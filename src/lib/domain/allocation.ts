import { isSlotAvailable } from './availability';

export interface DriverData {
  id: string;
  name: string;
  city: string;
  isActive: boolean;
  postcodes: string[];
}

export const UNALLOCATED = "UNALLOCATED";

/**
 * Core business rule for auto-allocating a driver based on postcode failover logic.
 * The failover automatically applies to any city if there are multiple active drivers.
 * 
 * @param deliveryPostcode The postcode the customer is ordering to.
 * @param timeSlot The requested time slot (e.g. '08:00-10:00').
 * @param allDrivers List of all drivers with their managed postcodes.
 * @param existingBookings List of existing bookings for the requested DATE.
 * @returns driverId or "UNALLOCATED"
 */
export function allocateDriver(
  deliveryPostcode: string,
  timeSlot: string,
  allDrivers: DriverData[],
  existingBookings: { driverId: string; timeSlot: string }[]
): string {
  // 1. Find primary driver by postcode match
  const primary = allDrivers.find(d => 
    d.isActive && d.postcodes.includes(deliveryPostcode)
  );

  if (!primary) {
    return UNALLOCATED; // No match - needs a human
  }

  // 2. Check if primary driver is available
  if (isSlotAvailable(primary.id, timeSlot, existingBookings)) {
    return primary.id;
  }

  // 3. Primary blocked - failover to other active drivers in the same city
  const cityDrivers = allDrivers.filter(
    d => d.isActive && d.city === primary.city && d.id !== primary.id
  );

  for (const alt of cityDrivers) {
    if (isSlotAvailable(alt.id, timeSlot, existingBookings)) {
      return alt.id;
    }
  }

  // 4. City matched, but nobody is free for that slot
  return UNALLOCATED;
}
