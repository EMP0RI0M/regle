import os
from typing import List, Dict, Any
from src.services.llm_service import llm_service
from src.services.supabase_service import search_supabase
from src.services.web_search import search_web
from src.services.youtube_service import search_youtube
from src.services.github_service import search_github
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def run_simple_parallel_rag(question: str) -> str:
    """
    Experimental orchestrator that runs all sources in parallel.
    (This was the previous v1 logic before LangGraph).
    """
    import asyncio
    
    tasks = [
        search_supabase(question),
        search_web(question),
        search_youtube(question),
        search_github(question)
    ]
    
    results = await asyncio.gather(*tasks)
    
    # Flatten & Synthesize
    documents = []
    for res in results:
        if isinstance(res, list):
            documents.extend(res)
            
    # Simple Synthesis
    context = "\n\n".join([f"Source: {d.get('source')}\nContent: {d.get('content')}" for d in documents[:5]])
    prompt = f"Question: {question}\n\nContext:\n{context}\n\nAnswer:"
    
    return await llm_service.chat_completion([{"role": "user", "content": prompt}])
