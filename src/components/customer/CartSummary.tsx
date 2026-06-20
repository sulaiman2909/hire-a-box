'use client';

import React, { useState, useEffect } from 'react';
import { checkServiceability, applyPromoCode } from '@/app/actions/checkout';
import { CartState } from '@/app/actions/cart';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discountAmount?: number;
  depositTotal?: number;
  total: number;
  threshold: number;
  onCheckout: () => void;
  isValid: boolean;
  isOpen: boolean;
  onClose: () => void;
  onClearCart?: () => void;
  children?: React.ReactNode;
  activeMode?: 'hire' | 'buy';
  cartState?: CartState;
  setDeliveryPostcode?: (pc: string) => void;
  setPickupPostcode?: (pc: string) => void;
  setPromoCode?: (code: string) => void;
}

export default function CartSummary({
  subtotal,
  deliveryFee,
  discountAmount = 0,
  depositTotal,
  total,
  threshold,
  onCheckout,
  isValid,
  isOpen,
  onClose,
  onClearCart,
  children,
  activeMode = 'hire',
  cartState,
  setDeliveryPostcode,
  setPickupPostcode,
  setPromoCode
}: CartSummaryProps) {
  const amountAway = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / threshold) * 100);

  const [localDelivery, setLocalDelivery] = useState(cartState?.deliveryPostcode || '');
  const [localPickup, setLocalPickup] = useState(cartState?.pickupPostcode || '');
  const [localPromo, setLocalPromo] = useState(cartState?.promoCode || '');
  
  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  const [serviceMsg, setServiceMsg] = useState('');

  const [promoValid, setPromoValid] = useState<boolean | null>(cartState?.promoCode ? true : null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [promoMsg, setPromoMsg] = useState('');

  useEffect(() => {
    if (cartState?.deliveryPostcode) {
      setLocalDelivery(cartState.deliveryPostcode);
    }
    if (cartState?.pickupPostcode) {
      setLocalPickup(cartState.pickupPostcode);
    }
    if (cartState?.promoCode) {
      setLocalPromo(cartState.promoCode);
      setPromoValid(true);
      setPromoMsg('Promo applied from saved cart.');
    } else {
      setLocalPromo('');
      setPromoValid(null);
      setPromoMsg('');
    }
  }, [cartState?.deliveryPostcode, cartState?.pickupPostcode, cartState?.promoCode]);

  const handleCheckServiceability = async () => {
    setCheckingServiceability(true);
    setServiceMsg('');
    try {
      const isDeliveryValid = await checkServiceability(localDelivery);
      
      if (!isDeliveryValid) {
        setServiceable(false);
        setServiceMsg('Delivery postcode is not serviceable. Please switch to Buy mode or change postcode.');
        setCheckingServiceability(false);
        return;
      }

      if (activeMode === 'hire') {
        if (!localPickup) {
           setServiceable(false);
           setServiceMsg('Please enter a pickup postcode for hire orders.');
           setCheckingServiceability(false);
           return;
        }
        const isPickupValid = await checkServiceability(localPickup);
        if (!isPickupValid) {
          setServiceable(false);
          setServiceMsg('Pickup postcode is not serviceable. Please switch to Buy mode or change postcode.');
          setCheckingServiceability(false);
          return;
        }
      }

      setServiceable(true);
      setServiceMsg('Great! We service your area.');
      if (setDeliveryPostcode) setDeliveryPostcode(localDelivery);
      if (setPickupPostcode && localPickup) setPickupPostcode(localPickup);
      
    } catch (err) {
      setServiceable(false);
      setServiceMsg('Error checking serviceability.');
    }
    setCheckingServiceability(false);
  };

  const handleApplyPromo = async () => {
    if (!localPromo) return;
    setCheckingPromo(true);
    try {
      const res = await applyPromoCode(localPromo);
      setPromoValid(res.valid);
      setPromoMsg(res.message);
      if (res.valid && setPromoCode) {
        setPromoCode(localPromo);
      } else if (!res.valid && setPromoCode) {
        setPromoCode(''); // Clear if invalid
      }
    } catch (err) {
      setPromoValid(false);
      setPromoMsg('Error checking promo code.');
    }
    setCheckingPromo(false);
  };

  const canCheckout = isValid && serviceable === true;

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[var(--color-brand-charcoal)]/40 backdrop-blur-[2px] transition-opacity duration-300 z-[99]"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      <div 
        className="fixed top-0 right-0 h-[100dvh] w-full max-w-[440px] bg-[var(--bg-color)] shadow-[-10px_0_30px_rgba(43,43,40,0.1)] z-[100] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-l-xl overflow-hidden"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)] bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] m-0">Your Order</h2>
            {isValid && onClearCart && (
              <button onClick={onClearCart} className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition-colors mt-1">
                Clear Cart
              </button>
            )}
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-[var(--text-secondary)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Free Delivery Progress */}
        {isValid && (
          <div className="px-6 py-4 bg-[var(--primary-50)] border-b border-[var(--border-color)]">
            <div className="flex justify-between mb-2 text-[13px] font-semibold text-[var(--text-primary)]">
              <span>Free Delivery</span>
              <span className={amountAway === 0 ? 'text-[var(--primary-600)]' : 'text-[var(--text-secondary)]'}>
                {amountAway === 0 ? 'Unlocked!' : `$${amountAway.toFixed(2)} away`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-500 ease-out ${amountAway === 0 ? 'bg-[var(--primary-500)]' : 'bg-[var(--color-brand-kraft)]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-grow overflow-y-auto px-6 flex flex-col bg-white">
          {children}
        </div>

        {/* Fixed Tools & Totals Section */}
        {isValid && (
          <div className="mt-auto bg-[#FDFCFB] border-t border-[var(--border-color)] p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-2">
            
            {/* Serviceability & Promo Tools (Compact) */}
            <div className="flex flex-col gap-1.5">
              {/* Serviceability */}
              <div className="flex flex-col gap-1.5 bg-stone-50 p-2 rounded border border-stone-200">
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Deliver to" 
                    value={localDelivery}
                    onChange={(e) => setLocalDelivery(e.target.value)}
                    className="flex-1 text-[11px] p-1 border border-stone-300 rounded focus:ring-1 focus:ring-[var(--color-brand-orange)] outline-none"
                  />
                  {activeMode === 'hire' && (
                    <input 
                      type="text" 
                      placeholder="Pick up from" 
                      value={localPickup}
                      onChange={(e) => setLocalPickup(e.target.value)}
                      className="flex-1 text-[11px] p-1 border border-stone-300 rounded focus:ring-1 focus:ring-[var(--color-brand-orange)] outline-none"
                    />
                  )}
                  <button 
                    onClick={handleCheckServiceability}
                    disabled={checkingServiceability || !localDelivery || (activeMode === 'hire' && !localPickup)}
                    className="px-2 py-1 bg-[var(--color-brand-charcoal)] text-white text-[11px] font-semibold rounded hover:bg-stone-800 disabled:opacity-50 transition-colors"
                  >
                    {checkingServiceability ? '...' : 'Check'}
                  </button>
                </div>
                {serviceable !== null && (
                  <p className={`text-[11px] font-semibold ${serviceable ? 'text-green-600' : 'text-red-500'}`}>
                    {serviceMsg}
                  </p>
                )}
              </div>

              {/* Promo Code */}
              <div>
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Promo code" 
                    value={localPromo}
                    onChange={(e) => setLocalPromo(e.target.value)}
                    className="flex-1 text-[11px] p-1 border border-stone-300 rounded focus:ring-1 focus:ring-[var(--color-brand-orange)] outline-none uppercase"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={checkingPromo || !localPromo}
                    className="px-3 py-1 bg-stone-200 text-[var(--color-brand-charcoal)] text-[11px] font-semibold rounded hover:bg-stone-300 disabled:opacity-50 transition-colors"
                  >
                    {checkingPromo ? '...' : 'Apply'}
                  </button>
                </div>
                {promoValid === null && !promoMsg && (
                  <p className="text-[10px] text-stone-400 mt-1">Use code TEST for 10% off (Demo Purposes)</p>
                )}
                {promoValid !== null && promoMsg && (
                  <p className={`text-[11px] font-semibold mt-1 ${promoValid ? 'text-green-600' : 'text-red-500'}`}>
                    {promoMsg}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-dashed border-[#E6E0D4] my-0.5"></div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-[#6B6862]">
                <span>Subtotal</span>
                <span className="font-medium text-[var(--color-brand-charcoal)]">${subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6B6862]">
                <span>Delivery Fee</span>
                <span className={`font-medium ${deliveryFee === 0 ? 'text-[var(--color-brand-orange)]' : 'text-[var(--color-brand-charcoal)]'}`}>
                  {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {depositTotal !== undefined && (
                <div className="flex justify-between text-[#6B6862]">
                  <span>Refundable Deposit</span>
                  <span className="font-medium text-[var(--color-brand-charcoal)]">${depositTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end mt-0.5 mb-1.5">
              <span className="text-[13px] font-heading font-bold text-[var(--color-brand-charcoal)]">Total</span>
              <span className="text-[15px] font-bold text-[var(--color-brand-orange)]">
                ${(total + (depositTotal || 0)).toFixed(2)}
              </span>
            </div>

            <button 
              className={`w-full text-[13px] font-semibold py-2 rounded shadow-sm transition-all ${canCheckout ? 'bg-[var(--color-brand-orange)] text-white hover:bg-orange-700 hover:shadow-md' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
              onClick={onCheckout}
              disabled={!canCheckout}
            >
              {serviceable === false ? 'Not Serviceable' : serviceable === null ? 'Check Postcode to Proceed' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
