import React from 'react';
import { notFound } from 'next/navigation';
import AdminOrderDetailClient from '@/components/admin/AdminOrderDetailClient';
import { prisma } from '@/lib/prisma';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
        orderBy: { product: { name: 'asc' } }
      },
      driver: true,
      emailLogs: {
        orderBy: { sentAt: 'desc' }
      }
    }
  });

  if (!order) {
    notFound();
  }

  // Fetch drivers and availabilities in parallel
  const [drivers, availabilities] = await Promise.all([
    prisma.driver.findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true }
    }),
    prisma.driverAvailability.findMany({
      where: {
        date: order.deliveryDate,
        status: 'AVAILABLE'
      },
      select: { driverId: true, timeSlot: true }
    })
  ]);

  // Serialize Decimals for Client Component
  const safeOrder = {
    ...order,
    hireTotal: Number(order.hireTotal),
    buyTotal: Number(order.buyTotal),
    depositTotal: Number(order.depositTotal),
    deliveryFee: Number(order.deliveryFee),
    discountAmount: Number(order.discountAmount),
    grandTotal: Number(order.grandTotal),
    amountPaid: Number(order.amountPaid),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price),
      depositPerUnit: Number(item.depositPerUnit),
      product: {
        ...item.product,
        hirePrice: item.product.hirePrice ? Number(item.product.hirePrice) : null,
        buyPriceNew: item.product.buyPriceNew ? Number(item.product.buyPriceNew) : null,
        buyPriceUsed: item.product.buyPriceUsed ? Number(item.product.buyPriceUsed) : null,
        depositPerUnit: item.product.depositPerUnit ? Number(item.product.depositPerUnit) : null,
      }
    }))
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <AdminOrderDetailClient 
        order={safeOrder} 
        drivers={drivers} 
        availabilities={availabilities} 
      />
    </div>
  );
}
