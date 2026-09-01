"use client";

import Link from "next/link";

export default function PaymentCard() {
  return (
    <div className="dashboard-panel payment-card">
      <div className="panel-header">
        <div>
          <h2>Payment Layer</h2>
          <p>Razorpay stays behind the AgentTrust decision.</p>
        </div>

        <span className="payment-status">
          TEST MODE
        </span>
      </div>

      <div className="payment-flow">
        <div className="payment-step">
          <span>01</span>
          <strong>AI Intent</strong>
          <small>Agent requests purchase</small>
        </div>

        <div className="payment-arrow">→</div>

        <div className="payment-step">
          <span>02</span>
          <strong>AgentTrust</strong>
          <small>Identity + risk + policy</small>
        </div>

        <div className="payment-arrow">→</div>

        <div className="payment-step">
          <span>03</span>
          <strong>Razorpay</strong>
          <small>Only after approval</small>
        </div>
      </div>

      <Link href="/buyer" className="payment-button">
        Test AI Purchase →
      </Link>
    </div>
  );
}