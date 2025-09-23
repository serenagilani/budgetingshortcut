## iOS Shortcut: Add Expense

This Shortcut captures a spoken/text expense, parses via the local server, confirms, and writes to Google Sheets.

Prereq: Run the server locally (`npm run dev`). If using from iPhone, use your Mac's LAN IP instead of localhost.

### Variables
- `ExpenseText`: the raw dictated or typed input.
- `Parsed`: dictionary from `/parse-expense` response.

### Steps (build in the Shortcuts app)
1. Dictate Text → set to variable `ExpenseText`. (Alternatively: Ask for Input → Text)
2. Get Contents of URL
   - URL: `http://<YOUR_HOST>:8787/parse-expense`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Request Body → JSON:
     ```
     { "text": "${ExpenseText}" }
     ```
   - Response: JSON → store as `Response`
3. Get Dictionary Value
   - Dictionary: `Response`
   - Key: `expense` → set variable `Parsed`
4. Text
   - Content:
     ```
     Confirm expense:
     Date: ${Parsed.date}
     Merchant: ${Parsed.merchant}
     Category: ${Parsed.category}
     Amount: ${Parsed.amount}
     Note: ${Parsed.note}
     ```
5. Show Alert
   - Title: "Confirm Expense"
   - Message: use the Text from step 4
   - Buttons: Confirm, Cancel
6. If Result is Confirm:
   - Get Contents of URL
     - URL: `http://<YOUR_HOST>:8787/add-expense`
     - Method: POST
     - Headers: `Content-Type: application/json`
     - Request Body → JSON:
       ```
       { "expense": ${Parsed} }
       ```
   - Otherwise: Stop

Optional Enhancements:
- Add a step to let the user edit any field before confirm (e.g., Ask for Input for `merchant` or `note`).
- Maintain a local log in Notes or Reminders.

