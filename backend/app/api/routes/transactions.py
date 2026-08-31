from fastapi import APIRouter
from app.api.routes.approvals import create_approval_request


from app.schemas.transaction import (
    AuthorizationRequest,
    TransactionRequest
)

from app.authorization.authorization_engine import authorize_transaction
from app.services.transaction_orchestrator import process_transaction



router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.post("/authorize")
def authorize(data: AuthorizationRequest):
    return authorize_transaction(
        agent_id=data.agent_id,
        amount=data.amount,
        category=data.category
    )


@router.post("/decision")
def transaction_decision(data: TransactionRequest):
    return process_transaction(
        agent_id=data.agent_id,
        amount=data.amount,
        category=data.category,
        transaction_count=data.transaction_count
    )