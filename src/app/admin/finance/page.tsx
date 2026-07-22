'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Banknote, CreditCard, AlertTriangle, Percent, Snowflake, Loader2,
  RefreshCw, FileText, Wallet, Search, ArrowLeft, Check, Save,
  ChevronLeft, ChevronRight, Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminApi, financeApi, AdminStats, VendorListItem,
  AdminSettlement, UnsettledBalance,
} from '@/lib/admin-services';
import type { WalletTransaction, VendorWallet, Settlement } from '@/lib/vendor-portal-services';
import {
  StatCard, PageHeader, StatusBadge, Table, Th, Td, Button, EmptyState,
} from '@/components/admin/ui';
import { formatPrice, formatDate } from '@/lib/utils';

type Tab = 'overview' | 'settlements' | 'wallets' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'settlements', label: 'Settlements' },
  { id: 'wallets', label: 'Vendor Wallets' },
  { id: 'settings', label: 'Settings' },
];

const ENTRY_TYPE_META: Record<
  WalletTransaction['type'],
  { label: string; badge: 'delivered' | 'confirmed' | 'cancelled' | 'suspended' | 'assigned' | 'delivering' }
> = {
  PRODUCT_VALUE: { label: 'Product Value', badge: 'delivered' },
  RIDER_EARNING: { label: 'Rider Earning', badge: 'confirmed' },
  COMMISSION_DEDUCTED: { label: 'Commission', badge: 'cancelled' },
  REFUND: { label: 'Refund', badge: 'suspended' },
  ADJUSTMENT: { label: 'Adjustment', badge: 'assigned' },
  SETTLEMENT_PAYOUT: { label: 'Settlement', badge: 'delivering' },
};

const SETTLEMENT_BADGE: Record<Settlement['status'], 'pending' | 'approved' | 'delivered'> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'delivered',
};

export default function AdminFinancePage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Deep link support: /admin/finance?tab=wallets&vendor=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (t && TABS.some((x) => x.id === t)) setTab(t as Tab);
    const v = params.get('vendor');
    if (v) {
      setTab('wallets');
      setSelectedVendor(v);
    }
  }, []);

  return (
    <>
      <PageHeader title="Finance" subtitle="Commissions, settlements, and vendor wallets" />

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelectedVendor(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-electric text-white'
                : 'bg-white/5 text-white/65 border border-white/10 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'settlements' && <SettlementsTab />}
      {tab === 'wallets' && (
        selectedVendor
          ? <VendorWalletDetail vendorId={selectedVendor} onBack={() => setSelectedVendor(null)} />
          : <VendorWalletList onSelect={setSelectedVendor} />
      )}
      {tab === 'settings' && <SettingsTab />}
    </>
  );
}

// ═══ Overview ═══
function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    adminApi.dashboard().then(setStats).catch(() => toast.error('Failed to load stats'));
  }, []);

  if (!stats) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-electric" size={32} /></div>;
  }

  const f = stats.finance;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="COD Collected" value={formatPrice(f.codCollected)} sublabel="Cash collected by vendors (delivered orders)" icon={Banknote} color="amber" />
      <StatCard label="Online Received" value={formatPrice(f.onlineReceived)} sublabel="Prepaid / online payments received" icon={CreditCard} color="blue" />
      <StatCard label="Outstanding COD Liability" value={formatPrice(f.outstandingCodLiability)} sublabel="Commission vendors currently owe FlowX" icon={AlertTriangle} color="purple" />
      <StatCard label="Commission Revenue" value={formatPrice(f.commissionRevenue)} sublabel="Total commission earned to date" icon={Percent} color="green" />
      <StatCard label="Frozen Vendors" value={f.frozenVendors} sublabel="Vendors with financial activity paused" icon={Snowflake} color="cyan" />
    </div>
  );
}

