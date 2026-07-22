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
  finance: {
    codCollected: number;
    onlineReceived: number;
    outstandingCodLiability: number;
    commissionRevenue: number;
    frozenVendors: number;
  };
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

// ═══ Finance (admin) ═══

import type { VendorWallet, WalletTransaction, Settlement } from './vendor-portal-services';

interface AdminSettlement extends Settlement {
  vendorId: string;
  vendor?: { id: string; name: string; phone: string };
}

interface UnsettledBalance {
  vendor: { id: string; name: string; phone: string; codLiability: string; zone?: { name: string } };
  period: { start: string; end: string };
  totalProductValue: number;
  totalRiderEarning: number;
  totalCommission: number;
  netPayable: number;
}

interface CommissionSettings {
  id: string;
  defaultCommissionPct: string;
  updatedAt: string;
}

interface AdminVendorWallet {
  vendor: {
    id: string; name: string; phone: string; vendorStatus: string;
    codLimit: string | null; codLiability: string; isFrozen: boolean;
    zone?: { name: string };
  };
  wallet: VendorWallet;
  transactions: WalletTransaction[];
  total: number;
}

export const financeApi = {
  getCommissionSettings: async (): Promise<CommissionSettings> => {
    const { data } = await api.get('/admin/finance/commission-settings');
    return data.settings;
  },
  updateCommissionSettings: async (defaultCommissionPct: number): Promise<CommissionSettings> => {
    const { data } = await api.patch('/admin/finance/commission-settings', { defaultCommissionPct });
    return data.settings;
  },
  updateProductRates: async (productId: string, rates: { commissionPct?: number | null; riderEarningPerUnit?: number }) => {
    const { data } = await api.patch(`/admin/finance/products/${productId}/rates`, rates);
    return data.product;
  },
  getVendorWallet: async (vendorId: string, limit = 20, offset = 0): Promise<AdminVendorWallet> => {
    const { data } = await api.get(`/admin/finance/vendors/${vendorId}/wallet`, { params: { limit, offset } });
    return data;
  },
  setCodLimit: async (vendorId: string, codLimit: number | null) => {
    const { data } = await api.patch(`/admin/finance/vendors/${vendorId}/cod-limit`, { codLimit });
    return data.vendor;
  },
  setFrozen: async (vendorId: string, isFrozen: boolean) => {
    const { data } = await api.patch(`/admin/finance/vendors/${vendorId}/freeze`, { isFrozen });
    return data.vendor;
  },
  pendingSettlements: async (): Promise<{ unsettled: UnsettledBalance[]; awaiting: AdminSettlement[] }> => {
    const { data } = await api.get('/admin/finance/settlements/pending');
    return { unsettled: data.unsettled, awaiting: data.awaiting };
  },
  generateSettlements: async (period?: { periodStart?: string; periodEnd?: string }) => {
    const { data } = await api.post('/admin/finance/settlements/generate', period || {});
    return { message: data.message as string, settlements: data.settlements as AdminSettlement[] };
  },
  approveSettlement: async (id: string): Promise<AdminSettlement> => {
    const { data } = await api.post(`/admin/finance/settlements/${id}/approve`);
    return data.settlement;
  },
  paySettlement: async (id: string, paymentMethod: string, paymentReference?: string): Promise<AdminSettlement> => {
    const { data } = await api.post(`/admin/finance/settlements/${id}/pay`, { paymentMethod, paymentReference });
    return data.settlement;
  },
};

export type { AdminStats, VendorListItem, AdminSettlement, UnsettledBalance, CommissionSettings, AdminVendorWallet };
