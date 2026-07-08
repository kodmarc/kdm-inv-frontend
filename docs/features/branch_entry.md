# Branch Entry Features

This covers the entry point pages for branch users before they get into a specific company's data.

---

## Company Selection — CompanySelection

`src/pages/Branch/CompanySelection.tsx`

The first page a branch user sees after logging in. Renders at `/branch/:branchSlug/companies`.

On mount it calls `refreshUser()` (to get fresh policy data) and then fetches all companies visible to the user's branch. Each company is displayed as a card with its name and code. Clicking a card navigates to:

```
/branch/:branchSlug/company/:companyCode/home
```

The `:companyCode` in the URL is the company's code field in lowercase (not a UUID). This is what `CompanyHomeLayout` uses to identify `activeCompany`.

If the branch has no companies yet, an empty state with a message is shown. If `company_creation_policy` is `'BRANCH_ADMIN'`, an Add Company button is available on this page. If `'ORG_ADMIN'`, the button is hidden.

---

## Branch Control Panel — BranchControlPanel

`src/pages/Branch/CompanyHome/BranchControlPanel.tsx`

Available at `/branch/:branchSlug/control-panel`. Only visible to BRANCH_ADMIN and ORG_ADMIN roles (the Control Panel link in the top nav is conditionally rendered).

Provides branch-level administrative controls — managing branch-wide settings, viewing an overview of all companies in the branch, and other admin operations not tied to a specific company.

---

## Company Dashboard — CompanyDashboard

`src/pages/Branch/CompanyHome/CompanyDashboard.tsx`

The home screen for a specific company, at `/branch/:branchSlug/company/:companySlug/home`. Shows summary stats: total items, recent transactions, stock alerts, and quick navigation cards.

Data comes from the `CompanyHomeLayout` Outlet context — no additional fetch is performed here.
