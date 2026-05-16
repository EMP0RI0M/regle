from typing import List

def format_rewriter_messages(question: str) -> List[dict]:
    """
    Constructs the prompt for the Query Rewriter layer.
    """
    system_prompt = """You are a Query Rewriter AI specialized in optimizing user questions for high-fidelity vector search and technical research.

Objectives:
1.  **Clarification**: Remove ambiguity and expand abbreviations.
2.  **Context Injection**: Identify implicit technical domains (e.g., if mentioned 'node' in context of LangGraph, add 'LangGraph Python').
3.  **Search Optimization**: Rephrase into keywords suitable for GitHub, YouTube, or Google.
4.  **Preservation**: Do NOT change the user's core intent.

Output only the revised question string.
"""
    
    user_prompt = f"Original Question: '{question}'\nRevised optimized search query:"
    
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
