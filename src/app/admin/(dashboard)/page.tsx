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

  // Optimize: Run exactly 5 parallel queries to avoid pool exhaustion but get lightning fast responses
  const [
    statusCounts,
    depositLiabilityAggr,
    actionNeededCount,
    allTimeOrders,
    deliveriesThisWeek
  ] = await Promise.all([
    prisma.order.groupBy({
      by: ['status', 'type'],
      _count: true
    }),
    prisma.order.aggregate({
      where: {
        type: 'HIRE',
        status: { notIn: ['COLLECTED', 'CANCELLED'] }
      },
      _sum: { depositTotal: true, depositRefunded: true, depositForfeited: true }
    }),
    prisma.order.count({ 
      where: { 
        deliveryDate: { gte: todayStart, lt: nextDayStart },
        status: { in: ['PENDING', 'UNALLOCATED', 'ALLOCATED'] }
      } 
    }),
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { createdAt: true, grandTotal: true, amountPaid: true, hireTotal: true, buyTotal: true, depositForfeited: true, type: true }
    }),
    prisma.order.findMany({
      where: { deliveryDate: { gte: todayStart, lt: new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000) }, driverId: { not: null }, status: { notIn: ['CANCELLED', 'COLLECTED'] } },
      include: { driver: true }
    })
  ]);

  // Compute metrics locally
  const unallocatedCount = statusCounts.filter(s => s.status === 'UNALLOCATED').reduce((sum, s) => sum + s._count, 0);
  const activeHireOrdersCount = statusCounts.filter(s => s.type === 'HIRE' && s.status !== 'COLLECTED' && s.status !== 'CANCELLED').reduce((sum, s) => sum + s._count, 0);
  
  const pendingCount = statusCounts.find(s => s.status === 'PENDING' && s.type === 'HIRE')?._count || 0;
  const allocatedCount = statusCounts.find(s => s.status === 'ALLOCATED' && s.type === 'HIRE')?._count || 0;
  const deliveredCount = statusCounts.find(s => s.status === 'DELIVERED' && s.type === 'HIRE')?._count || 0;
  const collectedCount = statusCounts.find(s => s.status === 'COLLECTED' && s.type === 'HIRE')?._count || 0;

  const pendingCountBuy = statusCounts.find(s => s.status === 'PENDING' && s.type === 'BUY')?._count || 0;
  const allocatedCountBuy = statusCounts.find(s => s.status === 'ALLOCATED' && s.type === 'BUY')?._count || 0;
  const deliveredCountBuy = statusCounts.find(s => s.status === 'DELIVERED' && s.type === 'BUY')?._count || 0;

  let outstandingTotal = 0;
  let todayHire = 0, todayBuy = 0, todayForfeited = 0;
  let weekHire = 0, weekBuy = 0, weekForfeited = 0;
  let monthHire = 0, monthBuy = 0, monthForfeited = 0;
  const recentOrders = [];

  for (const o of allTimeOrders) {
    const diff = Number(o.grandTotal) - Number(o.amountPaid);
    if (diff > 0) outstandingTotal += diff;

    if (o.createdAt >= todayStart) {
      todayHire += Number(o.hireTotal);
      todayBuy += Number(o.buyTotal);
      todayForfeited += Number(o.depositForfeited);
    }
    if (o.createdAt >= thisWeekStart) {
      weekHire += Number(o.hireTotal);
      weekBuy += Number(o.buyTotal);
      weekForfeited += Number(o.depositForfeited);
    }
    if (o.createdAt >= thisMonthStart) {
      monthHire += Number(o.hireTotal);
      monthBuy += Number(o.buyTotal);
      monthForfeited += Number(o.depositForfeited);
    }
    if (o.createdAt >= fourteenDaysAgo) {
      recentOrders.push(o);
    }
  }

  recentOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const todayAggr = { _sum: { hireTotal: todayHire, buyTotal: todayBuy, depositForfeited: todayForfeited } };
  const weekAggr = { _sum: { hireTotal: weekHire, buyTotal: weekBuy, depositForfeited: weekForfeited } };
  const monthAggr = { _sum: { hireTotal: monthHire, buyTotal: monthBuy, depositForfeited: monthForfeited } };

  const deliveriesToday = deliveriesThisWeek.filter(o => o.deliveryDate >= todayStart && o.deliveryDate < tomorrowStart);

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
    depositLiability: Number(depositLiabilityAggr._sum?.depositTotal || 0) 
                      - Number(depositLiabilityAggr._sum?.depositRefunded || 0) 
                      - Number(depositLiabilityAggr._sum?.depositForfeited || 0),
    outstandingTotal,
    revenueToday: {
      hire: Number(todayAggr._sum?.hireTotal || 0) + Number(todayAggr._sum?.depositForfeited || 0),
      sale: Number(todayAggr._sum?.buyTotal || 0)
    },
    revenueWeek: {
      hire: Number(weekAggr._sum?.hireTotal || 0) + Number(weekAggr._sum?.depositForfeited || 0),
      sale: Number(weekAggr._sum?.buyTotal || 0)
    },
    revenueMonth: {
      hire: Number(monthAggr._sum?.hireTotal || 0) + Number(monthAggr._sum?.depositForfeited || 0),
      sale: Number(monthAggr._sum?.buyTotal || 0)
    },
    statusCountsHire: {
      pending: pendingCount,
      allocated: allocatedCount,
      delivered: deliveredCount,
      collected: collectedCount
    },
    statusCountsBuy: {
      pending: pendingCountBuy,
      allocated: allocatedCountBuy,
      delivered: deliveredCountBuy
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
