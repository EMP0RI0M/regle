import os
import asyncio
from github import Github
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def search_github(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """
    Search GitHub for relevant code and repositories using the official PyGithub library.
    Wrapped in an async function to maintain consistency with other services.
    """
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("Warning: GITHUB_TOKEN not found in .env.")
        return []

    try:
        # PyGithub is synchronous, so we run the blocking calls in a thread if needed,
        # but for simplicity we'll just run it directly as it's a wrapper for our orchestrator.
        def _sync_search():
            g = Github(token)
            
            # 1. Search code specifically
            code_results = g.search_code(query=query)
            
            results = []
            for i, file in enumerate(code_results):
                if i >= max_results:
                    break
                
                try:
                    repo = file.repository
                    content = file.decoded_content.decode('utf-8')
                    if len(content) > 3000:
                        content = content[:3000] + "... [truncated]"
                    
                    results.append({
                        "content": f"Repository: {repo.full_name}\nFile: {file.path}\n\n{content}",
                        "metadata": {
                            "title": f"{repo.name} - {file.name}",
                            "url": file.html_url,
                            "repository": repo.full_name,
                            "language": repo.language
                        },
                        "source": "github"
                    })
                except Exception as e:
                    print(f"Error fetching GitHub file content: {e}")
                    continue
            
            if not results:
                repo_results = g.search_repositories(query=query)
                for i, repo in enumerate(repo_results):
                    if i >= max_results:
                        break
                    results.append({
                        "content": f"Repository: {repo.full_name}\nDescription: {repo.description}\nTopics: {', '.join(repo.get_topics() if hasattr(repo, 'get_topics') else [])}",
                        "metadata": {
                            "title": repo.full_name,
                            "url": repo.html_url,
                            "repository": repo.full_name,
                            "language": repo.language
                        },
                        "source": "github"
                    })
            return results

        return await asyncio.to_thread(_sync_search)
        
    except Exception as e:
        print(f"GitHub Search Error: {e}")
        return []

async def ingest_github_repo(repo_url: str, project_id: Optional[str] = None, user_id: Optional[str] = None):
    """
    Ingests a GitHub repository into the knowledge base.
    """
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        return {"status": "error", "message": "GITHUB_TOKEN not found."}

    try:
        # Extract owner and repo from URL
        parts = repo_url.rstrip("/").split("/")
        if len(parts) < 2:
            return {"status": "error", "message": "Invalid GitHub URL."}
        
        repo_name = f"{parts[-2]}/{parts[-1]}"
        
        def _sync_ingest():
            g = Github(token)
            repo = g.get_repo(repo_name)
            contents = repo.get_contents("")
            processed_count = 0
            
            # Recursive function to process files
            # For brevity, we'll limit to top-level or first few directories
            # In a real app, we'd use a more robust crawler.
            files_to_process = []
            while contents:
                file_content = contents.pop(0)
                if file_content.type == "dir":
                    contents.extend(repo.get_contents(file_content.path))
                else:
                    if any(file_content.name.lower().endswith(ext) for ext in [".py", ".ts", ".tsx", ".js", ".jsx", ".md", ".txt"]):
                        files_to_process.append(file_content)
                
                if len(files_to_process) > 20: # Limit for demo
                    break
            
            return files_to_process, repo

        files, repo_obj = await asyncio.to_thread(_sync_ingest)
        
        from src.services.ingestion_service import ingest_document
        import tempfile

        results = []
        for file in files:
            try:
                with tempfile.NamedTemporaryFile(mode="w", suffix=file.name, delete=False) as tmp:
                    content = file.decoded_content.decode("utf-8")
                    tmp.write(content)
                    tmp_path = tmp.name
                
                res = await ingest_document(tmp_path, project_id=project_id, user_id=user_id)
                os.remove(tmp_path)
                results.append(res)
            except:
                continue

        return {
            "status": "success", 
            "message": f"Ingested {len(results)} files from {repo_obj.full_name}",
            "repo": repo_obj.full_name
        }
    except Exception as e:
        print(f"GitHub Ingest Error: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Test ingestion
    import sys
    if len(sys.argv) > 1:
        asyncio.run(ingest_github_repo(sys.argv[1]))
    else:
        print("Please provide a repository URL to ingest.")
