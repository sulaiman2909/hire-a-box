import { OrderType } from '@prisma/client';

export const FREE_DELIVERY_THRESHOLD_HIRE = 65;
export const FREE_DELIVERY_THRESHOLD_BUY = 99;
export const DELIVERY_FEE = 35.00; // Assuming $35 standard delivery fee

export interface OrderItemInput {
  quantity: number;
  price: number;
  depositAmount: number;
}

export function calculateDeliveryFee(subtotal: number, type: OrderType): number {
  if (type === OrderType.HIRE && subtotal >= FREE_DELIVERY_THRESHOLD_HIRE) {
    return 0;
  }
  if (type === OrderType.BUY && subtotal >= FREE_DELIVERY_THRESHOLD_BUY) {
    return 0;
  }
  return DELIVERY_FEE;
}

export function calculateOrderTotals(type: OrderType, items: OrderItemInput[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = items.length === 0 ? 0 : calculateDeliveryFee(subtotal, type);
  
  if (type === OrderType.HIRE) {
    return {
      saleTotal: 0,
      deliveryFee,
      hireTotal: subtotal
    };
  } else {
    return {
      saleTotal: subtotal,
      deliveryFee,
      hireTotal: 0
    };
  }
}
