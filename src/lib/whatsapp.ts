const DEFAULT_NUMBER = '529991413325';

export function waNumber(): string {
  const raw = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? DEFAULT_NUMBER;
  return raw.replace(/\D/g, '');
}

export function waLink(message: string): string {
  return 'https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(message);
}

export function fmtMoney(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-MX');
}

export function fmtMoneyCents(n: number): string {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function financeFactor(): number {
  const raw = import.meta.env.VITE_FINANCE_FACTOR as string | undefined;
  const parsed = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 1.45;
}
