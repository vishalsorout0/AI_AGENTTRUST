import os
import hmac
import hashlib


def verify_signature(payload: bytes, signature: str):
    secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")

    if not secret:
        return False

    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature)