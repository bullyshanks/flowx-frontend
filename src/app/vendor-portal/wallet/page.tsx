'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Wallet, Percent, Banknote, Loader2, Snowflake, Receipt, FileText,
  ChevronLeft, ChevronRight, HandCoins,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  vendorPortalApi, VendorWallet, WalletTransaction, Settlement,
} from '@/lib/vendor-portal-services';
import { ENTRY_TYPE_META, SETTLEMENT_BADGE } from '@/lib/finance-meta';
import {
  StatCard, PageHeader, StatusBadge, Table, Th, Td, EmptyState, Button,
} from '@/components/admin/ui';
import { formatPrice, formatDateOnly } from '@/lib/utils';

const PAGE_SIZE = 20;

// ⚠️ URDU STRINGS — NEEDS NATIVE SPEAKER REVIEW BEFORE LAUNCH ⚠️
// These are machine-drafted translations of money-critical copy.
// Every string below must be verified by a native Urdu speaker
// (tone, register, and correctness) before this ships to vendors.
const UR = {
  youOwe: (amount: string) => `اس ہفتے آپ کو FlowX کو ${amount} دینے ہیں`,
  flowxPays: (amount: string) => `FlowX آپ کو ${amount} ادا کرے گا`,
  settled: 'یہ حساب مکمل ہو گیا ہے',
  noSettlement: 'ابھی تک کوئی ہفتہ وار حساب نہیں — FlowX ہر ہفتے آپ کا حساب کرتا ہے',
  waterSold: 'پانی کی فروخت',
  commission: 'FlowX کمیشن',
  cashOwed: 'وہ نقدی جو آپ نے FlowX کو دینی ہے',
  frozen: 'آپ کا اکاؤنٹ منجمد ہے — FlowX ایڈمن سے رابطہ کریں',
};

// Urdu rendered RTL with explicit lang tag
function Urdu({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span dir="rtl" lang="ur" className={`font-urdu block ${className}`}>
      {children}
    </span>
  );
}

