import os
from typing import List, Dict, Any
import asyncio
import re
from src.agents.state import AgentState
from src.services.supabase_service import search_supabase
# (other imports remain same)
from src.services.searxng_service import search_searxng
from src.services.youtube_service import search_youtube
from src.services.github_service import search_github
from src.services.llm_service import llm_service
from src.services.arxiv_service import search_arxiv
from src.utils.jit_vector import jit_filter_results
from src.utils.reranker import rerank_documents
from src.prompts.planner import format_planner_messages
from src.prompts.grader import format_grader_messages, format_web_grader_messages
from src.prompts.synthesizer import format_synthesizer_messages

# --- PLANNER NODE ---

async def planner_node(state: AgentState) -> dict:
    """
    Analyzes user question and generates a research plan.
    """
    print("---PLANNING EXECUTION---", flush=True)
    question = state["question"]
    planner_model = os.getenv("PLANNER_MODEL", "nvidia/nemotron-3-nano-30b-a3b:free")
    
    messages = format_planner_messages(question, mode=state.get("mode", "hybrid"))
    response_text, usage = await llm_service.chat_completion(messages, model=planner_model)
    
    print(f"---PLANNER RESPONSE [Model: {planner_model}]---\n{response_text}\n---END PLANNER RESPONSE---", flush=True)
    
    # Robust XML parsing (case-insensitive, handles whitespace)
    plan_steps = re.findall(r"<step>(.*?)</step>", response_text, re.IGNORECASE | re.DOTALL)
    if not plan_steps:
        # Fallback for numbered lists if the model skips XML tags
        plan_steps = re.findall(r"\d+\.\s+(.*?)(?=\n\d+\.|\n\n|\Z)", response_text)
        
    if not plan_steps:
        # If still no structured steps, use a default fallback
        plan_steps = [f"Performing deep RAG research on '{question}'"]
        
    routing_info = re.search(r"<routing>(.*?)</routing>", response_text, re.IGNORECASE | re.DOTALL)
    routing_str = routing_info.group(1).lower().strip() if routing_info else "general"
    
    return {
        "plan": plan_steps,
        "plan_str": response_text,
        "next_step": routing_str,
        "total_usage": usage,
        "steps": [
            "---PLANNING EXECUTION---",
            f"---LLM CALL [Model: {planner_model}]---",
            "> TRACE: MAPPING_GENESIS_VECTORS"
        ]
    }

# --- TOOL NODES ---

async def supabase_node(state: AgentState) -> dict:
    """Retrieves from Supabase Vision/Internal store."""
    print("---NODE: SUPABASE---", flush=True)
    project_id = state.get("project_id")
    print(f"> PROJECT_ID: {project_id or 'NONE (Searching all projects?)'}", flush=True)
    try:
        match_count = int(os.getenv("RAG_MATCH_COUNT", "10"))
        results = await search_supabase(
            state["question"], 
            match_count=match_count,
            project_id=state.get("project_id"),
            user_id=state.get("user_id")
        )
    except Exception as e:
        print(f"Error in supabase_node: {e}")
        results = []
    return {"raw_documents": results, "steps": [
        "---NODE: SUPABASE---",
        "> TRACE: RETRIEVING_LOCAL_KNOWLEDGE_BASE"
    ]}

async def github_node(state: AgentState) -> dict:
    """Retrieves from GitHub Public Repos."""
    print("---NODE: GITHUB---", flush=True)
    try:
        results = await search_github(state["question"], max_results=5)
    except Exception as e:
        print(f"Error in github_node: {e}")
        results = []
    return {"raw_documents": results, "steps": [
        "---NODE: GITHUB---",
        "> TRACE: SCANNING_GITHUB_REPOSITORIES"
    ]}

async def youtube_node(state: AgentState) -> dict:
    """Retrieves from YouTube Transcripts."""
    print("---NODE: YOUTUBE---", flush=True)
    try:
        results = await search_youtube(state["question"], max_results=3)
    except Exception as e:
        print(f"Error in youtube_node: {e}")
        results = []
    return {"raw_documents": results, "steps": [
        "---NODE: YOUTUBE---",
        "> TRACE: EXTRACTING_YOUTUBE_TRANSCRIPTS"
    ]}

