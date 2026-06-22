import React from 'react';
import { OrderStatus } from '@prisma/client';
import AdminCalendarClient from '@/components/admin/AdminCalendarClient';
import { prisma } from '@/lib/prisma';

export default async function CalendarPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const [drivers, availabilities, orders] = await Promise.all([
    prisma.driver.findMany({
      where: { isActive: true },
      orderBy: [{ city: 'asc' }, { name: 'asc' }]
    }),
    prisma.driverAvailability.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
          lte: sixtyDaysFromNow
        }
      }
    }),
    prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: thirtyDaysAgo,
          lte: sixtyDaysFromNow
        },
        driverId: { not: null },
        status: { notIn: [OrderStatus.COLLECTED, OrderStatus.CANCELLED] } // Only show active/pending allocations
      },
      select: {
        id: true,
        orderNumber: true,
        driverId: true,
        deliveryDate: true,
        deliverySlot: true,
        status: true
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--color-brand-charcoal)]">Driver Calendar</h1>
          <p className="text-sm text-stone-500">Manage availability block-outs and view active allocations.</p>
        </div>
      </div>
      
      <AdminCalendarClient 
        drivers={drivers}
        availabilities={availabilities}
        orders={orders}
      />
    </div>
  );
}
