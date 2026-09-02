"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { loadRazorpay } from "../lib/razorpay";
import Catalog, { products } from "./Catalog";

export default function BuyerAgent() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [userPrompt, setUserPrompt] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await api.getAgents();

        const list = Array.isArray(data)
          ? data
          : data?.agents || [];

        setAgents(list);

        if (list.length > 0) {
          setSelectedAgent(
            list[0].id || list[0].agent_id
          );
        }
      } catch (err) {
        setError(err.message);
      }
    }

    loadAgents();
  }, []);

  async function handleAIRequest() {
    if (!userPrompt.trim()) {
      setError(
        "Tell the AI Buyer what you want to buy."
      );
      return;
    }

    if (!selectedAgent) {
      setError("Please select an AI agent first.");
      return;
    }

    setAiLoading(true);
    setError("");
    setAiResult(null);
    setResult(null);
    setPaymentResult(null);

    try {
      const response = await fetch(
        "/api/ai/buyer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: userPrompt,
            products
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "AI Buyer failed."
        );
      }

      if (!data?.product) {
        throw new Error(
          "AI did not select a valid product."
        );
      }

      setAiResult(data);

      // AI selects the product.
      // AgentTrust still controls payment authorization.
      await handlePurchase(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handlePurchase(product) {
    if (!selectedAgent) {
      setError(
        "Please select an AI agent first."
      );
      return;
    }

    setSelectedProduct(product);
    setResult(null);
    setPaymentResult(null);
    setError("");
    setLoading(true);

    const agentId = selectedAgent;
    const amount = Number(product.price);
    const category =
      product.category || "GENERAL";

    try {
      const authorization =
        await api.authorizeTransaction({
          agent_id: agentId,
          amount,
          category
        });

      const risk =
        await api.calculateRisk({
          agent_id: agentId,
          amount,
          category
        });

      const policy =
        await api.evaluatePolicy({
          agent_id: agentId,
          amount,
          category
        });

      const decision =
        await api.transactionDecision({
          agent_id: agentId,
          amount,
          category,
          authorization,
          risk,
          policy
        });

      const decisionValue =
        String(
          decision?.decision ||
          decision?.status ||
          decision?.result ||
          ""
        ).toUpperCase();

      setResult({
        authorization,
        risk,
        policy,
        decision
      });

      if (
        decisionValue === "BLOCK" ||
        decisionValue === "BLOCKED" ||
        decisionValue === "DENY" ||
        decisionValue === "DENIED"
      ) {
        return;
      }

      if (
        decisionValue === "STEP_UP" ||
        decisionValue === "STEP-UP" ||
        decisionValue === "STEPUP"
      ) {
        return;
      }

      if (
        decisionValue === "APPROVE" ||
        decisionValue === "APPROVED"
      ) {
        await createRazorpayOrder(
          agentId,
          product,
          decision?.transaction_id
        );
      } else {
        setError(
          `Unexpected AgentTrust decision: ${
            decisionValue || "UNKNOWN"
          }`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createRazorpayOrder(
    agentId,
    product,
    transactionId
  ) {
    setPaymentLoading(true);
    setError("");

    try {
      const order =
        await api.createOrder({
          agent_id: agentId,
          amount: Number(product.price),
          currency: "INR",
          product_id: product.id,
          product_name: product.name,
          transaction_id: transactionId
        });

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout failed to load."
        );
      }

      const orderId =
        order?.order_id ||
        order?.id ||
        order?.razorpay_order_id;

      const keyId =
        order?.key_id ||
        order?.razorpay_key_id ||
        process.env
          .NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!orderId) {
        throw new Error(
          "Backend did not return a Razorpay order ID."
        );
      }

      if (!keyId) {
        throw new Error(
          "Razorpay public key is missing."
        );
      }

      const options = {
        key: keyId,
        amount:
          Number(product.price) * 100,
        currency: "INR",

        name: "AgentTrust",

        description:
          `AI purchase: ${product.name}`,

        order_id: orderId,

        handler: function (response) {
          setPaymentResult({
            success: true,
            response
          });
        },

        modal: {
          ondismiss: function () {
            setPaymentResult({
              success: false,
              cancelled: true
            });
          }
        },

        theme: {
          color: "#111111"
        }
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          setPaymentResult({
            success: false,
            failed: true,
            response
          });
        }
      );

      razorpay.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  }

  const decisionValue =
    String(
      result?.decision?.decision ||
      result?.decision?.status ||
      result?.decision?.result ||
      ""
    ).toUpperCase();

  const isBlocked =
    decisionValue === "BLOCK" ||
    decisionValue === "BLOCKED" ||
    decisionValue === "DENY" ||
    decisionValue === "DENIED";

  const isStepUp =
    decisionValue === "STEP_UP" ||
    decisionValue === "STEP-UP" ||
    decisionValue === "STEPUP";

  const isApproved =
    decisionValue === "APPROVE" ||
    decisionValue === "APPROVED";

  return (
    <section className="buyer-page">

      <div className="buyer-header">

        <div>
          <div className="eyebrow">
            AGENTTRUST / AI BUYER
          </div>

          <h1>
            Let the agent shop.
          </h1>

          <p>
            Tell the AI what you need.
            The AI selects the product.
            AgentTrust decides whether it can pay.
          </p>
        </div>

        <div className="agent-selector">

          <label>
            Buying Agent
          </label>

          <select
            value={selectedAgent}
            onChange={(e) =>
              setSelectedAgent(
                e.target.value
              )
            }
          >
            {agents.map((agent) => {
              const id =
                agent.id ||
                agent.agent_id;

              return (
                <option
                  key={id}
                  value={id}
                >
                  {agent.name || id}
                </option>
              );
            })}
          </select>

        </div>

      </div>

      <div className="ai-buyer-box">

        <div className="eyebrow">
          AUTONOMOUS AI BUYER
        </div>

        <h2>
          What do you want me to buy?
        </h2>

        <p>
          Describe your requirement naturally.
          Mistral will select the best product
          from the catalog.
        </p>

        <div className="ai-input-row">

          <input
            value={userPrompt}
            onChange={(e) =>
              setUserPrompt(
                e.target.value
              )
            }
            placeholder="e.g. Find me the best laptop under ₹3 lakh"
            disabled={
              aiLoading || loading
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAIRequest();
              }
            }}
          />

          <button
            className="buy-button"
            onClick={handleAIRequest}
            disabled={
              aiLoading || loading
            }
          >
            {aiLoading
              ? "Mistral is thinking..."
              : "Ask AI →"}
          </button>

        </div>

        {aiResult && (
          <div className="ai-result">

            <div>
              <strong>
                AI selected:
              </strong>{" "}
              {aiResult.product.name}
            </div>

            <div>
              <strong>
                Price:
              </strong>{" "}
              ₹
              {Number(
                aiResult.product.price
              ).toLocaleString("en-IN")}
            </div>

            <div>
              <strong>
                Reason:
              </strong>{" "}
              {aiResult.reason}
            </div>

            <div>
              <strong>
                Confidence:
              </strong>{" "}
              {aiResult.confidence}%
            </div>

            <div className="ai-security-note">
              Mistral selected the product.
              AgentTrust still controls
              the payment.
            </div>

          </div>
        )}

      </div>

      {error && (
        <div className="blocked-message">
          {error}
        </div>
      )}

      {/* AgentTrust decision is shown BEFORE the catalog */}
      {loading && (
        <div className="decision-result">

          <h3>
            AgentTrust is evaluating...
          </h3>

          <div className="decision-signals">

            <div>
              Identity → checking
            </div>

            <div>
              Authorization → checking
            </div>

            <div>
              Risk → checking
            </div>

            <div>
              Policy → checking
            </div>

          </div>

        </div>
      )}

      {result && !loading && (
        <div className="decision-result">

          <div className="eyebrow">
            AGENTTRUST DECISION CENTER
          </div>

          <h2>
            {decisionValue ||
              "DECISION RECEIVED"}
          </h2>

          <div className="decision-signals">

            <div>
              <span>
                Authorization
              </span>

              <strong>
                {getStatus(
                  result.authorization
                )}
              </strong>
            </div>

            <div>
              <span>
                Risk
              </span>

              <strong>
                {getRisk(
                  result.risk
                )}
              </strong>
            </div>

            <div>
              <span>
                Policy
              </span>

              <strong>
                {getStatus(
                  result.policy
                )}
              </strong>
            </div>

            <div>
              <span>
                Final Decision
              </span>

              <strong>
                {decisionValue ||
                  "UNKNOWN"}
              </strong>
            </div>

          </div>

          {isBlocked && (
            <div className="blocked-message">

              Payment blocked by
              AgentTrust.

              <br />

              Razorpay was never called.

            </div>
          )}

          {isStepUp && (
            <div className="stepup-message">

              Human approval is required.

              <br />

              Payment cannot reach
              Razorpay until approval.

            </div>
          )}

          {isApproved && (
            <div className="payment-created">

              AgentTrust approved
              this transaction.

              <br />

              {paymentLoading
                ? "Opening Razorpay Checkout..."
                : "Razorpay Checkout is ready."}

            </div>
          )}

        </div>
      )}

      {/* Catalog comes AFTER the decision */}
      <Catalog
        onBuy={handlePurchase}
      />

      {paymentResult?.success && (
        <div className="payment-created">

          <h3>
            Payment successful
          </h3>

          <p>
            AgentTrust authorized
            the purchase and Razorpay
            processed the payment.
          </p>

          {paymentResult
            .response
            ?.razorpay_payment_id && (
            <small>
              Payment ID:{" "}
              {
                paymentResult
                  .response
                  .razorpay_payment_id
              }
            </small>
          )}

        </div>
      )}

      {paymentResult?.cancelled && (
        <div className="stepup-message">
          Razorpay Checkout
          was cancelled.
        </div>
      )}

      {paymentResult?.failed && (
        <div className="blocked-message">
          Razorpay payment failed.
        </div>
      )}

      {selectedProduct && (
        <div className="selected-product">
          Selected:{" "}
          {selectedProduct.name}
        </div>
      )}

    </section>
  );
}

function getStatus(value) {
  if (!value) {
    return "UNKNOWN";
  }

  const status =
    String(
      value?.status ||
      value?.decision ||
      value?.result ||
      "PASS"
    ).toUpperCase();

  if (
    status.includes("FAIL") ||
    status.includes("DENY") ||
    status.includes("BLOCK")
  ) {
    return "FAILED";
  }

  return "PASSED";
}

function getRisk(value) {
  const score =
    value?.risk_score ??
    value?.score ??
    value?.risk ??
    null;

  if (score === null) {
    return "CALCULATED";
  }

  return `${score}/100`;
}