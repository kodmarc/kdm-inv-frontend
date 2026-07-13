# Database

## Overview

The database stores all operational and administrative data for the KDM Inventory & POS System. It maintains relationships between organizations, branches, users, inventory, customers, suppliers, and financial transactions.

---

## Key Entity Relationships

**Organization → Branch**: one-to-many FK. An organization has many branches.

**Company → Branch**: Many-to-Many. A company can be assigned to one or more branches. Branch users only see companies whose `branches` M2M includes their branch. This is how data visibility is scoped per branch — there is no single-branch FK on Company.

**ItemCategory → Organization**: FK. Item categories are organization-scoped, shared across all branches. No branch FK.

**Item → Organization + Company**: FKs. Items belong to an organization and a company. They are also organization-scoped (no branch FK) — all branches share the same item catalog filtered by the active company.

**Transaction models (SalesInvoice, PurchaseInvoice, etc.) → Branch**: scoped to the branch via a FK. Branch users only see their branch's transactions.

---

## Main Data Groups

- Organizations — the top-level tenant
- Branches — subdivisions of an organization
- Companies — product/brand units, assigned to branches via M2M
- Users — with role and optional branch assignment
- ItemCategory / Item — org-level catalog
- OrderBooker / Salesman / Party / AccountOpening — branch-level operational records
- SalesInvoice / PurchaseInvoice / PurchaseReturn / DamageReturn / DamageReceiving — branch-level transactions with auto-generated codes
- BranchSequence — per-branch counter for invoice code generation

---

## Actual Workflow

1. Backend receives a request.
2. SQL queries execute with organization/branch filters applied by the ViewSet.
3. Records are inserted, updated, or retrieved.
4. Results are returned to the backend.
5. Backend sends the response to the frontend.

---

## Important Implementation Detail

The database is the single source of truth for all business data. The backend always re-enforces organization and branch scoping on every query, regardless of what the frontend sends. Inventory, transactions, and reports are generated directly from stored records.

---

## Related Modules

- Backend
- Transactions
- Reports
- Manage