export default function VendorWalletPage() {
  const [wallet, setWallet] = useState<VendorWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    try {
      const [w, tx, st] = await Promise.all([
        vendorPortalApi.wallet(),
        vendorPortalApi.walletTransactions(PAGE_SIZE, p * PAGE_SIZE),
        vendorPortalApi.walletSettlements(),
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
        <Loader2 className="animate-spin text-flowgreen" size={32} />
      </div>
    );
  }

  const codPct = wallet.codLimit
    ? Math.min(100, (wallet.codLiability / wallet.codLimit) * 100)
    : 0;
  const nearLimit = wallet.codLimit != null && codPct >= 80;
  const totalPages = Math.ceil(txTotal / PAGE_SIZE);
  const latest = settlements[0] ?? null;

  return (
    <>
      <PageHeader title="Wallet" subtitle="Your earnings, commissions, and settlements" />

      {/* ── Frozen banner ── */}
      {wallet.isFrozen && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4">
          <Snowflake className="text-red-400 flex-shrink-0" size={20} />
          <div>
            <div className="font-bold text-red-400 text-sm">Account Frozen</div>
            <div className="text-white/70 text-xs mt-0.5">
              Financial activity is paused. Please contact FlowX admin to resolve.
            </div>
            <Urdu className="text-white/70 text-xs mt-1">{UR.frozen}</Urdu>
          </div>
        </div>
      )}

      {/* ── This week's settlement — the page's headline ── */}
      <SettlementHero latest={latest} />

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Ledger Balance"
          value={formatPrice(wallet.netPayable)}
          sublabel="All-time record of your account"
          icon={Wallet}
          color="green"
        />
        <StatCard
          label="Commission Paid"
          value={formatPrice(wallet.totalCommission)}
          sublabel="FlowX's share, deducted automatically"
          icon={Percent}
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
          <div className="font-bold text-3xl text-white tabular-nums">
            {formatPrice(wallet.codLiability)}
          </div>
          <Urdu className="text-[11px] text-white/60 mt-0.5">{UR.cashOwed}</Urdu>
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
            description="Earnings appear here after your orders are delivered."
          />
        ) : (
          <>
            {/* Mobile: stacked rows — amount always visible */}
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

            {/* Desktop: table */}
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

      {/* ── Past settlements ── */}
      <div>
        <h2 className="font-syne font-bold text-white text-lg mb-4">Past Settlements</h2>
        {settlements.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No settlements yet"
            description="FlowX settles your account weekly. Your history will show here."
          />
        ) : (
          <>
            {/* Mobile: stacked settlement cards */}
            <div className="sm:hidden space-y-2">
              {settlements.map((s) => {
                const net = Number(s.netPayable);
                return (
                  <div key={s.id} className="bg-navy border border-white/[0.08] rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge variant={SETTLEMENT_BADGE[s.status]}>{s.status}</StatusBadge>
                      <span className={`font-bold tabular-nums ${net >= 0 ? 'text-flowgreen' : 'text-red-400'}`}>
                        {net >= 0 ? '' : '−'}{formatPrice(Math.abs(net))}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/60 mt-1.5">
                      {formatDateOnly(s.periodStart)} – {formatDateOnly(s.periodEnd)}
                      {s.status === 'PAID' && s.paymentMethod && (
                        <span className="ml-2 text-white/70">via {s.paymentMethod}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Period</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Water Sold</Th>
                    <Th className="text-right">Commission</Th>
                    <Th className="text-right">Net</Th>
                    <Th>Paid Via</Th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => {
                    const net = Number(s.netPayable);
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02]">
                        <Td className="whitespace-nowrap text-xs">
                          {formatDateOnly(s.periodStart)} – {formatDateOnly(s.periodEnd)}
                        </Td>
                        <Td><StatusBadge variant={SETTLEMENT_BADGE[s.status]}>{s.status}</StatusBadge></Td>
                        <Td className="text-right tabular-nums">{formatPrice(s.totalProductValue)}</Td>
                        <Td className="text-right text-red-400 tabular-nums">−{formatPrice(s.totalCommission)}</Td>
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
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Settlement hero — leads the page with this week's money outcome ──
function SettlementHero({ latest }: { latest: Settlement | null }) {
  if (!latest) {
    return (
      <div className="mb-6 bg-navy border border-white/[0.08] rounded-2xl px-5 py-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
          <HandCoins className="text-white/60" size={22} />
        </div>
        <div>
          <div className="font-bold text-white">No settlement yet — FlowX settles your account weekly</div>
          {/* ⚠️ Urdu below needs native speaker review before launch */}
          <Urdu className="text-white/70 text-sm mt-1">{UR.noSettlement}</Urdu>
        </div>
      </div>
    );
  }

  const net = Number(latest.netPayable);
  const owes = net < 0;
  const isPaid = latest.status === 'PAID';
  const absNet = formatPrice(Math.abs(net));

  const headline = isPaid
    ? (owes ? `Settled — you paid FlowX ${absNet}` : `Settled — FlowX paid you ${absNet}`)
    : (owes ? `You owe FlowX ${absNet} this week` : `FlowX will pay you ${absNet}`);
  // ⚠️ Urdu headline needs native speaker review before launch
  const headlineUr = isPaid ? UR.settled : (owes ? UR.youOwe(absNet) : UR.flowxPays(absNet));

  const accent = isPaid
    ? 'border-flowgreen/30'
    : owes ? 'border-amber-500/40' : 'border-flowgreen/30';

  return (
    <div className={`mb-6 bg-navy border ${accent} rounded-2xl px-5 py-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <StatusBadge variant={SETTLEMENT_BADGE[latest.status]}>{latest.status}</StatusBadge>
            <span className="text-xs text-white/60">
              {formatDateOnly(latest.periodStart)} – {formatDateOnly(latest.periodEnd)}
            </span>
          </div>
          <div className="font-bold text-white text-xl tabular-nums">{headline}</div>
          <Urdu className="text-white/75 text-base mt-1 tabular-nums">{headlineUr}</Urdu>
          {isPaid && latest.paymentMethod && (
            <div className="text-xs text-white/60 mt-1.5">
              Paid via {latest.paymentMethod}
              {latest.paymentReference && <span className="font-mono ml-1.5">({latest.paymentReference})</span>}
            </div>
          )}
        </div>

        {/* Plain-language breakdown: how the number is built */}
        <div className="text-xs space-y-1 min-w-[210px]">
          <BreakdownRow en="Water sold" ur={UR.waterSold} amount={formatPrice(latest.totalProductValue)} />
          <BreakdownRow en="FlowX commission" ur={UR.commission} amount={`−${formatPrice(latest.totalCommission)}`} negative />
          <div className="border-t border-white/10 pt-1 flex items-center justify-between gap-4 font-bold text-white">
            <span>{owes ? 'You pay FlowX' : 'FlowX pays you'}</span>
            <span className="tabular-nums">{absNet}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ en, ur, amount, negative = false }: { en: string; ur: string; amount: string; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/65">
        {en}
        {/* ⚠️ Urdu needs native speaker review before launch */}
        <span dir="rtl" lang="ur" className="font-urdu text-white/50 mr-0 ml-1.5">· {ur}</span>
      </span>
      <span className={`tabular-nums ${negative ? 'text-red-400' : 'text-white/85'}`}>{amount}</span>
    </div>
  );
}
