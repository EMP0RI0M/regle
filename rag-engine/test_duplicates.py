import asyncio
import os
from src.services.ingestion_service import ingest_arxiv_core
from src.services.arxiv_service import is_biographical_query
from dotenv import load_dotenv

# Load env from the real project
load_dotenv("d:/zee/rag-engine/.env")

async def test_duplicate_prevention():
    project_id = "d34f2b93-0398-46f3-a195-73b82f531b19" # From user screenshot
    arxiv_id = "astro-ph/0510346v1" # The Dark Energy Survey
    
    print("\n--- Testing Duplicate Prevention ---")
    # First attempt (should exist if already in DB, or ingest once)
    res1 = await ingest_arxiv_core(arxiv_id, project_id=project_id)
    print(f"Attempt 1 Result: {res1.get('status')} - {res1.get('message')}")
    
    # Second attempt (should definitely return 'exists')
    res2 = await ingest_arxiv_core(arxiv_id, project_id=project_id)
    print(f"Attempt 2 Result: {res2.get('status')} - {res2.get('message')}")
    
async def test_guardrails():
    test_queries = [
        "Leonardo Da Vinci",
        "Who is Albert Einstein?",
        "Quantum Computing",
        "The Dark Energy Survey"
    ]
    
    print("\n--- Testing Guardrails ---")
    for q in test_queries:
        blocked = is_biographical_query(q)
        print(f"Query: '{q}' | Blocked: {blocked}")

async def main():
    await test_guardrails()
    await test_duplicate_prevention()

if __name__ == "__main__":
    asyncio.run(main())
