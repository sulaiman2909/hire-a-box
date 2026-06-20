'use server';

import { PrismaClient } from '@prisma/client';
import { validatePromo, Promo } from '@/lib/domain/promos';

const prisma = new PrismaClient();

export async function checkServiceability(postcode: string): Promise<boolean> {
  const normalized = postcode.trim();
  if (!normalized) return false;
  
  const mapping = await prisma.postcodeMapping.findUnique({
    where: { postcode: normalized }
  });
  
  return !!mapping;
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
  
  // Find all availabilities for these drivers on this date
  const availabilities = await prisma.driverAvailability.findMany({
    where: {
      driverId: { in: driverIds },
      date: targetDate,
      status: 'AVAILABLE'
    }
  });

  // Extract unique timeslots that have at least one driver available
  const slots = new Set<string>();
  availabilities.forEach(a => slots.add(a.timeSlot));
  
  return Array.from(slots).sort();
}
