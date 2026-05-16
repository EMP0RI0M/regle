import os
import httpx
from typing import List, Union
from dotenv import load_dotenv

# We initialize FastEmbed conditionally or globally if preferred.
try:
    from fastembed import TextEmbedding
    local_encoder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    # This downloads the model on the first run.
except ImportError:
    print("Warning: fastembed not installed. Local embeddings will fail.")
    local_encoder = None

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_EMBED_API_KEY = os.getenv("OPENROUTER_EMBED_API_KEY", OPENROUTER_API_KEY)
OPENROUTER_EMBEDDING_MODEL = os.getenv("OPENROUTER_EMBEDDING_MODEL", "nvidia/llama-nemotron-embed-vl-1b-v2:free")

async def call_openrouter_nvidia_embeddings(text_list: list[str]) -> list[list[float]]:
    """
    Calls OpenRouter for high-accuracy Nvidia Nemotron embeddings.
    """
    url = "https://openrouter.ai/api/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_EMBED_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": OPENROUTER_EMBEDDING_MODEL,
        "input": text_list
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload, timeout=90.0)
        response.raise_for_status()
        data = response.json()
        
        # OpenRouter returns a list of data objects with 'embedding' key
        embeddings = [item["embedding"] for item in data["data"]]
        return embeddings

async def get_embeddings(text_list: Union[str, list[str]], source: str = "document") -> list[list[float]]:
    """
    Dual-Embedder Router:
    - 'search': Fast, Local, CPU via FastEmbed
    - 'document': High-Accuracy, Remote via Nvidia/Nemotron
    """
    if isinstance(text_list, str):
        text_list = [text_list]
        
    if source == "search":
        if not local_encoder:
            raise RuntimeError("fastembed is required for search embeddings.")
        # fastembed returns an iterator of numpy arrays, convert to lists of floats
        num_arrays = list(local_encoder.embed(text_list))
        return [arr.tolist() for arr in num_arrays]
        
    elif source == "document" or source == "internal":
        try:
            return await call_openrouter_nvidia_embeddings(text_list)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 402:
                print("Warning: OpenRouter 402 Payment Required. Falling back to Local FastEmbed.")
                if not local_encoder:
                    raise RuntimeError("fastembed is required for fallback embeddings.")
                return [arr.tolist() for arr in list(local_encoder.embed(text_list))]
            raise e
        except Exception as e:
            print(f"Embedding Error: {e}. Attempting Local Fallback.")
            if local_encoder:
                 return [arr.tolist() for arr in list(local_encoder.embed(text_list))]
            raise e
    else:
        raise ValueError(f"Unknown embedding source: {source}")

# Backwards compatibility / Convenience method for singular strings
async def get_embedding(text: str, source: str = "document") -> list[float]:
    embeddings = await get_embeddings([text], source=source)
    return embeddings[0]
