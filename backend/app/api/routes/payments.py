from fastapi import APIRouter

from app.schemas.payment import (
    PaymentRequest,
    RefundRequest,
    OrderRequest
)

from app.payments.payment_service import create_payment
from app.payments.order_service import create_order
from app.payments.refund_service import create_refund


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/create")
def create(data: PaymentRequest):
    return create_payment(
        agent_id=data.agent_id,
        amount=data.amount,
        category=data.category
    )


@router.post("/order")
def order(data: OrderRequest):
    return create_order(
        amount=data.amount,
        currency=data.currency,
        transaction_id=data.transaction_id
    )


@router.post("/refund")
def refund(data: RefundRequest):
    return create_refund(
        payment_id=data.payment_id,
        amount=data.amount
    )