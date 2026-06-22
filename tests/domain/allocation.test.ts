import { describe, it, expect } from 'vitest';
import { allocateDriver, DriverProfile, PostcodeMapping, DriverAvailability } from '../../src/lib/domain/allocation';

describe('Allocation Domain Logic (Block-based)', () => {
  const drivers: DriverProfile[] = [
    { id: 'driver-1', city: 'Sydney', isActive: true },
    { id: 'driver-2', city: 'Sydney', isActive: true },
    { id: 'driver-inactive', city: 'Sydney', isActive: false }, // Mock inactive driver for testing
    { id: 'driver-3', city: 'Melbourne', isActive: true },
    { id: 'driver-4', city: 'Perth', isActive: true },
    { id: 'driver-5', city: 'Adelaide', isActive: true },
  ];

  const mappings: PostcodeMapping[] = [
    { postcode: '2000', driverId: 'driver-1' },
    { postcode: '2100', driverId: 'driver-2' },
    { postcode: '3000', driverId: 'driver-3' },
    { postcode: '6000', driverId: 'driver-4' },
    { postcode: '5000', driverId: 'driver-5' },
  ];

  const targetDate = '2026-06-25';
  const targetSlot = '10:00-12:00';

  it('1. Postcode in Driver 1\'s Sydney range, slot free → allocated to Driver 1', () => {
    // Empty blockouts = everyone is free
    const blockouts: DriverAvailability[] = [];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result).toBe('driver-1');
  });

  it('2. Postcode in Driver 1\'s range, Driver 1 already booked for that date+slot → fails over to Driver 2 (Sydney)', () => {
    const blockouts: DriverAvailability[] = [
      { driverId: 'driver-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' }
    ];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result).toBe('driver-2');
  });

  it('3. Three orders, same Sydney postcode range, same date+slot → Driver 1, then Driver 2, then UNALLOCATED', () => {
    // 1st order (both free) -> goes to driver 1. Simulate this by blocking driver 1 for the 2nd order.
    let blockouts: DriverAvailability[] = [
      { driverId: 'driver-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' }
    ];
    
    // 2nd order (driver 1 blocked) -> goes to driver 2
    const result2 = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result2).toBe('driver-2');

    // 3rd order (driver 1 AND driver 2 blocked) -> goes UNALLOCATED
    blockouts = [
      { driverId: 'driver-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' },
      { driverId: 'driver-2', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' }
    ];

    const result3 = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result3).toBe('UNALLOCATED');
  });

  it('4. Perth postcode (single driver), Driver 4 already booked for that date+slot → UNALLOCATED', () => {
    const blockouts: DriverAvailability[] = [
      { driverId: 'driver-4', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' }
    ];

    const result = allocateDriver('6000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result).toBe('UNALLOCATED'); // No failover in Perth
  });

  it('5. Perth postcode, same slot but DIFFERENT date than an existing Driver 4 booking → ALLOCATED', () => {
    const blockouts: DriverAvailability[] = [
      { driverId: 'driver-4', date: '2026-10-31', timeSlot: targetSlot, status: 'UNAVAILABLE' }
    ];

    const result = allocateDriver('6000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result).toBe('driver-4'); // Different date, no conflict
  });

  it('6. Postcode matching no driver → UNALLOCATED', () => {
    const blockouts: DriverAvailability[] = [];
    const result = allocateDriver('9999', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result).toBe('UNALLOCATED');
  });

  it('7. Owning driver has BLOCKED the slot (not booked, manually blocked) → same failover behaviour', () => {
    const blockouts: DriverAvailability[] = [
      // Manual calendar block has the exact same structure
      { driverId: 'driver-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' }
    ];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result).toBe('driver-2'); // Failover works the same way
  });

  it('ignores failover to an inactive driver', () => {
    const blockouts: DriverAvailability[] = [
      // Primary is UNAVAILABLE
      { driverId: 'driver-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' },
      // The other active Sydney driver is also UNAVAILABLE
      { driverId: 'driver-2', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' },
    ];

    // driver-inactive is NOT in blockouts, so they are "free", but they are inactive.
    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, blockouts);
    expect(result).toBe('UNALLOCATED');
  });
});
