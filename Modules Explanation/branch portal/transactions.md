# Transactions

## Overview

The Transactions module manages all inventory movements and financial transactions performed within the branch. Every transaction updates inventory quantities and related accounting information automatically.

---

## Actual Working Behavior

The Transactions module contains:

- Purchase Invoice
- Sales Invoice
- Purchase Return
- Damage Return
- Damage Receiving
- Load Form
- Daily Sales Report

Each transaction records business activities while maintaining inventory accuracy and financial consistency.

---

## Main Features

- Purchase processing
- Sales processing
- Product returns
- Damage management
- Dispatch management
- Daily sales reporting
- Automatic inventory updates

---

## Inputs

- Customer information
- Supplier information
- Products
- Quantities
- Prices
- Taxes
- Discounts
- Transaction dates

---

## Outputs

- Purchase invoices
- Sales invoices
- Return records
- Inventory updates
- Customer balances
- Supplier balances
- Daily sales summaries

---

## Actual Workflow

1. User selects a transaction type.
2. Required business party is selected.
3. Products are added.
4. Quantities and pricing are entered.
5. Transaction is validated.
6. Inventory updates automatically.
7. Financial records are updated.
8. Transaction becomes available in reports.

---

## Important Implementation Detail

Every completed transaction immediately updates stock quantities and related financial records, ensuring consistency between inventory and accounting information.

---

## Related Modules

- Dashboard
- Manage
- Account
- Reports