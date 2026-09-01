"use client";

import Link from "next/link";

const POLICIES = [
  {
    name: "Maximum Transaction",
    value: "Agent-specific limit",
    status: "ACTIVE"
  },
  {
    name: "Daily Spending Limit",
    value: "Agent-specific limit",
    status: "ACTIVE"
  },
  {
    name: "High Risk Transactions",
    value: "STEP-UP / BLOCK",
    status: "ACTIVE"
  },
  {
    name: "Unauthorized Merchant",
    value: "BLOCK",
    status: "ACTIVE"
  },
  {
    name: "Human Approval",
    value: "Required for STEP-UP",
    status: "ACTIVE"
  }
];

export default function PoliciesPage() {
  return (
    <main className="dashboard-page">
      <nav className="top-nav">
        <Link href="/dashboard">
          ← Merchant Console
        </Link>

        <span>
          AgentTrust / Policies
        </span>
      </nav>

      <div className="page-title">
        <span className="eyebrow">
          DETERMINISTIC CONTROLS
        </span>

        <h1>Policy Center</h1>

        <p>
          Rules that determine whether an AI
          transaction can proceed.
        </p>
      </div>

      <div className="policy-list">
        {POLICIES.map((policy) => (
          <div
            className="policy-row"
            key={policy.name}
          >
            <div>
              <strong>{policy.name}</strong>
              <span>{policy.value}</span>
            </div>

            <span className="policy-status">
              {policy.status}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}