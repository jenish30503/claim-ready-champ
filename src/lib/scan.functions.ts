import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  imageBase64: z.string().min(20),
  mediaType: z.string().min(3),
});

export type ScannedFields = {
  product: string;
  brand: string;
  model: string;
  date: string;
  price: string;
  category: string;
  seller: string;
  warrantyProvider: string;
  serialNumber: string;
  warrantyTenure: string;
  expiryDate: string;
};

const PROMPT = `Read this receipt / invoice image. Reply ONLY with JSON, no other text, no markdown, no thinking tags:
{"product": "...", "brand": "...", "model": "...", "date": "...", "price": "...", "category": "Electronics/Appliances/Clothing/Furniture/Other", "seller": "...", "warrantyProvider": "...", "serialNumber": "...", "warrantyTenure": "...", "expiryDate": "..."}
Use DD Month YYYY for dates. Keep price as it appears including the currency symbol.
If a field is not visible on the receipt, return an empty string "" for that field.`;

export const scanReceipt = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      throw new Error("Scanning is not configured on this demo.");
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              {
                type: "image_url",
                image_url: { url: `data:${data.mediaType};base64,${data.imageBase64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      let message = body;
      try {
        message = (JSON.parse(body)?.error?.message as string) ?? body;
      } catch {
        /* keep raw body */
      }
      if (res.status === 429) message = "Too many scans right now — try again in a moment.";
      if (res.status === 402) message = message || "AI credits are exhausted for this workspace.";
      throw new Error(message || `Scan failed (${res.status})`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const cleaned = raw
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/```json|```/g, "")
      .trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not read that receipt. Try a clearer photo.");

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      throw new Error("Could not read that receipt. Try a clearer photo.");
    }

    const pick = (key: string) => (typeof parsed[key] === "string" ? (parsed[key] as string) : "");

    const fields: ScannedFields = {
      product: pick("product"),
      brand: pick("brand"),
      model: pick("model"),
      date: pick("date"),
      price: pick("price"),
      category: pick("category"),
      seller: pick("seller"),
      warrantyProvider: pick("warrantyProvider"),
      serialNumber: pick("serialNumber"),
      warrantyTenure: pick("warrantyTenure"),
      expiryDate: pick("expiryDate"),
    };

    return fields;
  });
