# Branch Manage Features

The Manage section covers the master data a branch maintains for its companies. All pages live under `src/pages/Branch/CompanyHome/manage/` and render inside `CompanyHomeLayout`. They receive data via `useOutletContext<CompanyHomeLayoutContextType>()`.

All pages follow the same pattern: display a list from the context, open a modal to add or edit, call the layout's fetch function to refresh after saving.

---

## Items Catalog — ItemsCatalog

`src/pages/Branch/CompanyHome/manage/ItemsCatalog.tsx`

Shows all items for the current company (already filtered by `companySlug` in the parent fetch). Each row shows: name, code, category, pack, purchase rate, sales rate, sales tax, current stock, damaged stock, active status.

Items are organization-scoped — they are defined at the HQ level under `/org-admin/items` and are not created or edited from the branch portal. The branch view is read-only for item details; stock levels update automatically through transactions.

Items can be soft-disabled via the `is_active` toggle. Calling `fetchItems()` after any mutation refreshes the list.

---

## Item Categories — ItemCategories

`src/pages/Branch/CompanyHome/manage/ItemCategories.tsx`

Lists item categories. Categories are organization-scoped (no branch FK) and are managed by HQ. The branch view allows browsing categories for the active company.

---

## Order Bookers — OrderBookers

`src/pages/Branch/CompanyHome/manage/OrderBookers.tsx`

Lists order bookers for the branch. Add/edit via modal. Fields: name, contact number, email, active status.

---

## Salesmen — Salesmen

`src/pages/Branch/CompanyHome/manage/Salesmen.tsx`

Identical structure to Order Bookers. Salesmen are linked to sales invoices and damage receivings for tracking.

---

## Parties Registry — PartiesRegistry

`src/pages/Branch/CompanyHome/manage/PartiesRegistry.tsx`

Lists all parties (customers and/or suppliers) for the branch. The list can be filtered by type: all, customers only (`is_party=true`), suppliers only (`is_supplier=true`).

Each row shows: name, contact, NTN/GST, credit limit, current balance, flags. Balance is read-only and reflects the running total from all transactions.

Create/edit form includes both `is_party` and `is_supplier` checkboxes so a single record can serve as both.

---

## Account Opening — AccountsOpening

`src/pages/Branch/CompanyHome/manage/AccountsOpening.tsx`

Lists ledger accounts. Each account shows: name, code, opening balance, current running balance. Balance is read-only and updated automatically by transactions.

Create form has name, code (optional, auto-generated if blank), and opening balance.
