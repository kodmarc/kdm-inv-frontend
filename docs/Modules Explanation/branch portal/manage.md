# Manage

## Overview

The Manage module is responsible for maintaining all master data required by the branch. It allows users to create and manage inventory items, categories, suppliers, customers, sales staff, and company information before performing operational transactions.

---

## Actual Working Behavior

The Manage module contains several master data sections including:

- Company Catalog
- Items Catalog
- Item Categories
- Order Bookers
- Salesmen
- Suppliers & Parties
- Account Opening

Each section allows users to create, edit, search, and maintain business records that are later used throughout transaction modules.

---

## Main Features

- Company management
- Item management
- Category management
- Supplier management
- Customer management
- Order booker management
- Salesman management
- Account opening

---

## Inputs

- Company information
- Item details
- Categories
- Supplier information
- Customer information
- Employee information

---

## Outputs

- Updated master records
- Company catalog
- Inventory catalog
- Business party records
- Account opening records

---

## Actual Workflow

1. User opens the Manage module.
2. Required master section is selected.
3. New records are created or existing records are updated.
4. System validates entered information.
5. Records are saved.
6. Updated information becomes available throughout the system.

---

## Important Implementation Detail

Items and item categories are read from the organization-level catalog — they are not created or edited at the branch level. Only branch-specific master data (order bookers, salesmen, parties, accounts) is managed here.

Companies visible in the branch portal are those assigned to the branch via the Company → Branches M2M relationship, configured by HQ in the Org Admin portal.

---

## Related Modules

- Dashboard
- Transactions
- Account
- Reports