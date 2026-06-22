import { Resend } from 'resend';
import { Order } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

// On Resend's free tier, you can only send from onboarding@resend.dev to the email address you verified your account with.
const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendCustomerConfirmationEmail(order: Order, customerEmail: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your order!</h2>
          <p>Hi ${order.customerName},</p>
          <p>We have successfully received your order <strong>${order.orderNumber}</strong>.</p>
          
          <h3>Delivery Details</h3>
          <p>
            <strong>Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}<br/>
            <strong>Time Window:</strong> ${order.deliverySlot}<br/>
            <strong>Address:</strong> ${order.deliveryAddress}, ${order.deliverySuburb} ${order.deliveryPostcode}
          </p>

          <h3>Order Summary</h3>
          <p>
            <strong>Total Paid:</strong> $${order.grandTotal.toFixed(2)}
          </p>
          
          <p>If you have any questions, feel free to reply to this email.</p>
          <br/>
          <p>Best regards,<br/>The Hire A Box Team</p>
        </div>
      `
    });
    return data;
  } catch (error) {
    console.error('Failed to send customer email:', error);
    return null;
  }
}

export async function sendDriverNotificationEmail(order: Order, driverEmail: string) {
  try {
    // OVERRIDE FOR TESTING: Send all driver emails to the verified Resend sandbox email
    const overrideEmail = 'mhammsulaiman2909@gmail.com';
    
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: overrideEmail,
      subject: `[TEST ROUTING] New Job Allocated to ${driverEmail} - ${order.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Delivery Job Allocated</h2>
          <p>A new order has been allocated to your schedule.</p>
          
          <h3>Job Details</h3>
          <p>
            <strong>Order Number:</strong> ${order.orderNumber}<br/>
            <strong>Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}<br/>
            <strong>Time Window:</strong> ${order.deliverySlot}<br/>
            <strong>Delivery Address:</strong> ${order.deliveryAddress}, ${order.deliverySuburb} ${order.deliveryPostcode}
          </p>

          <h3>Customer Details</h3>
          <p>
            <strong>Name:</strong> ${order.customerName}<br/>
            <strong>Phone:</strong> ${order.customerPhone}
          </p>
          
          <p>Please check your driver portal for full itemized details.</p>
        </div>
      `
    });
    return data;
  } catch (error) {
    console.error('Failed to send driver email:', error);
    return null;
  }
}
