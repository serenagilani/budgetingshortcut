import { z } from "zod";

export const ExpenseSchema = z.object({
  amount: z.coerce.number().positive(),
  category: z.enum([
    "food",
    "groceries",
    "transport",
    "clothes",
    "health",
    "entertainment",
    "home",
    "utilities",
    "travel",
    "other"
  ]),
  // Expect YYYY-MM-DD
  date: z.coerce.date().transform(d => d.toISOString().slice(0, 10)),
  merchant: z.string().optional(),
  note: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

