from pydantic import BaseModel


class AuthorizationRequest(BaseModel):
    agent_id: str
    amount: float
    category: str


class TransactionRequest(BaseModel):
    agent_id: str
    amount: float
    category: str
    transaction_count: int = 0