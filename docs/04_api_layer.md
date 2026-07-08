# API Layer

All HTTP communication with the backend goes through a single Axios instance defined in `src/services/api.ts`. No component or page imports `axios` directly — they import the shared `api` instance.

---

## Axios Instance

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});
```

`withCredentials: true` tells the browser to include cookies on every request, including cross-origin ones. This is what makes cookie-based auth work.

`xsrfCookieName` and `xsrfHeaderName` are Axios's built-in CSRF support — but for this project they are a backup configuration only. The CSRF token is not sent as a cookie by Django; it is sent as a JSON body field. The frontend manually injects it into `api.defaults.headers.common['X-CSRFToken']` after every login and session restore. The xsrf config is still correct to have as a fallback.

---

## 401 Interceptor

The response interceptor handles silent token refresh:

1. A 401 comes in from any non-auth endpoint.
2. The interceptor checks `_retry` — if not already retried, sets `_retry = true` and calls `POST /auth/refresh/`.
3. If refresh succeeds, the original request is retried and its promise resolves transparently to the caller.
4. If refresh fails (second 401), fires `window.dispatchEvent(new Event('auth-session-expired'))`. AuthContext listens for this and clears user state.

Auth endpoints (`/auth/login-org/`, `/auth/login-branch/`, `/auth/signup/`, `/auth/logout/`) are excluded from the retry logic — a 401 from those is a real auth failure and should surface to the caller as an error.

---

## Usage Pattern

Every page and layout uses the `api` instance for all requests:

```typescript
import api from '../services/api';

const res = await api.get('/companies/');
const res = await api.post('/purchase-invoices/', payload);
const res = await api.patch(`/parties/${id}/`, { name: 'New Name' });
const res = await api.delete(`/items/${id}/`);
```

The `baseURL` already includes `/api`, so paths here are relative to that — `/companies/` becomes `https://yourdomain.com/api/companies/`.

Error handling is done locally in each function using try/catch. Most fetch functions set a local error string for display. Form submit functions re-throw the error after logging so the form component can show the appropriate validation message.
