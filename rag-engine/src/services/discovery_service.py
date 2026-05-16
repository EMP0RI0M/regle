import os
import asyncio
import re
import json
from typing import List, Dict, Any, Optional
from src.services.llm_service import llm_service
from src.services.arxiv_service import search_arxiv
from src.services.github_service import search_github
from src.services.youtube_service import search_youtube
from src.services.searxng_service import search_searxng
from src.services.ingestion_service import ingest_url, ingest_arxiv_core
from src.db.supabase_client import supabase

class DiscoveryService:
    """
    Service for intelligent source discovery. 
    Analyzes a prompt, searches multiple specialized tools, 
    grades candidates, and ingests the best 5.
    """

    async def discover_and_ingest(self, query: str, project_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        print(f"---SMART DISCOVERY INITIATED: {query}---")

        # 1. ANALYZE GOAL & PLAN
        plan = await self._analyze_goal(query)
        
        # 2. FETCH CANDIDATES IN PARALLEL
        candidates = await self._fetch_all_candidates(plan)
        if not candidates:
            return {"status": "error", "message": "No potential sources found for this query."}

        # 3. GRADE & FILTER TOP 5
        best_5 = await self._grade_and_select_best(query, candidates)
        if not best_5:
            return {"status": "error", "message": "No relevant sources passed the quality grader."}

        # 4. BATCH INGEST (with duplicate check)
        ingestion_results = await self._batch_ingest(best_5, project_id, user_id)

        return {
            "status": "success",
            "query": query,
            "candidates_found": len(candidates),
            "graded_as_high_quality": len(best_5),
            "ingested_count": sum(1 for r in ingestion_results if r.get("status") == "success"),
            "sources": ingestion_results
        }

    async def _analyze_goal(self, query: str) -> Dict[str, List[str]]:
        """Uses LLM to decide which tools and queries to use for discovery."""
        system_prompt = """You are a Research Discovery Architect. 
Your goal is to find the 5 most authoritative and helpful sources to populate a knowledge base for a specific research topic.
Identify the best specialized tools (arxiv, github, youtube, web) and specific search queries.

Output JSON format exactly:
{
  "tools": ["arxiv", "github", "youtube", "web"],
  "queries": {
    "arxiv": ["query 1", "query 2"],
    "github": ["query"],
    "youtube": ["query"],
    "web": ["query"]
  }
}
*Only include tools that are relevant to the topic.*
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Research Topic: {query}"}
        ]
        
        model = os.getenv("PLANNER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
        response_text, _ = await llm_service.chat_completion(messages, model=model)
        
        try:
            # Simple JSON extraction
            json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception as e:
            print(f"Discovery Planning Error: {e}")
        
        # Default fallback
        return {"tools": ["web"], "queries": {"web": [query]}}

    async def _fetch_all_candidates(self, plan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Executes search queries across all planned tools in parallel."""
        tasks = []
        tools = plan.get("tools", ["web"])
        queries = plan.get("queries", {})

        if "arxiv" in tools and queries.get("arxiv"):
            for q in queries["arxiv"]:
                tasks.append(search_arxiv(q, max_results=5))
        
        if "github" in tools and queries.get("github"):
            for q in queries["github"]:
                tasks.append(search_github(q, max_results=5))
                
        if "youtube" in tools and queries.get("youtube"):
            for q in queries["youtube"]:
                tasks.append(search_youtube(q, max_results=3))
                
        if "web" in tools and queries.get("web"):
            for q in queries["web"]:
                tasks.append(search_searxng(q, num_results=10))

        results_lists = await asyncio.gather(*tasks)
        
        # Flatten and de-duplicate by URL
        seen_urls = set()
        unique_candidates = []
        for sublist in results_lists:
            for item in sublist:
                url = item.get("url")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    unique_candidates.append(item)
                    
        return unique_candidates

    async def _grade_and_select_best(self, query: str, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Reuses the batch grader to find the top 5 most relevant sources."""
        from src.agents.nodes import grade_batch
        
        # We take up to 15 candidates to keep the grader call efficient
        candidates_to_grade = docs[:15]
        relevant_docs, usage = await grade_batch(query, candidates_to_grade, "discovery")
        
        # Return top 5 only
        return relevant_docs[:5]

    async def _batch_ingest(self, sources: List[Dict[str, Any]], project_id: Optional[str], user_id: Optional[str]) -> List[Dict[str, Any]]:
        """Ingests the winners, skipping duplicates already in the DB."""
        ingestion_tasks = []
        
        for source in sources:
            url = source.get("url")
            # 1. Check if already exists in this project
            if project_id and url:
                existing = supabase.table("knowledge_base").select("id").eq("project_id", project_id).eq("metadata->>url", url).execute()
                if existing.data:
                    print(f"Skipping duplicate source: {url}")
                    continue
            
            # 2. Ingest
            if url:
                if "arxiv.org" in url:
                    # Specialized arXiv ingestion
                    ingestion_tasks.append(ingest_arxiv_core(url, project_id=project_id, user_id=user_id))
                else:
                    ingestion_tasks.append(ingest_url(url, project_id=project_id, user_id=user_id, content_fallback=source.get("content")))

        if ingestion_tasks:
            return await asyncio.gather(*ingestion_tasks)
        return []

discovery_service = DiscoveryService()
