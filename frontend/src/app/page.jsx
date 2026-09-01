"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="landing">
      <div className="landing-card">
        <div className="brand">
          <div className="brand-mark">A</div>
          <span>AgentTrust</span>
        </div>

        <div className="hero">
          <div className="eyebrow">
            TRUST INFRASTRUCTURE FOR AI COMMERCE
          </div>

          <h1>
            AI can decide.
            <br />
            <span>AgentTrust decides if it can pay.</span>
          </h1>

          <p>
            A deterministic trust layer between AI agents and money.
            Identity, authorization, policy, trust and risk are checked
            before every transaction.
          </p>

          <button
            className="primary-button"
            onClick={() => router.push("/dashboard")}
          >
            Enter Merchant Console
            <span>→</span>
          </button>
        </div>

        <div className="trust-flow">
          <div>AI AGENT</div>
          <span>→</span>
          <div>AGENTTRUST</div>
          <span>→</span>
          <div>RAZORPAY</div>
        </div>

        <div className="decision-row">
          <div className="decision approve">
            <strong>APPROVE</strong>
            <span>Safe transaction</span>
          </div>

          <div className="decision stepup">
            <strong>STEP-UP</strong>
            <span>Human confirmation</span>
          </div>

          <div className="decision block">
            <strong>BLOCK</strong>
            <span>Unsafe transaction</span>
          </div>
        </div>
      </div>
    </main>
  );
}