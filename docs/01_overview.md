# Frontend Overview

The frontend is a React 19 single-page application built with Vite, TypeScript, and Tailwind CSS v4. It talks exclusively to the Django REST API backend through cookie-based authentication — no tokens are stored in localStorage or sessionStorage.

The app serves three distinct user populations through three separate UI surfaces: HQ administrators managing the organization from a sidebar-driven dashboard, branch operators working within specific companies through a top-navbar layout, and KPO users at a minimal point-of-sale checkout screen.

---

## Tech Stack

React 19 with the new JSX transform. TypeScript throughout — no plain JS files. Vite for bundling and dev server. Tailwind CSS v4 for utility-first styling. React Router v6 for client-side routing. Axios for all HTTP requests.

---

## Project Structure

```
frontend/
  src/
    App.tsx               — route tree and ProtectedRoute guard
    main.tsx              — app entry point
    context/
      AuthContext.tsx     — global auth state, login/logout/refreshUser
    services/
      api.ts              — Axios instance with CSRF and 401 refresh interceptor
    components/
      ui/                 — reusable primitive components (Button, Input, Card, Modal, etc.)
    pages/
      Shared/             — LandingPage, LoginScreen, SignupScreen
      Org/                — HQ admin pages under OrgLayout
      Branch/             — Branch pages under CompanyHomeLayout
      Kpo/                — KPO POS checkout
```

---

## Environment Variables

One variable is required:

```
VITE_API_URL    Full URL to the backend API, e.g. https://api.yourdomain.com/api
```

Create a `.env.local` file at the root of the `frontend/` directory for local development:

```
VITE_API_URL=http://localhost:8000/api
```

---

## Local Development

```
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default. The backend must be running and `CORS_ALLOWED_ORIGINS` must include `http://localhost:5173`.

---

## Build

```
npm run build
```

Output goes to `dist/`. The build is a standard static site — serve it from any CDN or static host (Vercel, Netlify, Render static site).
