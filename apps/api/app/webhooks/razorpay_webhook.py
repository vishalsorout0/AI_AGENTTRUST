from fastapi import APIRouter, Request, Header, HTTPException

from .signature import verify_signature

router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"]
)


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None)
):
    payload = await request.body()

    if not x_razorpay_signature:
        raise HTTPException(
            status_code=400,
            detail="Missing Razorpay signature"
        )

    if not verify_signature(
        payload,
        x_razorpay_signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook signature"
        )

    event = await request.json()

    return {
        "success": True,
        "message": "Webhook verified",
        "event": event.get("event")
    }