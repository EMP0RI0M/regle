import asyncio
import os
import sys
from dotenv import load_dotenv

# Add src path ensuring modules load properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.agents.graph import langgraph_app

async def test_orchestrator(question: str):
    print(f"\n--- TESTING ORCHESTRATOR WITH QUESTION: '{question}' ---")
    
    # Initialize State
    initial_state = {
        "question": question,
        "mode": "rag", # STRICT RAG MODE
        "raw_documents": [],
        "filtered_documents": [],
        "steps": [],
        "grades": [],
        "plan": [],
        "plan_str": "",
        "next_step": "",
        "generation": "",
        "search_needed": False
    }
    
    # Run Graph
    try:
        async for output in langgraph_app.astream(initial_state):
            for key, value in output.items():
                print(f"\nNode Finished: {key}")
                if "plan" in value:
                    print(f"Plan: {value['plan']}")
                if "next_step" in value:
                    print(f"Routing to: {value['next_step']}")
                if "raw_documents" in value:
                    print(f"Collected {len(value['raw_documents'])} raw documents")
                if "filtered_documents" in value:
                    print(f"Retrieved {len(value['filtered_documents'])} graded documents")
                if "generation" in value:
                    print("-" * 50)
                    print(f"Final Generation:\n{value['generation']}")
                    print("-" * 50)
    except Exception as e:
        print(f"Orchestrator Test Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Test cases representing different intents
    questions = [
        "How do I implement a custom LangGraph node in Python?", # Should hit GitHub
        "What are my notes on the internal Regle RAG architecture?", # Should hit Supabase
        "What are the latest news about Nvidia Nemotron models?", # Should hit SearXNG
        "Show me a video tutorial on how to use Supabase with Next.js." # Should hit YouTube
    ]
    
    # Run just one for now to verify
    asyncio.run(test_orchestrator(questions[0]))
