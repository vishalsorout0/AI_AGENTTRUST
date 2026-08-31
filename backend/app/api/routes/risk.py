from fastapi import APIRouter

from app.schemas.risk import RiskRequest
from app.risk.risk_engine import calculate_transaction_risk
from app.risk.trust_score import calculate_trust_score


router = APIRouter(
    prefix="/risk",
    tags=["Risk"]
)


@router.post("/calculate")
def calculate_risk(data: RiskRequest):
    return calculate_transaction_risk(
        agent_id=data.agent_id,
        amount=data.amount,
        category=data.category,
        transaction_count=data.transaction_count
    )


@router.get("/{agent_id}/trust")
def get_trust(agent_id: str):
    return calculate_trust_score(agent_id)