async def web_search_node(state: AgentState) -> dict:
    """Retrieves from SearXNG Web."""
    print("---NODE: SEARXNG---", flush=True)
    try:
        results = await search_searxng(state["question"], num_results=15)
    except Exception as e:
        print(f"Error in web_search_node: {e}")
        results = []
    return {"raw_documents": results, "steps": [
        "---NODE: SEARXNG---",
        "> TRACE: INITIATING_WEB_SEARCH_QUERY"
    ]}

async def arxiv_node(state: AgentState) -> dict:
    """Retrieves academic papers from ArXiv."""
    print("---NODE: ARXIV---", flush=True)
    try:
        results = await search_arxiv(state["question"], max_results=8)
    except Exception as e:
        print(f"Error in arxiv_node: {e}")
        results = []
    return {"raw_documents": results, "steps": [
        "---NODE: ARXIV---",
        "> TRACE: COLLECTING_ACADEMIC_METADATA"
    ]}


# --- PROCESSING NODES ---

async def grade_batch(question: str, docs: List[Dict[str, Any]], grader_type: str = "internal") -> tuple[List[Dict[str, Any]], Dict[str, int]]:
    """
    Grades a batch of documents in a single LLM call to save API quota.
    """
    if not docs:
        return [], {}
    
    # Construct a combined prompt for all documents
    char_limit = int(os.getenv("RAG_CHUNK_CHAR_LIMIT", "4000"))
    doc_text_list = []
    for i, doc in enumerate(docs):
        content = doc.get("content", "")[:char_limit]
        doc_text_list.append(f"--- Document {i} ---\n{content}")
        
    combined_docs = "\n\n".join(doc_text_list)
    
    system_prompt = f"You are a strict relevance grader assessing {grader_type} documents.\n"
    system_prompt += "Relevance criteria: The document must contain information that directly helps answer the user's specific question.\n"
    system_prompt += "IMPORTANT: Do NOT penalize informal sources (like YouTube transcripts) if they are helpful. Do NOT favor academic papers if they are off-topic (e.g., if the user asks about a person and the paper is about physics, mark it 'NO').\n"
    system_prompt += "For each document, output 'YES' if it is relevant or 'NO' if it is not.\n"
    system_prompt += "Format your response exactly like this: [YES, NO, YES, ...]"
    
    user_prompt = f"Question: {question}\n\nDocuments:\n{combined_docs}\n\nRelevance Scores (JSON list):"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    grader_model = os.getenv("GRADER_MODEL", "nvidia/nemotron-3-nano-30b-a3b:free")
    response_text, usage = await llm_service.chat_completion(messages, model=grader_model)
    
    # Try to parse the list
    import json
    scores = []
    print(f"---GRADER RESPONSE [Model: {grader_model}]---\n{response_text}\n---END GRADER RESPONSE---")
    
    try:
        # 1. Try to find bracketed content first
        list_match = re.search(r"\[(.*?)\]", response_text, re.DOTALL)
        if list_match:
            inner_content = list_match.group(1)
            # Try parsing as JSON first
            try:
                # Remove potential markdown code blocks if the model wrapped it
                clean_inner = re.sub(r"```json|```", "", inner_content).strip()
                scores = json.loads(f"[{clean_inner}]")
            except:
                # If JSON fails, use regex to find YES/NO words
                scores = re.findall(r"YES|NO", inner_content, re.IGNORECASE)
        else:
            # Fallback parsing on the whole text
            # Look for words like "Document 1: YES" or just "YES" as a list
            scores = re.findall(r"\bYES\b|\bNO\b", response_text, re.IGNORECASE)
            
        if not scores:
            # Last resort fallback
            for item in response_text.split(","):
                if "yes" in item.lower(): scores.append("YES")
                else: scores.append("NO")
                
    except Exception as e:
        print(f"---GRADER PARSE WARNING: {e}---")
        # Hard fallback
        scores = ["YES"] * len(docs) # Default to keeping all if parser fails
        
    relevant_docs = []
    for i, score in enumerate(scores):
        if i < len(docs) and str(score).upper() == "YES":
            doc = docs[i]
            if "similarity" in doc:
                try:
                    doc["similarity"] = float(doc["similarity"])
                except (TypeError, ValueError):
                    doc["similarity"] = 0.0
            relevant_docs.append(doc)
            
    return relevant_docs, usage

