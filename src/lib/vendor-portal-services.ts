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
};

export type { VendorStats };
