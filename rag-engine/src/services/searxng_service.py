import os
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def search_searxng(query: str, num_results: int = 10) -> List[Dict[str, Any]]:
    """
    Advanced search with engine-level filtering and time-resolution tuning.
    """
    searxng_url = os.getenv("SEARXNG_URL")
    if not searxng_url:
        print("Warning: SEARXNG_URL not found in .env.")
        return []

    try:
        # --- 1. Engine-Level Filtering ---
        enhanced_query = query
        if any(k in query.lower() for k in ["news", "conflict", "war", "report", "update"]):
            enhanced_query = f"!news {query}"
        elif any(k in query.lower() for k in ["science", "study", "research", "paper"]):
            enhanced_query = f"!science {query}"

        # --- 2. Time-Resolution Tuning ---
        params = {
            "q": enhanced_query,
            "format": "json",
            "engines": "google,bing,duckduckgo",
            "time_range": "month", # Prevents stale 2024/2025 data
            "language": "en"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{searxng_url}/search", params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            results = data.get("results", [])
            output = []
            for res in results[:num_results]:
                output.append({
                    "content": res.get("content", "") or res.get("snippet", ""),
                    "metadata": {
                        "title": res.get("title", ""),
                        "url": res.get("url", ""),
                        "published_date": res.get("publishedDate"),
                        "engine": res.get("engine")
                    },
                    "source": "web",
                    "confidence": "High" if res.get("score", 0) > 0.5 else "Medium"
                })
            return output
    except Exception as e:
        print(f"SearXNG Search Error: {e}")
        return []
