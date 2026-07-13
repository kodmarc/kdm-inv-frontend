# Org Admin Features

All HQ pages live under `src/pages/Org/` and render inside `OrgLayout`. They receive their data via `useOutletContext()` and call the layout's fetch functions to refresh after mutations.

---

## Dashboard — OrgHome

`src/pages/Org/OrgHome.tsx`

Overview page showing counts and summary cards for the organization — number of branches, companies, items, and users. Data comes from the Outlet context (no additional fetch needed).

---

## Branches — OrgBranches

`src/pages/Org/OrgBranches.tsx`

Lists all branches in the organization. Allows creating new branches via a modal form (name and slug fields). Only ORG_ADMIN and ORG_USER can create branches.

After a successful create or delete, calls `fetchBranches()` from the Outlet context to refresh the list. Uses `branchSuccess`, `branchError`, `setBranchSuccess`, `setBranchError` from the context for feedback banners.

---

## Companies — OrgCompanies

`src/pages/Org/OrgCompanies.tsx`

Lists all companies in the organization. Supports creating, editing, and deleting companies.

Each company is assigned to one or more branches via a Many-to-Many relationship. When creating or editing a company, a checkbox list of all branches is shown. The selected branch slugs are sent as the `branches` array in the payload. Branch users only see companies that include their branch in the `branches` list.

Uses `companySuccess`, `companyError` from context for feedback.

---

## Item Catalog — OrgItems

`src/pages/Org/OrgItems.tsx`

Lists items and item categories together on a tabbed or combined view. Supports creating, editing, and deleting items and categories.

Items and categories are organization-scoped — they are not tied to a specific branch. All branches within the organization share the same item catalog. Items are displayed with fields: name, code, category, company, pack, purchase rate, sales rate, sales tax. Inactive items are visually distinguished.

---

## User Management — OrgUsers

`src/pages/Org/OrgUsers.tsx`

Lists all users in the organization. Supports creating new users with role and branch assignment. Only ORG_ADMIN can create users with elevated roles.

When creating a branch user, the branch field is a select populated from the branches list in the Outlet context. HQ-level roles (ORG_ADMIN, ORG_USER) cannot be assigned a branch.

---

## Reports — OrgReports

`src/pages/Org/OrgReports.tsx`

Analytics and reporting page for the organization. Shows aggregated data across branches.
