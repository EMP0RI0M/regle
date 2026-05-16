import asyncio
import os
import sys

# Add src path ensuring modules load properly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.services.github_service import search_github

async def test_search():
    query = "langgraph"
    print(f"Testing GitHub Search with query: '{query}'")
    
    try:
        results = await search_github(query=query, max_results=3)
        print(f"Results: {results}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_search())
 
