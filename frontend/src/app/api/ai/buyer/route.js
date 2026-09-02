import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

export async function POST(request) {
  try {
    const body = await request.json();

    const { message, products } = body;

    if (!message || !Array.isArray(products)) {
      return Response.json(
        {
          error: "message and products are required"
        },
        { status: 400 }
      );
    }

    const productList = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price
    }));

    const response = await client.chat.complete({
      model: "mistral-medium-latest",

      messages: [
        {
          role: "system",
          content: `
You are AgentTrust AI Buyer.

Your job is ONLY to understand the user's shopping request
and select the best product from the provided catalog.

You must NEVER authorize payment.
You must NEVER approve a transaction.
You must NEVER bypass AgentTrust.

Return ONLY a valid JSON object:

{
  "product_id": "string",
  "reason": "short explanation",
  "confidence": 0
}

Rules:
- Select ONLY a product that exists in the catalog.
- NEVER invent a product.
- Respect explicit budget limits.
- If the user gives a budget, NEVER select a product above that budget.
- confidence must be a number between 0 and 100.
- Keep the reason short.
- Return JSON only.
          `
        },
        {
          role: "user",
          content: `
User request:
${message}

Available products:
${JSON.stringify(productList)}
          `
        }
      ],

      responseFormat: {
        type: "json_object"
      }
    });

    const content =
      response?.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        {
          error: "Mistral returned an empty response."
        },
        { status: 502 }
      );
    }

    const result =
      typeof content === "string"
        ? JSON.parse(content)
        : content;

    const selectedProduct = products.find(
      (product) =>
        product.id === result.product_id
    );

    if (!selectedProduct) {
      return Response.json(
        {
          error: "AI selected an invalid product."
        },
        { status: 422 }
      );
    }

    const confidence = Number(result.confidence);

    return Response.json({
      product: selectedProduct,
      reason:
        result.reason ||
        "Selected based on your request.",
      confidence:
        Number.isFinite(confidence)
          ? Math.max(0, Math.min(100, confidence))
          : 0
    });
  } catch (error) {
    console.error("Mistral AI Buyer error:", error);

    return Response.json(
      {
        error:
          error?.message ||
          "AI Buyer failed."
      },
      { status: 500 }
    );
  }
}