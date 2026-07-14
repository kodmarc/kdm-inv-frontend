# Branch Dashboard

## Overview

The Branch Dashboard is the main landing page for branch users after selecting a company catalog. It provides an overview of branch operations, inventory status, sales activities, and quick access to frequently used modules required for daily business operations.


## Actual Working Behavior

After a branch user logs in and selects a company, the dashboard retrieves operational data for the selected company.

The dashboard displays:

- Company information
- Inventory summary
- Recent transactions
- Sales overview
- Purchase overview
- Quick navigation to operational modules

The information is refreshed whenever the dashboard loads or when business transactions are completed.

## Main Features

- Company overview
- Inventory summary
- Sales summary
- Purchase summary
- Recent activities
- Quick navigation
- Operational statistics

## Inputs

- Selected company
- Inventory records
- Sales transactions
- Purchase transactions
- Branch information

---

## Outputs

- Dashboard summary cards
- Operational statistics
- Recent transaction list
- Navigation shortcuts

---

## Actual Workflow

1. Branch user signs in.
2. User selects a company catalog.
3. Dashboard requests company information.
4. Backend retrieves operational statistics.
5. Dashboard displays inventory, sales, and purchase summaries.
6. User navigates to required operational modules.

---

## Important Implementation Detail

The Branch Dashboard only displays information related to the selected company. Users cannot access data belonging to other branches or companies.

---

## Related Modules

- Manage
- Transactions
- Account
- Reports
- Control Panel