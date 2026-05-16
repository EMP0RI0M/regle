import sys
import os
import asyncio
import re
from unittest.mock import AsyncMock, patch

# Ensure we can import from src
sys.path.append(os.getcwd())

from src.agents.nodes import planner_node, grade_batch
from src.agents.graph import route_after_planning
from src.agents.state import AgentState

async def test_planner_resilience():
    print("\n--- TEST: PLANNER RESILIENCE ---")
    # Mocking a response that has NO XML TAGS
    mock_response = "Certainly! I'll help with that. First I will check the web, then I will look at GitHub."
    
    state: AgentState = {"question": "How to build a RAG?", "next_step": "", "plan": [], "plan_str": ""}
    
    with patch("src.agents.nodes.llm_service.chat_completion", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = (mock_response, {"total_tokens": 100})
        
        result = await planner_node(state)
        print(f"Fallback Plan: {result['plan']}")
        assert len(result["plan"]) > 0
        assert "Performing deep RAG research" in result["plan"][0]
        print("✅ Planner Fallback OK")

async def test_grader_resilience():
    print("\n--- TEST: GRADER RESILIENCE ---")
    # Mocking a response that has a MESSY JSON list
    mock_response = "Here is the relevance grading: ```json [YES, NO] ``` even though you asked for something else."
    docs = [{"content": "Doc 1"}, {"content": "Doc 2"}]
    
    with patch("src.agents.nodes.llm_service.chat_completion", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = (mock_response, {"total_tokens": 50})
        
        relevant, usage = await grade_batch("What is AI?", docs)
        print(f"Relevant Docs Count: {len(relevant)}")
        assert len(relevant) == 1
        print("✅ Grader Regex OK")

async def test_routing_fallback():
    print("\n--- TEST: ROUTING FALLBACK ---")
    state: AgentState = {
        "question": "something weird",
        "plan_str": "I don't know what to do.",
        "next_step": "unknown",
        "mode": "hybrid"
    }
    
    next_node = route_after_planning(state)
    print(f"Routed to: {next_node}")
    assert next_node == "web_search_node"
    print("✅ Routing Fallback OK")

async def main():
    try:
        await test_planner_resilience()
        await test_grader_resilience()
        await test_routing_fallback()
        print("\n✨ ALL TESTS PASSED! RAG Nodes are now resilient. ✨")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
