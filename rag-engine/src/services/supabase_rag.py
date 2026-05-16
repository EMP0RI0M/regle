import os
from typing import List, Dict, Any
from src.db.supabase_client import supabase
from src.utils.embedder import get_embedding
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def supabase_rag_query(query: str, match_count: int = 5) -> List[Dict[str, Any]]:
    """
    Stand-alone Supabase RAG query function.
    """
    try:
        embedding = await get_embedding(query)
        response = supabase.rpc(
            'match_documents',
            {
                'query_embedding': embedding,
                'match_threshold': 0.5,
                'match_count': match_count,
            }
        ).execute()
        return response.data
    except Exception as e:
        print(f"Supabase RAG Query Error: {e}")
        return []
