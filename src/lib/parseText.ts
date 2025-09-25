import { ExpenseSchema, type Expense } from "../types.js";

export function parseKeyValueTextToDict(blob: string) {
  const lines = blob.split("\n");
  const expense: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = line.split(":").map(str => str.trim());
    if (key) { 
      expense[key] = value || "";
    }
  }

  return expense;
}