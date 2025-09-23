import "dotenv/config";
import express from "express";
import cors from "cors";
import { parseExpense } from "./lib/openai.js";
import { ExpenseSchema } from "./types.js";
import { appendExpenseToSheet } from "./lib/sheets.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// POST /parse-expense { text: string }
app.post("/parse-expense", async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) return res.status(400).json({ error: "Missing text" });
    const expense = await parseExpense(text);
    res.json({ expense });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

// POST /add-expense { expense: Expense }
app.post("/add-expense", async (req, res) => {
  try {
    const parsed = ExpenseSchema.safeParse(req.body?.expense);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    await appendExpenseToSheet(parsed.data);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


