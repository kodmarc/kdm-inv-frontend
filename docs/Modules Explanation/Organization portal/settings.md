# Settings

## Overview

The Settings module has been removed from the application. Organization-level configuration (name, policies) was previously managed here, but this page no longer exists as a route or component.

---

## Current State

There is no `/org-admin/settings` route in `App.tsx`. The `OrgLayout` sidebar does not include a Settings link. The backend has no `/org-admin/settings/` endpoint.

The Organization model no longer has configurable policy fields (`company_creation_policy`, `item_creation_policy` were removed in migration `0004_remove_policies_branch_m2m`).

---

## Related Modules

- Dashboard
- Branch Management
- User Management
