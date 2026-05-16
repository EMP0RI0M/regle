from typing import List

def format_grader_messages(question: str, doc_content: str) -> List[dict]:
    """
    Constructs the prompt for grading internal documents.
    """
    system_prompt = """You are a grader assessing relevance of a retrieved document to a user question. 
If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant. 
Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
    
    user_prompt = f"Retrieved document: \n\n {doc_content} \n\n User question: {question}"
    
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

def format_web_grader_messages(question: str, doc_content: str) -> List[dict]:
    """
    Constructs the prompt for grading web search results.
    """
    system_prompt = """You are a grader assessing relevance of a web search result to a user question. 
If the search result contains information that could help answer the question, grade it as relevant. 
Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
    
    user_prompt = f"Web result: \n\n {doc_content} \n\n User question: {question}"
    
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
