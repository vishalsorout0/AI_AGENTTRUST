"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/api";

export default function ApprovalsPage() {
  const [transactionId, setTransactionId] = useState("");
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function searchApproval() {
    if (!transactionId.trim()) {
      setMessage("Enter a transaction ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await api.getApproval(
        transactionId.trim()
      );

      setApproval(data);
    } catch (error) {
      setApproval(null);
      setMessage(
        error.message || "Approval request not found."
      );
    } finally {
      setLoading(false);
    }
  }

  async function decide(approved) {
    if (!approval) return;

    try {
      setLoading(true);
      setMessage("");

      const data = await api.approvalDecision({
        transaction_id:
          approval.transaction_id ||
          transactionId.trim(),
        approved,
        approver_id: "merchant_demo"
      });

      setApproval(data);

      setMessage(
        approved
          ? "Transaction approved successfully."
          : "Transaction rejected successfully."
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to update approval."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-page">
      <nav className="top-nav">
        <Link href="/dashboard">
          ← Merchant Console
        </Link>

        <span>AgentTrust / Approvals</span>
      </nav>

      <div className="page-title">
        <span className="eyebrow">
          HUMAN OVERSIGHT
        </span>

        <h1>Approval Center</h1>

        <p>
          Review STEP-UP transactions before they
          are allowed to reach the payment layer.
        </p>
      </div>

      <div className="approval-search-large">
        <input
          value={transactionId}
          onChange={(event) =>
            setTransactionId(event.target.value)
          }
          placeholder="Transaction ID"
        />

        <button
          onClick={searchApproval}
          disabled={loading}
        >
          {loading ? "Checking..." : "Find Request"}
        </button>
      </div>

      {message && (
        <div className="approval-message">
          {message}
        </div>
      )}

      {approval && (
        <div className="approval-full-card">
          <div className="approval-card-top">
            <div>
              <span>STEP-UP REQUEST</span>
              <h2>
                Human decision required
              </h2>
            </div>

            <span className="decision-badge stepup">
              {approval.status || "PENDING"}
            </span>
          </div>

          <div className="approval-grid">
            <Info
              label="Transaction ID"
              value={
                approval.transaction_id ||
                transactionId
              }
            />

            <Info
              label="Agent"
              value={approval.agent_id || "--"}
            />

            <Info
              label="Amount"
              value={`₹${Number(
                approval.amount || 0
              ).toLocaleString("en-IN")}`}
            />

            <Info
              label="Category"
              value={approval.category || "--"}
            />

            <Info
              label="Merchant"
              value={
                approval.merchant ||
                "AgentTrust Demo Store"
              }
            />

            <Info
              label="Reason"
              value={
                approval.reason ||
                "Transaction requires human review."
              }
            />
          </div>

          {String(approval.status).toUpperCase() ===
            "PENDING" && (
            <div className="approval-action-row">
              <button
                className="approve-button"
                disabled={loading}
                onClick={() => decide(true)}
              >
                APPROVE TRANSACTION
              </button>

              <button
                className="deny-button"
                disabled={loading}
                onClick={() => decide(false)}
              >
                BLOCK TRANSACTION
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}