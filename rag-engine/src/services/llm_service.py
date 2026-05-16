import os
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

class LLMService:
    """
    Service for all LLM interactions using OpenRouter.
    """
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-nano-30b-a3b:free")
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables.")
        
        self.client = AsyncOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=300.0
        )

    async def chat_completion(self, messages: List[Dict[str, str]], model: Optional[str] = None) -> str:
        """
        Sends a chat completion request to OpenRouter with optional model override.
        """
        target_model = (model or self.model).strip()
        try:
            print(f"---LLM CALL [Model: {target_model}]---")
            response = await self.client.chat.completions.create(
                model=target_model,
                messages=messages,
            )
            content = response.choices[0].message.content
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            return content, usage
        except Exception as e:
            print(f"LLM Chat Completion error ({target_model}): {e}")
            return f"I'm sorry, I encountered an error while communicating with the AI model ({target_model}).", {}

    async def aclose(self):
        """
        Closes the underlying OpenAI client connection.
        """
        try:
            await self.client.close()
            print("---LLM CLIENT CLOSED---")
        except Exception as e:
            print(f"Error closing LLM client: {e}")

# Singleton instance
llm_service = LLMService()

if __name__ == "__main__":
    import asyncio
    import sys
    query = sys.argv[1] if len(sys.argv) > 1 else "Hello"
    async def test():
        res = await llm_service.chat_completion([{"role": "user", "content": query}])
        print(f"Response: {res}")
    asyncio.run(test())
