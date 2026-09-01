from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.database import supabase
from app.payments.payment_service import create_payment


router = APIRouter(
    prefix="/approvals",
    tags=["Approvals"]
)

approvals = {}


class ApprovalRequest(BaseModel):
    transaction_id: str
    approved: bool
    approver_id: str = "admin_demo_001"


def create_approval_request(
    transaction_id: str,
    agent_id: str = None,
    amount: float = 0,
    category: str = ""
):
    approval = {
        "transaction_id": transaction_id,
        "status": "PENDING",
        "approver_id": None
    }

    approvals[transaction_id] = approval

    if supabase:
        supabase.table("approvals").upsert({
            "transaction_id": transaction_id,
            "agent_id": agent_id,
            "amount": amount,
            "category": category,
            "status": "PENDING",
            "approver_id": None
        }).execute()

    return approval


@router.post("/create")
def create_approval(transaction_id: str):
    return create_approval_request(transaction_id)


@router.post("/decision")
def approval_decision(data: ApprovalRequest):
    approval = None

    if supabase:
        response = (
            supabase
            .table("approvals")
            .select("*")
            .eq("transaction_id", data.transaction_id)
            .execute()
        )

        if response.data:
            approval = response.data[0]

    if not approval:
        approval = approvals.get(data.transaction_id)

    if not approval:
        raise HTTPException(
            status_code=404,
            detail="Approval request not found"
        )

    status = "APPROVED" if data.approved else "REJECTED"

    approval["status"] = status
    approval["approver_id"] = data.approver_id

    if supabase:
        response = (
            supabase
            .table("approvals")
            .update({
                "status": status,
                "approver_id": data.approver_id
            })
            .eq("transaction_id", data.transaction_id)
            .execute()
        )

        if response.data:
            approval = response.data[0]

    approvals[data.transaction_id] = approval

    return approval

@router.get("/{transaction_id}")
def get_approval(transaction_id: str):
    if supabase:
        response = (
            supabase
            .table("approvals")
            .select("*")
            .eq("transaction_id", transaction_id)
            .execute()
        )

        if response.data:
            return response.data[0]

    approval = approvals.get(transaction_id)

    if not approval:
        raise HTTPException(
            status_code=404,
            detail="Approval request not found"
        )

    return approval