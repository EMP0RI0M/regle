import os
import httpx
import base64
from typing import List, Dict, Any
from dotenv import load_dotenv

# Optional Dependencies for PDF-to-Image
try:
    import fitz # PyMuPDF
    from PIL import Image
    VISION_LIBS_AVAILABLE = True
except ImportError:
    print("Warning: PyMuPDF or pillow not installed. Vision ingestion will be limited.")
    VISION_LIBS_AVAILABLE = False

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# Using model from .env for vision-centric ingestion
VISION_MODEL = os.getenv("OPENROUTER_VISION_MODEL", "nvidia/nemotron-nano-12b-v2-vl:free")
OPENROUTER_EMBEDDING_MODEL = os.getenv("OPENROUTER_EMBEDDING_MODEL", "nvidia/llama-nemotron-embed-vl-1b-v2:free")

async def process_document_vision(file_path: str) -> str:
    """
    Converts a document (PDF/Image) into a visual description using Vision Models.
    Iterates through up to 10 pages for PDFs.
    """
    if not VISION_LIBS_AVAILABLE:
        return "Vision processing unavailable (missing libraries)."
    
    if not OPENROUTER_API_KEY:
        return "Vision processing unavailable (missing API Key)."

    try:
        combined_text = []
        
        # --- CASE 1: MULTI-PAGE PDF ---
        if file_path.lower().endswith(".pdf"):
            doc = fitz.open(file_path)
            num_pages = min(len(doc), 10) # Limit to 10 pages for stability
            
            for i in range(num_pages):
                print(f"---PROCESSING PDF PAGE {i+1}/{num_pages}---")
                page = doc.load_page(i)
                pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
                img_data = pix.tobytes("png")
                base64_image = base64.b64encode(img_data).decode("utf-8")
                
                page_content = await extract_vision_content(base64_image, f"Extract text and summarize charts from page {i+1} of this document.")
                if page_content:
                    combined_text.append(f"--- PAGE {i+1} ---\n{page_content}")
            
            doc.close()
            return "\n\n".join(combined_text) if combined_text else "No content extracted from PDF."

        # --- CASE 2: SINGLE IMAGE ---
        else:
            with open(file_path, "rb") as f:
                img_data = f.read()
            base64_image = base64.b64encode(img_data).decode("utf-8")
            
            content = await extract_vision_content(base64_image, "Describe this document in detail. Extract all text, identify charts, tables, and the core purpose.")
            return content or "Failed to extract content from image."
            
    except Exception as e:
        print(f"Vision Service Exception for {file_path}: {e}")
        return f"Failed to process document vision: {e}"

async def extract_vision_content(base64_image: str, prompt: str) -> str:
    """Helper to call OpenRouter Vision API."""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": VISION_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    { "type": "text", "text": prompt },
                    { "type": "image_url", "image_url": { "url": f"data:image/png;base64,{base64_image}" } }
                ]
            }
        ],
        "max_tokens": 1000
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=60.0)
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"Vision API Error ({response.status_code}): {response.text}")
                return None
        except Exception as e:
            print(f"Vision Request Error: {e}")
            return None
