'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface EssentialProduct {
  id: string;
  name: string;
  description: string | null;
  buyPriceNew: number | null;
  buyPriceUsed: number | null;
  dimensions: string | null;
  spec: string | null;
}

interface Props {
  essentials: EssentialProduct[];
  pricingMode: 'hire' | 'buy';
  getQuantity: (id: string, isUsed: boolean) => number;
  onQuantityChange: (id: string, qty: number, isUsed?: boolean) => void;
}

export default function EssentialsSection({ essentials, pricingMode, getQuantity, onQuantityChange }: Props) {
  if (essentials.length === 0) return null;

  return (
    <section>
      <span className="section-eyebrow">Essentials</span>
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-[var(--color-brand-charcoal)]">
        Packing Supplies
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {essentials.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            description={p.description}
            dimensions={p.dimensions}
            spec={p.spec}
            price={p.buyPriceNew || 0}
            depositAmount={0}
            quantity={getQuantity(p.id, false)}
            quantityUsed={getQuantity(p.id, true)}
            onQuantityChange={(id, qty, isUsed) => onQuantityChange(id, qty, isUsed)}
            pricingMode={pricingMode}
            buyPriceNew={p.buyPriceNew}
            buyPriceUsed={p.buyPriceUsed}
          />
        ))}
      </div>
    </section>
  );
}
