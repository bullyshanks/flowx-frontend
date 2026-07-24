// ═══════════════════════════════════════════════════════════
//  Admin API services
//  Append these to existing src/lib/services.ts
// ═══════════════════════════════════════════════════════════

import api from './api';
import type { Order, User } from '@/types';

interface AdminStats {
  users: {
    customers: number;
    vendors: number; pendingVendors: number;
    riders: number; pendingRiders: number;
  };
  orders: { today: number; month: number; pending: number };
  subscriptions: { active: number };
  revenue: { total: number; month: number };
  finance: {
    codCollected: number;
    onlineReceived: number;
    outstandingCodLiability: number;
    commissionRevenue: number;
    frozenVendors: number;
    frozenRiders: number;
  };
}

interface VendorListItem extends User {
  cnic?: string;
  approvedAt?: string;
  createdAt: string;
  zone?: { id: string; name: string };
  _count?: { assignedOrders: number };
}

interface RiderListItem extends User {
  vehicleDetails?: string;
  isOnline?: boolean;
  isFrozen?: boolean;
  codLimit?: string | number | null;
  approvedAt?: string;
  createdAt: string;
  zone?: { id: string; name: string };
  _count?: { riderOrders: number };
}

interface KycSubmission {
  id: string;
  name: string;
  phone: string;
  role: 'VENDOR' | 'RIDER';
  vendorStatus?: string;
  kycStatus: string;
  cnicFront?: string;
  cnicBack?: string;
  selfieUrl?: string;
  zone?: { id: string; name: string };
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
  suspendVendor: async (vendorId: string, reason?: string) => {
    const { data } = await api.patch(`/vendors/${vendorId}/suspend`, { reason });
    return data as { message: string; vendor: VendorListItem };
  },
  changeVendorZone: async (vendorId: string, zoneId: string) => {
    const { data } = await api.patch(`/vendors/${vendorId}/zone`, { zoneId });
    return data.vendor;
  },

  // ── Riders ──
  listRiders: async (filters?: { status?: string; zoneId?: string }) => {
    const { data } = await api.get('/riders', { params: filters });
    return data.riders as RiderListItem[];
  },
  approveRider: async (riderId: string) => {
    const { data } = await api.post(`/riders/${riderId}/approve`);
    return data.rider;
  },
  rejectRider: async (riderId: string, reason?: string) => {
    const { data } = await api.post(`/riders/${riderId}/reject`, { reason });
    return data.rider;
  },
  suspendRider: async (riderId: string, reason?: string) => {
    const { data } = await api.patch(`/riders/${riderId}/suspend`, { reason });
    return data as { message: string; rider: RiderListItem };
  },
  changeRiderZone: async (riderId: string, zoneId: string) => {
    const { data } = await api.patch(`/riders/${riderId}/zone`, { zoneId });
    return data.rider;
  },
  setRiderCodLimit: async (riderId: string, codLimit: number | null) => {
    const { data } = await api.patch(`/riders/${riderId}/cod-limit`, { codLimit });
    return data.rider;
  },
  setRiderFrozen: async (riderId: string, isFrozen: boolean) => {
    const { data } = await api.patch(`/riders/${riderId}/freeze`, { isFrozen });
    return data.rider;
  },

  // ── KYC review (shared: vendor + rider) ──
  listPendingKyc: async (role?: 'VENDOR' | 'RIDER') => {
    const { data } = await api.get('/admin/kyc/pending', { params: { role } });
    return data.users as KycSubmission[];
  },
  getKycSubmission: async (userId: string) => {
    const { data } = await api.get(`/admin/kyc/${userId}`);
    return data.user as KycSubmission;
  },
  approveKyc: async (userId: string) => {
    const { data } = await api.post(`/admin/kyc/${userId}/approve`);
    return data.user;
  },
  rejectKyc: async (userId: string, reason?: string) => {
    const { data } = await api.post(`/admin/kyc/${userId}/reject`, { reason });
    return data.user;
  },

  // ── Subscriptions ──
  listSubscriptions: async () => {
    const { data } = await api.get('/subscriptions/admin/all');
    return data.subscriptions;
  },
  pauseSubscription: async (id: string) => {
    const { data } = await api.post(`/subscriptions/admin/${id}/pause`);
    return data.subscription;
  },
  resumeSubscription: async (id: string) => {
    const { data } = await api.post(`/subscriptions/admin/${id}/resume`);
    return data.subscription;
  },
  cancelSubscription: async (id: string) => {
    const { data } = await api.post(`/subscriptions/admin/${id}/cancel`);
    return data.subscription;
  },

