import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const now = new Date();
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const nextDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const fourteenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);

  // Parallelize all queries for speed
  const [
    unallocatedCount,
    actionNeededCount,
    activeHireOrdersCount,
    depositLiabilityAggr,
    outstandingAggr,
    
    todayAggr,
    weekAggr,
    monthAggr,

    pendingCount,
    allocatedCount,
    deliveredCount,
    collectedCount,

    deliveriesToday,
    deliveriesThisWeek,
    
    recentOrders
  ] = await Promise.all([
    // 1. Unallocated Orders
    prisma.order.count({ where: { status: 'UNALLOCATED' } }),

    // 2. Action needed (Deliveries today/tomorrow that aren't delivered/collected)
    prisma.order.count({ 
      where: { 
        deliveryDate: { gte: todayStart, lt: nextDayStart },
        status: { in: ['PENDING', 'UNALLOCATED', 'ALLOCATED'] }
      } 
    }),

    // 3. Active hire orders
    prisma.order.count({
      where: {
        type: 'HIRE',
        status: { notIn: ['COLLECTED', 'CANCELLED'] }
      }
    }),

    // 4. Total Deposit Liability (Refundable deposits held on active hire orders)
    prisma.order.aggregate({
      where: {
        type: 'HIRE',
        status: { notIn: ['COLLECTED', 'CANCELLED'] }
      },
      _sum: { depositTotal: true }
    }),

    // 5. Total Outstanding Amount (GrandTotal - AmountPaid) for non-cancelled orders
    // We fetch raw records and sum to avoid complex DB math if Prisma aggregate math is limited
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { grandTotal: true, amountPaid: true }
    }),

    // 6. Revenue Aggregates
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } },
      _sum: { hireTotal: true, buyTotal: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: thisWeekStart }, status: { not: 'CANCELLED' } },
      _sum: { hireTotal: true, buyTotal: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: thisMonthStart }, status: { not: 'CANCELLED' } },
      _sum: { hireTotal: true, buyTotal: true }
    }),

    // 7. Status Breakdowns
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'ALLOCATED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'COLLECTED' } }),

    // 8. Deliveries Scheduled
    prisma.order.findMany({
      where: { deliveryDate: { gte: todayStart, lt: tomorrowStart }, driverId: { not: null }, status: { notIn: ['CANCELLED', 'COLLECTED'] } },
      include: { driver: true }
    }),
    prisma.order.findMany({
      where: { deliveryDate: { gte: thisWeekStart }, driverId: { not: null }, status: { notIn: ['CANCELLED', 'COLLECTED'] } },
      include: { driver: true }
    }),

    // 9. Trend Data (Last 14 days)
    prisma.order.findMany({
      where: { createdAt: { gte: fourteenDaysAgo }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, grandTotal: true, type: true }
    })
  ]);

  // Process Outstanding
  const outstandingTotal = outstandingAggr.reduce((acc, order) => {
    const diff = Number(order.grandTotal) - Number(order.amountPaid);
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  // Process Deliveries by Driver
  const processDeliveries = (orders: any[]) => {
    const counts: Record<string, { name: string, city: string, count: number }> = {};
    orders.forEach(o => {
      if (!o.driver) return;
      if (!counts[o.driver.id]) {
        counts[o.driver.id] = { name: o.driver.name, city: o.driver.city, count: 0 };
      }
      counts[o.driver.id].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  };

  const dispatchToday = processDeliveries(deliveriesToday);
  const dispatchThisWeek = processDeliveries(deliveriesThisWeek);

  // Process Trend Data
  const trendsMap = new Map<string, { date: string, revenue: number, orders: number }>();
  
  // Initialize 14 days
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    trendsMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
  }

  recentOrders.forEach(o => {
    const dateStr = o.createdAt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    if (trendsMap.has(dateStr)) {
      const entry = trendsMap.get(dateStr)!;
      entry.orders++;
      entry.revenue += Number(o.grandTotal);
    }
  });

  const trendData = Array.from(trendsMap.values());

  const data = {
    unallocatedCount,
    actionNeededCount,
    activeHireOrdersCount,
    depositLiability: Number(depositLiabilityAggr._sum?.depositTotal || 0),
    outstandingTotal,
    revenueToday: {
      hire: Number(todayAggr._sum?.hireTotal || 0),
      sale: Number(todayAggr._sum?.buyTotal || 0)
    },
    revenueWeek: {
      hire: Number(weekAggr._sum?.hireTotal || 0),
      sale: Number(weekAggr._sum?.buyTotal || 0)
    },
    revenueMonth: {
      hire: Number(monthAggr._sum?.hireTotal || 0),
      sale: Number(monthAggr._sum?.buyTotal || 0)
    },
    statusCounts: {
      pending: pendingCount,
      allocated: allocatedCount,
      delivered: deliveredCount,
      collected: collectedCount
    },
    dispatchToday,
    dispatchThisWeek,
    trendData
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminDashboardClient data={data} />
    </div>
  );
}
