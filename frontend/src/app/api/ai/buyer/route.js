
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

    const systemPrompt = `You are AgentTrust AI Buyer.

Your job is ONLY to understand the user's shopping request and select the best product from the provided catalog.

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
- Return JSON only.`;

    const userPrompt = `User request:
${message}

Available products:
${JSON.stringify(productList)}`;

    let result;
    let provider = "Mistral";

    const mistralResponse = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-small-2603",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          response_format: {
            type: "json_object"
          }
        })
      }
    );

    const mistralData =
      await mistralResponse.json();

    if (mistralResponse.ok) {
      const content =
        mistralData?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(
          "Mistral returned an empty response."
        );
      }

      result =
        typeof content === "string"
          ? JSON.parse(content)
          : content;
    } else if (mistralResponse.status === 429) {
      provider = "Gemini";

      if (!process.env.GEMINI_API_KEY) {
        return Response.json(
          {
            error:
              "Mistral rate limit reached and GEMINI_API_KEY is missing."
          },
          { status: 500 }
        );
      }

      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            model: "gemini-3.5-flash-lite",
            input: `${systemPrompt}

${userPrompt}`
          })
        }
      );

      const geminiData =
        await geminiResponse.json();

      if (!geminiResponse.ok) {
        console.error(
          "Gemini API error:",
          geminiData
        );

        return Response.json(
          {
            error:
              geminiData?.error?.message ||
              "Gemini AI request failed."
          },
          {
            status: geminiResponse.status
          }
        );
      }

      const modelOutput =
        geminiData?.steps?.find(
          (step) =>
            step?.type === "model_output"
        );

      const geminiContent =
        modelOutput?.content?.find(
          (item) =>
            item?.type === "text"
        )?.text;

      if (!geminiContent) {
        return Response.json(
          {
            error:
              "Gemini returned an empty response."
          },
          { status: 502 }
        );
      }

      result =
        typeof geminiContent === "string"
          ? JSON.parse(geminiContent)
          : geminiContent;
    } else {
      console.error(
        "Mistral API error:",
        mistralData
      );

      return Response.json(
        {
          error:
            mistralData?.message ||
            "Mistral API request failed."
        },
        {
          status: mistralResponse.status
        }
      );
    }

    const selectedProduct =
      products.find(
        (product) =>
          product.id === result.product_id
      );

    if (!selectedProduct) {
      return Response.json(
        {
          error:
            "AI selected an invalid product."
        },
        { status: 422 }
      );
    }

    const confidence =
      Number(result.confidence);

    return Response.json({
      product: selectedProduct,
      reason:
        result.reason ||
        "Selected based on your request.",
      confidence:
        Number.isFinite(confidence)
          ? Math.max(
              0,
              Math.min(100, confidence)
            )
          : 0,
      provider
    });
  } catch (error) {
    console.error(
      "AI Buyer error:",
      error
    );

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