  // ── Zones ──
  listZonesAdmin: async (): Promise<AdminZone[]> => {
    const { data } = await api.get('/products/zones/admin/all');
    return data.zones;
  },
  createZone: async (fields: { name: string; city?: string }): Promise<AdminZone> => {
    const { data } = await api.post('/products/zones', fields);
    return data.zone;
  },
  updateZone: async (id: string, fields: { name?: string; city?: string; isActive?: boolean }): Promise<AdminZone> => {
    const { data } = await api.patch(`/products/zones/${id}`, fields);
    return data.zone;
  },
};

interface AdminZone {
  id: string;
  name: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { users: number; orders: number; subscriptions: number };
}

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

interface RiderWallet {
  totalEarning: number;
  netPayable: number;
  codLiability: number;
  codLimit: number | null;
  isFrozen: boolean;
}

interface RiderSettlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalEarning: string;
  netPayable: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  paymentMethod: string | null;
  paymentReference: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface AdminRiderSettlement extends RiderSettlement {
  riderId: string;
  rider?: { id: string; name: string; phone: string };
}

interface UnsettledRiderBalance {
  rider: { id: string; name: string; phone: string; codLiability: string; zone?: { name: string } };
  period: { start: string; end: string };
  totalEarning: number;
  netPayable: number;
}

interface AdminRiderWallet {
  rider: {
    id: string; name: string; phone: string; vendorStatus: string; kycStatus: string; vehicleDetails?: string;
    codLimit: string | null; codLiability: string; isFrozen: boolean;
    zone?: { name: string };
  };
  wallet: RiderWallet;
  transactions: WalletTransaction[];
  total: number;
  settlements: RiderSettlement[];
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
  getRiderWallet: async (riderId: string, limit = 20, offset = 0): Promise<AdminRiderWallet> => {
    const { data } = await api.get(`/admin/finance/riders/${riderId}/wallet`, { params: { limit, offset } });
    return data;
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
  pendingRiderSettlements: async (): Promise<{ unsettled: UnsettledRiderBalance[]; awaiting: AdminRiderSettlement[] }> => {
    const { data } = await api.get('/admin/finance/riders/settlements/pending');
    return { unsettled: data.unsettled, awaiting: data.awaiting };
  },
  generateRiderSettlements: async (period?: { periodStart?: string; periodEnd?: string }) => {
    const { data } = await api.post('/admin/finance/riders/settlements/generate', period || {});
    return { message: data.message as string, settlements: data.settlements as AdminRiderSettlement[] };
  },
  approveRiderSettlement: async (id: string): Promise<AdminRiderSettlement> => {
    const { data } = await api.post(`/admin/finance/riders/settlements/${id}/approve`);
    return data.settlement;
  },
  payRiderSettlement: async (id: string, paymentMethod: string, paymentReference?: string): Promise<AdminRiderSettlement> => {
    const { data } = await api.post(`/admin/finance/riders/settlements/${id}/pay`, { paymentMethod, paymentReference });
    return data.settlement;
  },

  // ── Refunds ──
  listRefunds: async (status?: string): Promise<Refund[]> => {
    const { data } = await api.get('/admin/finance/refunds', { params: status ? { status } : {} });
    return data.refunds;
  },
  createRefund: async (orderNumber: string, amount: number, reason: string): Promise<Refund> => {
    const { data } = await api.post('/admin/finance/refunds', { orderNumber, amount, reason });
    return data.refund;
  },
  approveRefund: async (id: string, clawbackVendor: boolean, clawbackRider: boolean): Promise<Refund> => {
    const { data } = await api.post(`/admin/finance/refunds/${id}/approve`, { clawbackVendor, clawbackRider });
    return data.refund;
  },
  rejectRefund: async (id: string, reason?: string): Promise<Refund> => {
    const { data } = await api.post(`/admin/finance/refunds/${id}/reject`, { reason });
    return data.refund;
  },
  payRefund: async (id: string, paymentMethod: string, paymentReference?: string): Promise<Refund> => {
    const { data } = await api.post(`/admin/finance/refunds/${id}/pay`, { paymentMethod, paymentReference });
    return data.refund;
  },
};

interface Refund {
  id: string;
  orderId: string;
  customerId: string | null;
  amount: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  clawbackVendor: boolean;
  clawbackRider: boolean;
  vendorClawbackAmount: string | null;
  riderClawbackAmount: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  rejectedReason: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  order?: { orderNumber: string; total: string; status?: string; vendorId?: string | null; riderId?: string | null };
  customer?: { id: string; name: string; phone: string } | null;
}

export type {
  AdminStats, VendorListItem, RiderListItem, KycSubmission, AdminSettlement, UnsettledBalance,
  CommissionSettings, AdminVendorWallet, AdminRiderWallet, RiderWallet, RiderSettlement,
  AdminRiderSettlement, UnsettledRiderBalance, AdminZone, Refund,
};
