# Transaction Features

Transaction pages live under `src/pages/Branch/CompanyHome/Transactions/`. Each transaction type has a list page and a form page, except Sales Return which has a single combined view.

---

## Common Patterns Across All Forms

Every transaction form follows the same structure:

It reads context from `CompanyHomeLayout` via `useOutletContext<CompanyHomeLayoutContextType>()` to get items, parties, accounts, and the active company without making its own fetch calls.

On edit, it reads the `id` param from the URL and finds the corresponding invoice in the context's list (e.g. `purchaseInvoices.find(p => p.id === id)`), then pre-populates all form fields from it.

On submit it calls `api.post(...)` for create or `api.patch(...)` for edit, then calls the layout's fetch function (e.g. `fetchPurchaseInvoices()`) to refresh the list, sets a success message via `setSuccess()`, and navigates back to the list page.

The date field accepts flexible formats — `4 6 2025`, `4 jan 2025`, `4-6-2025`, ISO format — thanks to `parseFlexibleDate()` in each form. The parsed ISO date is sent to the API; the raw typed string is shown in the input.

Line items are managed in local state as an array. Each row has a SearchableSelect for the item, and numeric fields for quantity, rate, and amounts. Adding a row appends an empty line item object. Removing a row splices it from the array.

---

## Purchase Invoice

List: `PurchaseInvoiceList.tsx` — shows all purchase invoices in a table, with links to edit and delete, and an Add button to go to the form.

Form: `PurchaseInvoiceForm.tsx` — rendered at both `/purchase-invoice/new` and `/purchase-invoice/:id/edit`. Handles both create and update depending on whether `id` param is present.

Key form fields: date (flexible parse), supplier (SearchableSelect from parties with `is_supplier=true`), account (SearchableSelect), status (pending/paid toggle), remarks, s_tax, freight, adv_income_tax, net_amount.

Line items: item (SearchableSelect from items for active company), carton, pcs, rate, amount, discount_amount, trade offer rate/amount, s_tax rate/amount, net_amount.

Stock impact: creating a purchase invoice increases `item.current_stock` by `pcs`. Editing recalculates the difference. Deleting reverses the change.

---

## Sales Invoice

List: `SalesInvoiceList.tsx`

Form: `SalesInvoiceForm.tsx`

Key differences from purchase invoice: uses `party` (customer, `is_party=true`) instead of supplier. Has `order_booker` and `salesman` optional fields. Line items have `s_tax_amount`, `f_tax_amount`, `gross_amount`, and trade offer (`to_rate`, `to_amount`) fields.

Stock impact: creating a sales invoice reduces `item.current_stock` by `pcs`.

---

## Purchase Return

List: `PurchaseReturnList.tsx`

Form: `PurchaseReturnForm.tsx`

Returns stock to the supplier. Line item structure matches purchase invoice. Has an optional `party_inv_no` field for referencing the supplier's original invoice.

Stock impact: reduces `item.current_stock` (reversal of the original purchase).

---

## Damage Return

List: `DamageReturnList.tsx`

Form: `DamageReturnForm.tsx`

Returns damaged stock to the supplier. Operates on `item.damaged_stock`. Simpler line item structure — no discount or trade offer fields. No `freight` or `adv_income_tax` at the header level.

Stock impact: reduces `item.damaged_stock`.

---

## Damage Receiving

List: `DamageReceivingList.tsx`

Form: `DamageReceivingForm.tsx`

Records damaged goods returned by a customer. Uses `party` (customer). Has a `salesman` field. Line items include `manual_code` and `issue_units` fields unique to this form.

Stock impact: increases `item.damaged_stock`.

---

## Sales Return — SalesReturn

`SalesReturn.tsx` — a combined page for viewing and recording sales return data. Does not have a separate list/form split like the other types.

---

## Load Form — LoadForm

`LoadForm.tsx` — used to record stock loaded onto a delivery vehicle before a sales run. Tracks what inventory left the warehouse in a given load.

---

## Daily Sales Report — DailySalesReport

`DailySalesReport.tsx` — a report view showing sales activity for a given date range. Summarizes invoice totals, quantities, and party balances. Read-only, no mutations.
