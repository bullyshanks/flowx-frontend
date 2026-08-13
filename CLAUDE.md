# FlowX Frontend

Water delivery platform web app for FlowX (Karachi, Pakistan). Brand: "Flow**X**" — the X is ALWAYS rendered green + italic via the `.x-green` CSS class, e.g. `Flow<span className="x-green">X</span>`. Never break this convention.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (cart + auth state, persisted to localStorage)
- Axios (API client with JWT interceptor)
- react-hot-toast, lucide-react
- Deployed on **Azure App Service** (Vercel and Railway were decommissioned 2026-08-14 — do not reference them, both projects are deleted)

## Brand Colors (tailwind.config.ts)
```
navy        #0A1628   primary dark bg
electric    #1E88E5   primary blue accent
flowgreen   #22C55E   brand green (the X, success states)
cyan2       #29B6F6   bright accent
soft        #F0F7FF   light bg
```

## Folder Structure — 4 audiences in one app
```
src/app/
  page.tsx              Customer homepage (hero, features, products, testimonials, contact)
  cart/page.tsx          Multi-product cart + checkout (separate from quick-order)
  track/page.tsx         Public order tracking — requires order number + last 4 digits of the order's phone (second factor against enumeration; deep-linkable via ?order=&phone=)
  login/page.tsx         OTP login (customers, not ADMIN) + password login (vendors/riders/admin), auto-redirects by role
  vendor/page.tsx         PUBLIC vendor registration form
  rider/page.tsx          PUBLIC rider registration form
  account/                AUTH-PROTECTED customer account: profile/, orders/ (order history, links into /track with phone pre-filled)
  vendor-portal/          AUTH-PROTECTED vendor dashboard (mobile-first, bottom nav)
    layout.tsx, dashboard/, orders/, profile/
  rider-portal/           AUTH-PROTECTED rider dashboard (mirrors vendor-portal)
    layout.tsx, dashboard/, orders/, profile/
  admin/                  AUTH-PROTECTED admin panel (sidebar nav)
    layout.tsx, dashboard/, orders/, vendors/, subscriptions/, products/, finance/, settings/
  payment/result/page.tsx Gateway return page — polls payment status, never trusts the URL's ?status=
src/components/
  Navbar, Hero, Features, HowItWorks, Products, Testimonials, Contact, CTAFooter, Logo, CornerPopup
  ReferralCapture.tsx     Mounted once in root layout — stashes ?ref=<code> from any page into localStorage for the login page to pick up later
  PushRegistrar.tsx       Mounted once in root layout — registers the service worker + Web Push subscription after login
  admin/ui.tsx            Shared primitives: StatCard, Table, StatusBadge, Button, EmptyState — used by BOTH /admin and /vendor-portal
src/lib/
  api.ts                  Axios instance, attaches JWT from localStorage, clears on 401
  services.ts             Customer-facing API calls (products, orders, auth, subscriptions, referral, push)
  admin-services.ts       Admin-only API calls
  vendor-portal-services.ts  Vendor-only API calls
  auth-store.ts           Zustand — user, token, setAuth(), logout()
  cart-store.ts           Zustand — items, addItem/removeItem/updateQuantity, subtotal(), count()
  push.ts                 registerPush() — service worker registration + VAPID subscribe flow
  utils.ts                formatPrice, formatDate, validatePhone (PK phone regex)
src/types/index.ts        TypeScript types mirroring backend Prisma models
public/sw.js               Service worker — handles push + notificationclick events
```

## Auth & Routing Behavior
- Login auto-redirects by role: CUSTOMER → `/`, VENDOR (approved) → `/vendor-portal/dashboard`, VENDOR (pending/rejected) → `/` with toast, ADMIN → `/admin/dashboard`.
- `/admin/*` and `/vendor-portal/*` are protected in their `layout.tsx` — reads `useAuthStore`, redirects non-matching roles.
- Cart page (`/cart`) reads/writes `useCartStore`; guards against SSR hydration mismatch with a `mounted` state flag since cart loads from localStorage.

