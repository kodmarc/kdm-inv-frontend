# User Management

## Overview

The User Management module allows Headquarters to manage both HQ users and branch-specific users from a centralized interface using role-based access control.

---

## Actual Working Behavior

The module contains two sections.

### Organization HQ Users

Manage users with organization-wide permissions.

Features include:

- Add HQ users
- Edit user information
- Enable or disable users
- Assign organization roles

### Branch-Specific Users

Manage operational users assigned to branches.

Features include:

- Add branch users
- Assign branches
- Assign roles
- Edit user information
- Enable or disable accounts

---

## Main Features

- HQ user management
- Branch user management
- Role assignment
- Branch assignment
- Account activation
- Account disabling
- Permission management

---

## Inputs

- Username
- Email
- Role
- Branch assignment
- Account status

---

## Outputs

- Updated user accounts
- Assigned permissions
- Active user list
- Branch user records

---

## Actual Workflow

1. Administrator opens User Management.
2. HQ users and Branch users are loaded.
3. Administrator creates or edits users.
4. Roles and branches are assigned.
5. Changes are saved.
6. Updated permissions become effective immediately.

---

## Important Implementation Detail

Access throughout the application is controlled using assigned roles such as Organization Admin, Branch Admin, and KPO users.

---

## Related Modules

- Dashboard
- Branch Management
- Governance
- Settings