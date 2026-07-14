# Account

## Overview

The Account module manages branch financial records through the Chart of Accounts. It maintains ledger accounts, opening balances, and current balances that are automatically updated through operational transactions.

---

## Actual Working Behavior

The module provides a centralized Chart of Accounts for the branch.

Users can:

- Create ledger accounts
- Edit account information
- View opening balances
- Monitor current balances
- Manage account status

Each account is associated with the current branch and is used throughout purchasing, sales, and inventory transactions.

---

## Main Features

- Chart of Accounts
- Ledger account creation
- Opening balance management
- Current balance tracking
- Account editing
- Account status management

---

## Inputs

- Account code
- Account name
- Opening balance
- Branch information
- Account status

---

## Outputs

- Ledger accounts
- Updated balances
- Branch financial records
- Account summaries

---

## Actual Workflow

1. User opens Account Management.
2. Existing ledger accounts are loaded.
3. Administrator creates or edits an account.
4. System validates the account information.
5. Changes are saved.
6. Transaction modules automatically use these accounts during financial posting.

---

## Important Implementation Detail

Current balances are automatically updated whenever purchases, sales, returns, or other financial transactions are completed.

---

## Related Modules

- Transactions
- Reports
- Manage