import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the project root to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.services.semantic_scholar_service import search_semantic_scholar
from src.services.arxiv_service import search_arxiv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

async def test_academic_sources():
    query = "quantum computing"
    print(f"\n--- Testing Academic Search for: '{query}' ---\n")

    # 1. Test Semantic Scholar
    print("Testing Semantic Scholar...")
    try:
        ss_results = await search_semantic_scholar(query, limit=3)
        print(f"DONE: Semantic Scholar found {len(ss_results)} results.")
        for r in ss_results:
            print(f"  - [{r.get('metadata', {}).get('source')}] {r.get('title')}")
    except Exception as e:
        print(f"FAIL: Semantic Scholar failed: {str(e)}")

    print("\n" + "-"*40 + "\n")

    # 2. Test arXiv
    print("Testing arXiv...")
    try:
        arxiv_results = await search_arxiv(query, max_results=3)
        print(f"DONE: arXiv found {len(arxiv_results)} results.")
        for r in arxiv_results:
            print(f"  - [{r.get('metadata', {}).get('source')}] {r.get('title')}")
    except Exception as e:
        print(f"FAIL: arXiv failed: {str(e)}")

    print("\n" + "="*40 + "\n")

    # 3. Final Summary
    total = len(ss_results) + len(arxiv_results)
    if total > 0:
        print(f"SUCCESS: Total of {total} academic papers retrieved.")
    else:
        print("FAILURE: No academic papers were retrieved from any source.")

if __name__ == "__main__":
    asyncio.run(test_academic_sources())
