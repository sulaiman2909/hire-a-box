import { OrderItemInput } from './pricing';

export function calculateDeposits(items: OrderItemInput[]): number {
  let depositTotal = 0;
  
  for (const item of items) {
    depositTotal += item.quantity * item.depositAmount;
  }

  return Math.round(depositTotal * 100) / 100;
}
