// ═══════════════════════════════════════════════════════════
//  Rider API services — for the rider portal
//  Mirrors vendor-portal-services.ts
// ═══════════════════════════════════════════════════════════

import api from './api';
import type { Order } from '@/types';
import type { WalletTransaction } from './vendor-portal-services';

interface RiderStats {
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalAssigned: number;
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

export const riderPortalApi = {
  // Dashboard stats
  dashboard: async (): Promise<RiderStats> => {
    const { data } = await api.get('/riders/dashboard');
    return data.stats;
  },

  // Order queue (offered to me + assigned to me)
  queue: async (): Promise<Order[]> => {
    const { data } = await api.get('/orders/rider/queue');
    return data.orders;
  },

  // Accept a delivery offered to me
  accept: async (orderId: string): Promise<Order> => {
    const { data } = await api.post(`/orders/${orderId}/rider/accept`);
    return data.order;
  },

  // Decline a delivery offered to me (passes to the next rider immediately)
  reject: async (orderId: string) => {
    const { data } = await api.post(`/orders/${orderId}/rider/reject`);
    return data as { success: boolean; message: string };
  },

  // Update order status (out_for_delivery = picked up, delivered)
  updateStatus: async (orderId: string, status: string, notes?: string): Promise<Order> => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status, notes });
    return data.order;
  },

  // Online/offline toggle
  setOnline: async (isOnline: boolean) => {
    const { data } = await api.patch('/riders/me/online', { isOnline });
    return data.rider as { id: string; isOnline: boolean };
  },

  // Wallet balance summary
  wallet: async (): Promise<RiderWallet> => {
    const { data } = await api.get('/riders/wallet');
    return data.wallet;
  },

  // Paginated ledger transactions
  walletTransactions: async (limit = 20, offset = 0): Promise<{ transactions: WalletTransaction[]; total: number }> => {
    const { data } = await api.get('/riders/wallet/transactions', { params: { limit, offset } });
    return { transactions: data.transactions, total: data.total };
  },

  // Settlement history
  walletSettlements: async (): Promise<RiderSettlement[]> => {
    const { data } = await api.get('/riders/wallet/settlements');
    return data.settlements;
  },
};

export type { RiderStats, RiderWallet, RiderSettlement };
