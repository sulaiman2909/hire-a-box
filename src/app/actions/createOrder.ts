'use server';

import { OrderType, OrderStatus, OrderSource } from '@prisma/client';
import { CartState } from '@/app/actions/cart';
import { calculateOrderTotals } from '@/lib/domain/pricing';
import { calculateDeposits } from '@/lib/domain/deposits';
import { calculateDiscount } from '@/lib/domain/promos';
import { allocateDriver, DriverProfile, PostcodeMapping, DriverAvailability } from '@/lib/domain/allocation';
import { cookies } from 'next/headers';
import { sendCustomerConfirmationEmail, sendDriverNotificationEmail } from '@/lib/domain/emails';
import { prisma } from '@/lib/prisma';

interface CreateOrderParams {
  cartState: CartState;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryDetails: {
    address: string;
    suburb: string;
    postcode: string;
    pickupPostcode?: string;
    date: Date;
    slot: string;
  };
  source?: OrderSource;
  isPaid?: boolean;
}

export async function createOrder(params: CreateOrderParams) {
  const isHire = params.cartState.hireItems.length > 0;
  const items = isHire ? params.cartState.hireItems : params.cartState.buyItems;
  const type = isHire ? OrderType.HIRE : OrderType.BUY;

  if (items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Recalculate Totals securely
  const totals = calculateOrderTotals(type, items);
  const depositTotal = isHire ? calculateDeposits(items) : 0;
  const subtotalBeforeDiscount = isHire ? totals.hireTotal : totals.saleTotal;
  const discountAmount = calculateDiscount(subtotalBeforeDiscount, params.cartState.promoCode);
  
  const grandTotal = (isHire ? totals.hireTotal : totals.saleTotal) - discountAmount + depositTotal + totals.deliveryFee;

  // Generate unique order number HAB-XXXXXX
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `HAB-${randomSuffix}`;

  // Start Transaction
  const orderId = await prisma.$transaction(async (tx) => {
    // 1. Fetch data for Allocation
    const dateStr = params.deliveryDetails.date.toISOString().split('T')[0];
    
    // Using mapping to find the city
    const mappingRecord = await tx.postcodeMapping.findUnique({
      where: { postcode: params.deliveryDetails.postcode },
      include: { driver: true }
    });

    let allocatedDriverId: string | 'UNALLOCATED' = 'UNALLOCATED';

    if (mappingRecord && mappingRecord.driver) {
      // Get all drivers in the city
      const allDrivers = await tx.driver.findMany({
        where: { city: mappingRecord.driver.city }
      });
      
      const allMappings = await tx.postcodeMapping.findMany({
        where: { driverId: { in: allDrivers.map(d => d.id) } }
      });

      const allBlockouts = await tx.driverAvailability.findMany({
        where: {
          driverId: { in: allDrivers.map(d => d.id) },
          date: params.deliveryDetails.date,
          timeSlot: params.deliveryDetails.slot,
          status: 'UNAVAILABLE'
        }
      });

      // Map to Domain models
      const domainDrivers: DriverProfile[] = allDrivers.map(d => ({
        id: d.id,
        city: d.city,
        isActive: d.isActive
      }));

      const domainMappings: PostcodeMapping[] = allMappings.map(m => ({
        postcode: m.postcode,
        driverId: m.driverId
      }));

      const domainBlockouts: DriverAvailability[] = allBlockouts.map(a => ({
        driverId: a.driverId,
        date: a.date.toISOString().split('T')[0],
        timeSlot: a.timeSlot,
        status: a.status as 'AVAILABLE' | 'UNAVAILABLE'
      }));

      allocatedDriverId = allocateDriver(
        params.deliveryDetails.postcode,
        dateStr,
        params.deliveryDetails.slot,
        domainDrivers,
        domainMappings,
        domainBlockouts
      );
    }

    if (allocatedDriverId === 'UNALLOCATED') {
      if (mappingRecord && mappingRecord.driver) {
        throw new Error(`Driver ${mappingRecord.driver.name} is already booked for this date+slot and there's no other driver in this city — choose another slot/date, or reassign the existing booking first.`);
      } else {
        throw new Error('This delivery postcode is not within our serviceable areas. Cannot allocate a driver.');
      }
    }

    // 2. Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        type,
        source: params.source || OrderSource.WEB,
        status: allocatedDriverId === 'UNALLOCATED' ? OrderStatus.UNALLOCATED : OrderStatus.ALLOCATED,
        customerName: params.customerDetails.name,
        customerEmail: params.customerDetails.email,
        customerPhone: params.customerDetails.phone,
        deliveryAddress: params.deliveryDetails.address,
        deliverySuburb: params.deliveryDetails.suburb,
        deliveryPostcode: params.deliveryDetails.postcode,
        pickupPostcode: params.deliveryDetails.pickupPostcode,
        deliveryDate: params.deliveryDetails.date,
        deliverySlot: params.deliveryDetails.slot,
        hireTotal: isHire ? totals.hireTotal : 0,
        buyTotal: !isHire ? totals.saleTotal : 0,
        depositTotal,
        deliveryFee: totals.deliveryFee,
        discountAmount,
        grandTotal,
        amountPaid: params.isPaid === false ? 0 : grandTotal,
        driverId: allocatedDriverId !== 'UNALLOCATED' ? allocatedDriverId : null,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            depositPerUnit: item.depositAmount,
            isUsed: item.isUsed
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // 3. Book Slot
    if (allocatedDriverId !== 'UNALLOCATED') {
      await tx.driverAvailability.create({
        data: {
          driverId: allocatedDriverId,
          date: params.deliveryDetails.date,
          timeSlot: params.deliveryDetails.slot,
          status: 'UNAVAILABLE'
        }
      });
    }

    // 4. Create Email Logs (ONLY if allocated)
    let allocatedDriverEmail: string | undefined;

    if (allocatedDriverId !== 'UNALLOCATED') {
      await tx.emailLog.create({
        data: {
          orderId: order.id,
          toEmail: params.customerDetails.email,
          templateType: 'CLIENT_CONFIRMATION',
          status: 'SUCCESS'
        }
      });

      const driver = await tx.driver.findUnique({ where: { id: allocatedDriverId } });
      if (driver) {
        allocatedDriverEmail = driver.email;
        await tx.emailLog.create({
          data: {
            orderId: order.id,
            toEmail: driver.email,
            templateType: 'DRIVER_NOTIFICATION',
            status: 'SUCCESS'
          }
        });
      }
    }

    return { order, allocatedDriverEmail };
  }, {
    maxWait: 5000, // default is 2000
    timeout: 15000, // default is 5000
  });

  // Clear cart cookie since we successfully created the order
  const cookieStore = await cookies();
  cookieStore.delete('hab_cart_state');

  // Fire off real emails asynchronously ONLY if allocated
  if (orderId.allocatedDriverEmail) {
    sendCustomerConfirmationEmail(orderId.order, params.customerDetails.email).catch(console.error);
    sendDriverNotificationEmail(orderId.order, orderId.allocatedDriverEmail).catch(console.error);
  }

  return orderId.order.id;
}
