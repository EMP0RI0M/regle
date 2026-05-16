from langgraph.graph import END, StateGraph, START
from src.agents.state import AgentState
from src.agents.nodes import (
    planner_node, 
    supabase_node, 
    github_node, 
    youtube_node, 
    web_search_node, 
    arxiv_node,
    grade_and_filter, 
    generate
)

def route_after_planning(state: AgentState):
    """
    Router that decides which tool(s) to hit based on the planning output.
    Returns a list of node names to execute in parallel.
    """
    # Look at both the planning text and the routing field
    next_step = state.get("next_step", "").lower()
    plan_str = state.get("plan_str", "").lower()
    question = state.get("question", "").lower()
    mode = state.get("mode", "hybrid").lower()
    
    selected_nodes = []
    
    # 1. --- MODE OVERRIDE ---
    if mode in ["rag", "local", "local_sql"]:
        print("---MODE: LOCAL SQL (INTERNAL ONLY)---")
        return ["supabase_node"]
    
    if mode == "web_api":
        print("---MODE: WEB API (WEB + CODE + VIDEO)---")
        return ["web_search_node", "github_node", "youtube_node"]
    
    if mode == "arxiv_acad":
        print("---MODE: ARXIV ACADEMIC---")
        return ["arxiv_node"]
        
    if mode == "hybrid_grid":
        print("---MODE: HYBRID GRID (ALL SOURCES)---")
        return ["supabase_node", "web_search_node", "github_node", "youtube_node", "arxiv_node"]

    if mode == "web":
        print("---MODE: WEB ONLY---")
        # Check for specific web modules or default to SearXNG
        if any(k in plan_str or k in question for k in ["github", "code", "repo"]):
            selected_nodes.append("github_node")
        if any(k in plan_str or k in question for k in ["youtube", "video", "tutorial"]):
            selected_nodes.append("youtube_node")
            
        if not selected_nodes or any(k in plan_str or k in question for k in ["web", "news", "searxng"]):
             selected_nodes.append("web_search_node")
        return list(set(selected_nodes)) # De-duplicate
        
    # 2. --- HYBRID LOGIC (Default) ---
    # ALWAYS include local knowledge base in Hybrid/Default mode
    selected_nodes.append("supabase_node")
        
    # GitHub Logic
    if any(k in plan_str or k in next_step or k in question for k in ["github", "code", "repo"]):
        selected_nodes.append("github_node")
        
    # YouTube Logic
    if any(k in plan_str or k in next_step or k in question for k in ["youtube", "video", "tutorial"]):
        selected_nodes.append("youtube_node")
        
    # SearXNG / Web Logic
    # Only add if specifically requested OR if nothing else is selected for a general query
    if any(k in plan_str or k in next_step for k in ["searxng", "web", "internet", "news"]):
        selected_nodes.append("web_search_node")
        
    # --- BIOGRAPHICAL GUARDRAIL ---
    # If query is about a person's life or history, explicitly disable ArXiv to avoid "Dark Energy" papers.
    biographical_triggers = ["who is", "history of", "biography", "life of", "dark history", "scandal", "story of"]
    is_biographical = any(t in question for t in biographical_triggers)
    
    # Academic / ArXiv Logic - HIGHLY STRICTURED
    # Only activate if the user explicitly asks for scholarly papers AND it's not biographical.
    arxiv_keywords = ["arxiv", "scholarly", "peer-reviewed", "academic paper", "research article"]
    if any(k in question or k in plan_str.lower() for k in arxiv_keywords) and not is_biographical:
        # Additional safety check for generic mentions
        if not any(k in question for k in ["news", "latest", "price", "how to"]):
            selected_nodes.append("arxiv_node")
        
    # Build final unique node list
    unique_nodes = list(set(selected_nodes))
    
    # --- MANDATORY FALLBACK ---
    # If no nodes were selected by the logic, default to web search to ensure a response.
    if not unique_nodes:
        print("---ROUTING WARNING: NO NODES SELECTED. FALLING BACK TO WEB SEARCH---")
        unique_nodes = ["web_search_node"]
    
    print(f"---ROUTING TO: {unique_nodes}---")
    
    # LangGraph Routing: If only one node is selected, returning it as a single string is safer
    # than a list in some older versions.
    if len(unique_nodes) == 1:
        return unique_nodes[0]
        
    return unique_nodes

# Build the LangGraph State Machine
workflow = StateGraph(AgentState)

# Define nodes
workflow.add_node("planner", planner_node)
workflow.add_node("supabase_node", supabase_node)
workflow.add_node("github_node", github_node)
workflow.add_node("youtube_node", youtube_node)
workflow.add_node("web_search_node", web_search_node)
workflow.add_node("arxiv_node", arxiv_node)
workflow.add_node("grade_and_filter", grade_and_filter)
workflow.add_node("generate", generate)

# Define edges
workflow.add_edge(START, "planner")

# Conditional Router -> Parallel Tool Execution
workflow.add_conditional_edges(
    "planner",
    route_after_planning,
    {
        "supabase_node": "supabase_node",
        "github_node": "github_node",
        "youtube_node": "youtube_node",
        "web_search_node": "web_search_node",
        "arxiv_node": "arxiv_node"
    }
)

# Tool Nodes -> Grader
workflow.add_edge("supabase_node", "grade_and_filter")
workflow.add_edge("github_node", "grade_and_filter")
workflow.add_edge("youtube_node", "grade_and_filter")
workflow.add_edge("web_search_node", "grade_and_filter")
workflow.add_edge("arxiv_node", "grade_and_filter")

# Grader -> Generator
workflow.add_edge("grade_and_filter", "generate")
workflow.add_edge("generate", END)

# Compile graph
langgraph_app = workflow.compile()
