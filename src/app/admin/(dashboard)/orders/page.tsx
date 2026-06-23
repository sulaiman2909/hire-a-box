import React from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import AdminOrdersTable, { AdminOrderRow } from '@/components/admin/AdminOrdersTable';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getOrderStats() {
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Week calculations (assuming week starts on Monday)
  const dayOfWeek = now.getDay() || 7; // Make Sunday = 7
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - dayOfWeek + 1);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  // Month calculations
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  // Optimize: Fetch lightweight timestamp records to replace 6 separate database queries with 1 fast query
  const recentOrders = await prisma.order.findMany({
    where: { createdAt: { gte: lastMonthStart } },
    select: { createdAt: true }
  });

  let todayCount = 0, yesterdayCount = 0, thisWeekCount = 0, lastWeekCount = 0, thisMonthCount = 0, lastMonthCount = 0;

  for (const o of recentOrders) {
    if (o.createdAt >= today) todayCount++;
    if (o.createdAt >= yesterday && o.createdAt < today) yesterdayCount++;
    if (o.createdAt >= thisWeekStart) thisWeekCount++;
    if (o.createdAt >= lastWeekStart && o.createdAt < thisWeekStart) lastWeekCount++;
    if (o.createdAt >= thisMonthStart) thisMonthCount++;
    if (o.createdAt >= lastMonthStart && o.createdAt < thisMonthStart) lastMonthCount++;
  }

  return { todayCount, yesterdayCount, thisWeekCount, lastWeekCount, thisMonthCount, lastMonthCount };
}

export default async function AdminOrdersPage() {
  // Enforce authentication at the page level as well
  const session = await auth();
  if (!session) {
    return null; // Layout redirects to login
  }

  const stats = await getOrderStats();

  const rawOrders = await prisma.order.findMany({
    take: 100, // Sensible limit to prevent fetching unbounded orders
    include: { driver: true },
    orderBy: { createdAt: 'desc' }
  });

  const orders: AdminOrderRow[] = rawOrders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    source: o.source,
    type: o.type,
    status: o.status,
    createdAt: o.createdAt,
    customerName: o.customerName,
    deliverySuburb: o.deliverySuburb,
    deliveryDate: o.deliveryDate,
    deliverySlot: o.deliverySlot,
    grandTotal: Number(o.grandTotal),
    driverName: o.driver?.name || null,
  }));

  const unallocatedCount = orders.filter(o => o.status === 'UNALLOCATED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-brand-charcoal)]">Orders Dashboard</h1>
          <p className="text-sm text-stone-500 mt-1">Manage and track all customer orders.</p>
        </div>
        <div className="flex items-center gap-4">
          {unallocatedCount > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-bold">{unallocatedCount} Unallocated {unallocatedCount === 1 ? 'Order' : 'Orders'} Require Attention</span>
            </div>
          )}
          <Link 
            href="/admin/orders/new" 
            className="flex items-center gap-2 bg-[var(--color-brand-orange)] text-white px-4 py-2 rounded-md hover:bg-[#c94d0a] transition-colors font-semibold text-sm shadow-sm"
          >
            <PlusCircle size={18} />
            New Order
          </Link>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Today", value: stats.todayCount, color: "border-l-blue-500" },
          { label: "Yesterday", value: stats.yesterdayCount, color: "border-l-emerald-500" },
          { label: "This Week", value: stats.thisWeekCount, color: "border-l-[var(--color-brand-orange)]" },
          { label: "Last Week", value: stats.lastWeekCount, color: "border-l-stone-300" },
          { label: "This Month", value: stats.thisMonthCount, color: "border-l-indigo-500" },
          { label: "Last Month", value: stats.lastMonthCount, color: "border-l-stone-300" },
        ].map((stat, i) => (
          <div key={i} className={`bg-white border border-stone-200 border-l-4 ${stat.color} rounded-md p-4 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md`}>
            <span className="text-stone-500 text-xs uppercase tracking-wider font-semibold mb-1">{stat.label}</span>
            <span className="text-2xl font-bold text-[var(--color-brand-charcoal)]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <AdminOrdersTable orders={orders} />
    </div>
  );
}
