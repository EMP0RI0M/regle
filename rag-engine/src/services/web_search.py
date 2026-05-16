import os
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def search_web(query: str, num_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search the web using Serper API.
    """
    serper_api_key = os.getenv("SERPER_API_KEY")
    if not serper_api_key:
        print("Warning: SERPER_API_KEY not found in .env.")
        return []

    try:
        url = "https://google.serper.dev/search"
        headers = {
            'X-API-KEY': serper_api_key,
            'Content-Type': 'application/json'
        }
        payload = {
            'q': query,
            'num': num_results
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            results = data.get("organic", [])
            output = []
            for res in results:
                output.append({
                    "content": res.get("snippet", ""),
                    "metadata": {
                        "title": res.get("title", ""),
                        "url": res.get("link", "")
                    },
                    "source": "web"
                })
            return output
    except Exception as e:
        print(f"Serper Search Error: {e}")
        return []