// ═══ Settlements ═══
function SettlementsTab() {
  const [unsettled, setUnsettled] = useState<UnsettledBalance[]>([]);
  const [awaiting, setAwaiting] = useState<AdminSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await financeApi.pendingSettlements();
      setUnsettled(data.unsettled);
      setAwaiting(data.awaiting);
    } catch {
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { message } = await financeApi.generateSettlements();
      toast.success(message);
      load();
    } catch {
      toast.error('Failed to generate settlements');
    } finally {
      setGenerating(false);
    }
  };

  const approve = async (id: string) => {
    setActioning(id);
    try {
      await financeApi.approveSettlement(id);
      toast.success('Settlement approved');
      load();
    } catch {
      toast.error('Failed to approve');
    } finally {
      setActioning(null);
    }
  };

  const pay = async (id: string) => {
    const paymentMethod = prompt('Payment method (e.g. BANK_TRANSFER, JAZZCASH, CASH):');
    if (!paymentMethod) return;
    const paymentReference = prompt('Payment reference (optional):') || undefined;
    setActioning(id);
    try {
      await financeApi.paySettlement(id, paymentMethod, paymentReference);
      toast.success('Settlement marked paid — COD liability updated');
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to mark paid');
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-electric" size={32} /></div>;
  }

  return (
    <>
      {/* ── Unsettled balances (current week) ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-syne font-bold text-white text-lg">Unsettled — Current Week</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load}><RefreshCw size={14} /> Refresh</Button>
          <Button variant="primary" onClick={generate} disabled={generating || unsettled.length === 0}>
            {generating ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
            Generate Weekly Settlements
          </Button>
        </div>
      </div>

      {unsettled.length === 0 ? (
        <EmptyState icon={FileText} title="Nothing to settle this week" description="Delivered orders create unsettled balances here." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Vendor</Th>
              <Th>Zone</Th>
              <Th className="text-right">Product Value</Th>
              <Th className="text-right">Rider Earnings</Th>
              <Th className="text-right">Commission</Th>
              <Th className="text-right">Net Payable</Th>
            </tr>
          </thead>
          <tbody>
            {unsettled.map((u) => (
              <tr key={u.vendor.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="font-semibold text-white">{u.vendor.name}</div>
                  <div className="text-[11px] text-white/45 font-mono">{u.vendor.phone}</div>
                </Td>
                <Td className="text-white/65 text-xs">{u.vendor.zone?.name || '—'}</Td>
                <Td className="text-right">{formatPrice(u.totalProductValue)}</Td>
                <Td className="text-right">{formatPrice(u.totalRiderEarning)}</Td>
                <Td className="text-right text-red-400">−{formatPrice(u.totalCommission)}</Td>
                <Td className={`text-right font-bold ${u.netPayable >= 0 ? 'text-flowgreen' : 'text-red-400'}`}>
                  {u.netPayable >= 0 ? '' : '−'}{formatPrice(Math.abs(u.netPayable))}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ── Awaiting approval / payment ── */}
      <h2 className="font-syne font-bold text-white text-lg mt-10 mb-4">Awaiting Approval / Payment</h2>
      {awaiting.length === 0 ? (
        <EmptyState icon={Receipt} title="No settlements awaiting action" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Vendor</Th>
              <Th>Period</Th>
              <Th>Status</Th>
              <Th className="text-right">Net Payable</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {awaiting.map((s) => {
              const net = Number(s.netPayable);
              return (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="font-semibold text-white">{s.vendor?.name}</div>
                    <div className="text-[11px] text-white/45 font-mono">{s.vendor?.phone}</div>
                  </Td>
                  <Td className="text-xs whitespace-nowrap">{formatDate(s.periodStart)} – {formatDate(s.periodEnd)}</Td>
                  <Td><StatusBadge variant={SETTLEMENT_BADGE[s.status]}>{s.status}</StatusBadge></Td>
                  <Td className={`text-right font-bold ${net >= 0 ? 'text-flowgreen' : 'text-red-400'}`}>
                    {net >= 0 ? '' : '−'}{formatPrice(Math.abs(net))}
                  </Td>
                  <Td>
                    <div className="flex gap-1.5">
                      {s.status === 'PENDING' && (
                        <Button size="sm" variant="success" disabled={actioning === s.id} onClick={() => approve(s.id)}>
                          <Check size={12} /> Approve
                        </Button>
                      )}
                      {s.status === 'APPROVED' && (
                        <Button size="sm" variant="primary" disabled={actioning === s.id} onClick={() => pay(s.id)}>
                          <Banknote size={12} /> Mark Paid
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}

// ═══ Vendor Wallets — list ═══
function VendorWalletList({ onSelect }: { onSelect: (id: string) => void }) {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.listVendors({ status: 'APPROVED' })
      .then(setVendors)
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-electric" size={32} /></div>;
  }

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.phone.includes(q) || v.zone?.name.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors by name, phone, or zone…"
          className="w-full bg-navy border border-white/10 rounded-xl text-white text-sm pl-10 pr-4 py-3 placeholder:text-white/30 focus:border-electric outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="No vendors found" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Vendor</Th>
              <Th>Zone</Th>
              <Th>Status</Th>
              <Th>Wallet</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="font-semibold text-white">{v.name}</div>
                  <div className="text-[11px] text-white/45 font-mono">{v.phone}</div>
                </Td>
                <Td className="text-white/65 text-xs">{v.zone?.name || '—'}</Td>
                <Td>
                  {v.vendorStatus && (
                    <StatusBadge variant={v.vendorStatus === 'APPROVED' ? 'approved' : 'pending'}>
                      {v.vendorStatus}
                    </StatusBadge>
                  )}
                </Td>
                <Td>
                  <Button size="sm" variant="secondary" onClick={() => onSelect(v.id)}>
                    <Wallet size={12} /> View Wallet
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

// ═══ Vendor Wallets — detail (ledger + COD limit + freeze) ═══
const PAGE_SIZE = 20;

function VendorWalletDetail({ vendorId, onBack }: { vendorId: string; onBack: () => void }) {
  const [data, setData] = useState<{
    vendor: { id: string; name: string; phone: string; vendorStatus: string; codLimit: string | null; codLiability: string; isFrozen: boolean; zone?: { name: string } };
    wallet: VendorWallet;
    transactions: WalletTransaction[];
    total: number;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [limitInput, setLimitInput] = useState('');
  const [savingLimit, setSavingLimit] = useState(false);
  const [togglingFreeze, setTogglingFreeze] = useState(false);

  const load = useCallback(async (p: number) => {
    try {
      const d = await financeApi.getVendorWallet(vendorId, PAGE_SIZE, p * PAGE_SIZE);
      setData(d);
      setLimitInput(d.vendor.codLimit != null ? String(Number(d.vendor.codLimit)) : '');
    } catch {
      toast.error('Failed to load vendor wallet');
    }
  }, [vendorId]);

  useEffect(() => { load(page); }, [load, page]);

  if (!data) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-electric" size={32} /></div>;
  }

  const { vendor, wallet, transactions, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const saveLimit = async () => {
    const value = limitInput.trim() === '' ? null : Number(limitInput);
    if (value !== null && (isNaN(value) || value < 0)) {
      toast.error('Enter a valid limit (or leave empty for unlimited)');
      return;
    }
    setSavingLimit(true);
    try {
      await financeApi.setCodLimit(vendor.id, value);
      toast.success(value === null ? 'COD limit removed (unlimited)' : `COD limit set to ${formatPrice(value)}`);
      load(page);
    } catch {
      toast.error('Failed to update COD limit');
    } finally {
      setSavingLimit(false);
    }
  };

  const toggleFreeze = async () => {
    setTogglingFreeze(true);
    try {
      await financeApi.setFrozen(vendor.id, !vendor.isFrozen);
      toast.success(vendor.isFrozen ? 'Vendor unfrozen' : 'Vendor frozen — financial activity blocked');
      load(page);
    } catch {
      toast.error('Failed to update freeze status');
    } finally {
      setTogglingFreeze(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-cyan2 hover:underline">
          <ArrowLeft size={15} /> All vendors
        </button>
        <div className="flex items-center gap-2">
          {vendor.isFrozen && <StatusBadge variant="cancelled">FROZEN</StatusBadge>}
          <Button variant={vendor.isFrozen ? 'success' : 'danger'} size="sm" disabled={togglingFreeze} onClick={toggleFreeze}>
            <Snowflake size={12} /> {vendor.isFrozen ? 'Unfreeze' : 'Freeze'}
          </Button>
        </div>
      </div>

      <div className="bg-navy border border-white/[0.08] rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-electric to-flowgreen flex items-center justify-center font-syne font-bold">
            {vendor.name[0]}
          </div>
          <div>
            <div className="font-syne font-bold text-white">{vendor.name}</div>
            <div className="text-xs text-white/50 font-mono">{vendor.phone} · {vendor.zone?.name || 'No zone'}</div>
          </div>
        </div>

        {/* COD limit editor */}
        <div className="flex items-end gap-2">
          <div>
            <div className="text-[11px] text-white/45 uppercase tracking-wide mb-1">COD Limit (empty = unlimited)</div>
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder="Unlimited"
              className="w-36 bg-white/10 border border-white/15 rounded-lg text-white text-sm px-3 py-2 focus:border-electric outline-none"
            />
          </div>
          <Button size="sm" variant="primary" disabled={savingLimit} onClick={saveLimit}>
            <Save size={12} /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Net Payable" value={formatPrice(wallet.netPayable)} icon={Wallet} color="green" />
        <StatCard label="Rider Earnings" value={formatPrice(wallet.totalRiderEarning)} icon={Banknote} color="cyan" />
        <StatCard label="Commission" value={formatPrice(wallet.totalCommission)} icon={Percent} color="blue" />
        <StatCard
          label="COD Liability"
          value={formatPrice(wallet.codLiability)}
          sublabel={wallet.codLimit != null ? `Limit: ${formatPrice(wallet.codLimit)}` : 'No limit set'}
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      <h2 className="font-syne font-bold text-white text-lg mb-4">Ledger</h2>
      {transactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No ledger entries yet" />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Order #</Th>
                <Th>Description</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const meta = ENTRY_TYPE_META[tx.type];
                const amount = Number(tx.amount);
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02]">
                    <Td className="whitespace-nowrap text-xs">{formatDate(tx.createdAt)}</Td>
                    <Td><StatusBadge variant={meta.badge}>{meta.label}</StatusBadge></Td>
                    <Td>
                      {tx.order
                        ? <span className="font-mono text-cyan2 text-xs">{tx.order.orderNumber}</span>
                        : <span className="text-white/35">—</span>}
                    </Td>
                    <Td className="text-white/55 text-xs max-w-xs truncate">{tx.description || '—'}</Td>
                    <Td className={`text-right font-bold whitespace-nowrap ${amount >= 0 ? 'text-flowgreen' : 'text-red-400'}`}>
                      {amount >= 0 ? '+' : '−'}{formatPrice(Math.abs(amount))}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-white/45">Page {page + 1} of {totalPages} · {total} entries</div>
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
    </>
  );
}

// ═══ Settings ═══
function SettingsTab() {
  const [pct, setPct] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    financeApi.getCommissionSettings()
      .then((s) => { setPct(String(Number(s.defaultCommissionPct))); setUpdatedAt(s.updatedAt); })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const value = Number(pct);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error('Commission must be between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      const s = await financeApi.updateCommissionSettings(value);
      setUpdatedAt(s.updatedAt);
      toast.success(`Default commission set to ${value}%`);
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-electric" size={32} /></div>;
  }

  return (
    <div className="max-w-xl">
      <div className="bg-navy border border-white/[0.08] rounded-2xl p-6">
        <h2 className="font-syne font-bold text-white text-lg mb-1">Default Commission</h2>
        <p className="text-white/50 text-sm mb-5">
          Applied to every product without its own override. Per-product overrides are edited on the{' '}
          <a href="/admin/products" className="text-cyan2 hover:underline">Products page</a>.
        </p>

        <div className="flex items-end gap-3">
          <div>
            <div className="text-[11px] text-white/45 uppercase tracking-wide mb-1.5">Commission %</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className="w-28 bg-white/10 border border-white/15 rounded-lg text-white text-lg font-bold px-3 py-2.5 focus:border-electric outline-none"
              />
              <span className="text-white/50 text-lg font-bold">%</span>
            </div>
          </div>
          <Button variant="primary" disabled={saving} onClick={save}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save
          </Button>
        </div>

        {updatedAt && (
          <div className="text-xs text-white/35 mt-4">Last updated {formatDate(updatedAt)}</div>
        )}
      </div>
    </div>
  );
}
