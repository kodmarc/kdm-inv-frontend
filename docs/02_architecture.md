# Frontend Architecture

## Route Tree

The entire route tree lives in `App.tsx`. Routes are organized into four sections.

**Public routes** — no auth required:

```
/                   LandingPage
/login              LoginScreen
/signup             SignupScreen
```

**HQ routes** — requires ORG_ADMIN or ORG_USER:

```
/org-admin/dashboard
/org-admin/branches
/org-admin/companies
/org-admin/items
/org-admin/users
/org-admin/settings
/org-admin/reports
```

All wrapped in `OrgLayout`, which renders the sidebar and passes data down through the React Router `Outlet` context.

**Branch routes** — requires BRANCH_ADMIN or USER:

```
/branch/:branchSlug/companies                              company picker
/branch/:branchSlug/control-panel                         admin-only control panel
/branch/:branchSlug/company/:companySlug/home             dashboard
/branch/:branchSlug/company/:companySlug/items
/branch/:branchSlug/company/:companySlug/categories
/branch/:branchSlug/company/:companySlug/order-bookers
/branch/:branchSlug/company/:companySlug/salesmen
/branch/:branchSlug/company/:companySlug/parties
/branch/:branchSlug/company/:companySlug/accounts
/branch/:branchSlug/company/:companySlug/purchase-invoice
/branch/:branchSlug/company/:companySlug/purchase-invoice/new
/branch/:branchSlug/company/:companySlug/purchase-invoice/:id/edit
/branch/:branchSlug/company/:companySlug/sales-invoice
/branch/:branchSlug/company/:companySlug/sales-invoice/new
/branch/:branchSlug/company/:companySlug/sales-invoice/:id/edit
/branch/:branchSlug/company/:companySlug/purchase-return
/branch/:branchSlug/company/:companySlug/damage-return
/branch/:branchSlug/company/:companySlug/damage-receiving
/branch/:branchSlug/company/:companySlug/load-form
/branch/:branchSlug/company/:companySlug/daily-sales-report
```

All company-scoped pages are wrapped in `CompanyHomeLayout`, which renders the top nav bar and passes data through Outlet context.

**KPO route** — requires KPO role:

```
/kpo/branch/:branchSlug/checkout
```

---

## ProtectedRoute

`ProtectedRoute` in `App.tsx` is a wrapper component that reads `useAuth()` and either renders `<Outlet />` or redirects. It accepts an `allowedRoles` array and renders a loading state while session restoration is in progress (the initial `/auth/me/` call).

```tsx
<Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']} />}>
  <Route element={<OrgLayout />}>
    ...
  </Route>
</Route>
```

---

## Layout Pattern

Both major layouts (`OrgLayout` and `CompanyHomeLayout`) follow the same pattern: they own all the data fetching for their section, store it in local state, and pass everything down to child pages via the React Router `Outlet` context.

Child pages consume the context with `useOutletContext<T>()` typed against the exported context interface. This means child pages contain no fetch logic of their own for shared data — they just call the parent's `fetchX()` functions to refresh after mutations.

This avoids prop drilling and keeps data fetching centralized in the layout, while giving children a clear contract through the typed context interface.

---

## State Management

There is no global state library. State lives in three places:

AuthContext holds authentication state (user profile, isAuthenticated, isLoading) and is global via React context. It persists across navigation.

Layout components (OrgLayout, CompanyHomeLayout) hold data state for their section — lists of branches, users, companies, items, etc. This state lives for the lifetime of the layout, so navigating between child pages does not re-fetch unless a mutation triggers a manual refresh.

Page components hold local UI state — form values, modal open/close state, local loading and error flags for their own operations.
