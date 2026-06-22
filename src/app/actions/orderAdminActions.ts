'use server';

import { OrderStatus, OrderType } from '@prisma/client';
import { calculateOrderTotals } from '@/lib/domain/pricing';
import { calculateDeposits } from '@/lib/domain/deposits';
import { sendCustomerConfirmationEmail, sendDriverNotificationEmail } from '@/lib/domain/emails';
import { prisma } from '@/lib/prisma';



export async function updateOrderAllocation(orderId: string, driverId: string | null, date: string, slot: string) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const newDateObj = new Date(date);

    // Check if the new slot is explicitly blocked
    if (driverId) {
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

    return updatedOrder;
  });
}

export async function updateOrderDeliveryAddress(
  orderId: string, 
  data: { deliveryAddress: string, deliverySuburb: string, deliveryPostcode: string, pickupPostcode?: string }
) {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryAddress: data.deliveryAddress,
      deliverySuburb: data.deliverySuburb,
      deliveryPostcode: data.deliveryPostcode,
      pickupPostcode: data.pickupPostcode,
    }
  });
}

export async function updateOrderPayment(orderId: string, amountPaid: number) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { amountPaid }
  });
}

export async function resendOrderEmail(orderId: string, type: 'CLIENT' | 'DRIVER') {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { driver: true }
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
    return result;
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
    return result;
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
    await tx.refund.deleteMany({ where: { orderId } });
    await tx.emailLog.deleteMany({ where: { orderId } });
    await tx.orderItem.deleteMany({ where: { orderId } });

    // Finally delete the order
    await tx.order.delete({ where: { id: orderId } });

    return true;
  });
}
