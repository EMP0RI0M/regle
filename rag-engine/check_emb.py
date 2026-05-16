import asyncio
from src.utils.embedder import get_embedding

async def check():
    emb = await get_embedding("test")
    print(f"Embedding length: {len(emb)}")

if __name__ == "__main__":
    asyncio.run(check())
