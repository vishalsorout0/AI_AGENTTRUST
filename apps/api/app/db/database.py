from supabase import create_client, Client
from ..core.config import settings


supabase: Client | None = None


def get_supabase() -> Client:
    global supabase

    if supabase is None:
        if not settings.supabase_url or not settings.supabase_key:
            raise RuntimeError(
                "Supabase configuration missing. "
                "Set SUPABASE_URL and SUPABASE_KEY in .env"
            )

        supabase = create_client(
            settings.supabase_url,
            settings.supabase_key
        )

    return supabase