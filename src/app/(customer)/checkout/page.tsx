import React from 'react';
import CheckoutClient from '@/components/customer/CheckoutClient';
import { getCartState } from '@/app/actions/cart';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const cartState = await getCartState();
  
  // Let's pass the active postcode mappings so the client can filter dates/drivers easily if needed.
  // Actually, we can just fetch slots via a Server Action when the user picks a date.
  
  return (
    <div className="bg-[#F8F7F4] min-h-screen py-12">
      <div className="max-w-[1000px] mx-auto px-6">
        <h1 className="text-3xl font-heading font-bold text-[var(--color-brand-charcoal)] mb-8 text-center">
          Secure Checkout
        </h1>
        <CheckoutClient initialCartState={cartState} />
      </div>
    </div>
  );
}
