from supabase import create_client, Client

from app.core.config import settings

SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_key

supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
    )

def is_configured():
    return supabase is not None