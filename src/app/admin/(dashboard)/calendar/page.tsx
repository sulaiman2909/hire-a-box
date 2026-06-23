import React from 'react';
import { OrderStatus } from '@prisma/client';
import AdminCalendarClient from '@/components/admin/AdminCalendarClient';
import { prisma } from '@/lib/prisma';

export default async function CalendarPage() {
  const dateRangeStart = new Date();
  dateRangeStart.setDate(dateRangeStart.getDate() - 90);
  
  const dateRangeEnd = new Date();
  dateRangeEnd.setDate(dateRangeEnd.getDate() + 365);

  const [drivers, availabilities, orders] = await Promise.all([
    prisma.driver.findMany({
      where: { isActive: true },
      orderBy: [{ city: 'asc' }, { name: 'asc' }]
    }),
    prisma.driverAvailability.findMany({
      where: {
        date: {
          gte: dateRangeStart,
          lte: dateRangeEnd
        }
      }
    }),
    prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: dateRangeStart,
          lte: dateRangeEnd
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
