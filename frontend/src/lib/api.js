const API_URL = "http://localhost:8000"
  // process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `API request failed: ${response.status}`
    );
  }

  return data;
}

export const api = {
  health: () =>
    request("/health"),

  getAgents: () =>
    request("/agents"),

  getAgent: (agentId) =>
    request(`/agents/${encodeURIComponent(agentId)}`),

  getAgentIdentity: (agentId) =>
    request(`/agents/${encodeURIComponent(agentId)}/identity`),

  getAgentCapabilities: (agentId) =>
    request(`/agents/${encodeURIComponent(agentId)}/capabilities`),

  getAgentTrust: (agentId) =>
    request(`/agents/${encodeURIComponent(agentId)}/trust`),

  authorizeTransaction: (payload) =>
    request("/transactions/authorize", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  transactionDecision: (payload) =>
    request("/transactions/decision", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  evaluatePolicy: (payload) =>
    request("/policies/evaluate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  calculateRisk: (payload) =>
    request("/risk/calculate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getTrust: (agentId) =>
    request(`/risk/${encodeURIComponent(agentId)}/trust`),

  getAuditLogs: () =>
    request("/audit/"),

  getAgentAuditLogs: (agentId) =>
    request(`/audit/${encodeURIComponent(agentId)}`),

  createPayment: (payload) =>
    request("/payments/create", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  createOrder: (payload) =>
    request("/payments/order", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  refundPayment: (payload) =>
    request("/payments/refund", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  createApproval: (transactionId) =>
    request("/approvals/create", {
      method: "POST",
      body: JSON.stringify({
        transaction_id: transactionId
      })
    }),

  approvalDecision: (payload) =>
    request("/approvals/decision", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getApproval: (transactionId) =>
    request(`/approvals/${encodeURIComponent(transactionId)}`)
};

export default api;