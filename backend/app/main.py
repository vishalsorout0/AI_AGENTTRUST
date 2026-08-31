from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes.transactions import router as transactions_router
from .api.routes.agents import router as agents_router
from .api.routes.policies import router as policies_router
from .api.routes.risk import router as risk_router
from .api.routes.audit import router as audit_router
from .api.routes.payments import router as payments_router
from .webhooks.razorpay_webhook import router as webhook_router
from app.api.routes.approvals import router as approvals_router
from app.webhooks.razorpay_webhook import router as razorpay_webhook_router
from app.db.database import is_configured




app = FastAPI(
    title="AgentTrust API",
    description="Trust infrastructure for AI-powered commerce",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(agents_router)
app.include_router(transactions_router)
app.include_router(policies_router)
app.include_router(risk_router)
app.include_router(audit_router)
app.include_router(payments_router)
app.include_router(webhook_router)
app.include_router(approvals_router)
app.include_router(razorpay_webhook_router)


@app.get("/")
def root():
    return {
        "name": "AgentTrust",
        "status": "running",
        "message": "AI commerce trust layer is online",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "supabase_configured": is_configured()
    }