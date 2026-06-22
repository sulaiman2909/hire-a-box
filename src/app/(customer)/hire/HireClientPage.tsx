'use client';

import React from 'react';
import { ProductRole } from '@prisma/client';
import ProductCard from '@/components/customer/ProductCard';
import EssentialsSection from '@/components/customer/EssentialsSection';
import { useCart } from '@/components/customer/CartProvider';

type PackageContent = {
  productId: string;
  name: string;
  quantity: number;
  hirePrice: number;
  depositPerUnit: number;
};

type SerializedProduct = {
  id: string;
  name: string;
  description: string | null;
  role: ProductRole;
  hirePrice: number;
  buyPriceNew: number | null;
  buyPriceUsed: number | null;
  depositPerUnit: number;
  dimensions: string | null;
  spec: string | null;
  contents?: PackageContent[];
};

interface Props {
  packages: SerializedProduct[];
  individualItems: SerializedProduct[];
  essentials: SerializedProduct[];
}

export default function HireClientPage({ packages, individualItems, essentials }: Props) {
  const { state, updateQuantity, openCart, clearCart } = useCart();

  const getQuantity = (productId: string) => {
    return state.hireItems.find(item => item.productId === productId)?.quantity || 0;
  };

  const handleIndividualQuantityChange = (id: string, qty: number) => {
    const product = individualItems.find(p => p.id === id) || essentials.find(p => p.id === id);
    if (!product) return;

    const previousQty = getQuantity(id);
    
    const price = product.role === ProductRole.ADDON ? (product.buyPriceNew || 0) : product.hirePrice;

    updateQuantity('hire', {
      productId: product.id,
      name: product.name,
      price: price,
      depositAmount: product.depositPerUnit,
      isUsed: false
    }, qty);

    if (previousQty === 0 && qty > 0) {
      openCart('hire');
    }
  };

  const handlePackageAdd = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg || !pkg.contents) return;

    clearCart('hire');

    // Explode package into cart
    pkg.contents.forEach(content => {
      updateQuantity('hire', {
        productId: content.productId,
        name: content.name,
        price: content.hirePrice,
        depositAmount: content.depositPerUnit,
        isUsed: false
      }, content.quantity);
    });

    openCart('hire');
  };

  return (
    <div className="space-y-12">
      {/* Packages Section */}
      {packages.length > 0 && (
        <section id="packages">
          <span className="section-eyebrow">All-in-one solutions</span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-[var(--color-brand-charcoal)]">
            Moving Supplies Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {packages.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                dimensions={p.dimensions}
                spec={p.spec}
                price={p.hirePrice}
                depositAmount={p.depositPerUnit}
                quantity={0} 
                onQuantityChange={() => {}}
                isPackage={true}
                onSelectPackage={() => handlePackageAdd(p.id)}
                contents={p.contents}
              />
            ))}
          </div>
        </section>
      )}

      {/* Individual Items Section */}
      {individualItems.length > 0 && (
        <section id="individual-items">
          <span className="section-eyebrow">Basics</span>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-[var(--color-brand-charcoal)]">
            Individual Boxes & Items
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {individualItems.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                dimensions={p.dimensions}
                spec={p.spec}
                price={p.hirePrice}
                depositAmount={p.depositPerUnit}
                quantity={getQuantity(p.id)}
                onQuantityChange={(id, qty) => handleIndividualQuantityChange(id, qty)}
              />
            ))}
          </div>
        </section>
      )}

      <EssentialsSection 
        essentials={essentials}
        pricingMode="hire"
        getQuantity={(id) => getQuantity(id)}
        onQuantityChange={handleIndividualQuantityChange}
      />
    </div>
  );
}
