import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Expense, ExpenseSchema } from "../src/types.js";
import { appendExpenseToSheet } from "../src/lib/sheets.js";
import { parseKeyValueTextToDict } from "../src/lib/parseText.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const expected = process.env.API_SECRET;
  if (expected && req.headers["x-api-key"] !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const expenseInput = req.body?.expense;
  if (typeof expenseInput !== "string") {
    return res.status(400).json({ error: "Expected expense to be a string" });
  }
  console.log("Incoming blob:\n", expenseInput);
  const expenseDict = parseKeyValueTextToDict(expenseInput);
  const expense = ExpenseSchema.safeParse(expenseDict);
  if (!expense.success) {
    return res.status(400).json({
      error: "Invalid expense",
      details: expense.error.flatten(),
    });
  }
  const result: Expense = expense.data;
  try {
    await appendExpenseToSheet(result);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
}

