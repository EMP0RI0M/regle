from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from src.services.github_service import search_github
from src.services.supabase_service import search_supabase
from src.services.searxng_service import search_searxng
from src.services.youtube_service import search_youtube
from src.services.semantic_scholar_service import search_semantic_scholar
from src.services.arxiv_service import search_arxiv
from src.agents.graph import langgraph_app
from src.services.credit_service import credit_service
router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    limit: Optional[int] = 5
    mode: Optional[str] = "hybrid"
    project_id: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    vectorize_response: Optional[bool] = False

@router.post("/search/academic")
async def academic_api(request: QueryRequest):
    try:
        import asyncio
        # Prioritize arXiv as requested. Temporarily disabling Semantic Scholar 
        # to avoid the 429 rate-limit wait cycles and provide a fast experience.
        results = await search_arxiv(request.question, max_results=request.limit + 10)
        
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search/github")
async def github_api(request: QueryRequest):
    try:
        results = await search_github(request.question, max_results=request.limit)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search/supabase")
async def supabase_api(request: QueryRequest):
    try:
        results = await search_supabase(
            request.question, 
            match_count=request.limit,
            project_id=request.project_id,
            user_id=request.user_id
        )
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search/web")
async def web_api(request: QueryRequest):
    try:
        results = await search_searxng(request.question, num_results=request.limit)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search/youtube")
async def youtube_api(request: QueryRequest):
    try:
        results = await search_youtube(request.question, max_results=request.limit)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orchestrate")
async def orchestrate_api(request: QueryRequest):
    """
    Runs the full LangGraph Multi-Modal RAG Orchestrator.
    """
    try:
        # 0. Handle PING_STATUS (UI Heartbeat)
        if request.question == "PING_STATUS":
            user_status = await credit_service.get_user_status(request.user_id) if request.user_id else None
            return {"status": "success", "user_status": user_status}

        from src.db.supabase_client import supabase
        from src.services.ingestion_service import get_project_name
        import uuid

        # 0.5 Generate session_id if not provided
        session_id = request.session_id or str(uuid.uuid4())
        project_name = await get_project_name(request.project_id) if request.project_id else None

        # 1. Save User Message to Chat History
        chat_data_user = {
            "user_id": request.user_id,
            "project_id": request.project_id,
            "session_id": session_id,
            "role": "user",
            "content": request.question,
            "metadata": {"mode": request.mode}
        }
        supabase.table("chat_history").insert(chat_data_user).execute()

        initial_state = {
            "question": request.question,
            "mode": request.mode,
            "project_id": request.project_id,
            "user_id": request.user_id,
            "raw_documents": [],
            "filtered_documents": [],
            "steps": [],
            "grades": [],
            "plan": [],
            "plan_str": "",
            "next_step": "",
            "generation": "",
            "search_needed": False,
            "total_usage": {}
        }
        # 2. Invoke the graph and take the final state
        result = await langgraph_app.ainvoke(initial_state)

        # 3. Deduct Credits based on total usage
        total_usage_dict = result.get("total_usage", {})
        total_tokens = total_usage_dict.get("total_tokens", 0)
        if request.user_id and total_tokens > 0:
            await credit_service.deduct_credits(request.user_id, total_tokens)
            
        # 4. Get Latest Credit Status
        user_status = await credit_service.get_user_status(request.user_id) if request.user_id else None
        
        # 5. Save Assistant Message and Project History
        gen_text = result.get("generation", "")
        if gen_text:
            # Save Assistant Message
            chat_data_assistant = {
                "user_id": request.user_id,
                "project_id": request.project_id,
                "session_id": session_id,
                "role": "assistant",
                "content": gen_text,
                "metadata": {"usage": total_usage_dict}
            }
            supabase.table("chat_history").insert(chat_data_assistant).execute()

            # Save Project History (Event)
            history_data = {
                "project_id": request.project_id,
                "project_name": project_name,
                "user_id": request.user_id,
                "event_type": "conversation",
                "description": f"AI response generated for: {request.question[:50]}...",
                "data": {
                    "question": request.question,
                    "answer_snippet": gen_text[:200],
                    "session_id": session_id
                }
            }
            supabase.table("project_history").insert(history_data).execute()

        response_data = {
            "status": "success",
            "generation": result.get("generation"),
            "steps": result.get("steps"),
            "documents": result.get("filtered_documents"),
            "plan": result.get("plan"),
            "usage": total_usage_dict,
            "user_status": user_status,
            "session_id": session_id
        }

        if request.vectorize_response:
            from src.utils.embedder import get_embedding
            
            if gen_text:
                vector = await get_embedding(gen_text, source="search")
                response_data["vector"] = vector
                response_data["vector_model"] = "BAAI/bge-small-en-v1.5"
                
                # PERSIST to Knowledge Base
                kb_data = {
                    "content": gen_text,
                    "embedding": vector,
                    "project_id": request.project_id,
                    "project": project_name,
                    "user_id": request.user_id,
                    "metadata": {
                        "source": "AI_SYNTHESIS",
                        "type": "generation",
                        "question": request.question
                    }
                }
                supabase.table("knowledge_base").insert(kb_data).execute()
            
        return response_data
    except Exception as e:
        import traceback
        print("CRITICAL ERROR IN ORCHESTRATE API:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Orchestrator Error: {str(e)}")
