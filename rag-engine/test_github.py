import asyncio
import os
import sys

# Add src path ensuring modules load properly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.services.github_service import search_github

async def test_search():
    query = "ai"
    print(f"Testing GitHub Search with query: '{query}'")
    print("-" * 50)
    
    results = await search_github(query=query, max_results=3)
    
    if not results:
        print("No results found or error occurred.")
        return
        
    for i, res in enumerate(results):
        print(f"\nResult {i+1}:")
        print(f"Repo: {res['metadata']['repo']}")
        print(f"File: {res['metadata']['title']}")
        print(f"URL: {res['metadata']['url']}")
        print(f"Content Preview: {res['content'][:150]}...")

if __name__ == "__main__":
    asyncio.run(test_search())
