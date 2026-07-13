# Layout Components

There are two major layout components that structure the two main areas of the app.

---

## OrgLayout

`src/pages/Org/OrgLayout.tsx`

The HQ admin shell. Renders a fixed left sidebar with navigation, a top header bar showing the page title, and the main content area where child pages render via `<Outlet>`.

On mount it fetches: branches, users, companies, items, and item categories. All of these are stored in local state and passed to child pages through the Outlet context.

Navigation items: Dashboard, Branches, Companies, Item Catalog, User Management, Reports. Each nav item uses `useLocation` to detect the active path and applies active styling.

The sidebar also shows the logged-in user's initials, username, and role, plus a Sign Out button.

Outlet context shape:
```typescript
{
  branches, users, companies, items, categories,
  fetchBranches, fetchUsers, fetchCompanies, fetchItems, fetchCategories,
  isUsersLoading, isCompaniesLoading, isItemsLoading, isCategoriesLoading,
  branchSuccess, setBranchSuccess, branchError, setBranchError,
  userSuccess, setUserSuccess, userError, setUserError,
  companySuccess, setCompanySuccess, companyError, setCompanyError,
  itemSuccess, setItemSuccess, itemError, setItemError,
  categorySuccess, setCategorySuccess, categoryError, setCategoryError,
}
```

---

## CompanyHomeLayout

`src/pages/Branch/CompanyHome/CompanyHomeLayout.tsx`

The branch operator shell. Renders a horizontal top navigation bar and the main content area.

On mount (and whenever `companySlug` changes) it fetches all data for the current company context: companies, categories, items (filtered by `?company_code=companySlug`), order-bookers, salesmen, parties, accounts, sales invoices, and purchase invoices.

The active company is derived by matching `companySlug` from the URL against the companies list: `companies.find(c => c.code.toLowerCase() === companySlug?.toLowerCase())`.

The top nav has five menus: Dashboard (direct link), Manage (dropdown), Transactions (dropdown), Account (dropdown, placeholder items marked "Soon"), Reports (dropdown, placeholder items marked "Soon"). Control Panel is an additional link shown only to BRANCH_ADMIN and ORG_ADMIN roles.

A "Switch Company" button in the top right navigates back to `/branch/:branchSlug/companies` so the user can change which company they're working in.

The layout renders global success and error banners above the Outlet when those strings are set. Child pages use `setSuccess` and `setError` from the context to trigger these.

Outlet context type: `CompanyHomeLayoutContextType` (exported interface from the same file). Contains all data arrays, all fetch functions, `activeCompany`, `isLoading`, `success/setSuccess`, `error/setError`.

---

## CompanySelection

`src/pages/Branch/CompanySelection.tsx`

Not a layout but an entry point for branch sessions. Rendered at `/branch/:branchSlug/companies`. Shows a list of companies the branch user has access to — only companies whose `branches` M2M includes the user's branch are returned by the API.

Clicking a company card navigates to `/branch/:branchSlug/company/:companyCode/home`.
