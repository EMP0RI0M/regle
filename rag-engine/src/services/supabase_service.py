import os
from typing import List, Dict, Any, Optional
from src.db.supabase_client import supabase
from src.utils.embedder import get_embedding
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def search_supabase(query: str, match_count: int = 5, match_threshold: float = 0.3, project_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Performs a hybrid search (vector + keyword) in Supabase.
    """
    try:
        # Get query embedding
        query_embedding = await get_embedding(query)
        
        # Call the hybrid_search RPC function
        response = supabase.rpc(
            'hybrid_search',
            {
                'query_text': query,
                'query_embedding': query_embedding,
                'match_threshold': match_threshold,
                'match_count': match_count,
                'full_text_weight': 1.0,
                'vector_weight': 1.0,
                'p_project_id': project_id,
                'p_user_id': user_id
            }
        ).execute()
        
        results = response.data
        if not results:
            return []
            
        return [
            {
                "id": result.get("id"),
                "content": result.get("content"),
                "metadata": result.get("metadata"),
                "similarity": float(result.get("similarity", 0.0)) if result.get("similarity") is not None else 0.0,
                "source": result.get("metadata", {}).get("title") or result.get("metadata", {}).get("source") or "internal",
                "project_id": result.get("project_id")
            }
            for result in results
        ]
    except Exception as e:
        print(f"Supabase RAG search error: {err_msg if (err_msg := str(e).encode('ascii', 'ignore').decode('ascii')) else e}")
        return []
