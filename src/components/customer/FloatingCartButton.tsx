'use client';

import React from 'react';
import { useCart } from '@/components/customer/CartProvider';

export default function FloatingCartButton() {
  const { state, openCart } = useCart();

  const hireCount = state.hireItems.reduce((acc, item) => acc + item.quantity, 0);
  const buyCount = state.buyItems.reduce((acc, item) => acc + item.quantity, 0);

  // If both carts are empty, we can still show it or hide it. Let's always show it so they know it exists.
  // Actually, usually floating carts appear when there's at least one item, but the image shows it explicitly as a toggle.
  
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex shadow-xl rounded-md overflow-hidden border-2 border-white/20">
      <button 
        onClick={() => openCart('hire')}
        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--color-brand-orange)] text-white hover:bg-orange-700 transition-colors"
      >
        <span className="font-heading font-bold tracking-wider uppercase text-[15px]">Hire Cart</span>
        {hireCount > 0 && (
          <span className="flex items-center justify-center w-6 h-6 bg-white text-[var(--color-brand-orange)] rounded-full text-xs font-bold font-sans tabular-nums">
            {hireCount}
          </span>
        )}
      </button>

      <button 
        onClick={() => openCart('buy')}
        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--color-brand-charcoal)] text-white hover:bg-stone-800 transition-colors"
      >
        <span className="font-heading font-bold tracking-wider uppercase text-[15px]">Buy Cart</span>
        {buyCount > 0 && (
          <span className="flex items-center justify-center w-6 h-6 bg-white text-[var(--color-brand-charcoal)] rounded-full text-xs font-bold font-sans tabular-nums">
            {buyCount}
          </span>
        )}
      </button>
    </div>
  );
}
