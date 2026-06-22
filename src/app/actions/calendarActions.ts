'use server';

import { prisma } from '@/lib/prisma';

export async function toggleSlotStatus(driverId: string, dateStr: string, timeSlot: string, isCurrentlyAvailable: boolean) {
  const dateObj = new Date(dateStr);
  
  if (isCurrentlyAvailable) {
    // We are blocking it out
    // Since there's no record or it says 'AVAILABLE', we need to create or update it to 'UNAVAILABLE'
    const existing = await prisma.driverAvailability.findFirst({
      where: { driverId, date: dateObj, timeSlot }
    });

    if (existing) {
      await prisma.driverAvailability.update({
        where: { id: existing.id },
        data: { status: 'UNAVAILABLE' }
      });
    } else {
      await prisma.driverAvailability.create({
        data: {
          driverId,
          date: dateObj,
          timeSlot,
          status: 'UNAVAILABLE'
        }
      });
    }
  } else {
    // We are unblocking it. Delete the blockout.
    await prisma.driverAvailability.deleteMany({
      where: { driverId, date: dateObj, timeSlot }
    });
  }
}
