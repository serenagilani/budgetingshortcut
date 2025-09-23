import { z } from "zod";

export const ExpenseSchema = z.object({
  amount: z.number().positive(),
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
  date: z.string().refine((v: string) => !Number.isNaN(Date.parse(v)), {
    message: "date must be an ISO8601 date string",
  }),
  merchant: z.string().optional(),
  note: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

