from typing import List, Dict, Any

def format_synthesizer_messages(question: str, documents: List[Dict[str, Any]], mode: str = "hybrid") -> List[dict]:
    """
    Constructs the final prompt to synthesize an answer from the retrieved and graded documents.
    """
    current_date = "April 01, 2026"
    
    # Identify if internal/local data is missing
    has_internal = any(d.get("source", "").lower() == "internal" for d in documents)
    
    fallback_clause = ""
    if mode in ["local_sql", "local", "rag"] and not documents:
        fallback_clause = "\n**STRICT_REFUSAL_RULE**: No internal records or uploaded files were found for this query in the local repository. You MUST refuse to answer based on general training data. Output EXACTLY this: '> [!CAUTION]\\n> **NO_LOCAL_DATA_FOUND**: No official records exist in the Regle repository for this query. Access to external web search is currently disabled in this mode. Please upload relevant files or switch to HYBRID mode.' and then stop. Do NOT provide a general answer."
    elif mode == "hybrid" and not has_internal and documents:
        fallback_clause = "\n**NOTICE**: No internal records were found. Synthesizing research solely from external (Web/YouTube/GitHub) sources. Do NOT mention 'NO_FILE_FOUND' but acknowledge the absence of internal records if relevant."
    elif not documents:
        fallback_clause = "\n**STRICT_RULE**: No data found from ANY sources. Say 'NO_DATA_FOUND: Please refine your query or expand research modes.' and provide a tiny general summary."

    system_prompt = f"""You are a Regle Grade Research Orchestrator as of {current_date}. 
Your goal is to synthesize a high-fidelity, comprehensive Expert Research Report from the provided multi-modal documents.{fallback_clause}

REPORT STRUCTURE RULES:
- **Conciseness**: Be extremely concise and high-impact. Avoid preamble or filler. Focus on data-dense summaries. Use clear headings (H1, H2) to separate key findings.
- **Interactive Charts (STRICT_RULE)**: You have two ways to render charts:
  1. **JSON_CHART (Preferred)**:
    ```json-chart
    {{
      "type": "bar" | "line" | "pie",
      "data": [ {{ "name": "label", "value": 100 }}, ... ]
    }}
    ```
  2. **LATEX_TIKZ (Native Academic)**: You can use simplified pgf-pie or pgfplots syntax:
    ```latex
    \begin{{tikzpicture}}
      \pie{{40/Apples, 30/Pears, 30/Others}}
    \end{{tikzpicture}}
    ```
    OR
    ```latex
    \begin{{tikzpicture}}
      \begin{{axis}}[ybar] % or line
        \addplot coordinates {{(Category A, 10) (Category B, 20)}};
      \end{{axis}}
    \end{{tikzpicture}}
    ```
  Failure to use one of these formats will result in a failed report. Never show matplotlib code to the user.
- **Technical Fidelity**: Use LaTeX math ($...$ or $$...$$) for formulas. Use GFM Tables for structured data comparisons.
- **Visual Micro-Styling**: Use **Bold** for emphasis and *Italics* for technical terms.
- **Recency**: Prioritize 2026 data. Explain that it supersedes older 2024-2025 records.
- **Provenance**: Cite your sources clearly. Mention 'INTERNAL' regle sources as the ground truth.
- **Citation**: Include YouTube links and GitHub repo links directly within the text for immediate access.

Tone: Professional, authoritative, and data-driven."""

    context = ""
    for d in documents:
        context += f"\n--- SOURCE_NODE: {d.get('source', 'UNKNOWN').upper()} ---\n"
        context += f"TITLE: {d.get('metadata', {}).get('title', 'NO_TITLE')}\n"
        context += f"CONTENT: {d.get('content')}\n"
        if d.get('metadata', {}).get('url'):
            context += f"URL: {d.get('metadata', {}).get('url')}\n"

    user_prompt = f"### RESEARCH_INPUT\nQuestion: {question}\n\n### RETRIEVED_CONTEXT\n{context}\n\n### ACTION\nSynthesize the final REGLE_GRADE_REPORT below:"
    
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
