export interface SlotStatus {
  driverId: string;
  date: Date;
  timeSlot: string;
  isAvailable: boolean;
}

/**
 * In a real application, this would read from the DriverAvailability table.
 * For the domain layer, we inject the existing booked slots and check against them.
 */
export function isSlotAvailable(
  driverId: string,
  timeSlot: string,
  existingBookings: { driverId: string; timeSlot: string }[]
): boolean {
  // Check if this specific driver already has a booking for this slot
  const isBooked = existingBookings.some(
    b => b.driverId === driverId && b.timeSlot === timeSlot
  );
  
  return !isBooked;
}
