<a id="top"></a>

# AgentTrust AI Buyer

> **Trust infrastructure for AI-powered commerce.**
>
> AI can decide what to buy. **AgentTrust decides whether it is allowed to pay.**

AgentTrust is an AI commerce trust layer that sits between an AI buyer and payment infrastructure.

It combines **Mistral AI for intent and product selection** with a deterministic **AgentTrust security layer** that evaluates identity, authorization, policies, trust, and risk before allowing a transaction to reach Razorpay.

The core principle is simple:

**AI can recommend. AgentTrust controls money.**


---
## 📑 Table of Contents

- [🚀 Overview](#-overview)
- [🎯 Problem Statement](#-problem-statement)
- [💡 Solution](#-solution)
- [🏗️ Architecture](#️-architecture)
- [🤖 AI Layer — Mistral](#-ai-layer--mistral)
- [🛡️ AgentTrust Security Layer](#️-agenttrust-security-layer)
- [💳 Razorpay Integration](#-razorpay-integration)
- [🗄️ Supabase](#️-supabase)
- [🔄 Transaction Flow](#-transaction-flow)
- [🟢 APPROVE / 🟡 STEP-UP / 🔴 BLOCK](#-approve---step-up---block)
- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Environment Variables](#️-environment-variables)
- [🛠️ Installation](#️-installation)
- [▶️ Running Locally](#️-running-locally)
- [🔌 API Overview](#-api-overview)
- [🧪 Demo Scenarios](#-demo-scenarios)
- [🔐 Security Design](#-security-design)

---



## 🚀 Overview

As AI agents become capable of making purchases on behalf of users, merchants need a way to make those transactions **safe, explainable, bounded, and auditable**.

AgentTrust provides that control layer.

A user can interact with an AI buyer using natural language, for example:

> "I need wireless headphones under ₹10,000."

Mistral understands the request and selects an appropriate product from the catalog.

However, the AI does **not** get permission to make the payment.

The selected purchase is passed through AgentTrust, where the system evaluates:

* Agent identity
* Agent capabilities
* Spending limits
* Allowed categories
* Policy rules
* Trust score
* Risk signals
* Transaction history
* Approval requirements

Only after AgentTrust makes the final decision can the transaction proceed to Razorpay.

---

## 🎯 Problem Statement

This project was built for the **AI Growth & Agentic Commerce** problem space.

The challenge is to:

> **Grow the merchant's revenue and make them sellable to AI buyers.**

The broader problem is that AI agents are increasingly capable of discovering products and initiating purchases, but allowing an AI agent to directly control money creates a major trust and security problem.

A merchant needs to know:

* Who is the agent?
* What is the agent allowed to buy?
* How much can it spend?
* Is the requested category allowed?
* Is the transaction risky?
* Should a human approve it?
* Why was the transaction approved or blocked?
* Can the entire money action be audited?

AgentTrust addresses this gap by introducing a **trust and decision layer between AI agents and payment infrastructure**.

---

## 💡 Solution

AgentTrust separates **decision-making from payment authorization**.

The AI buyer is responsible for understanding the user's intent and selecting a product.

AgentTrust is responsible for deciding whether that purchase is allowed.

The architecture follows:

```text
User
  ↓
AI Buyer
  ↓
Mistral
  ↓
Product Selection
  ↓
AgentTrust
  ├── Identity
  ├── Authorization
  ├── Policy
  ├── Trust
  └── Risk
  ↓
Decision
  ├── APPROVE
  ├── STEP-UP
  └── BLOCK
  ↓
Razorpay
```

This prevents the AI layer from becoming the final authority over money.

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     AI Buyer UI      │
                    │      Next.js         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Mistral AI       │
                    │ Intent + Product     │
                    │     Selection        │
                    └──────────┬───────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │         AgentTrust API         │
              │            FastAPI             │
              ├────────────────────────────────┤
              │ Identity                       │
              │ Authorization                  │
              │ Capability Checks              │
              │ Spending Limits                │
              │ Policy Engine                  │
              │ Trust Score                    │
              │ Risk Engine                    │
              │ Audit Layer                    │
              └───────────────┬────────────────┘
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
                ┌─────────┐       ┌─────────┐
                │Supabase │       │ Decision│
                │ Database│       │ Engine  │
                └─────────┘       └────┬────┘
                                       │
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                     APPROVE        STEP-UP         BLOCK
                         │             │
                         │             ▼
                         │       Human Approval
                         │             │
                         └──────┬──────┘
                                ▼
                         ┌────────────┐
                         │  Razorpay  │
                         │ Test Mode  │
                         └────────────┘
```

The backend remains the final security boundary.

---

## 🤖 AI Layer — Mistral

The AI Buyer uses **Mistral** to understand natural-language shopping requests and select the best matching product from the provided catalog.

The Mistral endpoint:

```text
POST /api/ai/buyer
```

receives:

* User message
* Available product catalog

The model returns:

```json
{
  "product_id": "string",
  "reason": "short explanation",
  "confidence": 0
}
```

The AI layer is intentionally constrained.

It is explicitly instructed to:

* Select only products from the provided catalog
* Never invent products
* Respect explicit budget limits
* Never authorize payments
* Never approve transactions
* Never bypass AgentTrust
* Return structured JSON

The backend also validates that the returned product actually exists in the catalog.

### AI Boundary

The most important design decision is:

```text
Mistral
   ↓
"What should be purchased?"
   
AgentTrust
   ↓
"Is this purchase allowed?"
   
Razorpay
   ↓
"Execute the payment."
```

Mistral never becomes the payment authority.

---

## 🛡️ AgentTrust Security Layer

AgentTrust is the deterministic security boundary of the system.

Before a transaction can proceed, the backend evaluates the agent and transaction against multiple controls.

### Identity

The system identifies the purchasing agent and retrieves its registered information.

### Capabilities

Agents have explicit capabilities such as:

```text
PAYMENT
PURCHASE
```

This prevents an agent without the required capability from performing restricted actions.

### Spending Limits

Agents have transaction-level and daily spending limits.

Example:

```text
Maximum transaction: ₹20,000
Daily limit: ₹1,00,000
```

### Category Restrictions

Agents can only purchase from configured categories such as:

```text
ELECTRONICS
FOOD
TRAVEL
ACCESSORIES
OFFICE
```

### Policy Engine

The policy layer evaluates whether the requested transaction satisfies the merchant's configured rules.

### Trust Score

Each agent has a trust score that contributes to the overall decision.

### Risk Engine

The risk layer evaluates transaction risk using signals such as transaction behavior, velocity, anomalies, and trust-related information.

### Audit Layer

Every important transaction decision can be recorded with:

* Agent ID
* Amount
* Category
* Decision
* Reason
* Risk score
* Trust score
* Timestamp

---

## 💳 Razorpay Integration

Razorpay is used as the actual payment infrastructure in **Test Mode**.

AgentTrust does not directly replace the payment provider.

Instead:

```text
AgentTrust Decision
        ↓
   APPROVE
        ↓
Razorpay Order
        ↓
Razorpay Checkout
```

For a `STEP-UP` decision, the transaction must go through the additional approval flow before payment execution.

For a `BLOCK` decision, the payment flow is stopped.

Razorpay webhooks are also supported for payment event processing and verification.

---

## 🗄️ Supabase

Supabase is used as the persistent data layer.

The database contains tables for:

### `agents`

Stores registered AI agents and their controls.

Important fields include:

```text
id
external_agent_id
name
owner_id
status
trust_score
capabilities
max_transaction
daily_limit
allowed_categories
```

### `transactions`

Stores transaction decisions and risk information.

```text
id
agent_id
amount
category
decision
reason
risk_score
trust_score
status
```

### `approvals`

Stores human approval state for step-up transactions.

```text
transaction_id
agent_id
amount
category
status
approver_id
```

### `payments`

Stores Razorpay payment and order information.

```text
payment_id
order_id
agent_id
amount
category
currency
status
```

### `audit_logs`

Stores the audit trail of transaction decisions.

```text
agent_id
amount
category
decision
reason
risk_score
trust_score
created_at
```

---

## 🔄 Transaction Flow

A complete purchase follows this flow:

```text
1. User describes what they want
              ↓
2. Mistral understands the request
              ↓
3. Mistral selects a catalog product
              ↓
4. AgentTrust receives the transaction
              ↓
5. Agent identity is checked
              ↓
6. Capabilities are checked
              ↓
7. Spending limits are checked
              ↓
8. Policy is evaluated
              ↓
9. Trust and risk are calculated
              ↓
10. AgentTrust makes final decision
              ↓
      ┌───────┼────────┐
      ▼       ▼        ▼
   APPROVE  STEP-UP   BLOCK
      │       │        │
      │       ▼        X
      │   Human        Stop
      │   Approval
      │       │
      └───┬───┘
          ▼
       Razorpay
          ↓
       Payment
          ↓
       Audit Log
```

The critical property is that **AI product selection happens before the security decision, not instead of the security decision**.

---

## 🟢 APPROVE / 🟡 STEP-UP / 🔴 BLOCK

AgentTrust has three important transaction outcomes.

### 🟢 APPROVE

The transaction satisfies the required controls.

```text
AI selects product
       ↓
AgentTrust checks transaction
       ↓
APPROVE
       ↓
Razorpay
```

The payment can proceed.

---

### 🟡 STEP-UP

The transaction requires additional human confirmation.

```text
AI selects product
       ↓
AgentTrust evaluates
       ↓
STEP-UP
       ↓
Human Approval
       ↓
Razorpay
```

This creates an additional safety boundary for transactions that should not be automatically executed.

---

### 🔴 BLOCK

The transaction fails the required security or policy controls.

```text
AI selects product
       ↓
AgentTrust evaluates
       ↓
BLOCK
       ↓
Payment stopped
```

The AI cannot override the decision.

---

## ✨ Features

* Natural-language AI shopping
* Mistral-powered product selection
* Agent identity verification
* Capability-based authorization
* Transaction spending limits
* Daily spending limits
* Category restrictions
* Policy evaluation
* Trust scoring
* Risk evaluation
* Anomaly and velocity checks
* Human approval / STEP-UP flow
* Transaction blocking
* Razorpay Test Mode integration
* Razorpay webhook processing
* Supabase persistence
* Transaction audit trail
* Decision explanations
* Merchant dashboard
* Agent management
* Risk monitoring
* Approval management
* Transaction history

---

## 🧰 Tech Stack

### Frontend

* Next.js `14.2.15`
* React `18.3.1`
* JavaScript / JSX
* Mistral AI SDK

### AI

* Mistral AI
* `@mistralai/mistralai`

### Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* Pydantic Settings

### Database

* Supabase
* PostgreSQL

### Payments

* Razorpay Test Mode
* Razorpay Webhooks

### Infrastructure

* Frontend: Next.js application
* Backend: deployed on Render

Backend deployment:

https://ai-agenttrust.onrender.com

---

## 📁 Project Structure

### Frontend

```text
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ai/
│   │   │       └── buyer/
│   │   │           └── route.js
│   │   ├── buyer/
│   │   │   └── page.jsx
│   │   ├── dashboard/
│   │   │   └── page.jsx
│   │   ├── page.jsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── BuyerAgent.jsx
│   │   ├── Catalog.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ProductCard.jsx
│   │   ├── PaymentCard.jsx
│   │   ├── ApprovalPanel.jsx
│   │   ├── RiskCard.jsx
│   │   ├── AgentCard.jsx
│   │   └── TransactionTable.jsx
│   │
│   └── lib/
│       ├── api.js
│       └── razorpay.js
│
├── package.json
└── ...
```

### Backend

```text
backend/
├── agents/
├── api/
│   └── routes/
│       ├── agents.py
│       ├── approvals.py
│       ├── audit.py
│       ├── payments.py
│       ├── policies.py
│       ├── risk.py
│       └── transactions.py
│
├── audit/
├── authorization/
├── core/
├── db/
├── payments/
├── policy/
├── risk/
├── schemas/
├── services/
├── webhooks/
├── main.py
└── requirements.txt
```

---

## ⚙️ Environment Variables

### Frontend

Create:

```text
.env.local
```

Add:

```env
MISTRAL_API_KEY=your_mistral_api_key
NEXT_PUBLIC_API_URL=your_backend_url
```

Do **not** expose the Mistral API key using `NEXT_PUBLIC_`.

---

### Backend

Create:

```text
.env
```

Example:

```env
ENVIRONMENT=development

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

FRONTEND_URL=http://localhost:3000
```

Never commit `.env` files or secret credentials to GitHub.

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install frontend dependencies

```bash
npm install
```

The frontend uses:

```bash
npm install @mistralai/mistralai
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

Backend dependencies include:

```text
fastapi
uvicorn
pydantic
pydantic-settings
python-dotenv
supabase
httpx
razorpay
```

### 4. Configure environment variables

Create the required `.env` and `.env.local` files.

### 5. Configure Supabase

Create the required tables:

```text
agents
transactions
approvals
payments
audit_logs
```

### 6. Configure Razorpay

Use Razorpay **Test Mode** credentials.

Configure the webhook endpoint according to the deployed backend.

---

## ▶️ Running Locally

### Start the backend

From the backend directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Health check:

```text
GET /health
```

### Start the frontend

From the frontend directory:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

The main application flow is:

```text
/
   ↓
/dashboard
   ↓
/buyer
```

---

## 🔌 API Overview

### Agent APIs

```text
GET /agents
GET /agents/{agent_id}
GET /agents/{agent_id}/identity
GET /agents/{agent_id}/capabilities
GET /agents/{agent_id}/trust
```

### Transaction APIs

```text
POST /transactions/authorize
POST /transactions/decision
```

### Policy APIs

```text
POST /policies/evaluate
```

### Risk APIs

```text
POST /risk/calculate
GET /risk/{agent_id}/trust
```

### Audit APIs

```text
GET /audit/
GET /audit/{agent_id}
```

### Payment APIs

```text
POST /payments/create
POST /payments/order
POST /payments/refund
```

### Approval APIs

```text
POST /approvals/create
POST /approvals/decision
GET /approvals/{transaction_id}
```

### System

```text
GET /
GET /health
```

### AI Buyer

The frontend exposes the Mistral-powered AI buyer route:

```text
POST /api/ai/buyer
```

The AI route is responsible only for product selection.

---

## 🧪 Demo Scenarios

The project includes a catalog designed to demonstrate different transaction outcomes.

### Scenario 1 — Safe Purchase

User:

```text
I want wireless headphones under ₹10,000.
```

Flow:

```text
User Request
     ↓
Mistral selects product
     ↓
AgentTrust evaluates
     ↓
APPROVE
     ↓
Razorpay
```

This demonstrates the normal autonomous purchase path.

---

### Scenario 2 — Additional Verification

A higher-value transaction can trigger the AgentTrust step-up flow.

```text
User Request
     ↓
Mistral selects product
     ↓
AgentTrust evaluates
     ↓
STEP-UP
     ↓
Human Approval
     ↓
Razorpay
```

This demonstrates that higher-risk decisions can require human involvement.

---

### Scenario 3 — Unsafe Transaction

A transaction that violates configured security, authorization, policy, spending, or risk controls can be blocked.

```text
User Request
     ↓
Mistral selects product
     ↓
AgentTrust evaluates
     ↓
BLOCK
     ↓
Payment stopped
```

This demonstrates that the AI cannot bypass the trust layer.

---

## 🔐 Security Design

The core security principle of AgentTrust is:

> **The AI is not the final authority over money.**

Mistral is deliberately restricted to:

```text
Intent Understanding
        +
Product Selection
```

It cannot:

```text
Authorize Payment
Approve Transactions
Bypass Policies
Override Risk
Override AgentTrust
```

The backend is the final decision-maker.

### Defense in Depth

A transaction passes through multiple independent controls:

```text
Identity
   ↓
Capabilities
   ↓
Authorization
   ↓
Spending Limits
   ↓
Policy
   ↓
Trust
   ↓
Risk
   ↓
Decision
   ↓
Payment
```

### Explainability

Transaction decisions contain structured information such as:

```text
Decision
Reason
Risk Score
Trust Score
Agent
Amount
Category
Timestamp
```

This creates an audit trail for money actions.

### Human-in-the-loop

STEP-UP prevents the system from treating every AI-generated purchase as automatically executable.

When required, the system introduces a human approval boundary before payment.

### Failure Handling

During development, one of the practical issues was keeping the AI layer from becoming tightly coupled to the payment/security logic.

The solution was to maintain a strict separation:

```text
Mistral
→ Product recommendation

AgentTrust
→ Security decision

Razorpay
→ Payment execution
```

This separation also makes failures easier to isolate. If AI product selection fails, payment authorization is never reached. If AgentTrust blocks a transaction, the AI cannot override it.

The same principle was used when debugging the frontend: instead of changing the backend security flow to accommodate UI issues, the frontend was corrected while preserving the existing AgentTrust decision pipeline.

---

## 🏆 What AgentTrust Solves

AgentTrust makes AI-driven commerce safer by ensuring that **AI autonomy does not automatically mean payment authority**.

It provides merchants with a controlled path from:

```text
AI Intent
    ↓
Product Selection
    ↓
Identity
    ↓
Authorization
    ↓
Policy
    ↓
Risk
    ↓
Trust
    ↓
Decision
    ↓
Payment
    ↓
Audit
```

The result is an AI commerce system where every money action is:

**Explainable. Bounded. Gated. Auditable.**
---

<p align="center">
  <a href="#top">⬆️ Back to Top</a>
</p>