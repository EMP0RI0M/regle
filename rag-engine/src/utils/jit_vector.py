import numpy as np
from typing import List, Dict, Any

# We initialize FastEmbed conditionally
try:
    from fastembed import TextEmbedding
    local_encoder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
except ImportError:
    print("Warning: fastembed not installed. Local embeddings will fail.")
    local_encoder = None

async def jit_filter_results(query: str, raw_results: List[Dict[str, Any]], top_k: int = 5, threshold: float = 0.5) -> List[Dict[str, Any]]:
    """
    Performs Just-In-Time (JIT) vectorization and similarity search 
    using local CPU embeddings (FastEmbed) to filter out noise from web search results.
    """
    if not raw_results or not local_encoder:
        return raw_results[:top_k] if raw_results else []

    snippets = [res.get("content") or res.get("snippet") or "" for res in raw_results]

    try:
        query_emb = list(local_encoder.embed([query]))[0]
        snippet_embs = list(local_encoder.embed(snippets))
        
        scores = [float(np.dot(query_emb, s_emb)) for s_emb in snippet_embs]
        
        ranked = sorted(zip(scores, raw_results), key=lambda x: x[0], reverse=True)
        
        filtered = [
            {
                "content": item.get("content") or item.get("snippet") or "",
                "metadata": {
                    **(item.get("metadata", {})),
                    "title": item.get("title") or item.get("metadata", {}).get("title"),
                    "url": item.get("url") or item.get("link") or item.get("metadata", {}).get("url"),
                },
                "source": item.get("source", "web_filtered"),
                "similarity": score
            }
            for score, item in ranked if score > threshold
        ]
        
        if not filtered and ranked:
            item = ranked[0][1]
            return [{
                "content": item.get("content") or item.get("snippet") or "",
                "metadata": {
                    **(item.get("metadata", {})),
                    "title": item.get("title") or item.get("metadata", {}).get("title"),
                    "url": item.get("url") or item.get("link") or item.get("metadata", {}).get("url"),
                },
                "source": item.get("source", "web_filtered"),
                "similarity": ranked[0][0]
            }]
            
        return filtered[:top_k]
    except Exception as e:
        print(f"JIT Numpy Vectorization error: {e}")
        return raw_results[:top_k]
