// ─── Shared ledger/settlement display semantics ──
// Single source of truth for both /admin/finance and /vendor-portal/wallet,
// so entry labels and badge meanings can't drift between the two surfaces.

import type { WalletTransaction, Settlement } from './vendor-portal-services';

type FinanceBadge = 'credit' | 'earning' | 'charge' | 'refund' | 'adjustment' | 'payout';

export const ENTRY_TYPE_META: Record<
  WalletTransaction['type'],
  { label: string; badge: FinanceBadge }
> = {
  PRODUCT_VALUE: { label: 'Product Value', badge: 'credit' },
  RIDER_EARNING: { label: 'Rider Earning', badge: 'earning' },
  COMMISSION_DEDUCTED: { label: 'Commission', badge: 'charge' },
  REFUND: { label: 'Refund', badge: 'refund' },
  ADJUSTMENT: { label: 'Adjustment', badge: 'adjustment' },
  SETTLEMENT_PAYOUT: { label: 'Settlement', badge: 'payout' },
};

export const SETTLEMENT_BADGE: Record<Settlement['status'], 'pending' | 'approved' | 'paid'> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
};

export const REFUND_BADGE: Record<'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED', 'pending' | 'approved' | 'paid' | 'rejected'> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  REJECTED: 'rejected',
};
