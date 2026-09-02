"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";
import { loadRazorpay } from "../lib/razorpay";

export default function ApprovalPanel() {
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPendingApproval();
  }, []);

  async function loadPendingApproval() {
    try {
      setLoading(true);
      setMessage("");

      const data = await api.getPendingApprovals();

      const pending =
        data?.approvals?.find(
          (item) =>
            String(item.status).toUpperCase() === "PENDING"
        ) || null;

      setApproval(pending);

      if (!pending) {
        setMessage("No pending STEP-UP transactions.");
      }
    } catch (error) {
      setApproval(null);
      setMessage(
        error.message ||
          "Unable to load pending approvals."
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
        "Approved. Creating payment..."
      );

      const payment = await api.createPayment({
        agent_id: approval.agent_id,
        amount: Number(approval.amount),
        category: approval.category
      });

      if (!payment?.order_id) {
        throw new Error(
          payment?.message ||
            "Unable to create payment."
        );
      }

      setMessage(
        "Payment created. Opening Razorpay Checkout..."
      );

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout failed to load."
        );
      }

      const keyId =
        payment?.key_id ||
        payment?.razorpay_key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!keyId) {
        throw new Error(
          "Razorpay public key is missing."
        );
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: Number(payment.amount) * 100,
        currency: payment.currency || "INR",
        name: "AgentTrust",
        description: "Approved AI purchase",
        order_id: payment.order_id,

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

        <button
          onClick={loadPendingApproval}
          disabled={loading}
        >
          {loading ? "Checking..." : "Refresh"}
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

              <h3>
                Human confirmation required
              </h3>
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