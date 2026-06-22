import React from 'react';
import ManualOrderClient from '@/components/admin/ManualOrderClient';
import { prisma } from '@/lib/prisma';

export default async function NewOrderPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      packageContents: {
        include: { product: true }
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-[var(--color-brand-charcoal)]">Manual Order Entry</h1>
        <p className="text-sm text-stone-500">Create B2B or phone orders manually. Payment is processed externally.</p>
      </div>

      {/* Serialize Decimals before passing to Client Component */}
      <ManualOrderClient 
        products={products.map(p => ({
          ...p,
          hirePrice: p.hirePrice ? Number(p.hirePrice) : null,
          buyPriceNew: p.buyPriceNew ? Number(p.buyPriceNew) : null,
          buyPriceUsed: p.buyPriceUsed ? Number(p.buyPriceUsed) : null,
          depositPerUnit: p.depositPerUnit ? Number(p.depositPerUnit) : null,
          packageContents: p.packageContents.map(pc => ({
            productId: pc.productId,
            quantity: pc.quantity,
            product: {
              ...pc.product,
              hirePrice: pc.product.hirePrice ? Number(pc.product.hirePrice) : null,
              buyPriceNew: pc.product.buyPriceNew ? Number(pc.product.buyPriceNew) : null,
              buyPriceUsed: pc.product.buyPriceUsed ? Number(pc.product.buyPriceUsed) : null,
              depositPerUnit: pc.product.depositPerUnit ? Number(pc.product.depositPerUnit) : null,
            }
          }))
        }))} 
      />
    </div>
  );
}
