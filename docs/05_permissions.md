# Permissions and Role Gating

The frontend enforces role-based access at two levels: route access and feature access within pages.

---

## Route-Level Gating

`ProtectedRoute` in `App.tsx` accepts an `allowedRoles` array. If the authenticated user's `role` is not in that array, they are redirected to `/access-denied`. The five roles are:

```
ORG_ADMIN     — full HQ access, can change all settings
ORG_USER      — HQ access, read-only on some settings, cannot change policies
BRANCH_ADMIN  — branch access, manages branch data, can see control panel
USER          — branch access, operational entry only
KPO           — only the /kpo/... checkout route
```

HQ routes are guarded by `['ORG_ADMIN', 'ORG_USER']`. Branch routes by `['BRANCH_ADMIN', 'USER']`. KPO by `['KPO']`.

---

## Policy-Based Feature Gating

Within branch pages, certain features (creating companies, creating items) are conditionally shown or hidden based on two policy fields from the user profile:

`company_creation_policy` — either `'ORG_ADMIN'` or `'BRANCH_ADMIN'`
`item_creation_policy` — either `'ORG_ADMIN'` or `'BRANCH_ADMIN'`

When the policy is `'ORG_ADMIN'`, only HQ users should be able to create that resource and the Add button is hidden for branch users. When the policy is `'BRANCH_ADMIN'`, branch users see and can use the Add button.

The backend enforces the same policy on every write request independently. The frontend hiding is a UX convenience, not a security boundary.

---

## Keeping Policy Data Fresh

Policy values are fields on the user profile (`user.company_creation_policy`, `user.item_creation_policy`). These are stored in AuthContext and set at login time.

If the ORG_ADMIN changes a policy after a branch user has already logged in, that user's in-memory profile would have the old value. To handle this, `CompanySelection.tsx` and `CompanyHomeLayout.tsx` both call `refreshUser()` on mount. `refreshUser()` re-fetches `/auth/me/` and updates the user profile in AuthContext with the current server values.

---

## Admin-Only UI Elements

Inside branch pages, the Control Panel link in the top nav is conditionally rendered:

```tsx
{(user?.role === 'ORG_ADMIN' || user?.role === 'BRANCH_ADMIN') && (
  <button onClick={() => go(`/branch/${branchSlug}/control-panel`)}>
    Control Panel
  </button>
)}
```

ORG_ADMIN can access branch pages if they navigate there directly (the backend will serve them data), and they see the control panel. Regular USER operators do not see it.

---

## Backend is the Authoritative Gate

All role and policy enforcement on mutations happens in the backend. The frontend role checks and conditional rendering are purely for UX. A user could, in theory, call the API directly and the backend would still enforce the correct policy. Never rely on frontend checks for security.
