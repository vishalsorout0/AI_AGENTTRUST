from pydantic import BaseModel


class PaymentRequest(BaseModel):
    agent_id: str
    amount: float
    category: str


class RefundRequest(BaseModel):
    payment_id: str
    amount: float


class OrderRequest(BaseModel):
    amount: float
    currency: str = "INR"