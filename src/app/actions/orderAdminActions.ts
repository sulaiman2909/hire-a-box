'use server';

import { OrderStatus, OrderType } from '@prisma/client';
import { calculateOrderTotals } from '@/lib/domain/pricing';
import { calculateDeposits } from '@/lib/domain/deposits';
import { sendCustomerConfirmationEmail, sendDriverNotificationEmail } from '@/lib/domain/emails';
import { allocateDriver } from '@/lib/domain/allocation';
import { prisma } from '@/lib/prisma';



export async function updateOrderAllocation(orderId: string, driverId: string | null, date: string, slot: string) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const newDateObj = new Date(date);

    // Check if the new slot is explicitly blocked and validate city
    if (driverId) {
      // Validate City Match
      const assignedDriver = await tx.driver.findUnique({ where: { id: driverId } });
      if (assignedDriver) {
        const mapping = await tx.postcodeMapping.findUnique({ where: { postcode: order.deliveryPostcode } });
        if (mapping) {
          const expectedPrimaryDriver = await tx.driver.findUnique({ where: { id: mapping.driverId } });
          if (expectedPrimaryDriver && expectedPrimaryDriver.city !== assignedDriver.city) {
            throw new Error(`Cannot assign a driver from ${assignedDriver.city} to a postcode in ${expectedPrimaryDriver.city}.`);
          }
        }
      }

      const newAvail = await tx.driverAvailability.findFirst({
        where: {
          driverId: driverId,
          date: newDateObj,
          timeSlot: slot
        }
      });

      if (newAvail && newAvail.status === 'UNAVAILABLE') {
        throw new Error('This slot is explicitly blocked out for this driver in the calendar.');
      }
    }

    // 3. Update Order
    const newStatus = driverId ? OrderStatus.ALLOCATED : OrderStatus.UNALLOCATED;
    
    // Don't downgrade status if it's already DELIVERED or COLLECTED
    let finalStatus = order.status;
    if (order.status === 'PENDING' || order.status === 'UNALLOCATED' || order.status === 'ALLOCATED') {
      finalStatus = newStatus;
    }

    // If changing the slot or driver, we must free the old slot block
    if (order.driverId && order.deliveryDate && order.deliverySlot) {
      await tx.driverAvailability.deleteMany({
        where: {
          driverId: order.driverId,
          date: order.deliveryDate,
          timeSlot: order.deliverySlot,
          status: 'UNAVAILABLE'
        }
      });
    }

    // Block the new slot if allocated to a driver
    if (driverId) {
      await tx.driverAvailability.create({
        data: {
          driverId,
          date: newDateObj,
          timeSlot: slot,
          status: 'UNAVAILABLE'
        }
      });
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        driverId,
        deliveryDate: newDateObj,
        deliverySlot: slot,
        status: finalStatus
      }
    });
  }).then(() => ({ success: true })).catch(err => ({ error: err.message || 'An unknown error occurred.' }));
}

export async function updateOrderDeliveryAddress(
  orderId: string, 
  data: { deliveryAddress: string, deliverySuburb: string, deliveryPostcode: string, pickupPostcode?: string }
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const drivers = await tx.driver.findMany();
    const mappings = await tx.postcodeMapping.findMany();

    // 1. Check if serviceable postcode at all
    const isServiceable = mappings.some(m => m.postcode === data.deliveryPostcode);
    if (!isServiceable) {
      throw new Error(`Postcode ${data.deliveryPostcode} is not a serviceable area.`);
    }

    // 2. See if we need to re-allocate
    const dateStr = order.deliveryDate.toISOString().split('T')[0];
    const allBlockouts = await tx.driverAvailability.findMany({
      where: { date: order.deliveryDate, timeSlot: order.deliverySlot }
    });

    // EXCEPTION: If this order is currently allocated, we must ignore its own blockout
    // otherwise the driver will appear "UNAVAILABLE" to themselves for this same time slot!
    const blockouts = allBlockouts.filter(b => b.driverId !== order.driverId);

    const newDriverId = allocateDriver(
      data.deliveryPostcode,
      dateStr,
      order.deliverySlot,
      drivers.map(d => ({ id: d.id, city: d.city, isActive: d.isActive })),
      mappings.map(m => ({ postcode: m.postcode, driverId: m.driverId })),
      blockouts.map(b => ({ driverId: b.driverId, date: b.date.toISOString().split('T')[0], timeSlot: b.timeSlot, status: b.status as 'AVAILABLE' | 'UNAVAILABLE' }))
    );

    let warningMsg;
    let finalStatus = order.status;
    let finalDriverId = order.driverId;

    if (newDriverId === 'UNALLOCATED') {
      finalDriverId = null;
      if (order.status === 'ALLOCATED') {
        finalStatus = 'UNALLOCATED';
      }
      warningMsg = `Address saved, but no drivers are available for postcode ${data.deliveryPostcode} at ${dateStr} (${order.deliverySlot}). The order has been moved to UNALLOCATED. Please change the time slot or manually assign a driver.`;
      
      // Free old slot block if existed
      if (order.driverId) {
        await tx.driverAvailability.deleteMany({
          where: {
            driverId: order.driverId,
            date: order.deliveryDate,
            timeSlot: order.deliverySlot,
            status: 'UNAVAILABLE'
          }
        });
      }
    } else {
      // Driver was found. If it's different from the old driver, swap blockouts.
      if (order.driverId !== newDriverId) {
        if (order.driverId) {
           await tx.driverAvailability.deleteMany({
             where: { driverId: order.driverId, date: order.deliveryDate, timeSlot: order.deliverySlot, status: 'UNAVAILABLE' }
           });
        }
        await tx.driverAvailability.create({
           data: { driverId: newDriverId, date: order.deliveryDate, timeSlot: order.deliverySlot, status: 'UNAVAILABLE' }
        });
        finalDriverId = newDriverId;
        if (order.status === 'UNALLOCATED') {
          finalStatus = 'ALLOCATED';
        }
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        deliveryAddress: data.deliveryAddress,
        deliverySuburb: data.deliverySuburb,
        deliveryPostcode: data.deliveryPostcode,
        pickupPostcode: data.pickupPostcode,
        driverId: finalDriverId,
        status: finalStatus
      }
    });

    return { success: true, warning: warningMsg };
  }).catch(err => ({ error: err.message || 'An unknown error occurred.' }));
}

