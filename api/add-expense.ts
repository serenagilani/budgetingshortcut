import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ExpenseSchema } from "../src/types.js";
import { appendExpenseToSheet } from "../src/lib/sheets.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const expected = process.env.API_SECRET;
  if (expected && req.headers["x-api-key"] !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = ExpenseSchema.safeParse((req.body as any)?.expense);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  try {
    await appendExpenseToSheet(parsed.data);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
}

