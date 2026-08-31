from pydantic import BaseModel


class PolicyRequest(BaseModel):
    amount: float
    category: str