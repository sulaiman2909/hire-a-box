'use client';

import React, { useState, useEffect } from 'react';
import { CartState } from '@/app/actions/cart';
import { calculateOrderTotals, FREE_DELIVERY_THRESHOLD_HIRE, FREE_DELIVERY_THRESHOLD_BUY } from '@/lib/domain/pricing';
import { calculateDeposits } from '@/lib/domain/deposits';
import { calculateDiscount } from '@/lib/domain/promos';
import { OrderType } from '@prisma/client';
import { getAvailableSlots } from '@/app/actions/checkout';
import { createOrder } from '@/app/actions/createOrder';
import { useRouter } from 'next/navigation';

interface CheckoutClientProps {
  initialCartState: CartState;
}

export default function CheckoutClient({ initialCartState }: CheckoutClientProps) {
  const router = useRouter();
  
  // Decide if we are checking out Hire or Buy based on which has items.
  // Priority to Hire if both exist, but generally they shouldn't checkout both at once without separating.
  // For simplicity, assume active mode is hire if hireItems exist, else buy.
  const isHire = initialCartState.hireItems.length > 0;
  const items = isHire ? initialCartState.hireItems : initialCartState.buyItems;
  const orderType = isHire ? OrderType.HIRE : OrderType.BUY;
  
  // Calculations
  const totals = calculateOrderTotals(orderType, items);
  const depositTotal = isHire ? calculateDeposits(items) : 0;
  const subtotalBeforeDiscount = isHire ? (totals.hireTotal - totals.deliveryFee) : totals.saleTotal - totals.deliveryFee;
  const discountAmount = calculateDiscount(subtotalBeforeDiscount, initialCartState.promoCode);
  const totalAmount = (isHire ? totals.hireTotal : totals.saleTotal) - discountAmount + depositTotal;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    phone: '',
    street: '',
    addressLine2: '',
    suburb: initialCartState.deliveryPostcode || '', // Pre-filled and read-only
    deliveryDate: '',
    deliverySlot: '',
    specialInstructions: '',
    marketingOptIn: false,
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Payment State
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [paymentError, setPaymentError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch slots when date changes
  useEffect(() => {
    if (formData.deliveryDate && formData.suburb) {
      setLoadingSlots(true);
      getAvailableSlots(formData.suburb, formData.deliveryDate).then(slots => {
        setAvailableSlots(slots);
        setFormData(prev => ({ ...prev, deliverySlot: '' })); // Reset slot
        setLoadingSlots(false);
      });
    } else {
      setAvailableSlots([]);
    }
  }, [formData.deliveryDate, formData.suburb]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep1 = () => {
    return formData.firstName && formData.lastName && formData.email && formData.mobile && formData.street && formData.deliveryDate && formData.deliverySlot;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const validateCard = () => {
    // Basic format checks
    if (!paymentData.cardName || !paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv) {
      setPaymentError('All payment fields are required.');
      return false;
    }
    
    const num = paymentData.cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(num)) {
      setPaymentError('Invalid card number format.');
      return false;
    }
    
    // Luhn Check
    let sum = 0;
    let alternate = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    if (sum % 10 !== 0) {
      setPaymentError('Invalid card number (Luhn check failed).');
      return false;
    }

    if (!/^\d{3}$/.test(paymentData.cvv)) {
      setPaymentError('CVV must be 3 digits.');
      return false;
    }

    setPaymentError('');
    return true;
  };

  const handlePayment = async () => {
    if (!validateCard()) return;
    
    setIsProcessing(true);
    
    // MOCK GATEWAY: 4111 1111 1111 1111 is success
    const num = paymentData.cardNumber.replace(/\s+/g, '');
    if (num !== '4111111111111111') {
      setPaymentError('Payment declined. Please try another card.');
      setIsProcessing(false);
      return;
    }

    try {
      const orderId = await createOrder({
        cartState: initialCartState,
        customerDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobile
        },
        deliveryDetails: {
          address: `${formData.street}, ${formData.addressLine2}`,
          suburb: formData.suburb,
          postcode: formData.suburb, // In a real app, parse this properly. Here suburb holds postcode for serviceability
          date: new Date(formData.deliveryDate),
          slot: formData.deliverySlot
        }
      });
      
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err: any) {
      setPaymentError(err.message || 'Error processing order.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E6E0D4] overflow-hidden">
      {/* Progress Bar */}
      <div className="flex border-b border-[#E6E0D4] bg-[#FDFCFB]">
        {['Contact & Delivery', 'Review Order', 'Payment'].map((label, idx) => {
          const s = idx + 1;
          const isActive = step === s;
          const isDone = step > s;
          return (
            <div key={s} className={`flex-1 py-4 px-6 text-center text-sm font-semibold border-r border-[#E6E0D4] last:border-0 ${isActive ? 'bg-[var(--color-brand-charcoal)] text-white' : isDone ? 'text-[var(--color-brand-orange)]' : 'text-[#9A9791]'}`}>
              {s}. {label}
            </div>
          );
        })}
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-[var(--color-brand-charcoal)]">Contact Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none" />
              <input type="text" name="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none" />
              <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none col-span-2" />
              <input type="tel" name="mobile" placeholder="Mobile Number *" value={formData.mobile} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none" />
              <input type="tel" name="phone" placeholder="Phone Number (Optional)" value={formData.phone} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none" />
              <input type="text" name="company" placeholder="Company Name (Optional)" value={formData.company} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none col-span-2" />
            </div>

            <h2 className="text-xl font-bold text-[var(--color-brand-charcoal)] mt-8">Delivery Details</h2>
            <p className="text-xs text-[#9A9791] mb-4">P.O. Boxes not accepted</p>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="street" placeholder="Street Address *" value={formData.street} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none col-span-2" />
              <input type="text" name="addressLine2" placeholder="Apartment, suite, etc. (Optional)" value={formData.addressLine2} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none col-span-2" />
              <input type="text" name="suburb" value={formData.suburb} readOnly className="p-3 text-sm border border-[#E6E0D4] rounded-md bg-stone-100 text-[#6B6862] cursor-not-allowed col-span-2" placeholder="Postcode" title="Postcode locked from cart serviceability" />
              
              <div className="col-span-2 sm:col-span-1">
                <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleFormChange} className="w-full p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <select name="deliverySlot" value={formData.deliverySlot} onChange={handleFormChange} disabled={!formData.deliveryDate || loadingSlots} className="w-full p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none disabled:bg-stone-100 disabled:text-[#9A9791]">
                  <option value="">{loadingSlots ? 'Loading slots...' : 'Select time slot *'}</option>
                  {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                {formData.deliveryDate && !loadingSlots && availableSlots.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No slots available for this date.</p>
                )}
              </div>
              <textarea name="specialInstructions" placeholder="Special Delivery Instructions" value={formData.specialInstructions} onChange={handleFormChange} className="p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none col-span-2 h-24 resize-none" />
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={handleNext} disabled={!validateStep1()} className="px-8 py-3 bg-[var(--color-brand-orange)] text-white text-sm font-semibold rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors">
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-[var(--color-brand-charcoal)]">Review Your Order</h2>
            
            <div className="border border-[#E6E0D4] rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FDFCFB] border-b border-[#E6E0D4] text-[#6B6862]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold w-24 text-center">Qty</th>
                    <th className="px-4 py-3 font-semibold w-32 text-right">Unit Price</th>
                    <th className="px-4 py-3 font-semibold w-32 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D4]">
                  {items.map(item => (
                    <tr key={`${item.productId}-${item.isUsed}`}>
                      <td className="px-4 py-4 font-medium text-[var(--color-brand-charcoal)]">{item.name} {item.isUsed ? '(Used)' : ''}</td>
                      <td className="px-4 py-4 text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#FDFCFB] border border-[#E6E0D4] rounded-md p-6 w-full max-w-sm ml-auto space-y-3 text-sm">
              <div className="flex justify-between text-[#6B6862]">
                <span>Subtotal</span>
                <span>${subtotalBeforeDiscount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B6862]">
                <span>Delivery Fee</span>
                <span>{totals.deliveryFee === 0 ? 'FREE' : `$${totals.deliveryFee.toFixed(2)}`}</span>
              </div>
              {depositTotal > 0 && (
                <div className="flex justify-between text-[#6B6862]">
                  <span>Refundable Deposit</span>
                  <span>${depositTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-[#E6E0D4] flex justify-between font-bold text-lg text-[var(--color-brand-charcoal)]">
                <span>Total</span>
                <span className="text-[var(--color-brand-orange)]">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={handleBack} className="px-6 py-3 text-sm font-semibold text-[#6B6862] hover:text-[var(--color-brand-charcoal)]">
                Back to Details
              </button>
              <button onClick={handleNext} className="px-8 py-3 bg-[var(--color-brand-orange)] text-white text-sm font-semibold rounded-md hover:bg-orange-700 transition-colors">
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[var(--color-brand-charcoal)] text-center mb-2">Payment Details</h2>
            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md border border-yellow-200 mb-6 text-center">
              <strong>TEST PAYMENT MODE:</strong> Use card <span className="font-mono bg-yellow-200 px-1 rounded">4111 1111 1111 1111</span> to succeed. Any other valid Luhn will decline. Never enter real card details.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B6862] mb-1">Name on Card</label>
                <input type="text" name="cardName" value={paymentData.cardName} onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})} className="w-full p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none uppercase" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6862] mb-1">Card Number</label>
                <input type="text" name="cardNumber" maxLength={19} placeholder="XXXX XXXX XXXX XXXX" value={paymentData.cardNumber} onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})} className="w-full p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6862] mb-1">Expiry Date</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="MM" maxLength={2} value={paymentData.expiryMonth} onChange={(e) => setPaymentData({...paymentData, expiryMonth: e.target.value})} className="w-full p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none text-center" />
                    <input type="text" placeholder="YY" maxLength={2} value={paymentData.expiryYear} onChange={(e) => setPaymentData({...paymentData, expiryYear: e.target.value})} className="w-full p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6862] mb-1">CVV</label>
                  <input type="password" maxLength={3} placeholder="XXX" value={paymentData.cvv} onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})} className="w-full p-3 text-sm border border-[#E6E0D4] rounded-md focus:ring-2 focus:ring-[var(--color-brand-orange)] outline-none text-center" />
                </div>
              </div>
            </div>

            {paymentError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200 mt-4 text-center font-medium">
                {paymentError}
              </div>
            )}

            <div className="flex justify-between mt-8 items-center">
              <button onClick={handleBack} disabled={isProcessing} className="px-6 py-3 text-sm font-semibold text-[#6B6862] hover:text-[var(--color-brand-charcoal)] disabled:opacity-50">
                Back to Review
              </button>
              <button onClick={handlePayment} disabled={isProcessing} className="px-8 py-3 bg-[var(--color-brand-charcoal)] text-white text-sm font-bold rounded-md hover:bg-black transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
                {isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
