import asyncio
from src.services.arxiv_service import is_biographical_query, search_arxiv

async def test_guardrails():
    test_queries = [
        "Dark history of Michael Jackson",
        "Who is Steve Jobs?",
        "Biography of Elon Musk",
        "Quantum computing in 2026", # Should pass
        "Black holes and dark matter", # Should pass
        "The scandal of some politician",
        "History of Dark Energy" # Potential false positive, but let's see
    ]
    
    print("--- TESTING BIOGRAPHICAL GUARDRAIL ---")
    for q in test_queries:
        is_bio = is_biographical_query(q)
        print(f"Query: '{q}' -> Is Biographical? {is_bio}")
        
    print("\n--- TESTING SEARCH_ARXIV BLOCKING ---")
    # This should return [] and print a block message
    results = await search_arxiv("Dark history of a person")
    print(f"Results for 'Dark history': {results}")
    
    # This should proceed to search (and likely return results or fail gracefully if no API key/etc)
    # But here we just want to see if it BLOCKS the bad one.
    results_ok = await search_arxiv("Quantum chromodynamics")
    print(f"Results for 'Quantum': {len(results_ok)} results found (or API called)")

if __name__ == "__main__":
    asyncio.run(test_guardrails())
