// ═══════════════════════════════════════════════════════════
//  Service layer — typed wrappers around every backend route
// ═══════════════════════════════════════════════════════════

import api from './api';
import type {
  Product, Zone, Order, User,
  PlaceOrderInput, VendorRegisterInput,
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
  sendOtp: async (phone: string, purpose = 'login') => {
    const { data } = await api.post('/auth/otp/send', { phone, purpose });
    return data;
  },
  verifyOtp: async (phone: string, code: string, purpose = 'login') => {
    const { data } = await api.post('/auth/otp/verify', { phone, code, purpose });
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
  }) => {
    const { data } = await api.post('/subscriptions', payload);
    return data.subscription;
  },
  my: async () => {
    const { data } = await api.get('/subscriptions/my');
    return data.subscriptions;
  },
};
