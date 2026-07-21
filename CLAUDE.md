# FlowX Frontend

Water delivery platform web app for FlowX (Karachi, Pakistan). Brand: "Flow**X**" — the X is ALWAYS rendered green + italic via the `.x-green` CSS class, e.g. `Flow<span className="x-green">X</span>`. Never break this convention.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (cart + auth state, persisted to localStorage)
- Axios (API client with JWT interceptor)
- react-hot-toast, lucide-react
- Deployed on **Vercel** (auto-deploys on every `git push` to main)

## Brand Colors (tailwind.config.ts)
```
navy        #0A1628   primary dark bg
electric    #1E88E5   primary blue accent
flowgreen   #22C55E   brand green (the X, success states)
cyan2       #29B6F6   bright accent
soft        #F0F7FF   light bg
```

## Folder Structure — 3 audiences in one app
```
src/app/
  page.tsx              Customer homepage (hero, features, products, testimonials, contact)
  cart/page.tsx          Multi-product cart + checkout (separate from quick-order)
  track/page.tsx         Public order tracking by order number
  login/page.tsx         OTP login (customers) + password login (vendors/admin), auto-redirects by role
  vendor/page.tsx         PUBLIC vendor registration form
  vendor-portal/          AUTH-PROTECTED vendor dashboard (mobile-first, bottom nav)
    layout.tsx, dashboard/, orders/, profile/
  admin/                  AUTH-PROTECTED admin panel (sidebar nav)
    layout.tsx, dashboard/, orders/, vendors/, subscriptions/, products/, settings/
src/components/
  Navbar, Hero, Features, HowItWorks, Products, Testimonials, Contact, CTAFooter, Logo, CornerPopup
  admin/ui.tsx            Shared primitives: StatCard, Table, StatusBadge, Button, EmptyState — used by BOTH /admin and /vendor-portal
src/lib/
  api.ts                  Axios instance, attaches JWT from localStorage, clears on 401
  services.ts             Customer-facing API calls (products, orders, auth, subscriptions)
  admin-services.ts       Admin-only API calls
  vendor-portal-services.ts  Vendor-only API calls
  auth-store.ts           Zustand — user, token, setAuth(), logout()
  cart-store.ts           Zustand — items, addItem/removeItem/updateQuantity, subtotal(), count()
  utils.ts                formatPrice, formatDate, validatePhone (PK phone regex)
src/types/index.ts        TypeScript types mirroring backend Prisma models
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
NEXT_PUBLIC_API_URL=https://flowx-backend-production.up.railway.app/api
NEXT_PUBLIC_WHATSAPP=923158374442
```

## Deployment (Vercel)
- Connected to GitHub — every `git push` to main auto-deploys, no manual dashboard action needed.
- Workflow: edit locally → `npm run dev` to test → `git add . && git commit -m "..." && git push`.

## Known Gotchas (already hit these — don't repeat)
- Backend CORS requires the exact Vercel URL in its `FRONTEND_URL` env var (set on Railway side, not here) — if login/API calls fail with CORS errors in browser console, that's a backend-side fix, not frontend.
- Products/order forms must respect each product's `minQuantity` (e.g. 19L Dispenser min 3, Refill min 4) — both quick-order and cart quantity steppers enforce this.
- No cart persistence bugs: `cart-store.ts` uses `createJSONStorage` with an SSR-safe no-op fallback — don't remove this or the app breaks on server render.

## Client Change History (context for future requests)
- Brand X must always be green+italic (client-mandated, applies everywhere including admin/vendor portal).
- Client wanted a Daraz-style non-blocking corner popup for Customer/Vendor choice (NOT a full-screen gate) — see `CornerPopup.tsx`.
- Vendor system: register → PENDING → admin approves (sends SMS) → can log in and accept zone-matched orders only.
