# Governance

## Overview

The Governance module — which previously managed `company_creation_policy` and `item_creation_policy` — has been removed. These policy fields no longer exist on the Organization model and are not returned by the backend.

---

## Current State

Company and item creation is no longer policy-gated. The Organization model contains only `id`, `org_id`, `name`, and `created_at`. There is no governance configuration surface in the application.

Branch access to data is now controlled purely through the Company → Branches M2M assignment: branch users see only companies whose `branches` list includes their branch.

---

## Related Modules

- Dashboard
- Branch Management
- User Management
