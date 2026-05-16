import httpx
import asyncio
import os
import uuid

BACKEND_URL = "http://127.0.0.1:8001"

async def test_source_view():
    print("--- TESTING SOURCE VIEW FEATURE ---")
    
    project_id = "d34f2b93-0398-46f3-a195-73b82f531b19" # Valid project from DB
    test_content = "This is a test document content for verification of source text retrieval."
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Ingest a test document
        print(f"1. Ingesting test document into project: {project_id}")
        ingest_res = await client.post(
            f"{BACKEND_URL}/api/v1/ingest/text",
            params={"project_id": project_id},
            json={"content": test_content}
        )
        ingest_data = ingest_res.json()
        print(f"Ingest response: {ingest_data}")
        if ingest_res.status_code != 200:
            print(f"FAILED to ingest: {ingest_data}")
            return
        
        if "id" not in ingest_data:
            print(f"FAILED: 'id' not found in response. Response: {ingest_data}")
            return
            
        source_id = ingest_data["id"]
        print(f"SUCCESS: Ingested source ID: {source_id}")
        
        # 2. List sources for project
        print(f"2. Listing sources for project: {project_id}")
        list_res = await client.get(
            f"{BACKEND_URL}/api/v1/ingest/sources",
            params={"project_id": project_id}
        )
        list_data = list_res.json()
        print(f"Listing response: {list_data}")
        
        if not any(s["id"] == source_id for s in list_data["sources"]):
            print("FAILED: Source ID not found in project listing.")
            return
        print("SUCCESS: Source found in listing.")
        
        # 3. Fetch specific source text
        print(f"3. Fetching text for source ID: {source_id}")
        fetch_res = await client.get(f"{BACKEND_URL}/api/v1/ingest/source/{source_id}")
        fetch_data = fetch_res.json()
        
        if fetch_res.status_code != 200:
            print(f"FAILED to fetch text: {fetch_data}")
            return
        
        if fetch_data["content"] == test_content:
            print("SUCCESS: Retrieved content matches ingested content!")
            print(f"Retrieved Content: {fetch_data['content'][:50]}...")
        else:
            print(f"FAILED: Content mismatch.\nExpected: {test_content}\nGot: {fetch_data['content']}")

if __name__ == "__main__":
    asyncio.run(test_source_view())
