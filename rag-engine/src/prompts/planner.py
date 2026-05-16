from typing import List
from datetime import datetime

def format_planner_messages(question: str, mode: str = "hybrid") -> List[dict]:
    """
    Constructs the prompt for the Master Orchestrator's Planning & Routing layer.
    """
    current_date = "March 31, 2026"
    
    # Dynamically build the available tools list and rules based on mode
    tools = [
        "1. Supabase (Vision/Internal): Use for private documents, uploaded PDFs, images, user-specific knowledge, and anything marked as 'local' or 'internal'.",
        "2. GitHub (Public Code): Use for implementation logic, code patterns, and public software repositories.",
        "3. YouTube (Video/Tutorial): Use for visual explanations, walkthroughs, and conceptual tutorials.",
        "4. SearXNG (Web/Facts): Use for general information, real-time news, facts, and public internet data.",
        "5. ArXiv (Academic): ONLY for Physics, Math, CS, and formal science. DO NOT use for biographies, people, scandals, or general history."
    ]
    
    extra_rules = [
        "- If 'search scholarly papers', 'academic search', or 'arxiv' is explicitly requested -> Use ArXiv.",
        "- IMPORTANT: If the query is about a person's life, 'dark history', biography, or scandals -> EXPLICITLY FORBID ArXiv. Use SearXNG and YouTube instead.",
        "- If 'code', 'repository', or 'how to implement' is mentioned -> Prioritize GitHub.",
        "- If 'my notes', 'internal project', 'uploaded file', 'local', or 'internal source' is mentioned -> Prioritize Supabase.",
        "- If 'watch', 'video tutorial', or 'visual demo' is mentioned -> Prioritize YouTube.",
        "- If it's a general question or latest news -> Prioritize SearXNG.",
        "- For complex queries, use COMBINATION of tools (e.g., YouTube + SearXNG)."
    ]

    if mode in ["rag", "local", "local_sql"]:
        tools = [tools[0]] # Only Supabase
        extra_rules = ["- **STRICT_MODE**: You are in LOCAL-ONLY mode. You MUST ONLY use 'Supabase'. Any mention of external tools will result in system failure."]
    elif mode == "web_api":
        tools = tools[1:4] # GitHub, YouTube, SearXNG
        extra_rules = ["- **STRICT_MODE**: You are in WEB-ONLY mode. Do NOT use Supabase."]
    elif mode == "arxiv_acad":
        tools = [tools[4]] # ArXiv
        extra_rules = ["- **STRICT_MODE**: You are in ACADEMIC-ONLY mode. Use ONLY ArXiv."]

    tools_str = "\n".join(tools)
    rules_str = "\n".join(extra_rules)

    system_prompt = f"""You are a Master Orchestrator AI designed to categorize user intent and select the best tools from your high-fidelity research suite.

**IMPORTANT**: Today is {current_date}. 
Research reports MUST prioritize the most up-to-date information. If the question is about news or events, explicitly seek March 2026 or 2026-specific data in your reasoning steps.

Available Tools:
{tools_str}

Logic Rules:
{rules_str}

Output Format (STRICTLY XML):
<plan>
<step>Step 1 description (Tool Name)</step>
<step>Step 2 description (Tool Name)</step>
</plan>
<tools>Supabase, GitHub, etc.</tools>
<routing>supabase, github, etc.</routing>
"""
    
    user_prompt = f"User Question: '{question}'\nWrite a 3-step reasoning plan and identify exactly which tools you will use. Remember to search for the most recent 2026 data."
    
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
