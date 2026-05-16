import os
import aiohttp
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def search_semantic_scholar(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Searches Semantic Scholar for academic papers.
    Returns a list of papers with title, abstract, URL, and more.
    """
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": "title,url,abstract,authors,year,venue"
    }
    
    api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
    
    import asyncio
    import random
    
    # Track key failure in a simple local cache during the session to avoid 403 cycles
    # (Optional: this could be moved to a module level variable)
    
    headers = {
        "User-Agent": "RegleResearchDashboard/1.0 (https://github.com/black-hand-corp; contact@regle.io)",
    }
    
    # Logic: try with key first, if forbidden or key missing, try without key.
    # Wrap that whole choice in a 429 retry loop.
    
    current_key = api_key
    
    try:
        connector = aiohttp.TCPConnector(ssl=False)
        async with aiohttp.ClientSession(connector=connector) as session:
            for attempt in range(2): 
                # Prepare headers for this specific attempt
                current_headers = headers.copy()
                if current_key:
                    current_headers["x-api-key"] = current_key
                
                async with session.get(url, params=params, headers=current_headers) as response:
                    # Case 1: Rate Limited
                    if response.status == 429:
                        wait_time = 5 + random.uniform(0, 2)
                        print(f"Semantic Scholar: 429 Rate Limit. Attempt {attempt+1}/2. Waiting {wait_time:.1f}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    # Case 2: Forbidden (Bad Key)
                    if response.status == 403 and current_key:
                        print("Semantic Scholar: 403 Forbidden with API Key. Falling back to Public Tier for this query.")
                        current_key = None # Clear key and retry immediately without key
                        # No continue here, the loop should just go to the next attempt or we can do another get
                        # Let's do another get immediately
                        async with session.get(url, params=params, headers=headers) as public_resp:
                            if public_resp.status == 200:
                                data = await public_resp.json()
                                break
                            elif public_resp.status == 429:
                                wait_time = 5 + random.uniform(0, 2)
                                print(f"Semantic Scholar (Public): 429 Rate Limit. Attempt {attempt+1}/2. Waiting {wait_time:.1f}s...")
                                await asyncio.sleep(wait_time)
                                continue
                            else:
                                text = await public_resp.text()
                                print(f"Semantic Scholar Error (Public): {public_resp.status} - {text}")
                                return []
                    
                    # Case 3: Other Errors
                    if response.status != 200:
                        text = await response.text()
                        print(f"Semantic Scholar Error: {response.status} - {text}")
                        return []
                    
                    # Case 4: Success
                    data = await response.json()
                    break
            else:
                return []
            
            # This part is now outside the loop and reached via 'break'
            results = []
            for item in data.get("data", []):
                # Format as standard document
                paper_title = item.get("title", "Untitled Paper")
                paper_url = item.get("url", "")
                abstract = item.get("abstract", "")
                
                # Combine info for content
                authors = ", ".join([a.get("name", "") for a in item.get("authors", [])])
                venue = item.get("venue", "N/A")
                year = item.get("year", "N/A")
                
                content = f"Title: {paper_title}\nAuthors: {authors}\nVenue: {venue} ({year})\n\nAbstract: {abstract}"
                
                results.append({
                    "id": item.get("paperId", ""),
                    "title": paper_title,
                    "content": content,
                    "url": paper_url,
                    "metadata": {
                        "title": paper_title,
                        "url": paper_url,
                        "source": "semantic_scholar",
                        "authors": authors,
                        "year": year,
                        "venue": venue,
                        "type": "academic_paper"
                    },
                    "source": "academic"
                })
            
            return results

    except Exception as e:
        print(f"Semantic Scholar Service Error: {str(e)}")
        return []
