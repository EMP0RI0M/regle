import os
import json
from fastmcp import FastMCP
from src.agents.graph import langgraph_app
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Create FastMCP server
# This can be run using the 'mcp dev mcp_server.py' command or similar.
mcp = FastMCP("RAG Engine Server")

@mcp.tool()
async def advanced_search(query: str) -> str:
    """
    Search both internal documents (Supabase) and the web (SearXNG) for an answer.
    This runs a complex Agentic RAG loop to guarantee factual and grounded responses.
    """
    try:
        # Initialize state for LangGraph
        initial_state = {
            "question": query,
            "raw_documents": [],
            "filtered_documents": [],
            "generation": "",
            "search_needed": False,
            "steps": [],
            "plan": [],
            "plan_str": "",
            "next_step": "",
            "grades": []
        }
        
        # We can implement astream_events here in the future to report tool thinking
        result = await langgraph_app.ainvoke(initial_state)
        
        # Format the response for the AI client
        response_text = result.get("generation", "No generation produced.")
        
        # Include source metadata if available
        documents = result.get("filtered_documents", [])
        if documents:
            sources = list(set([c.get("metadata", {}).get("url") or c.get("source") for c in documents if isinstance(c, dict)]))
            if sources:
                response_text += "\n\nSources:\n- " + "\n- ".join(sources)
                
        return response_text
    except Exception as e:
        return f"Error performing search: {str(e)}"

if __name__ == "__main__":
    # Run the MCP server
    mcp.run()
