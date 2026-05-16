import os
import re
from typing import List, Dict, Any
from datetime import datetime

# Define highly credible sources
PREMIUM_SOURCES = ["reuters", "al jazeera", "iran international", "independent", "bbc", "internal", "supabase", "arxiv", "academic"]

def rerank_documents(query: str, documents: List[Dict[str, Any]], top_k: int = None) -> List[Dict[str, Any]]:
    """
    Enhanced reranking based on:
    1. Recency (Dates found in content)
    2. Credibility (Source reputation)
    3. Business Rules (Internal priority)
    """
    if top_k is None:
        top_k = int(os.getenv("RAG_TOP_K", "5"))

    if not documents:
        return []

    def get_score(doc):
        score = 0
        content = doc.get("content", "").lower()
        source = doc.get("source", "").lower()
        metadata = doc.get("metadata", {})
        title = (metadata.get("title") or "").lower()

        # --- 1. Recency Weighting ---
        # Look for 2026 vs 2025 in content or title
        if "2026" in content or "2026" in title or "march" in content:
            score += 100
        elif "2025" in content or "2025" in title:
            score += 50

        # --- 2. Credibility Weighting ---
        # Check if source is in premium list
        for premium in PREMIUM_SOURCES:
            if premium in source or premium in (metadata.get("url") or "").lower():
                score += 80
                break

        # --- 3. Internal Priority ---
        if source in ["internal", "supabase", "regle"]:
            score += 150
            
        # --- 4. Similarity match (if present) ---
        score += float(doc.get("similarity", 0)) * 10
        
        return score

    # Sort by our custom score
    reranked = sorted(documents, key=get_score, reverse=True)
    
    return reranked[:top_k]