export async function updateOrderPayment(orderId: string, amountPaid: number) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { amountPaid }
  }).then(() => ({ success: true })).catch(err => ({ error: err.message || 'An unknown error occurred.' }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status }
  }).then(() => ({ success: true })).catch(err => ({ error: err.message || 'An unknown error occurred.' }));
}

export async function resendOrderEmail(orderId: string, type: 'CLIENT' | 'DRIVER') {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        driver: true,
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) throw new Error('Order not found');

    if (type === 'CLIENT') {
      const result = await sendCustomerConfirmationEmail(order, order.customerEmail);
      await prisma.emailLog.create({
        data: {
          orderId: order.id,
          toEmail: order.customerEmail,
          templateType: 'CLIENT_CONFIRMATION',
          status: result ? 'SUCCESS' : 'FAILED'
        }
      });
      return { success: result };
    } else if (type === 'DRIVER') {
      if (!order.driverId || !order.driver) {
        throw new Error('No driver allocated');
      }
      const result = await sendDriverNotificationEmail(order, order.driver.email);
      await prisma.emailLog.create({
        data: {
          orderId: order.id,
          toEmail: order.driver.email,
          templateType: 'DRIVER_NOTIFICATION',
          status: result ? 'SUCCESS' : 'FAILED'
        }
      });
      return { success: result };
    }
  } catch (err: any) {
    return { error: err.message || 'An unknown error occurred.' };
  }
}

export async function deleteOrder(orderId: string) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    // Free the slot block if allocated
    if (order.driverId && order.deliveryDate && order.deliverySlot) {
      await tx.driverAvailability.deleteMany({
        where: {
          driverId: order.driverId,
          date: order.deliveryDate,
          timeSlot: order.deliverySlot,
          status: 'UNAVAILABLE'
        }
      });
    }

    // Delete all relations manually since we don't have onDelete: Cascade
    await tx.emailLog.deleteMany({ where: { orderId } });
    await tx.orderItem.deleteMany({ where: { orderId } });

    // Finally delete the order
    await tx.order.delete({ where: { id: orderId } });

    return { success: true };
  }).catch(err => ({ error: err.message || 'An unknown error occurred.' }));
}

export async function resolveDeposit(orderId: string, amount: number, type: 'REFUND' | 'FORFEIT', reason: string = '') {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    if (order.type !== 'HIRE') throw new Error('Deposit resolution only applies to hire orders');

    if (amount <= 0) throw new Error('Amount must be greater than zero');

    const totalDeposit = Number(order.depositTotal);
    const refunded = Number(order.depositRefunded);
    const forfeited = Number(order.depositForfeited);
    const remaining = totalDeposit - refunded - forfeited;

    // Small epsilon for floating point errors
    if (amount > remaining + 0.001) {
      throw new Error(`Cannot resolve $${amount.toFixed(2)}. Only $${remaining.toFixed(2)} deposit remaining.`);
    }

    if (type === 'REFUND') {
      // --- MOCK eWAY PAYMENT GATEWAY INTEGRATION ---
      // In production, we would use the eWAY SDK here: eway.refund(transactionId, amount)
      console.log(`[eWay Mock API] Initiating refund of $${amount.toFixed(2)} for Order ${orderId}...`);
      
      // Simulate 1.5 seconds of network latency to the payment gateway
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate a 95% success rate for the refund processing
      const ewayResponseMock = Math.random() > 0.05 ? { status: 200, message: 'Approved' } : { status: 400, message: 'Card Expired' };
      
      if (ewayResponseMock.status !== 200) {
        throw new Error(`Payment Gateway Error: ${ewayResponseMock.message}. Refund aborted.`);
      }
      
      console.log(`[eWay Mock API] Refund successful! Proceeding with database update.`);
      // ---------------------------------------------
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        depositRefunded: type === 'REFUND' ? { increment: amount } : undefined,
        depositForfeited: type === 'FORFEIT' ? { increment: amount } : undefined,
      }
    });

    await tx.depositResolution.create({
      data: {
        orderId,
        amount,
        type,
        reason
      }
    });
    
    return type === 'REFUND' 
      ? `[eWay API Mock] Successfully processed refund of $${amount.toFixed(2)} to customer card.`
      : '';
  }).then((msg) => ({ success: true, message: msg })).catch(err => ({ error: err.message || 'An unknown error occurred.' }));
}
