# Organization Dashboard

## Overview

The Organization Dashboard is the central home page for Headquarters (HQ) users after signing into the KDM HQ portal. It provides a high-level overview of the organization's branches, users, companies, and operational statistics while offering quick access to administration modules.

---

## Actual Working Behavior

After an Organization Administrator signs in, the dashboard automatically loads organization-wide statistics from the backend.

The dashboard displays:

- Total registered branches
- HQ staff count
- Branch staff count
- Quick access to Branch Management
- Governance Policies
- User Management
- Analytics & Reports

It serves as the starting point for managing the entire organization.

---

## Main Features

- Organization overview
- Registered branch statistics
- HQ staff summary
- Branch staff summary
- Quick access cards
- Administrative shortcuts
- Organization status overview

---

## Inputs

- Organization ID
- Branch records
- User records
- Company data
- Organization statistics

---

## Outputs

- Dashboard summary cards
- Staff statistics
- Branch overview
- Navigation to organization modules

---

## Actual Workflow

1. Organization Administrator signs in.
2. Dashboard requests organization statistics.
3. Backend retrieves branch, company, and user information.
4. Summary cards are displayed.
5. Administrator navigates to Branches, Companies, Users, Reports, or Governance.

---

## Important Implementation Detail

The Organization Dashboard displays organization-wide information only. Inventory transactions and day-to-day operations are managed through the Branch Portal.

---

## Related Modules

- Branch Management
- Governance
- User Management
- Reports
- Settings