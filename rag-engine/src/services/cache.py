import os
import json
from typing import Optional, Any
from upstash_redis import Redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

class CacheService:
    """
    Handles caching via Upstash Redis.
    """
    def __init__(self):
        url = os.getenv("UPSTASH_REDIS_REST_URL")
        token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        
        if not url or not token:
            print("Warning: Redis configuration missing. Cache disabled.")
            self.redis = None
        else:
            self.redis = Redis(url=url, token=token)

    def get(self, key: str) -> Optional[Any]:
        if not self.redis:
            return None
        try:
            val = self.redis.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            print(f"Cache Get Error: {e}")
            return None

    def set(self, key: str, value: Any, ex: int = 3600):
        if not self.redis:
            return
        try:
            self.redis.set(key, json.dumps(value), ex=ex)
        except Exception as e:
            print(f"Cache Set Error: {e}")

# Singleton
cache_service = CacheService()
