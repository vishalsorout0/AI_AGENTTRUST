import secrets


def generate_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(8)}"


def generate_api_key() -> str:
    return f"at_{secrets.token_urlsafe(32)}"