# FlowX Water Delivery — Complete Web Platform

Production-ready Next.js 14 + TypeScript + Tailwind CSS frontend featuring:
- 🛒 **Customer Site** — Browse, order, track water deliveries
- 🛠 **Admin Panel** — Manage orders, vendors, products, subscriptions
- 🚚 **Vendor Portal** — Mobile-first portal for delivery partners

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand + localStorage persistence
- **API Client:** Axios
- **Notifications:** react-hot-toast
- **Icons:** lucide-react

## 📦 Quick Start

```bash
# 1. Make sure backend is running on port 4000
cd ../flowx-backend && npm run dev

# 2. Install + run frontend
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**

---

## 🗂 All Pages

### 🛒 Customer-facing
| Path | Description |
|---|---|
| `/` | Landing page — products, ordering, testimonials, contact |
| `/track` | Order tracking by order number |
| `/login` | OTP login + password login |

### 🚚 Vendor-facing (Public)
| Path | Description |
|---|---|
| `/vendor` | Vendor registration form |

### 🚚 Vendor Portal (Auth — APPROVED VENDOR)
| Path | Description |
|---|---|
| `/vendor-portal/dashboard` | Stats + today's queue + active deliveries |
| `/vendor-portal/orders` | Tabbed view: Available · Active · Completed |
| `/vendor-portal/profile` | Profile + performance stats + support |

### 🛠 Admin Panel (Auth — ADMIN)
| Path | Description |
|---|---|
| `/admin/dashboard` | Stats, revenue, orders by status, top zones |
| `/admin/orders` | All orders, filter, assign vendors |
| `/admin/vendors` | Approve/reject, change zones |
| `/admin/subscriptions` | All recurring subscriptions |
| `/admin/products` | Edit prices, activate/deactivate |
| `/admin/settings` | Account & system info |

---

## 🔐 Login Flows

After login, users are auto-redirected to their portal:
- **CUSTOMER** → `/` (homepage)
- **VENDOR (Approved)** → `/vendor-portal/dashboard`
- **VENDOR (Pending/Rejected)** → home with toast notification
- **ADMIN** → `/admin/dashboard`

**Default admin** (from backend seed):
- Phone: `03158374442`
- Password: `ChangeMe123!`

**Test vendor flow:**
1. Register at `/vendor` with a different phone
2. Login as admin → `/admin/vendors` → Approve
3. Login again with the vendor phone → auto-redirect to vendor portal

---

## 🚚 Vendor Portal Highlights

The vendor portal is **mobile-first** because vendors typically use phones.

- **Bottom navigation** on mobile (Home / Orders / Profile)
- **Sidebar navigation** on desktop
- **Auto-refresh every 30 seconds** on dashboard for live order updates
- **Tap-to-call and WhatsApp** buttons on every order
- **Accordion order cards** — tap to expand, see full details
- **One-click status updates**: Accept → Out for Delivery → Delivered

The vendor can see:
- Today's order count
- In-progress / Completed counts
- Active deliveries (orders they've accepted)
- Available orders in their zone (auto-filtered by backend)

---

## 🛠 Admin Panel Highlights

- **Dashboard** with revenue, order stats, status breakdown, top zones
- **Orders** with status filters, one-click confirm, vendor assignment modal
- **Vendors** with approve/reject (sends SMS), inline zone editing
- **Products** with inline price editing
- **Auth-protected** — non-admins are redirected away

---

## 🎨 Brand System

```
navy        #0A1628  ← primary dark
electric    #1E88E5  ← primary blue accent
flowgreen   #22C55E  ← brand green (the X color)
cyan2       #29B6F6  ← bright accent
soft        #F0F7FF  ← light bg
```

The italic green X via `.x-green` utility class is everywhere:
```tsx
Flow<span className="x-green">X</span>
```

---

## 🚀 Production Deployment

For **Vercel** (recommended — free tier works):
1. Push to GitHub
2. Import on vercel.com
3. Add environment variable `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`
4. Deploy

The backend should be deployed separately on Railway / Render / DigitalOcean.

---

## 🗂 Project Structure

```
flowx-frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   ├── track/page.tsx
│   │   ├── vendor/page.tsx              ← Public vendor registration
│   │   ├── login/page.tsx
│   │   ├── admin/                       ← Admin Panel
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/, orders/, vendors/,
│   │   │   ├── subscriptions/, products/, settings/
│   │   └── vendor-portal/               ← Vendor Portal (NEW)
│   │       ├── layout.tsx               (sidebar + bottom-nav)
│   │       ├── dashboard/page.tsx
│   │       ├── orders/page.tsx
│   │       └── profile/page.tsx
│   ├── components/
│   │   ├── Navbar, Hero, Products, etc. ← Customer
│   │   └── admin/ui.tsx                 ← Shared admin/vendor UI
│   ├── lib/
│   │   ├── api.ts, services.ts
│   │   ├── admin-services.ts
│   │   ├── vendor-portal-services.ts    ← NEW
│   │   ├── auth-store.ts, cart-store.ts, utils.ts
│   └── types/index.ts
└── package.json, tsconfig.json, tailwind.config.ts, next.config.js
```

---

## 🐛 Common Issues

**"Vendor access only" + redirect** — User isn't a VENDOR or isn't APPROVED. Check `/admin/vendors`.

**Empty vendor portal** — Backend zone matching: vendor's `zoneId` must match the order's `zoneId`. Verify in admin panel.

**Auto-refresh not working** — The dashboard polls every 30s. Open browser console to check API errors.

---

## ✅ End-to-End Flow Test

1. **Customer:** `/` → place order with COD payment, zone "North Karachi" → get order number
2. **Admin:** Login → `/admin/orders` → see PENDING order
3. **Vendor:** Register at `/vendor` (phone in zone "North Karachi")
4. **Admin:** `/admin/vendors` → click **Approve** (vendor receives SMS in backend logs)
5. **Vendor:** Login again → auto-redirected to `/vendor-portal/dashboard`
6. **Vendor:** See available order → tap **Accept Order**
7. **Vendor:** Tab to "Active" → tap **Mark Out for Delivery**
8. **Customer:** Visit `/track` → enter order number → see "Out for Delivery"
9. **Vendor:** Tap **Mark Delivered** → done!
10. **Admin:** Dashboard updates with revenue + delivered count

---

Built with ❤️ for FlowX — Pure Water · Fast Delivery
