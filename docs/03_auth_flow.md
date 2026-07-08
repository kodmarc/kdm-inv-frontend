# Auth Flow

Authentication state is managed by `AuthContext` in `src/context/AuthContext.tsx`. The context is global — it wraps the entire app via `AuthProvider` in `App.tsx`.

---

## Session Restoration

On every app load, `AuthProvider` calls `GET /api/auth/me/` inside a `useEffect`. If the access token cookie is valid, the backend returns the user profile and the context sets `isAuthenticated = true`. If the call fails (no cookie or expired token), the user stays unauthenticated.

While the restore is in progress, `isLoading` is `true`. `ProtectedRoute` renders a loading spinner during this period rather than immediately redirecting, which prevents the logged-in user from being flashed to `/login` on refresh.

Once restore is complete, the returned `csrf_token` is injected into Axios defaults:

```typescript
api.defaults.headers.common['X-CSRFToken'] = response.data.csrf_token;
```

---

## Login

The login screen (`LoginScreen`) handles both org-level and branch-level login by calling `loginOrg()` or `loginBranch()` from the context. Both functions POST to the backend, receive a user profile and csrf_token in the response body, set state in AuthContext, and inject the CSRF token into Axios.

The backend sets `access_token` and `refresh_token` as HttpOnly cookies in the Set-Cookie header — the browser stores them automatically, and they are invisible to JavaScript.

---

## Token Refresh

The Axios interceptor in `src/services/api.ts` catches 401 responses automatically. On the first 401 from any non-auth endpoint, it calls `POST /api/auth/refresh/` using a separate bare `axios` instance (not the shared `api` instance, to avoid an interceptor loop). If refresh succeeds, the original request is retried.

If refresh also returns 401 — meaning both tokens are expired or blacklisted — the interceptor fires the `auth-session-expired` custom DOM event. `AuthProvider` listens for this event and clears the user state, effectively logging the user out on the client side.

The `_retry` flag on the original request config ensures the retry cycle only runs once per request.

---

## refreshUser

`refreshUser()` is a function exposed from AuthContext that re-fetches `/auth/me/` and updates the user profile in state. It is called on mount by branch-level pages (`CompanySelection`, `CompanyHomeLayout`) to ensure the in-memory user profile reflects the current policy settings, even if those policies were changed by the ORG_ADMIN after the user logged in.

Without this, branch users would see stale `company_creation_policy` and `item_creation_policy` values from login time.

---

## Logout

`logout()` calls `POST /api/auth/logout/`, which blacklists the refresh token on the backend and clears the cookies. Even if the network call fails, `logout()` clears client-side state in the `finally` block so the user is always taken back to the login screen.

---

## CSRF

The CSRF token is a rotating value returned by the backend as a plain field in the JSON response body (not a cookie). The frontend stores it in Axios's common headers. Every mutating request (POST, PATCH, DELETE) sends it as `X-CSRFToken`. Django's `CsrfViewMiddleware` validates it server-side.

On logout, the header is cleared: `delete api.defaults.headers.common['X-CSRFToken']`.