async def grade_and_filter(state: AgentState) -> dict:
    """
    Grades documents retrieved by tool nodes.
    Uses batching to avoid OpenRouter rate limits.
    """
    print("---GRADING & FILTERING---", flush=True)
    question = state["question"]
    documents = state.get("raw_documents", [])
    
    # Categorize
    internal_docs = [d for d in documents if d.get("source") == "internal"]
    raw_api_docs = [d for d in documents if d.get("source") in ["github", "web", "youtube", "arxiv"]]
    
    # 1. Batch grade internal docs (with robust safety checks)
    if not internal_docs:
        print("---GRADER: NO INTERNAL DOCUMENTS FOUND---")
        relevant_internal, usage_internal = [], {}
    else:
        try:
            relevant_internal, usage_internal = await grade_batch(question, internal_docs, "internal")
        except (ValueError, TypeError) as e:
            print(f"---GRADER ERROR (INTERNAL): {e}---")
            relevant_internal, usage_internal = [], {}
    
    # 2. JIT filter public docs first (semantic relevance pre-check)
    filtered_public = await jit_filter_results(question, raw_api_docs, top_k=5)
    
    # 3. Batch grade filtered public docs (external)
    if not filtered_public:
        print("---GRADER: NO EXTERNAL DOCUMENTS FOUND---")
        relevant_public, usage_web = [], {}
    else:
        try:
            relevant_public, usage_web = await grade_batch(question, filtered_public, "web/external")
        except (ValueError, TypeError) as e:
            print(f"---GRADER ERROR (EXTERNAL): {e}---")
            relevant_public, usage_web = [], {}
    
    relevant_docs = relevant_internal + relevant_public
    
    # Sum usage (operator.add in AgentState expects a dict with numeric values)
    combined_usage = {
        "prompt_tokens": usage_internal.get("prompt_tokens", 0) + usage_web.get("prompt_tokens", 0),
        "completion_tokens": usage_internal.get("completion_tokens", 0) + usage_web.get("completion_tokens", 0),
        "total_tokens": usage_internal.get("total_tokens", 0) + usage_web.get("total_tokens", 0)
    }
            
    return {
        "filtered_documents": relevant_docs, 
        "total_usage": combined_usage,
        "steps": [
            "---GRADING & FILTERING---",
            f"---LLM CALL (BATCH GRADER) [Model: {llm_service.model}]---",
            "> TRACE: ALIGNING_MODULAR_LAYERS"
        ]
    }

async def generate(state: AgentState) -> dict:
    """Synthesizes final answer."""
    print("---GENERATING FINAL ANSWER---", flush=True)
    question = state["question"]
    documents = state.get("filtered_documents", [])
    
    # Final rerank to prioritize internal data
    final_docs = rerank_documents(question, documents)
    
    synth_model = os.getenv("SYNTHESIZER_MODEL", "nvidia/nemotron-3-nano-30b-a3b:free")
    messages = format_synthesizer_messages(question, final_docs, mode=state.get("mode", "hybrid"))
    generation_text, usage = await llm_service.chat_completion(messages, model=synth_model)
    
    return {
        "generation": generation_text, 
        "total_usage": usage,
        "steps": [
            "---GENERATING FINAL ANSWER---",
            f"---LLM CALL [Model: {synth_model}]---",
            "> TRACE: OPTIMIZING_PARITY_CHECK"
        ]
    }
