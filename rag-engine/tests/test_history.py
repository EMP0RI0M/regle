import asyncio
import uuid
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.supabase_client import supabase
from src.api.v1.chat import QueryRequest, orchestrate_api

async def test_history_persistence():
    print("--- TESTING HISTORY PERSISTENCE ---")
    
    test_user_id = "4064a917-045d-481a-a1e0-4e5b15748746"
    test_session_id = str(uuid.uuid4())
    request = QueryRequest(
        question="What is the capital of France?",
        limit=1,
        mode="hybrid",
        project_id="d34f2b93-0398-46f3-a195-73b82f531b19", 
        user_id=test_user_id,
        session_id=test_session_id,
        vectorize_response=False
    )
    
    print(f"Orchestrating for session: {test_session_id}")
    try:
        response = await orchestrate_api(request)
        print("Response received.")
        
        # Verify Chat History
        print("Checking chat_history...")
        chat_history = supabase.table("chat_history")\
            .select("*")\
            .eq("session_id", test_session_id)\
            .execute()
        
        if chat_history.data and len(chat_history.data) >= 2:
            print(f"SUCCESS: Found {len(chat_history.data)} messages in chat_history.")
            for msg in chat_history.data:
                print(f"  - {msg['role']}: {msg['content'][:50]}...")
        else:
            print(f"FAILURE: Expected at least 2 messages, found {len(chat_history.data) if chat_history.data else 0}.")

        # Verify Project History
        print("Checking project_history...")
        project_history = supabase.table("project_history")\
            .select("*")\
            .eq("user_id", test_user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if len(project_history.data) > 0:
            latest = project_history.data[0]
            if latest["data"].get("session_id") == test_session_id:
                print("SUCCESS: Found record in project_history with matching session_id.")
            else:
                print(f"FAILURE: Project history session_id mismatch. Got {latest['data'].get('session_id')}")
        else:
            print("FAILURE: No project_history record found for test_user_history.")

    except Exception as e:
        print(f"ERROR DURING TEST: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_history_persistence())
