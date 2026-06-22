'use server';

import { prisma } from '@/lib/prisma';
import { validatePromo, Promo } from '@/lib/domain/promos';

export async function checkServiceability(postcode: string): Promise<boolean> {
  const normalized = postcode.trim();
  if (!normalized) return false;
  
  const mapping = await prisma.postcodeMapping.findUnique({
    where: { postcode: normalized }
  });
  
  return !!mapping;
}

export async function checkFullServiceability(
  deliveryPostcode: string, 
  pickupPostcode?: string,
  isHire: boolean = false
): Promise<{ isValid: boolean; message: string }> {
  const normDelivery = deliveryPostcode.trim();
  const normPickup = pickupPostcode?.trim();

  if (!normDelivery) {
    return { isValid: false, message: 'Please enter a delivery postcode.' };
  }

  const deliveryMapping = await prisma.postcodeMapping.findUnique({
    where: { postcode: normDelivery },
    include: { driver: true }
  });

  if (!deliveryMapping || !deliveryMapping.driver) {
    // Fire and forget log for unserviceable area
    if (prisma.postcodeSearchLog) {
      prisma.postcodeSearchLog.create({
        data: {
          postcode: normDelivery,
          context: isHire ? 'HIRE_DELIVERY' : 'BUY_DELIVERY'
        }
      }).catch(err => console.error('Silent log failure:', err));
    }

    return { isValid: false, message: "We don't currently provide service in your area." };
  }

  const deliveryCity = deliveryMapping.driver.city;

  if (isHire) {
    if (!normPickup) {
      return { isValid: false, message: 'Please enter a pickup postcode for hire orders.' };
    }

    const pickupMapping = await prisma.postcodeMapping.findUnique({
      where: { postcode: normPickup },
      include: { driver: true }
    });

    if (!pickupMapping || !pickupMapping.driver || pickupMapping.driver.city !== deliveryCity) {
      // Fire and forget log for unserviceable pickup area
      if (normPickup && prisma.postcodeSearchLog) {
        prisma.postcodeSearchLog.create({
          data: {
            postcode: normPickup,
            context: 'HIRE_PICKUP'
          }
        }).catch(err => console.error('Silent log failure:', err));
      }

      return { 
        isValid: false, 
        message: "We can deliver here but can't collect from your pickup area — switch to Buy to purchase boxes instead."
      };
    }
  }

  return { isValid: true, message: 'Great! We service your area.' };
}

export async function applyPromoCode(code: string): Promise<{ valid: boolean; promo: Promo | null; message: string }> {
  const promo = validatePromo(code);
  
  if (promo) {
    return { valid: true, promo, message: `Promo applied: ${promo.discountPercent}% off!` };
  } else {
    return { valid: false, promo: null, message: 'Invalid or expired promo code.' };
  }
}

export async function getAvailableSlots(postcode: string, dateStr: string): Promise<string[]> {
  const normalized = postcode.trim();
  const mapping = await prisma.postcodeMapping.findUnique({
    where: { postcode: normalized },
    include: { driver: true }
  });

  if (!mapping || !mapping.driver) return [];

  // Parse target date
  const targetDate = new Date(dateStr);
  
  // Find all active drivers in the SAME city (failover logic)
  const cityDrivers = await prisma.driver.findMany({
    where: { city: mapping.driver.city, isActive: true }
  });
  
  const driverIds = cityDrivers.map(d => d.id);
  
  // Find all blockouts for these drivers on this date
  const blockouts = await prisma.driverAvailability.findMany({
    where: {
      driverId: { in: driverIds },
      date: targetDate,
      status: 'UNAVAILABLE'
    }
  });

  const STANDARD_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];
  const availableSlots: string[] = [];

  for (const slot of STANDARD_SLOTS) {
    // A slot is available if AT LEAST ONE city driver is NOT blocked for this slot
    const isSlotAvailable = driverIds.some(dId => {
      const isBlocked = blockouts.some(b => b.driverId === dId && b.timeSlot === slot);
      return !isBlocked;
    });

    if (isSlotAvailable) {
      availableSlots.push(slot);
    }
  }
  
  return availableSlots;
}

export async function getDisabledDates(postcode: string): Promise<string[]> {
  const normalized = postcode.trim();
  const mapping = await prisma.postcodeMapping.findUnique({
    where: { postcode: normalized },
    include: { driver: true }
  });

  if (!mapping || !mapping.driver) return [];

  const cityDrivers = await prisma.driver.findMany({
    where: { city: mapping.driver.city, isActive: true }
  });
  
  const driverIds = cityDrivers.map(d => d.id);
  const STANDARD_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(today.getDate() + 60);

  const blockouts = await prisma.driverAvailability.findMany({
    where: {
      driverId: { in: driverIds },
      date: { gte: today, lte: sixtyDaysFromNow },
      status: 'UNAVAILABLE'
    }
  });

  const disabledDatesStr: string[] = [];
  const blockoutsByDate: Record<string, typeof blockouts> = {};
  
  for (const b of blockouts) {
    const dStr = b.date.toISOString().split('T')[0];
    if (!blockoutsByDate[dStr]) blockoutsByDate[dStr] = [];
    blockoutsByDate[dStr].push(b);
  }

  for (const [dStr, dayBlockouts] of Object.entries(blockoutsByDate)) {
    let availableSlotsCount = 0;

    for (const slot of STANDARD_SLOTS) {
      const isSlotAvailable = driverIds.some(dId => {
        const isBlocked = dayBlockouts.some(b => b.driverId === dId && b.timeSlot === slot);
        return !isBlocked;
      });

      if (isSlotAvailable) {
        availableSlotsCount++;
      }
    }

    if (availableSlotsCount === 0) {
      disabledDatesStr.push(dStr);
    }
  }

  return disabledDatesStr;
}
