# Database

## Overview

The SQL Server database stores all operational and administrative data used by the KDM Inventory & POS System. It maintains relationships between organizations, branches, users, inventory, customers, suppliers, and financial transactions.

---

## Actual Working Behavior

Every business operation performed within the application reads or writes data to the database through backend APIs.

The database maintains information for:

- Organizations
- Branches
- Companies
- Users
- Roles
- Items
- Categories
- Suppliers
- Customers
- Purchase Invoices
- Sales Invoices
- Returns
- Reports

Relationships between tables ensure data consistency throughout the system.

---

## Main Features

- Relational database
- Primary and foreign keys
- Constraints
- Indexes
- Transaction support
- Secure data storage
- Data integrity

---

## Inputs

- API requests
- User records
- Inventory records
- Transaction records
- Report queries

---

## Outputs

- Stored business data
- Query results
- Reports
- Analytics
- Audit information

---

## Actual Workflow

1. Backend receives a request.
2. SQL queries execute.
3. Records are inserted, updated, or retrieved.
4. Results are returned to the backend.
5. Backend sends the response to the frontend.

---

## Important Implementation Detail

The database is the single source of truth for all business data. Inventory, transactions, and reports are generated directly from stored records.

---

## Related Modules

- Backend
- Transactions
- Reports
- Manage