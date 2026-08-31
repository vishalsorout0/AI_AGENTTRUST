from pydantic import BaseModel, Field
from typing import List


class AgentCreate(BaseModel):
    external_agent_id: str
    name: str
    owner_id: str

    capabilities: List[str] = Field(
        default_factory=lambda: ["PURCHASE", "CATALOG_SEARCH"]
    )

    max_transaction: float = 5000
    daily_limit: float = 20000

    allowed_categories: List[str] = Field(
        default_factory=lambda: ["ELECTRONICS", "BOOKS"]
    )


class AgentResponse(BaseModel):
    id: str
    external_agent_id: str
    name: str
    owner_id: str
    status: str
    trust_score: float
    capabilities: List[str]
    max_transaction: float
    daily_limit: float
    allowed_categories: List[str]