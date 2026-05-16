import os
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

# Try importing the specific libraries
try:
    from googleapiclient.discovery import build
    from youtube_transcript_api import YouTubeTranscriptApi
    from src.utils.jit_vector import jit_filter_results
    YOUTUBE_AVAILABLE = True
except ImportError:
    print("Warning: Missing youtube-transcript-api or google-api-python-client. YouTube searching disabled.")
    YOUTUBE_AVAILABLE = False

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

async def search_youtube(query: str, max_results: int = 1) -> List[Dict[str, Any]]:
    """
    Finds a YouTube video for the query, downloads the transcript,
    and JIT vectorizes it to return only the most relevant spoken chunks.
    """
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key or not YOUTUBE_AVAILABLE:
        print("Warning: YouTube API Key missing or libraries not installed.")
        return []

    try:
        # 1. Search YouTube for top video related to query
        youtube = build('youtube', 'v3', developerKey=api_key)
        request = youtube.search().list(
            q=query,
            part='snippet',
            type='video',
            maxResults=max_results,
            relevanceLanguage='en'
        )
        response = await asyncio.to_thread(request.execute)

        all_video_chunks = []

        for item in response.get('items', []):
            video_id = item['id']['videoId']
            raw_title = item['snippet']['title']
            raw_description = item['snippet']['description']
            # Sanitize title for potential print/logging issues on Windows
            video_title = raw_title.encode('ascii', 'ignore').decode('ascii')
            video_url = f"https://www.youtube.com/watch?v={video_id}"

            # 2. Extract Transcript with fallback to description
            try:
                transcript_list = await asyncio.to_thread(YouTubeTranscriptApi.list_transcripts, video_id)
                try:
                    transcript_obj = transcript_list.find_transcript(['en'])
                except:
                    # Generic fallback: just take the first available one (manually created or auto-generated)
                    transcript_obj = next(iter(transcript_list._manually_created_transcripts.values())) if transcript_list._manually_created_transcripts else next(iter(transcript_list._generated_transcripts.values()))
                
                transcript_parts = await asyncio.to_thread(transcript_obj.fetch)
                
                # 3. Create Chunks from transcript
                transcript_chunks = []
                chunk_size_fragments = 8 
                for i in range(0, len(transcript_parts), chunk_size_fragments):
                    batch = transcript_parts[i : i + chunk_size_fragments]
                    content = " ".join([p['text'] for p in batch])
                    start_time = batch[0]['start']
                    transcript_chunks.append({
                        "content": content,
                        "title": raw_title,
                        "url": f"{video_url}&t={int(start_time)}s",
                        "metadata": {
                            "title": raw_title,
                            "source": "youtube",
                            "video_id": video_id,
                            "start_time": start_time
                        },
                        "source": "youtube"
                    })
                
                if transcript_chunks:
                    filtered = await jit_filter_results(query=query, raw_results=transcript_chunks, top_k=3, threshold=0.1)
                    all_video_chunks.extend(filtered)
                    continue # Successfully added transcript chunks

            except Exception:
                # Silently catch common transcript failures and rely on the metadata/description fallback below
                pass

            # Fallback: Just add the video metadata if transcript fails
            all_video_chunks.append({
                "content": raw_description or f"YouTube Video: {raw_title}",
                "title": raw_title,
                "url": video_url,
                "metadata": {
                    "title": raw_title,
                    "url": video_url,
                    "source": "youtube",
                    "video_id": video_id,
                    "type": "youtube_metadata"
                },
                "source": "youtube",
                "similarity": 0.5
            })

        return all_video_chunks[:max_results*3] # Return a few chunks per video
    
    except Exception as e:
        err_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        print(f"YouTube Service Error: {err_msg}")
        return []
