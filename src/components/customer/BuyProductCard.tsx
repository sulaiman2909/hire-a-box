'use client';

import React, { useState } from 'react';
import { useCart } from '@/components/customer/CartProvider';
import { SerializedProduct } from '@/app/(customer)/buy/BuyClientPage';
import ImagePlaceholder from '@/components/customer/ImagePlaceholder';

export default function BuyProductCard({ product }: { product: SerializedProduct }) {
  const [isUsedSelected, setIsUsedSelected] = useState(false);
  const { state, updateQuantity, openCart } = useCart();

  const hasNew = product.buyPriceNew !== null;
  const hasUsed = product.buyPriceUsed !== null;
  
  // If no used price is available, forcefully select new.
  const isUsed = hasUsed && isUsedSelected;
  const price = isUsed ? product.buyPriceUsed! : product.buyPriceNew!;

  // We look into the cart to find the current quantity for this (product, isUsed) combination.
  const quantity = state.buyItems.find(item => item.productId === product.id && item.isUsed === isUsed)?.quantity || 0;

  const handleQuantityChange = (qty: number) => {
    const previousQty = quantity;
    
    updateQuantity('buy', {
      productId: product.id,
      name: product.name,
      price: Number(price),
      depositAmount: 0, // No deposits for buy items
      isUsed: isUsed
    }, qty);

    if (previousQty === 0 && qty > 0) {
      openCart('buy');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E6E0D4] shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md">
      {/* Image Area */}
      <div className="p-3 bg-[var(--color-brand-warm-secondary)] flex items-center justify-center">
        <ImagePlaceholder label={product.name} aspectRatio="aspect-square" />
      </div>
      
      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-heading font-bold text-[var(--color-brand-charcoal)] mb-1 leading-tight">
          {product.name}
        </h3>

        {/* Specs & Dimensions */}
        {(product.dimensions || product.spec) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.dimensions && (
              <span className="text-xs font-semibold px-2 py-1 bg-[var(--color-brand-kraft)]/10 text-[var(--color-brand-kraft-deep)] rounded">
                {product.dimensions}
              </span>
            )}
            {product.spec && (
              <span className="text-xs font-semibold px-2 py-1 bg-[var(--color-brand-kraft)]/10 text-[var(--color-brand-kraft-deep)] rounded">
                {product.spec}
              </span>
            )}
          </div>
        )}

        <p className="text-[#6B6862] text-sm mb-4 flex-grow leading-snug">
          {product.description || 'Sturdy and reliable for all your needs.'}
        </p>

        {hasNew && hasUsed && (
          <div className="flex gap-2 mb-4 bg-[var(--color-brand-warm-secondary)] p-1 rounded-md">
            <button 
              onClick={() => setIsUsedSelected(false)}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-all ${
                !isUsedSelected 
                  ? 'bg-white text-[var(--color-brand-orange)] shadow-sm' 
                  : 'bg-transparent text-[#6B6862] hover:text-[var(--color-brand-charcoal)]'
              }`}
            >
              New
            </button>
            <button 
              onClick={() => setIsUsedSelected(true)}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-all ${
                isUsedSelected 
                  ? 'bg-white text-[var(--color-brand-orange)] shadow-sm' 
                  : 'bg-transparent text-[#6B6862] hover:text-[var(--color-brand-charcoal)]'
              }`}
            >
              Used
            </button>
          </div>
        )}
        
        <div className="flex flex-col mb-4">
          <span className="text-xl font-bold text-[var(--color-brand-orange)] leading-none">
            ${Number(price).toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto bg-[var(--color-brand-warm-secondary)] rounded-md p-1 flex items-center justify-between">
          <button 
            onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-lg font-medium transition-colors ${
              quantity > 0 
                ? 'bg-white text-[var(--color-brand-charcoal)] shadow-sm hover:bg-stone-50' 
                : 'text-[#9A9791] cursor-default'
            }`}
            disabled={quantity <= 0}
          >
            -
          </button>
          
          <span className="font-bold text-base min-w-[32px] text-center text-[var(--color-brand-charcoal)]">
            {quantity}
          </span>
          
          <button 
            onClick={() => handleQuantityChange(quantity + 1)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-lg font-medium bg-[var(--color-brand-orange)] text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
