import OpenAI from "openai";
import { ExpenseSchema, type Expense } from "../types.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `You are an assistant that extracts expense data from a short user message.
- Output ONLY JSON with keys: amount (number), category (one of: food, groceries, transport, clothes, health, entertainment, home, utilities, travel, other), date (ISO8601), merchant (optional string), note (optional string).
- Amount is in USD and should be a number without currency symbols.
- Choose the most appropriate category.
- If no date is given, use today's date in the user's locale.
- If merchant is obvious (e.g., a store or restaurant), include it.
- Do not include any explanations or additional text, only JSON.`;

function toYmd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function parseExpense(text: string, now: Date = new Date()): Promise<Expense> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const today = toYmd(now);
  const userPrompt = `Message: ${text}\nToday (YYYY-MM-DD): ${today}`;

  // Use chat completions and enforce JSON output. We'll validate with Zod.
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("No content from OpenAI");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch (err) {
    throw new Error("OpenAI response was not valid JSON");
  }

  // Fill default date if missing
  const withDefaults = {
    date: today,
    ...((raw as Record<string, unknown>) || {}),
  };

  const parsed = ExpenseSchema.safeParse(withDefaults);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid expense data: ${issues}`);
  }
  return parsed.data;
}

