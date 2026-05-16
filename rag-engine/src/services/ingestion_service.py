import os
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from src.services.vision_service import process_document_vision
from src.services.arxiv_service import search_arxiv, is_biographical_query
from src.db.supabase_client import supabase
from src.utils.embedder import get_embedding
from src.services.credit_service import credit_service
from src.services.web_search import search_web

async def check_duplicate_source(project_id: str, url: str) -> Optional[dict]:
    """Checks if a matching URL already exists for this project."""
    if not project_id or not url:
        return None
    try:
        response = supabase.table("knowledge_base")\
            .select("id, metadata")\
            .eq("project_id", project_id)\
            .execute()
        
        # Check metadata for matching URL
        for item in response.data:
            metadata = item.get("metadata") or {}
            if metadata.get("url") == url:
                return item
        return None
    except Exception as e:
        print(f"Error checking duplicates: {e}")
        return None

async def get_project_name(project_id: str) -> Optional[str]:
    """Retrieves the project name from the projects table."""
    if not project_id:
        return None
    try:
        response = supabase.table("projects").select("name").eq("id", project_id).execute()
        return response.data[0]["name"] if response.data else None
    except Exception as e:
        print(f"Error fetching project name: {e}")
        return None

async def ingest_document(file_path: str, project_id: Optional[str] = None, user_id: Optional[str] = None) -> dict:
    """
    Ingests a document. If it's a PDF or Image, it uses vision models to extract content.
    Then it generates embeddings and stores it in Supabase.
    """
    print(f"---INGESTING DOCUMENT: {file_path}---")
    
    # 0. Check Limits
    if user_id:
        await credit_service.check_limits(user_id, project_id)
    
    try:
        project_name = await get_project_name(project_id) if project_id else None
        
        # 1. Extract content (Visual or Text)
        content = ""
        type_str = "text"
        if file_path.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
            content = await process_document_vision(file_path)
            type_str = "vision"
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

        if not content:
            return {"status": "error", "message": "No content extracted."}

        # Handle process_document_vision failure strings
        if content.startswith(("Failed to process", "Vision processing unavailable", "Error processing")):
            return {"status": "error", "message": content}

        # 2. Generate Embedding (with safety truncation)
        # We truncate to 6000 chars for free-tier model safety and to prevent common token limit errors
        truncated_content = content[:6000]
        embedding = await get_embedding(truncated_content)

        # 3. Store in Supabase
        filename = os.path.basename(file_path)
        
        # If it's a temporary text file from a UI input, synthesize a better title
        display_title = filename
        if filename.startswith("tmp") and file_path.lower().endswith(".txt"):
            snippet = content[:50].strip().replace("\n", " ")
            display_title = f"{snippet}..." if len(content) > 50 else snippet
        
        data = {
            "content": content,
            "embedding": embedding,
            "metadata": {
                "title": display_title,  # Improved identifying title
                "source": filename,
                "file_path": file_path,
                "type": type_str,
                "project_id": project_id
            },
            "project_id": project_id,
            "user_id": user_id,
            "project": project_name
        }

        response = supabase.table("knowledge_base").insert(data).execute()
        
        if not response.data:
            return {"status": "error", "message": f"Database insertion failed (no data returned). Check RLS policies? Project: {project_id}"}
            
        return {"status": "success", "id": response.data[0]["id"]}

    except Exception as e:
        print(f"FAILED INGESTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

async def ingest_url(url: str, project_id: Optional[str] = None, user_id: Optional[str] = None, content_fallback: Optional[str] = None) -> dict:
    """
    Scrapes a URL (standard web or YouTube snippet) and ingests it.
    """
    print(f"---INGESTING URL: {url}---")
    
    # 0. Check Limits
    if user_id:
        await credit_service.check_limits(user_id, project_id)
        
    # 0.5. Check Duplicates
    existing = await check_duplicate_source(project_id, url)
    if existing:
        print(f"---SOURCE ALREADY EXISTS: {url}---")
        return {"status": "exists", "id": existing["id"], "message": "Source already in project repository."}

    project_name = await get_project_name(project_id) if project_id else None
    content = ""
    title = url
    import re
    # Basic URL structure validation (Must have a dot and no spaces)
    if " " in url or "." not in url:
        return {"status": "error", "message": f"Invalid URL: '{url}'. Please provide a complete web address (e.g., https://example.com) instead of a search query."}

    try:
        # Basic protocol normalization
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code == 200:
                from markdownify import markdownify as md
                content = md(response.text)
                # Simple title extraction
                if "<title>" in response.text:
                    title = response.text.split("<title>")[1].split("</title>")[0]
    except Exception as e:
        print(f"Scraping Error for {url}: {e}")
        if not content_fallback:
            return {"status": "error", "message": f"Could not scrape URL: {str(e)}"}
        content = content_fallback

    if not content:
        return {"status": "error", "message": "No content extracted from URL."}

    # 2. Generate Embedding
    embedding = await get_embedding(content[:8000]) # Truncate for embedding safety

    # 3. Store in Supabase
    data = {
        "content": content,
        "embedding": embedding,
        "metadata": {
            "title": title,
            "source": title,
            "url": url,
            "type": "web" if "youtube.com" not in url else "youtube"
        },
        "project_id": project_id,
        "project": project_name,
        "user_id": user_id
    }

    try:
        response = supabase.table("knowledge_base").insert(data).execute()
        
        # 4. Deduct Credits for Vector Ingestion (Fixed Rate)
        if user_id:
            await credit_service.deduct_credits(user_id, tokens=2000) # Standard 2k token cost per source
            
        return {"status": "success", "id": response.data[0]["id"]}
    except Exception as e:
        print(f"URL Ingestion Error: {e}")
        return {"status": "error", "message": str(e)}

async def ingest_auto(query: str, project_id: Optional[str] = None, user_id: Optional[str] = None) -> dict:
    """
    AUTO_PILOT MODE: Deep research the query, bring 5 sources at a time.
    """
    print(f"---AUTO_PILOT_UPLINK: {query}---")
    
    # 1. Search Web
    results = await search_web(query)
    top_5 = results[:5]
    
    # 2. Parallel Ingestion
    tasks = []
    for res in top_5:
        url = res.get("metadata", {}).get("url")
        snippet = res.get("content", "")
        if url:
            tasks.append(ingest_url(url, project_id=project_id, user_id=user_id, content_fallback=snippet))
            
    ingest_results = await asyncio.gather(*tasks)
    
    success_count = sum(1 for r in ingest_results if r.get("status") == "success")
    failed_count = len(ingest_results) - success_count
    
    return {
        "status": "success" if success_count > 0 else "error",
        "total": len(top_5),
        "success": success_count,
        "failed": failed_count,
        "results": ingest_results
    }

async def ingest_arxiv_core(query_or_id: str, project_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Core logic to fetch, vectorize, and store an arXiv paper."""
    try:
        # 0. Check Guardrail
        if is_biographical_query(query_or_id):
            return {"status": "blocked", "message": "Biographical query blocked for ArXiv.", "id": None}

        # 0.5 Check Duplicates (if input looks like a URL/ID)
        clean_url = query_or_id
        if not query_or_id.startswith("http"):
            clean_url = f"https://arxiv.org/abs/{query_or_id}"
            
        existing = await check_duplicate_source(project_id, clean_url)
        if existing:
            print(f"---ARXIV PAPER ALREADY EXISTS: {query_or_id}---")
            return {"status": "exists", "id": existing["id"], "message": "Paper already in project repository."}

        project_name = await get_project_name(project_id) if project_id else None

        # 1. Fetch paper
        papers = await search_arxiv(query_or_id, max_results=1)
        if not papers:
            return {"status": "error", "message": "Paper not found on arXiv."}
        
        paper = papers[0]
        
        # 2. Vectorize
        embedding = await get_embedding(paper["content"][:8000])
        
        # 3. Store
        data = {
            "content": paper["content"],
            "embedding": embedding,
            "metadata": paper["metadata"],
            "project_id": project_id,
            "project": project_name,
            "user_id": user_id
        }
        
        response = supabase.table("knowledge_base").insert(data).execute()
        if not response.data:
            return {"status": "error", "message": "Failed to save paper to database."}
            
        return {"status": "success", "id": response.data[0]["id"], "title": paper["title"]}
    except Exception as e:
        print(f"ingest_arxiv_core error: {e}")
        return {"status": "error", "message": str(e)}

    # Test ingestion
    import sys
    if len(sys.argv) > 1:
        asyncio.run(ingest_document(sys.argv[1]))
    else:
        print("Please provide a file path to ingest.")
