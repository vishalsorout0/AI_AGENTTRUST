from pydantic import BaseModel


class RiskRequest(BaseModel):
    agent_id: str
    amount: float
    category: str
    transaction_count: int = 0