# Frontend

## Overview

The frontend of the KDM Inventory & POS System provides the complete user interface for both the Organization Portal and Branch Portal. It is responsible for rendering pages, handling user interactions, communicating with backend APIs, and enforcing role-based navigation throughout the application.

---

## Actual Working Behavior

The frontend is developed as a Single Page Application (SPA) using React and TypeScript.

The application is divided into two primary workspaces:

- Organization Portal (HQ Administration)
- Branch Portal (Daily Operations)

Navigation is handled using React Router, while layouts provide a consistent interface for each portal. Shared data is loaded through API services and displayed using reusable components.

---

## Main Features

- Single Page Application
- Responsive user interface
- Organization and Branch portals
- Role-based navigation
- Dashboard views
- Inventory management screens
- Transaction management
- Reports
- Authentication integration
- API communication

---

## Inputs

- User interactions
- Form submissions
- API responses
- Authentication state
- Route parameters
- Search and filter values

---

## Outputs

- Interactive user interface
- Dashboard statistics
- Data tables
- Reports
- Forms
- Notifications
- Navigation between modules

---

## Actual Workflow

1. User opens the application.
2. Frontend loads the authentication state.
3. User signs in successfully.
4. System determines the assigned role.
5. Appropriate portal is loaded.
6. API requests fetch required business data.
7. Components render information.
8. User performs operations such as managing inventory or creating invoices.
9. Updated information is displayed after successful API responses.

---

## Important Implementation Detail

The frontend contains no direct database logic. All business operations are performed through secured REST API endpoints provided by the backend.

---

## Related Modules

- Backend
- Routing
- Authentication
- Organization Portal
- Branch Portal