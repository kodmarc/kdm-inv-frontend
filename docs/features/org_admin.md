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

The Add Company button is visible regardless of `company_creation_policy` at the HQ level — HQ users always have this ability. Policy only restricts branch users.

Uses `companySuccess`, `companyError` from context for feedback.

---

## Item Catalog — OrgItems

`src/pages/Org/OrgItems.tsx`

Lists items and item categories together on a tabbed or combined view. Supports creating, editing, and deleting items and categories.

Items are displayed with fields: name, code, category, company, pack, purchase rate, sales rate, sales tax. Inactive items are visually distinguished.

Same as companies — at HQ level, `item_creation_policy` does not restrict HQ users.

---

## User Management — OrgUsers

`src/pages/Org/OrgUsers.tsx`

Lists all users in the organization. Supports creating new users with role and branch assignment. Only ORG_ADMIN can create users with elevated roles.

When creating a branch user, the branch field is a select populated from the branches list in the Outlet context. HQ-level roles (ORG_ADMIN, ORG_USER) cannot be assigned a branch.

---

## Settings — OrgSettings

`src/pages/Org/OrgSettings.tsx`

Allows ORG_ADMIN to update the organization name and the two creation policies.

The form is pre-populated from `settings` in the Outlet context. On save, it calls `PUT /org-admin/settings/`, then calls `fetchSettings()` from the context to refresh. The `fetchSettings()` function uses a sequence counter to prevent stale responses from overwriting a freshly-saved value.

---

## Reports — OrgReports

`src/pages/Org/OrgReports.tsx`

Analytics and reporting page for the organization. Shows aggregated data across branches.
