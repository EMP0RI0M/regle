import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.prompts.synthesizer import format_synthesizer_messages

def test_strict_refusal_local():
    question = "What is the secret code?"
    documents = [] # No documents found
    mode = "local"
    
    messages = format_synthesizer_messages(question, documents, mode=mode)
    
    system_prompt = messages[0]['content']
    print("--- SYSTEM PROMPT ---")
    print(system_prompt)
    
    assert "STRICT_REFUSAL_RULE" in system_prompt
    assert "NO_LOCAL_DATA_FOUND" in system_prompt
    assert "refuse to answer" in system_prompt.lower()
    
    print("\nSUCCESS: Strict refusal rule found in system prompt for Local mode.")

def test_hybrid_fallback():
    question = "What is the secret code?"
    documents = [{"source": "web", "content": "Some web info", "metadata": {"title": "Web Source"}}]
    mode = "hybrid"
    
    messages = format_synthesizer_messages(question, documents, mode=mode)
    system_prompt = messages[0]['content']
    
    assert "NOTICE" in system_prompt
    assert "No internal records were found" in system_prompt
    
    print("SUCCESS: Hybrid mode correctly identifies missing internal records but allows synthesis.")

if __name__ == "__main__":
    test_strict_refusal_local()
    test_hybrid_fallback()
