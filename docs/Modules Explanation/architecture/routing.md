# Routing

## Overview

The routing system controls navigation throughout the KDM Inventory & POS System. It ensures users access only the pages permitted by their assigned role while maintaining separate navigation for Organization and Branch portals.

---

## Actual Working Behavior

The application uses React Router to manage navigation between public and protected pages.

Routes are divided into:

- Public routes
- Authentication routes
- Organization Portal routes
- Branch Portal routes

Protected routes verify authentication before rendering any page.

---

## Main Features

- Public routing
- Protected routing
- Nested layouts
- Dynamic route parameters
- Company selection
- Branch selection
- Role-based navigation

---

## Inputs

- URL
- User role
- Authentication state
- Route parameters

---

## Outputs

- Requested page
- Redirects
- Protected content
- Navigation layouts

---

## Actual Workflow

1. User navigates to a route.
2. Authentication status is verified.
3. User role is checked.
4. Matching layout loads.
5. Requested page is rendered.
6. Unauthorized users are redirected to Sign In.

---

## Important Implementation Detail

Organization and Branch portals use separate layouts to isolate administrative functions from daily operational workflows.

---

## Related Modules

- Frontend
- Authentication
- Organization Portal
- Branch Portal