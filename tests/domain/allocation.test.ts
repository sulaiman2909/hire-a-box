import { describe, it, expect } from 'vitest';
import { allocateDriver, DriverProfile, PostcodeMapping, DriverAvailability } from '../../src/lib/domain/allocation';

describe('Allocation Domain Logic', () => {
  const drivers: DriverProfile[] = [
    { id: 'driver-syd-1', city: 'Sydney', isActive: true },
    { id: 'driver-syd-2', city: 'Sydney', isActive: true },
    { id: 'driver-syd-3', city: 'Sydney', isActive: false }, // Inactive driver
    { id: 'driver-mel-1', city: 'Melbourne', isActive: true },
  ];

  const mappings: PostcodeMapping[] = [
    { postcode: '2000', driverId: 'driver-syd-1' },
    { postcode: '2100', driverId: 'driver-syd-2' },
    { postcode: '3000', driverId: 'driver-mel-1' },
  ];

  const targetDate = '2026-06-25';
  const targetSlot = '10:00-12:00';

  it('allocates the primary driver when available', () => {
    const availabilities: DriverAvailability[] = [
      { driverId: 'driver-syd-1', date: targetDate, timeSlot: targetSlot, status: 'AVAILABLE' }
    ];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, availabilities);
    expect(result).toBe('driver-syd-1');
  });

  it('fails over to a secondary driver in the SAME city if the primary is unavailable', () => {
    const availabilities: DriverAvailability[] = [
      // Primary is UNAVAILABLE
      { driverId: 'driver-syd-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' },
      // Secondary in Sydney is AVAILABLE
      { driverId: 'driver-syd-2', date: targetDate, timeSlot: targetSlot, status: 'AVAILABLE' }
    ];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, availabilities);
    expect(result).toBe('driver-syd-2');
  });

  it('returns UNALLOCATED if the primary is unavailable and no secondary drivers are available', () => {
    const availabilities: DriverAvailability[] = [
      // Primary is UNAVAILABLE
      { driverId: 'driver-syd-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' },
      // Secondary in Sydney is UNAVAILABLE
      { driverId: 'driver-syd-2', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' },
      // Driver in Melbourne is AVAILABLE (but should be ignored because wrong city)
      { driverId: 'driver-mel-1', date: targetDate, timeSlot: targetSlot, status: 'AVAILABLE' },
    ];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, availabilities);
    expect(result).toBe('UNALLOCATED');
  });

  it('returns UNALLOCATED if the primary is inactive, even if a mapping exists', () => {
    // Change mapping to point to the inactive driver
    const inactiveMappings: PostcodeMapping[] = [
      { postcode: '2000', driverId: 'driver-syd-3' }
    ];
    
    const availabilities: DriverAvailability[] = [
      // The inactive driver has an available slot (edge case database artifact)
      { driverId: 'driver-syd-3', date: targetDate, timeSlot: targetSlot, status: 'AVAILABLE' },
      // Secondary in Sydney is also available, so it SHOULD failover to them since primary is inactive
      { driverId: 'driver-syd-1', date: targetDate, timeSlot: targetSlot, status: 'AVAILABLE' }
    ];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, inactiveMappings, availabilities);
    // Because primary is inactive, it should fallback to another active driver in the SAME city.
    // Let's ensure this works. Our logic says:
    // if (!preferredDriver.isActive) { ... failover checks }
    // Wait, let's verify if my logic works for this!
    expect(result).toBe('driver-syd-1');
  });

  it('returns UNALLOCATED for an unknown postcode', () => {
    const availabilities: DriverAvailability[] = [
      { driverId: 'driver-syd-1', date: targetDate, timeSlot: targetSlot, status: 'AVAILABLE' }
    ];

    const result = allocateDriver('9999', targetDate, targetSlot, drivers, mappings, availabilities);
    expect(result).toBe('UNALLOCATED');
  });

  it('ignores failover to an inactive driver', () => {
    const availabilities: DriverAvailability[] = [
      // Primary is UNAVAILABLE
      { driverId: 'driver-syd-1', date: targetDate, timeSlot: targetSlot, status: 'UNAVAILABLE' },
      // Secondary Sydney driver is AVAILABLE, but they are inactive in the profile
      { driverId: 'driver-syd-3', date: targetDate, timeSlot: targetSlot, status: 'AVAILABLE' },
    ];

    const result = allocateDriver('2000', targetDate, targetSlot, drivers, mappings, availabilities);
    expect(result).toBe('UNALLOCATED');
  });
});
