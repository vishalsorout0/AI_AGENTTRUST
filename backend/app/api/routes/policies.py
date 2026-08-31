from fastapi import APIRouter

from app.schemas.policy import PolicyRequest
from app.policy.policy_engine import evaluate_policy


router = APIRouter(
    prefix="/policies",
    tags=["policies"]
)


@router.post("/evaluate")
def evaluate(data: PolicyRequest):
    return evaluate_policy(
        amount=data.amount,
        category=data.category
    )