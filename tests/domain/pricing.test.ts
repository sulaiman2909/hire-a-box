import { test, expect } from 'vitest';
import { calculateOrderTotals, calculateDeliveryFee, FREE_DELIVERY_THRESHOLD_HIRE, FREE_DELIVERY_THRESHOLD_BUY, DELIVERY_FEE } from '../../src/lib/domain/pricing';
import { OrderType } from '@prisma/client';

test('calculateDeliveryFee - Hire below threshold', () => {
  const fee = calculateDeliveryFee(50.00, OrderType.HIRE);
  expect(fee).toBe(DELIVERY_FEE);
});

test('calculateDeliveryFee - Hire exactly at threshold', () => {
  const fee = calculateDeliveryFee(FREE_DELIVERY_THRESHOLD_HIRE, OrderType.HIRE);
  expect(fee).toBe(0);
});

test('calculateDeliveryFee - Buy above threshold', () => {
  const fee = calculateDeliveryFee(100.00, OrderType.BUY);
  expect(fee).toBe(0);
});

test('calculateOrderTotals - Hire applies correct totals', () => {
  const items = [
    { quantity: 2, price: 10.00, depositAmount: 2.00 }, // 20
    { quantity: 1, price: 5.50, depositAmount: 0 } // 5.50
  ]; // subtotal = 25.50
  
  const totals = calculateOrderTotals(OrderType.HIRE, items);
  
  expect(totals.saleTotal).toBe(0);
  expect(totals.deliveryFee).toBe(DELIVERY_FEE);
  expect(totals.hireTotal).toBe(25.50 + DELIVERY_FEE);
});

test('calculateOrderTotals - Buy applies correct totals', () => {
  const items = [
    { quantity: 10, price: 10.00, depositAmount: 0 }, // 100
  ]; // subtotal = 100.00
  
  const totals = calculateOrderTotals(OrderType.BUY, items);
  
  expect(totals.hireTotal).toBe(0);
  expect(totals.deliveryFee).toBe(0); // > 99 threshold
  expect(totals.saleTotal).toBe(100.00);
});
