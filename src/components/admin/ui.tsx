// ═══════════════════════════════════════════════════════════
//  Admin UI primitives
// ═══════════════════════════════════════════════════════════

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// ─── Stat Card ──
interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'cyan';
}

const COLOR_MAP = {
  blue: { bg: 'bg-electric/10', text: 'text-electric', border: 'border-electric/20' },
  green: { bg: 'bg-flowgreen/10', text: 'text-flowgreen', border: 'border-flowgreen/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  cyan: { bg: 'bg-cyan2/10', text: 'text-cyan2', border: 'border-cyan2/20' },
};

export function StatCard({ label, value, sublabel, icon: Icon, color = 'blue' }: StatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`bg-navy border ${c.border} rounded-2xl p-6 transition hover:border-opacity-50`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={c.text} size={22} />
        </div>
      </div>
      <div className="text-xs text-white/50 uppercase tracking-wide mb-1">{label}</div>
      <div className="font-syne font-extrabold text-3xl text-white">{value}</div>
      {sublabel && <div className="text-xs text-white/45 mt-1.5">{sublabel}</div>}
    </div>
  );
}

// ─── Page Header ──
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="font-syne text-3xl lg:text-4xl font-extrabold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-white/55 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2.5">{actions}</div>}
    </div>
  );
}

// ─── Status Badge ──
type BadgeVariant =
  | 'pending' | 'confirmed' | 'assigned' | 'delivering' | 'delivered' | 'cancelled'
  | 'approved' | 'rejected' | 'suspended' | 'active' | 'paused';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-cyan2/15 text-cyan2 border-cyan2/30',
  assigned: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivering: 'bg-electric/15 text-electric border-electric/30',
  delivered: 'bg-flowgreen/15 text-flowgreen border-flowgreen/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  approved: 'bg-flowgreen/15 text-flowgreen border-flowgreen/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  suspended: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  active: 'bg-flowgreen/15 text-flowgreen border-flowgreen/30',
  paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

export function StatusBadge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${BADGE_STYLES[variant]}`}
    >
      {children}
    </span>
  );
}

// Maps order/vendor status strings to badge variants
export function statusToBadge(status: string): BadgeVariant {
  const s = status.toUpperCase();
  if (s === 'PENDING') return 'pending';
  if (s === 'CONFIRMED') return 'confirmed';
  if (s === 'ASSIGNED') return 'assigned';
  if (s === 'OUT_FOR_DELIVERY') return 'delivering';
  if (s === 'DELIVERED') return 'delivered';
  if (s === 'CANCELLED') return 'cancelled';
  if (s === 'APPROVED') return 'approved';
  if (s === 'REJECTED') return 'rejected';
  if (s === 'SUSPENDED') return 'suspended';
  if (s === 'ACTIVE') return 'active';
  if (s === 'PAUSED') return 'paused';
  return 'pending';
}

// ─── Table ──
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="bg-navy border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`px-5 py-4 text-left text-[11px] font-bold text-white/45 uppercase tracking-wider border-b border-white/[0.08] ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-5 py-4 text-sm text-white/85 border-b border-white/[0.06] ${className}`}>
      {children}
    </td>
  );
}

// ─── Button ──
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-electric to-[#1565C0] text-white hover:-translate-y-0.5',
  secondary: 'bg-white/8 text-white border border-white/15 hover:bg-white/12',
  success: 'bg-gradient-to-br from-flowgreen to-flowgreen-dark text-white hover:-translate-y-0.5',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
  ghost: 'text-white/65 hover:bg-white/5 hover:text-white',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}) {
  const sizing = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm';
  return (
    <button
      {...props}
      className={`${sizing} ${BUTTON_STYLES[variant]} rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ${props.className || ''}`}
    >
      {children}
    </button>
  );
}

// ─── Empty State ──
export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="bg-navy border border-white/[0.06] rounded-2xl p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <Icon className="text-white/40" size={28} />
      </div>
      <h3 className="font-syne font-bold text-white text-lg mb-2">{title}</h3>
      {description && <p className="text-white/50 text-sm">{description}</p>}
    </div>
  );
}
