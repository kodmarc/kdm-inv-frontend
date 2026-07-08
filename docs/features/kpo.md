# KPO — Point of Sale

The KPO (Key Point Operator) is a restricted role with a single dedicated screen: the checkout.

---

## Route

```
/kpo/branch/:branchSlug/checkout
```

Protected by `ProtectedRoute` with `allowedRoles={['KPO']}`. A KPO user logging in is sent directly to this route. They cannot navigate to any org or branch admin page.

---

## KpoCheckout

`src/pages/Kpo/KpoCheckout.tsx`

A minimal POS register interface. Shows the branch slug in the header and identifies the user with an amber avatar and the "KPO Cashier" label.

The top bar has: the KDM POS brand mark, the branch identifier, the logged-in user's name and role, and a Sign Out button.

The checkout area is the working space for processing sales at the counter — selecting items, entering quantities, calculating totals, and recording transactions.

This screen is intentionally simpler and more focused than the full branch operator interface. It does not expose the full Manage or Transactions menus. KPO users see only what is needed for point-of-sale operations.

---

## Why a Separate Role

The KPO role exists to support cashier staff who should not have access to inventory management, purchase invoices, settings, or any administrative function. The frontend routes and ProtectedRoute ensure they land only on this page. The backend enforces the same role restrictions on any API call.
