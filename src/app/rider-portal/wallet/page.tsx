'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Wallet, Bike, Banknote, Loader2, Snowflake, Receipt, FileText,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { riderPortalApi, RiderWallet, RiderSettlement } from '@/lib/rider-portal-services';
import type { WalletTransaction } from '@/lib/vendor-portal-services';
import { ENTRY_TYPE_META, SETTLEMENT_BADGE } from '@/lib/finance-meta';
import {
  StatCard, PageHeader, StatusBadge, Table, Th, Td, EmptyState, Button,
} from '@/components/admin/ui';
import { formatPrice, formatDateOnly } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function RiderWalletPage() {
  const [wallet, setWallet] = useState<RiderWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [settlements, setSettlements] = useState<RiderSettlement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    try {
      const [w, tx, st] = await Promise.all([
        riderPortalApi.wallet(),
        riderPortalApi.walletTransactions(PAGE_SIZE, p * PAGE_SIZE),
        riderPortalApi.walletSettlements(),
      ]);
      setWallet(w);
      setTransactions(tx.transactions);
      setTxTotal(tx.total);
      setSettlements(st);
    } catch {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  if (loading || !wallet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-cyan2" size={32} />
      </div>
    );
  }

  const codPct = wallet.codLimit
    ? Math.min(100, (wallet.codLiability / wallet.codLimit) * 100)
    : 0;
  const nearLimit = wallet.codLimit != null && codPct >= 80;
  const totalPages = Math.ceil(txTotal / PAGE_SIZE);

  return (
    <>
      <PageHeader title="Wallet" subtitle="Your earnings, COD liability, and settlements" />

      {/* ── Frozen banner ── */}
      {wallet.isFrozen && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4">
          <Snowflake className="text-red-400 flex-shrink-0" size={20} />
          <div>
            <div className="font-bold text-red-400 text-sm">Account Frozen</div>
            <div className="text-white/70 text-xs mt-0.5">
              Financial activity is paused. Please contact FlowX admin to resolve.
            </div>
          </div>
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Net Payable"
          value={formatPrice(wallet.netPayable)}
          sublabel="Your current ledger balance"
          icon={Wallet}
          color="green"
        />
        <StatCard
          label="Total Earnings"
          value={formatPrice(wallet.totalEarning)}
          sublabel="From completed deliveries"
          icon={Bike}
          color="cyan"
        />

        {/* COD cash owed, with limit progress bar */}
        <div className={`bg-navy border rounded-2xl p-6 ${nearLimit ? 'border-red-500/40' : 'border-amber-500/20'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${nearLimit ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              <Banknote className={nearLimit ? 'text-red-400' : 'text-amber-400'} size={22} />
            </div>
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Cash You Owe FlowX</div>
          <div className="font-bold text-3xl text-white tabular-nums">{formatPrice(wallet.codLiability)}</div>
          {wallet.codLimit != null ? (
            <div className="mt-3">
              <div
                role="progressbar"
                aria-label="Cash owed against your COD limit"
                aria-valuemin={0}
                aria-valuemax={wallet.codLimit}
                aria-valuenow={wallet.codLiability}
                aria-valuetext={`${formatPrice(wallet.codLiability)} of ${formatPrice(wallet.codLimit)} limit`}
                className="h-2 rounded-full bg-white/[0.08] overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all ${nearLimit ? 'bg-red-500' : 'bg-amber-400'}`}
                  style={{ width: `${codPct}%` }}
                />
              </div>
              <div className={`text-xs mt-1.5 ${nearLimit ? 'text-red-400 font-semibold' : 'text-white/60'}`}>
                {nearLimit && '⚠ '}
                {formatPrice(wallet.codLiability)} of {formatPrice(wallet.codLimit)} limit
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/60 mt-1.5">No COD limit set</div>
          )}
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="mb-8">
        <h2 className="font-syne font-bold text-white text-lg mb-4">Transactions</h2>
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Earnings appear here after your deliveries are completed."
          />
        ) : (
          <>
            <div className="sm:hidden space-y-2">
              {transactions.map((tx) => {
                const meta = ENTRY_TYPE_META[tx.type];
                const amount = Number(tx.amount);
                return (
                  <div key={tx.id} className="bg-navy border border-white/[0.08] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <StatusBadge variant={meta.badge}>{meta.label}</StatusBadge>
                      <div className="text-[11px] text-white/60 mt-1.5">
                        {formatDateOnly(tx.createdAt)}
                        {tx.order && <span className="font-mono text-cyan2 ml-2">{tx.order.orderNumber}</span>}
                      </div>
                    </div>
                    <div className={`font-bold text-base whitespace-nowrap tabular-nums ${amount >= 0 ? 'text-flowgreen' : 'text-red-400'}`}>
                      {amount >= 0 ? '+' : '−'}{formatPrice(Math.abs(amount))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden sm:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Order #</Th>
                    <Th className="text-right">Amount</Th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const meta = ENTRY_TYPE_META[tx.type];
                    const amount = Number(tx.amount);
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02]">
                        <Td className="whitespace-nowrap">{formatDateOnly(tx.createdAt)}</Td>
                        <Td><StatusBadge variant={meta.badge}>{meta.label}</StatusBadge></Td>
                        <Td>
                          {tx.order ? (
                            <span className="font-mono text-cyan2 text-xs">{tx.order.orderNumber}</span>
                          ) : (
                            <span className="text-white/50">—</span>
                          )}
                        </Td>
                        <Td className={`text-right font-bold whitespace-nowrap tabular-nums ${amount >= 0 ? 'text-flowgreen' : 'text-red-400'}`}>
                          {amount >= 0 ? '+' : '−'}{formatPrice(Math.abs(amount))}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-white/65">
                  Page {page + 1} of {totalPages} · {txTotal} transactions
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft size={14} /> Prev
                  </Button>
                  <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
                    Next <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Settlement history ── */}
      <div>
        <h2 className="font-syne font-bold text-white text-lg mb-4">Settlement History</h2>
        {settlements.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No settlements yet"
            description="FlowX settles your account periodically. Your history will show here."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Period</Th>
                <Th>Status</Th>
                <Th className="text-right">Total Earning</Th>
                <Th className="text-right">Net Payable</Th>
                <Th>Paid Via</Th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => {
                const net = Number(s.netPayable);
                return (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <Td className="whitespace-nowrap text-xs">{formatDateOnly(s.periodStart)} – {formatDateOnly(s.periodEnd)}</Td>
                    <Td><StatusBadge variant={SETTLEMENT_BADGE[s.status]}>{s.status}</StatusBadge></Td>
                    <Td className="text-right tabular-nums">{formatPrice(s.totalEarning)}</Td>
                    <Td className={`text-right font-bold tabular-nums ${net >= 0 ? 'text-flowgreen' : 'text-red-400'}`}>
                      {net >= 0 ? '' : '−'}{formatPrice(Math.abs(net))}
                    </Td>
                    <Td className="text-xs">
                      {s.status === 'PAID' ? (
                        <div>
                          <div className="text-white/85">{s.paymentMethod}</div>
                          {s.paymentReference && <div className="text-white/60 font-mono">{s.paymentReference}</div>}
                        </div>
                      ) : (
                        <span className="text-white/50">—</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
}
