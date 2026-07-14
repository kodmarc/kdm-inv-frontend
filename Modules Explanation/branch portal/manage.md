# Manage

## Overview

The Manage module contains all branch-level master data required for daily operations. It allows users to view HQ-managed inventory while maintaining branch-specific records such as order bookers, salesmen, suppliers, parties, ledger accounts, and branch staff.

---

## Actual Working Behavior

The Manage module consists of the following sections:

### Items Catalog

Displays inventory items assigned to the selected company by Headquarters.

Branch users can:

- View assigned items
- Search items
- View stock information
- View purchase and sales rates
- View taxes
- View minimum and maximum stock levels

**Items cannot be created or edited by branch users.**

---

### Item Categories

Displays all item categories assigned by Headquarters.

Branch users can:

- View categories
- Search categories

**Categories are maintained by Headquarters and cannot be modified by branches.**

---

### Order Bookers

Manage employees responsible for collecting customer orders.

Features include:

- Add order booker
- Edit order booker
- Enable or disable records
- Search order bookers

---

### Salesmen

Manage branch sales representatives.

Features include:

- Add salesman
- Edit salesman
- Enable or disable salesman
- Search sales staff

---

### Suppliers & Parties

Manage suppliers, vendors and customers used during purchasing and sales.

Users can register:

- Suppliers
- Customers (Parties)
- Both Supplier & Customer

Information includes:

- Business name
- Contact number
- Email
- NTN
- GST Number
- Credit limit

---

### Account Opening

Manage branch ledger accounts used for accounting transactions.

Users can:

- Create ledger accounts
- View opening balance
- View current balance
- Edit ledger accounts
- Manage account status

---

### Branch User Management

Manage branch staff accounts.

Administrators can:

- Add branch users
- Assign roles
- Edit users
- Enable or disable accounts

Supported roles include:

- Branch Admin
- KPO Cashier

---

## Main Features

- View HQ item catalog
- View item categories
- Order booker management
- Salesman management
- Supplier & customer management
- Ledger account management
- Branch user management

---

## Inputs

- Supplier information
- Customer information
- Staff information
- Ledger account details
- Branch user information

---

## Outputs

- Updated branch master data
- Supplier records
- Customer records
- Ledger accounts
- Branch staff accounts

---

## Actual Workflow

1. User opens the Manage module.
2. Required management section is selected.
3. Existing records are loaded.
4. User creates or updates branch-specific records.
5. System validates the data.
6. Updated records become available throughout the Branch Portal.

---

## Important Implementation Detail

Items and Item Categories are maintained by Headquarters and are available to branches in read-only mode. Branch users manage only operational records such as suppliers, customers, staff, and ledger accounts.

---

## Related Modules

- Dashboard
- Transactions
- Account
- Reports