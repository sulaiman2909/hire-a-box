import { OrderType } from '@prisma/client';

export interface OrderItemInput {
  quantity: number;
  price: number;
  depositAmount: number;
}

export const DELIVERY_FEE = 25.00; // Flat rate for orders under threshold
export const FREE_DELIVERY_THRESHOLD_HIRE = 65.00;
export const FREE_DELIVERY_THRESHOLD_BUY = 99.00;

export function calculateOrderTotals(
  type: OrderType,
  items: OrderItemInput[]
) {
  let subtotal = 0;
  
  for (const item of items) {
    subtotal += item.quantity * item.price;
  }

  // Ensure fixed precision (2 decimal places)
  subtotal = Math.round(subtotal * 100) / 100;

  const deliveryFee = calculateDeliveryFee(subtotal, type);
  
  const total = subtotal + deliveryFee;

  return {
    hireTotal: type === 'HIRE' ? total : 0,
    saleTotal: type === 'BUY' ? total : 0,
    deliveryFee // exposed for UI transparency
  };
}

export function calculateDeliveryFee(subtotal: number, type: OrderType): number {
  if (type === 'HIRE' && subtotal >= FREE_DELIVERY_THRESHOLD_HIRE) {
    return 0;
  }
  if (type === 'BUY' && subtotal >= FREE_DELIVERY_THRESHOLD_BUY) {
    return 0;
  }
  return DELIVERY_FEE;
}
