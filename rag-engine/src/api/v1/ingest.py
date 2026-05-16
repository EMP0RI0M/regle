from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import tempfile
from src.services.ingestion_service import ingest_document, ingest_url, ingest_auto, ingest_arxiv_core
from src.services.discovery_service import discovery_service
from src.services.web_search import search_web

router = APIRouter()

class IngestRequest(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = {}

class SearchRequest(BaseModel):
    query: str
    num_results: Optional[int] = 10
    project_id: Optional[str] = None
    user_id: Optional[str] = None
    limit: Optional[int] = 10

@router.post("/text")
async def ingest_text(request: IngestRequest, project_id: Optional[str] = None, user_id: Optional[str] = None):
    """
    Ingests text into the Supabase vector store.
    """
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
            tmp.write(request.content)
            tmp_path = tmp.name
        
        result = await ingest_document(tmp_path, project_id=project_id, user_id=user_id)
        os.remove(tmp_path)
        return result
    except Exception as e:
        print(f"Error in ingest_text route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/file")
async def ingest_file(
    file: UploadFile = File(...),
    project_id: Optional[str] = None,
    user_id: Optional[str] = None
):
    """
    Uploads a file to the processing pipeline.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
            
        result = await ingest_document(tmp_path, project_id=project_id, user_id=user_id)
        os.remove(tmp_path)
        return result
    except Exception as e:
        print(f"Error in ingest_file route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from src.services.github_service import ingest_github_repo

class GithubIngestRequest(BaseModel):
    github_url: str

@router.post("/github")
async def ingest_github(request: GithubIngestRequest, project_id: Optional[str] = None, user_id: Optional[str] = None):
    """
    Ingests a GitHub repository.
    """
    try:
        result = await ingest_github_repo(request.github_url, project_id=project_id, user_id=user_id)
        return result
    except Exception as e:
        print(f"Error in ingest_github route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class URLIngestRequest(BaseModel):
    url: str
    project_id: Optional[str] = None
    user_id: Optional[str] = None
    content: Optional[str] = None

@router.post("/url")
async def ingest_url_api(request: URLIngestRequest):
    """
    Ingests a URL (web page or YouTube metadata) into the knowledge base.
    """
    try:
        result = await ingest_url(
            url=request.url,
            project_id=request.project_id,
            user_id=request.user_id,
            content_fallback=request.content
        )
        return result
    except Exception as e:
        print(f"Error in ingest_url route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from src.services.arxiv_service import search_arxiv, is_biographical_query
from src.utils.embedder import get_embedding
from src.db.supabase_client import supabase

@router.post("/arxiv")
async def ingest_arxiv(request: URLIngestRequest):
    """
    Ingests an arXiv paper by ID or search term.
    """
    try:
        result = await ingest_arxiv_core(
            request.url, 
            project_id=request.project_id, 
            user_id=request.user_id
        )
        
        if result.get("status") == "blocked":
            raise HTTPException(status_code=400, detail=result.get("message", "Request blocked by safety guardrails."))
            
        if result.get("status") == "error" and "not found" in result.get("message", "").lower():
            raise HTTPException(status_code=404, detail=result["message"])
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in ingest_arxiv route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def web_search_api(request: SearchRequest):
    """
    Performs a web search and returns results for selection.
    """
    try:
        results = await search_web(request.query, num_results=request.num_results)
        return {"results": results}
    except Exception as e:
        print(f"Error in web_search_api route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auto")
async def auto_uplink_api(request: SearchRequest):
    """
    AUTO_PILOT: Deep research and ingestion of 5 sources in one click.
    """
    try:
        result = await ingest_auto(
            request.query, 
            project_id=request.project_id, 
            user_id=request.user_id
        )
        return result
    except Exception as e:
        print(f"Error in auto_uplink_api route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/discover")
async def discovery_uplink_api(request: SearchRequest):
    """
    SMART_DISCOVERY: Analyzes prompt, finds, grades, and adds the BEST 5 sources.
    """
    try:
        result = await discovery_service.discover_and_ingest(
            request.query, 
            project_id=request.project_id, 
            user_id=request.user_id
        )
        return result
    except Exception as e:
        print(f"Error in discovery_uplink_api route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources")
async def list_sources(project_id: str):
    """
    Lists all ingested sources for a specific project.
    """
    try:
        response = supabase.table("knowledge_base")\
            .select("id, metadata, project_id")\
            .eq("project_id", project_id)\
            .execute()
        return {"sources": response.data}
    except Exception as e:
        print(f"Error in list_sources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/source/{source_id}")
async def fetch_source_text(source_id: str):
    """
    Retrieves the raw extracted text content of a source by ID.
    """
    try:
        response = supabase.table("knowledge_base")\
            .select("id, content, metadata")\
            .eq("id", source_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Source document not found.")
            
        return response.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        print(f"Error in fetch_source_text: {e}")
        raise HTTPException(status_code=500, detail=str(e))
