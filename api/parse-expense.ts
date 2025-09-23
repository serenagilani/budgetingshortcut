import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseExpense } from "../src/lib/openai.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const expected = process.env.API_SECRET;
  if (expected && req.headers["x-api-key"] !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const text = String((req.body as any)?.text || "").trim();
  if (!text) return res.status(400).json({ error: "Missing text" });
  try {
    const expense = await parseExpense(text);
    res.json({ expense });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
}

