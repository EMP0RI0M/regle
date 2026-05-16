import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.agents.nodes import planner_node, generate
from src.agents.state import AgentState

async def test_strict_planner():
    print("\n--- TESTING STRICT PLANNER (LOCAL_SQL) ---")
    state = {
        "question": "What is the capital of France?",
        "mode": "local_sql"
    }
    
    # Run planner
    result = await planner_node(state)
    print(f"PLAN: {result['plan']}")
    print(f"ROUTING: {result['next_step']}")
    
    # Verify that plan doesn't mention web/external tools
    plan_text = " ".join(result['plan']).lower()
    external_tools = ["searxng", "web", "youtube", "github", "arxiv"]
    found_external = [t for t in external_tools if t in plan_text]
    
    if not found_external:
        print("SUCCESS: Planner strictly followed local mode.")
    else:
        print(f"FAILURE: Planner still mentioned external tools: {found_external}")

async def test_strict_synthesizer():
    print("\n--- TESTING STRICT SYNTHESIZER (LOCAL_SQL + EMPTY DOCS) ---")
    state = {
        "question": "What is the secret code?",
        "mode": "local_sql",
        "filtered_documents": [] # Empty
    }
    
    # Run generate
    result = await generate(state)
    print(f"GENERATION: {result['generation']}")
    
    if "no relevant internal data found" in result['generation'].lower() or "no internal records" in result['generation'].lower():
        print("SUCCESS: Synthesizer refused to hallucinate and correctly reported missing internal data.")
    else:
        print("FAILURE: Synthesizer might be providing general knowledge despite empty local data.")

if __name__ == "__main__":
    asyncio.run(test_strict_planner())
    asyncio.run(test_strict_synthesizer())
