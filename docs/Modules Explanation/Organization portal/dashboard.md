# Organization Dashboard

## Overview

The Organization Dashboard is the headquarters (HQ) home page of the KDM Inventory & POS System. It provides administrators with an overview of the entire organization, including branch performance, user statistics, and quick access to management modules.


## Actual Working Behavior

After an Organization user signs in, the dashboard is displayed as the default landing page.

The dashboard retrieves organization-wide information including:

- Registered branches
- Organization users
- Company catalogs
- Branch statistics
- Recent activities
- Quick navigation shortcuts

The displayed information is updated from the backend whenever the dashboard is loaded or refreshed.

## Main Features

- Organization summary
- Branch overview
- User statistics
- Company statistics
- Quick navigation
- Organization activity overview
- Dashboard widgets


## Inputs

- Organization ID
- Branch records
- User records
- Company information
- Dashboard statistics


## Outputs

- Organization summary cards
- Branch information
- User statistics
- Quick navigation links
- Dashboard analytics

## Actual Workflow

1. User signs in as an Organization Administrator.
2. The dashboard requests organization data.
3. Backend retrieves organization statistics.
4. Dashboard displays summary information.
5. User navigates to management modules using dashboard shortcuts.

## Important Implementation Detail

The Organization Dashboard displays administrative information only. Operational activities such as inventory and transactions are managed within the Branch Portal.


## Related Modules

- Branch Management
- Governance
- User Management
- Reports
- Settings