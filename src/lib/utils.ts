// ─── Formatters & helpers ──

export const formatPrice = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `Rs. ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Date without time — for periods, settlement rows, ledger dates
export const formatDateOnly = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(' ');

export const validatePhone = (phone: string): boolean =>
  /^(\+92|0)?3\d{9}$/.test(phone.replace(/\s|-/g, ''));
