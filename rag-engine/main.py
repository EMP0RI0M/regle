import asyncio
import sys

# Decisive fix for Windows "Event loop is closed" errors
# This switches from ProactorEventLoop to SelectorEventLoop which is more stable on shutdown.
# We set this at the top level to ensure it applies even when running via uvicorn.
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.api.v1.ingest import router as ingest_router
from src.api.v1.chat import router as chat_router
from src.api.v1.analytics import router as analytics_router
from src.services.llm_service import llm_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup LOGIC
    print("---BACKEND STARTUP: MONITORING SERVICES---")
    
    # Set a custom exception handler for the loop to ignore shutdown noise
    loop = asyncio.get_running_loop()
    def handle_exception(loop, context):
        msg = context.get("exception", context["message"])
        if "Event loop is closed" in str(msg) or "NoneType' object has no attribute 'send'" in str(msg):
            return # Ignore these during shutdown
        print(f"Caught exception: {msg}")
    loop.set_exception_handler(handle_exception)
    
    yield
    # Shutdown LOGIC
    print("---REGLE CONSOLE: RELEASING RESOURCES---")
    try:
        await llm_service.aclose()
    except Exception as e:
        # Silently handle common Windows shutdown errors
        if "Event loop is closed" not in str(e):
            print(f"Shutdown error: {e}")

app = FastAPI(
    title="RAG Backend API",
    description="A high-structure RAG system using FastAPI, Supabase, and Redis.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingest_router, prefix="/api/v1/ingest", tags=["Ingestion"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Query"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {"message": "Welcome to the RAG Backend API. Use /docs for API documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
