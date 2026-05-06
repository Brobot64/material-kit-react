# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ShopMaster** — a retail ERP web app by Tajarah targeting Nigerian businesses. Built on a Material Kit React template. The app manages products, sales (POS), inventory, customers, employees, outlets, receivables, and financial reporting.

## Commands

```bash
yarn dev          # Start dev server on port 3039
yarn build        # tsc + vite build
yarn lint         # ESLint (flat config)
yarn lint:fix     # Auto-fix lint errors
yarn fm:check     # Prettier check
yarn fm:fix       # Prettier format
yarn fix:all      # lint:fix + fm:fix
yarn test         # Vitest (jsdom)
yarn tsc:watch    # Watch TypeScript errors without emit
```

**Node ≥ 20 required. Use Yarn (not npm).**

Environment: copy `.env` and set `VITE_API_URL` to the backend base URL (default `http://localhost:4000/v1`).

## Architecture

### Routing (`src/routes/sections.tsx`)

Three route groups, all using `React.lazy` + `Suspense`:

- **Public** (`/`, `/sign-in`, `/register`, `/forgot-password`, `/reset-password`, `/change-password`, `/verify-otp`)
- **Authenticated** (`/app/*`) — wrapped in `AuthGuard` + `SubscriptionGuard`
- **Subscription** (`/subscription/*`) — renew, success, cancel flows

Guards live in `src/routes/components/`. `AuthGuard` redirects to `/sign-in` if no token; `GuestGuard` redirects to `/app` if already authenticated; `SubscriptionGuard` redirects to `/subscription/renew` if subscription expired.

### API Layer (`src/services/api.ts`)

Single `api` object with domain-namespaced methods (e.g., `api.products.getAll()`, `api.sales.create()`). All calls go through a `request<T>()` wrapper that:
- Injects `Authorization: Bearer <token>` from `localStorage.accessToken`
- Handles `Content-Type` automatically (skips header for `FormData`)
- On `401` → redirects to `/sign-in`
- On `403` with subscription error → redirects to `/subscription/renew`

### Auth & State

No Redux/Zustand — state lives in three React contexts:
- `AuthContext` (`src/contexts/`) — user, outlets, categories, subscription status, login/logout/OTP/password methods
- `SocketContext` — Socket.io connection
- `NotificationContext` — real-time notifications

Auth data persisted to `localStorage` as `accessToken`, `user`, `appData`.

### Layout (`src/layouts/dashboard/layout.tsx`)

`DashboardLayout` wraps all `/app/*` routes. It renders a collapsible sidebar, header (search, theme toggle, notifications, account menu), outlet/workspace switcher, and `SubscriptionBanner`. Nav items are role-filtered via `getNavForRole()` in `src/layouts/nav-config-dashboard.tsx`.

### Role-Based Access

Roles: `owner`, `system_admin`, `outlet_admin`, `store_executive`, `sales_rep`. Owner and system_admin see financial overview and outlet management; outlet_admin and store_executive see operational routes only. Role is stored on the user object from the API.

### Code Organization

```
src/
  pages/          # Route-level page components (thin wrappers)
  sections/       # Feature modules (auth, product, sale, team, …)
    <feature>/
      view/       # Page-level view components
  layouts/
    components/   # Landing page sections (Hero, Pricing, FAQ, …)
    dashboard/    # App shell layout
  services/api.ts # All API calls
  contexts/       # React context providers
  routes/         # Route config + guards
  types/          # TypeScript interfaces by domain
  hooks/          # Custom hooks
```

Pages are thin; logic lives in `sections/<feature>/view/`. Shared UI uses MUI 7 components styled with Emotion; utility styling uses TailwindCSS 4.

### Types

Domain types are split across `src/types/`: `product.ts`, `sale.ts`, `customer.ts`, `inventory.ts`, `team.ts`, `outlet.ts`, `chat.ts`, `notification.ts`, `project.ts`. Common/shared types are in `src/types/index.ts`.

### Real-time

Socket.io via `SocketContext`. The socket URL comes from the same `VITE_API_URL` base. Notifications are pushed over the socket and consumed by `NotificationContext`.

### Landing Page

`src/pages/home-page.tsx` is the public marketing page. Sections are standalone components in `src/layouts/components/` (Hero, DescriptionBanner, FeatureCards, Pricing, FAQ, Contact, Footer). Pricing is in NGN.
