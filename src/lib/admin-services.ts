// ═══════════════════════════════════════════════════════════
//  Admin API services
//  Append these to existing src/lib/services.ts
// ═══════════════════════════════════════════════════════════

import api from './api';
import type { Order, User } from '@/types';

interface AdminStats {
  users: { customers: number; vendors: number; pendingVendors: number };
  orders: { today: number; month: number; pending: number };
  subscriptions: { active: number };
  revenue: { total: number; month: number };
}

interface VendorListItem extends User {
  cnic?: string;
  approvedAt?: string;
  createdAt: string;
  zone?: { id: string; name: string };
  _count?: { assignedOrders: number };
}

export const adminApi = {
  // ── Dashboard ──
  dashboard: async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/dashboard');
    return data.stats;
  },
  ordersByStatus: async () => {
    const { data } = await api.get('/admin/orders/by-status');
    return data.data as Array<{ status: string; _count: { _all: number } }>;
  },
  topZones: async () => {
    const { data } = await api.get('/admin/orders/top-zones');
    return data.data as Array<{ zone: string; orderCount: number }>;
  },

  // ── Orders ──
  listOrders: async (filters?: { status?: string; zoneId?: string; limit?: number; offset?: number }) => {
    const { data } = await api.get('/orders/admin/all', { params: filters });
    return { orders: data.orders as Order[], total: data.total as number };
  },
  assignVendor: async (orderId: string, vendorId: string) => {
    const { data } = await api.post(`/orders/${orderId}/assign`, { vendorId });
    return data.order as Order;
  },
  updateOrderStatus: async (orderId: string, status: string, notes?: string) => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status, notes });
    return data.order as Order;
  },

  // ── Vendors ──
  listVendors: async (filters?: { status?: string; zoneId?: string }) => {
    const { data } = await api.get('/vendors', { params: filters });
    return data.vendors as VendorListItem[];
  },
  approveVendor: async (vendorId: string) => {
    const { data } = await api.post(`/vendors/${vendorId}/approve`);
    return data.vendor;
  },
  rejectVendor: async (vendorId: string, reason?: string) => {
    const { data } = await api.post(`/vendors/${vendorId}/reject`, { reason });
    return data.vendor;
  },
  changeVendorZone: async (vendorId: string, zoneId: string) => {
    const { data } = await api.patch(`/vendors/${vendorId}/zone`, { zoneId });
    return data.vendor;
  },

  // ── Subscriptions ──
  listSubscriptions: async () => {
    const { data } = await api.get('/subscriptions/admin/all');
    return data.subscriptions;
  },
};

export type { AdminStats, VendorListItem };
