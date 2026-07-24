// ═══════════════════════════════════════════════════════════
//  Vendor API services — for the vendor portal
// ═══════════════════════════════════════════════════════════

import api from './api';
import type { Order } from '@/types';

interface VendorStats {
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalAssigned: number;
}

interface VendorWallet {
  totalProductValue: number;
  totalRiderEarning: number;
  totalCommission: number;
  netPayable: number;
  codLiability: number;
  codLimit: number | null;
  isFrozen: boolean;
}

interface WalletTransaction {
  id: string;
  type: 'PRODUCT_VALUE' | 'RIDER_EARNING' | 'COMMISSION_DEDUCTED' | 'REFUND' | 'ADJUSTMENT' | 'SETTLEMENT_PAYOUT';
  amount: string;
  description: string | null;
  createdAt: string;
  order: { orderNumber: string; paymentMethod: string } | null;
}

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalProductValue: string;
  totalRiderEarning: string;
  totalCommission: string;
  netPayable: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  paymentMethod: string | null;
  paymentReference: string | null;
  paidAt: string | null;
  createdAt: string;
}

export const vendorPortalApi = {
  // Dashboard stats
  dashboard: async (): Promise<VendorStats> => {
    const { data } = await api.get('/vendors/dashboard');
    return data.stats;
  },

  // Order queue (assigned to me + available in my zone)
  queue: async (): Promise<Order[]> => {
    const { data } = await api.get('/orders/vendor/queue');
    return data.orders;
  },

  // Accept an unassigned order in my zone
  accept: async (orderId: string): Promise<Order> => {
    const { data } = await api.post(`/orders/${orderId}/accept`);
    return data.order;
  },

  // Update order status (out_for_delivery, delivered, cancelled)
  updateStatus: async (orderId: string, status: string, notes?: string): Promise<Order> => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status, notes });
    return data.order;
  },

  // Wallet balance summary
  wallet: async (): Promise<VendorWallet> => {
    const { data } = await api.get('/vendors/wallet');
    return data.wallet;
  },

  // Paginated ledger transactions
  walletTransactions: async (limit = 20, offset = 0): Promise<{ transactions: WalletTransaction[]; total: number }> => {
    const { data } = await api.get('/vendors/wallet/transactions', { params: { limit, offset } });
    return { transactions: data.transactions, total: data.total };
  },

  // Settlement history
  walletSettlements: async (): Promise<Settlement[]> => {
    const { data } = await api.get('/vendors/wallet/settlements');
    return data.settlements;
  },

  // Storefront open/closed + in-stock/out-of-stock toggles
  updateStorefront: async (fields: { isOpen?: boolean; stockStatus?: boolean }) => {
    const { data } = await api.patch('/vendors/me/storefront', fields);
    return data.vendor as { id: string; isOpen: boolean; stockStatus: boolean };
  },

  // My product catalog — own price/stock overrides
  myProducts: async (): Promise<VendorProductListing[]> => {
    const { data } = await api.get('/vendors/me/products');
    return data.products;
  },
  updateMyProduct: async (productId: string, fields: { price?: number | null; inStock?: boolean }) => {
    const { data } = await api.patch(`/vendors/me/products/${productId}`, fields);
    return data.product as { productId: string; price: string | null; inStock: boolean };
  },
};

interface VendorProductListing {
  id: string;
  name: string;
  unit: string;
  minQuantity: number;
  imageUrl: string | null;
  catalogPrice: string;
  price: string;
  hasOverridePrice: boolean;
  inStock: boolean;
}

export type { VendorStats, VendorWallet, WalletTransaction, Settlement, VendorProductListing };
