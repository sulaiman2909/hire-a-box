import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateDriver, UNALLOCATED, DriverData } from '../../src/lib/domain/allocation';

test('allocateDriver - postcode matching no driver returns UNALLOCATED', () => {
  const drivers: DriverData[] = [
    { id: 'd1', name: 'D1', city: 'Sydney', isActive: true, postcodes: ['2000'] }
  ];
  
  const driverId = allocateDriver('9999', '08:00-10:00', drivers, []);
  assert.equal(driverId, UNALLOCATED);
});

test('allocateDriver - primary driver available', () => {
  const drivers: DriverData[] = [
    { id: 'd1', name: 'D1', city: 'Sydney', isActive: true, postcodes: ['2000'] }
  ];
  
  const driverId = allocateDriver('2000', '08:00-10:00', drivers, []);
  assert.equal(driverId, 'd1');
});

test('allocateDriver - primary blocked, failover to secondary in same city', () => {
  const drivers: DriverData[] = [
    { id: 'd1', name: 'D1', city: 'Sydney', isActive: true, postcodes: ['2000'] },
    { id: 'd2', name: 'D2', city: 'Sydney', isActive: true, postcodes: ['2080'] }
  ];
  
  // d1 is booked
  const bookings = [{ driverId: 'd1', timeSlot: '08:00-10:00' }];
  
  const driverId = allocateDriver('2000', '08:00-10:00', drivers, bookings);
  
  // should failover to d2
  assert.equal(driverId, 'd2');
});

test('allocateDriver - all city drivers blocked returns UNALLOCATED', () => {
  const drivers: DriverData[] = [
    { id: 'd1', name: 'D1', city: 'Sydney', isActive: true, postcodes: ['2000'] },
    { id: 'd2', name: 'D2', city: 'Sydney', isActive: true, postcodes: ['2080'] }
  ];
  
  const bookings = [
    { driverId: 'd1', timeSlot: '08:00-10:00' },
    { driverId: 'd2', timeSlot: '08:00-10:00' }
  ];
  
  const driverId = allocateDriver('2000', '08:00-10:00', drivers, bookings);
  assert.equal(driverId, UNALLOCATED);
});
