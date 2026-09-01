"use client";

import { useState } from "react";
import api from "../lib/api";
import { loadRazorpay } from "../lib/razorpay";

export default function ApprovalPanel() {
  const [transactionId, setTransactionId] = useState("");
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function findApproval() {
    if (!transactionId.trim()) {
      setMessage("Enter a transaction ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await api.getApproval(transactionId.trim());

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

  async function submitDecision(approved) {
    if (!approval) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const result = await api.approvalDecision({
        transaction_id: approval.transaction_id,
        approved,
        approver_id: "merchant_demo"
      });

      setApproval(result);

      if (!approved) {
        setMessage(
          "Transaction rejected. Razorpay was not called."
        );
        return;
      }

      setMessage(
        "Approved. Creating Razorpay order..."
      );

      const order = await api.createOrder({
        transaction_id: approval.transaction_id,
        amount: Number(approval.amount),
        currency: "INR"
      });

      if (!order?.success) {
        throw new Error(
          order?.message ||
            "Unable to create Razorpay order."
        );
      }

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout failed to load."
        );
      }

      const keyId =
        order?.key_id ||
        order?.razorpay_key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!keyId) {
        throw new Error(
          "Razorpay public key is missing."
        );
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: Number(order.amount),
        currency: order.currency || "INR",
        name: "AgentTrust",
        description: "Approved AI purchase",
        order_id: order.order_id,

        handler: function (response) {
          setMessage(
            `Payment successful. Payment ID: ${
              response.razorpay_payment_id
            }`
          );
        },

        modal: {
          ondismiss: function () {
            setMessage(
              "Razorpay Checkout was cancelled."
            );
          }
        },

        theme: {
          color: "#111111"
        }
      });

      razorpay.on(
        "payment.failed",
        function () {
          setMessage(
            "Razorpay payment failed."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to process approval."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="panel-header">
        <div>
          <h2>Human Approval</h2>
          <p>
            Review STEP-UP transactions before payment.
          </p>
        </div>
      </div>

      <div className="approval-search">
        <input
          value={transactionId}
          onChange={(event) =>
            setTransactionId(event.target.value)
          }
          placeholder="Enter transaction ID"
        />

        <button
          onClick={findApproval}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {message && (
        <div className="approval-message">
          {message}
        </div>
      )}

      {approval && (
        <div className="approval-request">
          <div className="approval-request-header">
            <div>
              <span>STEP-UP REQUEST</span>
              <h3>Human confirmation required</h3>
            </div>

            <span className="decision-badge stepup">
              {approval.status || "PENDING"}
            </span>
          </div>

          <div className="approval-details">
            <div>
              <span>Agent</span>
              <strong>
                {approval.agent_id || "Unknown"}
              </strong>
            </div>

            <div>
              <span>Amount</span>
              <strong>
                ₹
                {Number(
                  approval.amount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Category</span>
              <strong>
                {approval.category || "Unknown"}
              </strong>
            </div>

            <div>
              <span>Transaction</span>
              <strong>
                {approval.transaction_id}
              </strong>
            </div>
          </div>

          {String(approval.status).toUpperCase() ===
            "PENDING" && (
            <div className="approval-actions">
              <button
                className="approve-button"
                onClick={() =>
                  submitDecision(true)
                }
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : "APPROVE ONCE"}
              </button>

              <button
                className="deny-button"
                onClick={() =>
                  submitDecision(false)
                }
                disabled={loading}
              >
                DENY
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}