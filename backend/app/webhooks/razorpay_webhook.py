import json

from fastapi import APIRouter, Request, HTTPException

from app.webhooks.signature import verify_webhook_signature
from app.webhooks.event_processor import process_razorpay_event


router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"]
)


@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    body = await request.body()

    signature = request.headers.get(
        "X-Razorpay-Signature"
    )

    if not signature:
        raise HTTPException(
            status_code=400,
            detail="Missing Razorpay signature"
        )

    if not verify_webhook_signature(
        body,
        signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay signature"
        )

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON payload"
        )

    return process_razorpay_event(event)