import React from 'react';
import { PrismaClient, OrderType } from '@prisma/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const params = await searchParams;
  if (!params.orderId) {
    redirect('/');
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: { include: { product: true } } }
  });

  if (!order) {
    redirect('/');
  }

  const isHire = order.type === OrderType.HIRE;

  return (
    <div className="bg-[#F8F7F4] min-h-screen py-12 px-6">
      <div className="max-w-[600px] mx-auto bg-white rounded-xl shadow-sm border border-[#E6E0D4] overflow-hidden">
        <div className="bg-[var(--color-brand-charcoal)] text-white text-center py-10 px-6">
          <div className="w-16 h-16 bg-[var(--color-brand-orange)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Order Confirmed!</h1>
          <p className="text-stone-300">Thank you for choosing Hire a Box.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-[#6B6862] font-semibold uppercase tracking-wider mb-1">Order Number</p>
            <p className="text-2xl font-mono font-bold text-[var(--color-brand-charcoal)]">{order.orderNumber}</p>
          </div>

          <div className="bg-[#FDFCFB] border border-[#E6E0D4] rounded-lg p-5 text-sm space-y-3">
            <h3 className="font-bold text-[var(--color-brand-charcoal)] border-b border-[#E6E0D4] pb-2 mb-3">Delivery Details</h3>
            <div className="flex justify-between">
              <span className="text-[#6B6862]">Name</span>
              <span className="font-medium text-right">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6862]">Address</span>
              <span className="font-medium text-right">{order.deliveryAddress}, {order.deliverySuburb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6862]">Date</span>
              <span className="font-medium text-right">{new Date(order.deliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6862]">Time Window</span>
              <span className="font-medium text-right">{order.deliverySlot}</span>
            </div>
          </div>

          {isHire && order.depositTotal && Number(order.depositTotal) > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-sm text-orange-900">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Deposit Reassurance
              </h3>
              <p>Your order includes a fully refundable deposit of <strong>${Number(order.depositTotal).toFixed(2)}</strong>. This will be automatically refunded to your card once the boxes are collected in good condition.</p>
            </div>
          )}

          <div className="border-t border-[#E6E0D4] pt-6">
            <h3 className="font-bold text-[var(--color-brand-charcoal)] mb-4 text-center">What happens next?</h3>
            <ul className="text-sm text-[#6B6862] space-y-3 pl-4 list-disc marker:text-[var(--color-brand-orange)]">
              <li>You will receive an email confirmation shortly.</li>
              <li>Our driver will arrive within your selected time window.</li>
              <li>For any changes, please contact our support team quoting your order number.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cross-Sell Section */}
      <div className="max-w-[800px] mx-auto mt-12 text-center">
        <h2 className="text-2xl font-heading font-bold text-[var(--color-brand-charcoal)] mb-2">Complete your move</h2>
        <p className="text-[#6B6862] mb-8">Take the stress out of moving with our trusted partner services.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E6E0D4] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h3 className="font-bold text-[var(--color-brand-charcoal)] mb-2">Hire A Mover</h3>
            <p className="text-xs text-[#6B6862] mb-4">Professional removalists for a seamless transition.</p>
            <div className="text-sm font-semibold text-[var(--color-brand-orange)] mb-4 bg-orange-50 py-1 px-2 rounded inline-block">Get 10% back on your boxes</div>
            <Link href="#" className="block w-full py-2 border border-[#E6E0D4] text-[var(--color-brand-charcoal)] rounded text-sm font-semibold hover:bg-stone-50 transition-colors">Book a Mover</Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E6E0D4] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h3 className="font-bold text-[var(--color-brand-charcoal)] mb-2">Hire A Packer</h3>
            <p className="text-xs text-[#6B6862] mb-4">Expert packing and unpacking services.</p>
            <div className="text-sm font-semibold text-[var(--color-brand-orange)] mb-4 bg-orange-50 py-1 px-2 rounded inline-block">Get 10% back on your boxes</div>
            <Link href="#" className="block w-full py-2 border border-[#E6E0D4] text-[var(--color-brand-charcoal)] rounded text-sm font-semibold hover:bg-stone-50 transition-colors">Book a Packer</Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E6E0D4] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M2 15h10"></path><path d="M2 18h10"></path></svg>
            </div>
            <h3 className="font-bold text-[var(--color-brand-charcoal)] mb-2">Hire Storage</h3>
            <p className="text-xs text-[#6B6862] mb-4">Secure, affordable storage facilities.</p>
            <div className="text-sm font-semibold text-[var(--color-brand-orange)] mb-4 bg-orange-50 py-1 px-2 rounded inline-block">Get 10% back on your boxes</div>
            <Link href="#" className="block w-full py-2 border border-[#E6E0D4] text-[var(--color-brand-charcoal)] rounded text-sm font-semibold hover:bg-stone-50 transition-colors">Find Storage</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
