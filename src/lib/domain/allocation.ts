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
  availabilities: DriverAvailability[]
): string | 'UNALLOCATED' {
  // 1. Lookup: Match postcode to a driver
  const mapping = mappings.find(m => m.postcode === postcode);
  if (!mapping) return 'UNALLOCATED';

  const preferredDriver = drivers.find(d => d.id === mapping.driverId);
  if (!preferredDriver) return 'UNALLOCATED';

  // 2. Primary Check: is preferred driver active and available?
  if (preferredDriver.isActive) {
    const isAvailable = availabilities.some(
      a => a.driverId === preferredDriver.id && 
           a.date === targetDate && 
           a.timeSlot === targetSlot && 
           a.status === 'AVAILABLE'
    );
    if (isAvailable) return preferredDriver.id;
  }

  // 3. Failover Check: Find another active driver in the SAME city who IS available
  const cityDrivers = drivers.filter(d => 
    d.city === preferredDriver.city && 
    d.isActive && 
    d.id !== preferredDriver.id
  );

  for (const failover of cityDrivers) {
    const failoverAvailable = availabilities.some(
      a => a.driverId === failover.id && 
           a.date === targetDate && 
           a.timeSlot === targetSlot && 
           a.status === 'AVAILABLE'
    );
    if (failoverAvailable) return failover.id;
  }

  // 4. Fallback: No driver in city is available
  return 'UNALLOCATED';
}
