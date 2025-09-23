# Budgeting Shortcut Server

Small TypeScript server backing an iOS Shortcut to log expenses.

It:
- Parses a free-form expense message via OpenAI into `{ amount, category, date, merchant, note }`.
- Confirms the parsed row in the Shortcut UI.
- Appends the confirmed row to a Google Sheet.

## Requirements
- Node 18+
- An OpenAI API key
- A Google Cloud service account with Sheets access
- A Google Sheet with a tab named `Expenses` and columns: `Date, Merchant, Category, Amount, Note`

## Setup

1) Install deps
```bash
npm install
```

2) Create `.env`

Create a `.env` file in the project root with:
```bash
PORT=8787
OPENAI_API_KEY=sk-...            # Required
OPENAI_MODEL=gpt-4o-mini          # Optional; default gpt-4o-mini

GOOGLE_SHEETS_SPREADSHEET_ID=     # Required (the spreadsheet ID from the URL)
GOOGLE_SHEETS_SHEET_NAME=Expenses # Optional
GOOGLE_SERVICE_ACCOUNT_EMAIL=     # Required
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" # Required; keep quotes; note \n
```

3) Share the Sheet with the service account email
- Open your Google Sheet
- Share with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as Editor

4) Run the server
```bash
npm run dev
```
It will start on `http://localhost:8787`.

## API

- `POST /parse-expense`
  - Body: `{ "text": "I just spent $8 at Blank Street" }`
  - Response: `{ "expense": { amount, category, date, merchant?, note? } }`

- `POST /add-expense`
  - Body: `{ "expense": { amount, category, date, merchant?, note? } }`
  - Response: `{ ok: true }`

## iOS Shortcut
This Shortcut takes dictated text, asks the server to parse, shows a confirmation row, then appends on confirm.

Steps:
1. Action: "Dictate Text" (or "Ask for Input") → variable `ExpenseText`
2. Action: "Get Contents of URL"
   - Method: POST
   - URL: `http://localhost:8787/parse-expense`
   - Headers: `Content-Type: application/json`
   - Request Body: JSON
     ```
     { "text": "${ExpenseText}" }
     ```
   - Get Dictionary from: Response
3. Action: "Get Dictionary Value" → Key: `expense` → variable `Parsed`
4. Action: "Text"
   - Value:
     ```
     Date: ${Parsed.date}
     Merchant: ${Parsed.merchant}
     Category: ${Parsed.category}
     Amount: ${Parsed.amount}
     Note: ${Parsed.note}
     ```
5. Action: "Show Alert" with the Text above → Buttons: Confirm / Cancel
6. If Confirm:
   - Action: "Get Contents of URL"
     - Method: POST
     - URL: `http://localhost:8787/add-expense`
     - Headers: `Content-Type: application/json`
     - Request Body: JSON
       ```
       { "expense": ${Parsed} }
       ```
   - Otherwise: Stop

Tips:
- You can replace `localhost` with your LAN IP to run from iPhone (same Wi‑Fi).
- Consider adding a default `note` or letting the user edit fields before confirm.

## Categories
Supported categories: `food, groceries, transport, clothes, health, entertainment, home, utilities, travel, other`.

## Example
- Input: "I just spent $8 at Blank Street" → `{ amount: 8, category: "food", date: <today>, merchant: "Blank Street" }`
- Input: "Ordered shorts from Patagonia for $40" → `{ amount: 40, category: "clothes", date: <today>, merchant: "Patagonia" }`

