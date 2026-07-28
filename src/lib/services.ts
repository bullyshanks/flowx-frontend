// ═══════════════════════════════════════════════════════════
//  Service layer — typed wrappers around every backend route
// ═══════════════════════════════════════════════════════════

import api from './api';
import type {
  Product, Zone, Order, User, Subscription,
  PlaceOrderInput, VendorRegisterInput, RiderRegisterInput,
} from '@/types';

// ─── Products & Zones ──

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data.products;
  },
  getOne: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data.product;
  },
  getZones: async (): Promise<Zone[]> => {
    const { data } = await api.get('/products/zones');
    return data.zones;
  },
};

// ─── Orders ──

export const ordersApi = {
  place: async (input: PlaceOrderInput): Promise<Order> => {
    const { data } = await api.post('/orders', input);
    return data.order;
  },
  track: async (orderNumber: string): Promise<Order> => {
    const { data } = await api.get(`/orders/track/${orderNumber}`);
    return data.order;
  },
  myOrders: async (): Promise<Order[]> => {
    const { data } = await api.get('/orders/my-orders');
    return data.orders;
  },
  // Vendor
  vendorQueue: async (): Promise<Order[]> => {
    const { data } = await api.get('/orders/vendor/queue');
    return data.orders;
  },
  accept: async (orderId: string): Promise<Order> => {
    const { data } = await api.post(`/orders/${orderId}/accept`);
    return data.order;
  },
  updateStatus: async (
    orderId: string,
    status: string,
    notes?: string
  ): Promise<Order> => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status, notes });
    return data.order;
  },
};

// ─── Auth ──

export const authApi = {
  registerCustomer: async (payload: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    zoneId?: string;
  }) => {
    const { data } = await api.post('/auth/register/customer', payload);
    return data;
  },
  registerVendor: async (payload: VendorRegisterInput) => {
    const { data } = await api.post('/auth/register/vendor', payload);
    return data;
  },
  registerRider: async (payload: RiderRegisterInput) => {
    const { data } = await api.post('/auth/register/rider', payload);
    return data;
  },
  sendOtp: async (phone: string, purpose = 'login') => {
    const { data } = await api.post('/auth/otp/send', { phone, purpose });
    return data;
  },
  verifyOtp: async (phone: string, code: string, purpose = 'login', referralCode?: string) => {
    const { data } = await api.post('/auth/otp/verify', { phone, code, purpose, referralCode });
    return data as { success: boolean; token: string; user: User };
  },
  login: async (phone: string, password: string) => {
    const { data } = await api.post('/auth/login', { phone, password });
    return data as { success: boolean; token: string; user: User };
  },
  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
  updateMe: async (payload: { name?: string; email?: string | null; defaultAddress?: string | null }): Promise<User> => {
    const { data } = await api.patch('/auth/me', payload);
    return data.user;
  },
  submitKyc: async (payload: { cnicFront: string; cnicBack: string; selfieUrl: string }) => {
    const { data } = await api.post('/auth/kyc', payload);
    return data as { success: boolean; message: string; user: { kycStatus: string } };
  },
};

// ─── Vendor (admin operations) ──

export const vendorApi = {
  dashboard: async () => {
    const { data } = await api.get('/vendors/dashboard');
    return data.stats;
  },
};

// ─── Subscriptions ──

export const subscriptionsApi = {
  create: async (payload: {
    productId: string;
    zoneId: string;
    quantity: number;
    frequency: string;
    preferredTimeSlot?: string;
    deliveryAddress: string;
    paymentMethod: string;
  }): Promise<Subscription> => {
    const { data } = await api.post('/subscriptions', payload);
    return data.subscription;
  },
  my: async (): Promise<Subscription[]> => {
    const { data } = await api.get('/subscriptions/my');
    return data.subscriptions;
  },
  pause: async (id: string): Promise<Subscription> => {
    const { data } = await api.post(`/subscriptions/${id}/pause`);
    return data.subscription;
  },
  resume: async (id: string): Promise<Subscription> => {
    const { data } = await api.post(`/subscriptions/${id}/resume`);
    return data.subscription;
  },
  cancel: async (id: string): Promise<Subscription> => {
    const { data } = await api.post(`/subscriptions/${id}/cancel`);
    return data.subscription;
  },
};

// ─── Push Notifications ──

export const notificationsApi = {
  subscribe: async (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<void> => {
    await api.post('/notifications/subscribe', subscription);
  },
  unsubscribe: async (endpoint: string): Promise<void> => {
    await api.delete('/notifications/subscribe', { data: { endpoint } });
  },
};

// ─── Payments ──

export interface PaymentRedirect {
  url: string;
  method: 'GET' | 'POST';
  fields: Record<string, string>;
}

export interface PaymentInitiation {
  mode: 'dev' | 'live';
  provider: string;
  reference: string;
  redirect: PaymentRedirect;
}

export interface PaymentStatus {
  orderNumber: string;
  total: number | string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status: string;
  payments: Array<{
    provider: string;
    status: string;
    failureReason?: string | null;
    paidAt?: string | null;
    createdAt: string;
  }>;
}

export const paymentsApi = {
  initiate: async (payload: { orderId?: string; orderNumber?: string; guestPhone?: string }): Promise<PaymentInitiation> => {
    const { data } = await api.post('/payments/initiate', payload);
    return data;
  },
  // The result page must read payment state from here rather than from its own
  // query string — the gateway sends the customer back through the browser, so
  // anything in the URL is user-editable.
  status: async (orderNumber: string, guestPhone?: string): Promise<PaymentStatus> => {
    const { data } = await api.get(`/payments/status/${orderNumber}`, {
      params: guestPhone ? { guestPhone } : undefined,
    });
    return data.order;
  },
};

// A guest has no account, so /payments/status proves ownership with the phone
// the order was placed under. That can't ride in the return URL — it's a phone
// number, and the gateway redirect is a plain browser navigation anyone could
// see or share. Stash it locally instead: the gateway returns the customer to
// the same browser, so it's there when the result page needs it.
//
// If storage is unavailable or cleared, the result page falls back to telling
// the customer to use Track Order rather than guessing.
const PENDING_PAYMENT_KEY = 'flowx_pending_payment';

export function rememberGuestPayment(orderNumber: string, guestPhone: string): void {
  try {
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ orderNumber, guestPhone }));
  } catch {
    // Private browsing or storage disabled — not worth breaking checkout over.
  }
}

export function recallGuestPayment(orderNumber: string): string | undefined {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw) as { orderNumber?: string; guestPhone?: string };
    return saved.orderNumber === orderNumber ? saved.guestPhone : undefined;
  } catch {
    return undefined;
  }
}

export function forgetGuestPayment(): void {
  try {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    /* nothing to clean up */
  }
}

// Hands the browser to the gateway. A GET is a plain navigation; a POST needs
// a real form submit, because gateways like JazzCash expect form-encoded
// fields and a signed hash that we must not reshape into JSON.
export function redirectToGateway(redirect: PaymentRedirect): void {
  if (redirect.method === 'GET') {
    window.location.href = redirect.url;
    return;
  }
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = redirect.url;
  Object.entries(redirect.fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

// ─── Referral ──

export interface ReferralInfo {
  referralCode: string;
  walletBalance: number;
  referralsCount: number;
  creditedCount: number;
}

export const referralApi = {
  get: async (): Promise<ReferralInfo> => {
    const { data } = await api.get('/customer/referral');
    return data;
  },
};
