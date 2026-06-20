export interface Promo {
  code: string;
  discountPercent: number; // 0 to 100
}

export const PROMOS: Promo[] = [
  { code: 'MOVING10', discountPercent: 10 },
  { code: 'WELCOME5', discountPercent: 5 },
  { code: 'TEST', discountPercent: 10 }, // For demo purposes
  { code: 'TEST100', discountPercent: 100 }, // For easy testing
];

export function validatePromo(code: string): Promo | null {
  const normalizedCode = code.trim().toUpperCase();
  const promo = PROMOS.find(p => p.code === normalizedCode);
  return promo || null;
}

export function calculateDiscount(subtotal: number, promoCode?: string): number {
  if (!promoCode) return 0;
  const promo = validatePromo(promoCode);
  if (!promo) return 0;
  
  return (subtotal * promo.discountPercent) / 100;
}
