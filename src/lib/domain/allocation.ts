export interface DriverProfile {
  id: string;
  city: string;
  isActive: boolean;
}

export interface DriverAvailability {
  driverId: string;
  date: string;
  timeSlot: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface PostcodeMapping {
  postcode: string;
  driverId: string;
}

export function allocateDriver(
  postcode: string,
  targetDate: string,
  targetSlot: string,
  drivers: DriverProfile[],
  mappings: PostcodeMapping[],
  blockouts: DriverAvailability[]
): string | 'UNALLOCATED' {
  // 1. Lookup: Match postcode to a driver
  const mapping = mappings.find(m => m.postcode === postcode);
  if (!mapping) return 'UNALLOCATED';

  const preferredDriver = drivers.find(d => d.id === mapping.driverId);
  if (!preferredDriver) return 'UNALLOCATED';

  // Helper to check if a driver is blocked
  const isDriverBlocked = (driverId: string) => {
    return blockouts.some(
      b => b.driverId === driverId && 
           b.date === targetDate && 
           b.timeSlot === targetSlot
    );
  };

  // 2. Primary Check: is preferred driver active and NOT blocked?
  if (preferredDriver.isActive && !isDriverBlocked(preferredDriver.id)) {
    return preferredDriver.id;
  }

  // 3. Failover Check: Find another active driver in the SAME city who is NOT blocked
  const cityDrivers = drivers.filter(d => 
    d.city === preferredDriver.city && 
    d.isActive && 
    d.id !== preferredDriver.id
  );

  for (const failover of cityDrivers) {
    if (!isDriverBlocked(failover.id)) {
      return failover.id;
    }
  }

  // 4. Fallback: No driver in city is available
  return 'UNALLOCATED';
}