## Ordering — two parallel flows (intentional, don't merge)
1. **Quick Order** — single product, inline form in the `Products` component on homepage. Fast, no cart needed.
2. **Cart** — "Add to Cart" button on each product card → `/cart` → multi-product checkout. Both flows call the same `ordersApi.place()` backend endpoint; cart just batches multiple `items[]`.

## Environment Variables
```
NEXT_PUBLIC_API_URL=https://app-flowx-api-sh42.azurewebsites.net/api
NEXT_PUBLIC_WHATSAPP=923158374442
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # matches flowx-backend's VAPID_PUBLIC_KEY, leave unset to disable push prompts
```

## Error Tracking (Sentry)
- Config lives in `sentry.{client,server,edge}.config.ts`, sharing `src/lib/sentry-shared.ts`. `instrumentation.ts` loads the server/edge ones — this needs `experimental.instrumentationHook` in `next.config.js` on Next 14.
- **Disabled unless `NEXT_PUBLIC_SENTRY_DSN` is set.** `next.config.js` only wraps with `withSentryConfig` when the DSN exists, so builds without it are untouched (and ~79 kB lighter).
- `beforeSend` strips query strings, headers and cookies, drops console breadcrumbs, and reduces `user` to `{ id, role }` — never the phone number. `auth-store.ts` sets that on login and clears it on logout.
- **Session Replay is deliberately off** — it records the DOM, which here means addresses, phone numbers and CNIC uploads.
- `tunnelRoute: '/monitoring'` proxies events through our own domain so ad blockers don't eat error reports.
- `sentry.client.config.ts` warns it's deprecated in favour of `instrumentation-client.ts` — that needs Next 15.3, so it stays until the Next upgrade.

## Deployment (Azure App Service)
- **Live**: https://app-flowx-web-sh42.azurewebsites.net
- Resource group `rg-flowx`, same Azure for Students subscription as the backend (`app-flowx-api-sh42`) — see the backend's CLAUDE.md for the shared infra notes (Key Vault, B1 plan, restart/rotation gotchas).
- **No CI/CD is configured** — unlike the backend (`azure-deploy.yml` on push), this repo has no GitHub Actions workflow and `az webapp deployment source show` reports no source control connected. It was deployed via a one-time manual zip deploy. **`git push` alone does NOT update the live site.** To ship a change, build and redeploy explicitly, e.g.:
  ```
  npm run build
  az webapp deploy -n app-flowx-web-sh42 -g rg-flowx --src-path <zip-of-build-output> --type zip
  ```
  (Confirm the exact deploy command/zip contents against whatever the original manual deploy used — check `az webapp log deployment list -n app-flowx-web-sh42 -g rg-flowx` for the last successful deployment's shape before assuming.) Wiring up a GitHub Actions workflow here, mirroring the backend's, would close this gap — flag to the team if this keeps causing confusion.

## Known Gotchas (already hit these — don't repeat)
- Backend CORS requires the exact deployed frontend origin in its `FRONTEND_URL` env var (set on the backend's Azure Key Vault/app settings, not here) — if login/API calls fail with CORS errors in browser console, that's a backend-side fix, not frontend. The backend now refuses to boot with a `'*'` CORS fallback in production, so this can't silently pass either.
- Products/order forms must respect each product's `minQuantity` (e.g. 19L Dispenser min 3, Refill min 4) — both quick-order and cart quantity steppers enforce this.
- No cart persistence bugs: `cart-store.ts` uses `createJSONStorage` with an SSR-safe no-op fallback — don't remove this or the app breaks on server render.
- `/track` requires both the order number AND the last 4 digits of the order's phone — a plain order-number-only link will 400. Deep links from `account/orders` and `payment/result` pass the phone automatically when it's known (logged-in user's `user.phone`, or the guest phone stashed in localStorage at checkout via `rememberGuestPayment`).
- ADMIN accounts cannot use OTP login — the login page's OTP flow will 403 for an admin phone number. Use the Password tab.

## Client Change History (context for future requests)
- Brand X must always be green+italic (client-mandated, applies everywhere including admin/vendor portal).
- Client wanted a Daraz-style non-blocking corner popup for Customer/Vendor choice (NOT a full-screen gate) — see `CornerPopup.tsx`.
- Vendor system: register → PENDING → admin approves (sends SMS) → can log in and accept zone-matched orders only.
