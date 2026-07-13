# Sign In

## Overview

The Sign In page is the entry point of the KDM Inventory & POS System. It allows authorized users to securely access the application using their assigned credentials and redirects them to the appropriate portal based on their role.

---

## Actual Working Behavior

The Sign In screen collects user credentials and submits them to the authentication service.

After successful verification, the system:

- Creates a secure user session
- Retrieves user profile information
- Determines assigned organization and branch
- Identifies user permissions
- Redirects the user to the correct dashboard

If authentication fails, appropriate validation or error messages are displayed.

---

## Main Features

- Username or Email login
- Password authentication
- Form validation
- Secure authentication
- Remember active session
- Error handling
- Automatic portal redirection
- Logout support

---

## Inputs

- Username or Email
- Password
- Organization selection (if required)
- Branch selection (if required)

---

## Outputs

- Authenticated user session
- User profile
- Assigned organization
- Assigned branch
- Dashboard access
- Login success or error messages

---

## Actual Workflow

1. User opens the Sign In page.
2. Username or email and password are entered.
3. User submits the login form.
4. Authentication service validates the credentials.
5. User information and assigned role are retrieved.
6. A secure session is created.
7. The system redirects the user to the appropriate Organization or Branch Portal dashboard.
8. Invalid credentials display an error message without granting access.

---

## Important Implementation Detail

The Sign In page only performs user authentication. Authorization and permission checks are handled after authentication, ensuring users only access resources permitted by their assigned role.

---

## Related Modules

- Authentication
- Frontend
- Routing
- Organization Portal Dashboard
- Branch Portal Dashboard