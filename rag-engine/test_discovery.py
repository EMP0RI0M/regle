import httpx
import asyncio
import json

async def test_discovery():
    url = "http://localhost:8000/api/v1/ingest/discover"
    payload = {
        "query": "Future of Agentic AI and Large Action Models in 2026",
        "project_id": "d34f2b93-0398-46f3-a195-73b82f531b19", # Using the ID from your logs
        "user_id": "test_user_001"
    }
    
    print(f"---Testing Smart Discovery API---")
    print(f"Goal: {payload['query']}")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                result = response.json()
                print("\n✅ DISCOVERY SUCCESSFUL!")
                print(f"Candidates Found: {result.get('candidates_found')}")
                print(f"High Quality Sources Selected: {result.get('graded_as_high_quality')}")
                print(f"Newly Ingested: {result.get('ingested_count')}")
                
                print("\nSources Added:")
                for source in result.get('sources', []):
                    status = "✅" if source.get("status") == "success" else "⚠️"
                    title = source.get("title", "Untitled")
                    msg = source.get("message", "Added")
                    print(f"{status} {title} ({msg})")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure 'python main.py' is running!")

if __name__ == "__main__":
    asyncio.run(test_discovery())
