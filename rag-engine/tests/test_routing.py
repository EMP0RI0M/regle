import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.agents.graph import route_after_planning

def test_routing():
    modes = ["local_sql", "web_api", "arxiv_acad", "hybrid_grid", "web", "hybrid"]
    
    for mode in modes:
        state = {
            "question": "test question",
            "mode": mode,
            "plan_str": "general plan",
            "next_step": "general"
        }
        
        result = route_after_planning(state)
        print(f"MODE: {mode:12} -> ROUTING: {result}")

if __name__ == "__main__":
    test_routing()
