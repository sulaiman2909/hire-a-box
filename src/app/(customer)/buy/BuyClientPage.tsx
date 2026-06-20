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
  buyPriceNew: number;
  buyPriceUsed: number | null;
  depositPerUnit: number;
};

type SerializedProduct = {
  id: string;
  name: string;
  description: string | null;
  role: ProductRole;
  hirePrice: number | null;
  buyPriceNew: number;
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

export default function BuyClientPage({ packages, individualItems, essentials }: Props) {
  const { state, updateQuantity, openCart, clearCart } = useCart();

  const getQuantity = (productId: string, isUsed: boolean) => {
    return state.buyItems.find(item => item.productId === productId && item.isUsed === isUsed)?.quantity || 0;
  };

  const handleIndividualQuantityChange = (id: string, qty: number, isUsed = false) => {
    const product = individualItems.find(p => p.id === id) || essentials.find(p => p.id === id);
    if (!product) return;

    const previousQty = getQuantity(id, isUsed);
    
    const price = isUsed && product.buyPriceUsed !== null 
      ? product.buyPriceUsed 
      : product.buyPriceNew;

    updateQuantity('buy', {
      productId: product.id,
      name: product.name,
      price: price,
      depositAmount: 0,
      isUsed: isUsed
    }, qty);

    if (previousQty === 0 && qty > 0) {
      openCart('buy');
    }
  };

  const handlePackageAdd = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg || !pkg.contents) return;

    clearCart('buy');

    // Explode package into cart using used prices for boxes/dispensers if available
    pkg.contents.forEach(content => {
      const shouldUseUsed = content.buyPriceUsed !== null;
      const price = shouldUseUsed ? content.buyPriceUsed! : content.buyPriceNew;
      
      updateQuantity('buy', {
        productId: content.productId,
        name: content.name,
        price: price,
        depositAmount: 0,
        isUsed: shouldUseUsed
      }, content.quantity);
    });

    openCart('buy');
  };

  return (
    <div className="space-y-12">
      {/* Packages Section */}
      {packages.length > 0 && (
        <section>
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
                price={p.buyPriceNew} // This is the computed single buy price
                depositAmount={0}
                quantity={0} 
                onQuantityChange={() => {}}
                isPackage={true}
                onSelectPackage={() => handlePackageAdd(p.id)}
                contents={p.contents}
                pricingMode="buy"
                buyPriceNew={p.buyPriceNew}
              />
            ))}
          </div>
        </section>
      )}

      {/* Individual Items Section */}
      {individualItems.length > 0 && (
        <section>
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
                price={p.buyPriceNew}
                depositAmount={0}
                quantity={getQuantity(p.id, false)}
                quantityUsed={getQuantity(p.id, true)}
                onQuantityChange={(id, qty, isUsed) => handleIndividualQuantityChange(id, qty, isUsed)}
                pricingMode="buy"
                buyPriceNew={p.buyPriceNew}
                buyPriceUsed={p.buyPriceUsed}
              />
            ))}
          </div>
        </section>
      )}

      <EssentialsSection 
        essentials={essentials}
        pricingMode="buy"
        getQuantity={getQuantity}
        onQuantityChange={handleIndividualQuantityChange}
      />
    </div>
  );
}
