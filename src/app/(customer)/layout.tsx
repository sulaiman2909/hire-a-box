import React from 'react';
import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerFooter from '@/components/customer/CustomerFooter';
import { CartProvider } from '@/components/customer/CartProvider';
import GlobalCart from '@/components/customer/GlobalCart';
import { getCartState } from '@/app/actions/cart';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialCartState = await getCartState();

  return (
    <div className="bg-[var(--color-brand-warm-white)] font-sans text-[var(--color-brand-charcoal)] min-h-screen flex flex-col">
      <CartProvider initialState={initialCartState}>
        <CustomerHeader />
        <GlobalCart />
        <main className="flex-grow">
          {children}
        </main>
        <CustomerFooter />
      </CartProvider>
    </div>
  );
}
