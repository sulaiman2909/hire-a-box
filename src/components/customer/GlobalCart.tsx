'use client';

import React from 'react';
import { useCart } from './CartProvider';
import CartSummary from './CartSummary';
import { calculateOrderTotals, FREE_DELIVERY_THRESHOLD_BUY, FREE_DELIVERY_THRESHOLD_HIRE } from '@/lib/domain/pricing';
import { calculateDeposits } from '@/lib/domain/deposits';
import { calculateDiscount } from '@/lib/domain/promos';
import { OrderType } from '@prisma/client';
import { getProductImageUrl } from '@/lib/domain/images';
import { useRouter } from 'next/navigation';

export default function GlobalCart() {
  const router = useRouter();
  const { 
    state, isDrawerOpen, closeCart, activeMode, updateQuantity, clearCart,
    setDeliveryPostcode, setPickupPostcode, setPromoCode, setActiveMode
  } = useCart();

  const items = activeMode === 'hire' ? state.hireItems : state.buyItems;
  const orderType = activeMode === 'hire' ? OrderType.HIRE : OrderType.BUY;
  const threshold = activeMode === 'hire' ? FREE_DELIVERY_THRESHOLD_HIRE : FREE_DELIVERY_THRESHOLD_BUY;

  const totals = calculateOrderTotals(orderType, items);
  const depositTotal = activeMode === 'hire' ? calculateDeposits(items) : undefined;
  
  const subtotalBeforeDiscount = activeMode === 'hire' ? (totals.hireTotal - totals.deliveryFee) : totals.saleTotal - totals.deliveryFee;
  const discountAmount = calculateDiscount(subtotalBeforeDiscount, state.promoCode);
  const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;
  
  const totalAmount = (activeMode === 'hire' ? totals.hireTotal : totals.saleTotal) - discountAmount;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <CartSummary
      isOpen={isDrawerOpen}
      onClose={closeCart}
      onClearCart={() => clearCart(activeMode)}
      subtotal={subtotalBeforeDiscount}
      discountAmount={discountAmount}
      deliveryFee={totals.deliveryFee}
      depositTotal={depositTotal}
      total={totalAmount}
      threshold={threshold}
      onCheckout={handleCheckout}
      isValid={items.length > 0}
      activeMode={activeMode}
      cartState={state}
      setDeliveryPostcode={setDeliveryPostcode}
      setPickupPostcode={setPickupPostcode}
      setPromoCode={setPromoCode}
      setActiveMode={setActiveMode}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
          <div className="text-4xl mb-4 opacity-50">🛒</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Your {activeMode} cart is empty</h3>
          <p className="text-sm text-[var(--text-secondary)]">Looks like you haven't added anything yet.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {items.map((item, index) => (
            <div 
              key={`${item.productId}-${item.isUsed}`} 
              className={`flex items-start gap-3 py-4 ${index !== items.length - 1 ? 'border-b border-[var(--border-color)]' : ''}`}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center flex-shrink-0 border border-[var(--border-color)] overflow-hidden">
                <img src={getProductImageUrl(item.name)} alt={item.name} className="w-full h-full object-contain p-0.5" />
              </div>
              
              {/* Info Column */}
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-semibold text-[var(--color-brand-charcoal)] text-[13px] leading-snug break-words">
                  {item.name} {item.isUsed ? '(Used)' : ''}
                </h4>
                <div className="text-xs text-[#9A9791] mt-0.5 font-medium">
                  ${item.price.toFixed(2)} each
                </div>
              </div>
              
              {/* Price & Stepper Column */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="text-[13px] font-bold text-[var(--color-brand-charcoal)]">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <div className="flex items-center border border-[#E6E0D4] rounded bg-white shadow-sm overflow-hidden">
                  <button 
                    onClick={() => updateQuantity(activeMode, item, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#6B6862] hover:bg-stone-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <span className="w-6 text-center font-semibold text-xs text-[var(--color-brand-charcoal)]">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(activeMode, item, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-[var(--color-brand-orange)] hover:bg-stone-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CartSummary>
  );
}
