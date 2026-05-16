import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Supabase URL or Key not found in environment variables.")

supabase: Client = create_client(url, key)
