import { test, expect } from 'vitest';
import { calculateDeposits } from '../../src/lib/domain/deposits';

test('calculateDeposits - sums correctly', () => {
  const items = [
    { quantity: 5, price: 3.25, depositAmount: 2.00 }, // deposit = 10
    { quantity: 2, price: 4.35, depositAmount: 2.50 }, // deposit = 5
    { quantity: 1, price: 12.00, depositAmount: 0.00 } // deposit = 0
  ];
  
  const total = calculateDeposits(items);
  expect(total).toBe(15.00);
});
