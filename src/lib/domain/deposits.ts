export interface DepositItemInput {
  quantity: number;
  price: number; // Ignored for deposits, but passed by tests
  depositAmount: number;
}

export function calculateDeposits(items: DepositItemInput[]): number {
  return items.reduce((sum, item) => sum + (item.depositAmount * item.quantity), 0);
}
