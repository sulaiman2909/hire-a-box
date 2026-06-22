import { ProductRole } from '@prisma/client';
import BuyClientPage from './BuyClientPage';
import { prisma } from '@/lib/prisma';
import CompactHeader from '@/components/customer/CompactHeader';
import HowItWorks from '@/components/customer/HowItWorks';

import { unstable_cache } from 'next/cache';

export const revalidate = 60;

const getCachedProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        OR: [
          { availableForBuy: true },
          { role: ProductRole.ADDON },
          { role: ProductRole.PACKAGE }
        ]
      },
      include: {
        packageContents: {
          include: {
            product: true
          }
        }
      },
      orderBy: { buyPriceNew: 'asc' }
    });

    const serializeProduct = (p: typeof products[0]) => {
      let computedBuyPriceNew = p.buyPriceNew ? Number(p.buyPriceNew) : 0;

      if (p.role === ProductRole.PACKAGE) {
        computedBuyPriceNew = p.packageContents.reduce((sum, item) => {
          const priceToUse = item.product.buyPriceUsed !== null 
            ? Number(item.product.buyPriceUsed) 
            : Number(item.product.buyPriceNew);
          return sum + (priceToUse * item.quantity);
        }, 0);
      }

      const { packageContents, ...rest } = p;

      return {
        id: rest.id,
        name: rest.name,
        description: rest.description,
        role: rest.role,
        availableForHire: rest.availableForHire,
        availableForBuy: rest.availableForBuy,
        hirePrice: rest.hirePrice !== null ? Number(rest.hirePrice) : null,
        buyPriceNew: computedBuyPriceNew,
        buyPriceUsed: rest.buyPriceUsed !== null ? Number(rest.buyPriceUsed) : null,
        depositPerUnit: 0,
        dimensions: rest.dimensions,
        spec: rest.spec,
        isActive: rest.isActive,
        createdAt: rest.createdAt,
        updatedAt: rest.updatedAt,
        contents: p.packageContents.map(pc => ({
          productId: pc.product.id,
          name: pc.product.name,
          quantity: pc.quantity,
          buyPriceNew: Number(pc.product.buyPriceNew),
          buyPriceUsed: pc.product.buyPriceUsed !== null ? Number(pc.product.buyPriceUsed) : null,
          depositPerUnit: 0
        }))
      };
    };

    return {
      packages: products
        .filter(p => p.role === ProductRole.PACKAGE)
        .map(serializeProduct)
        .sort((a, b) => a.buyPriceNew - b.buyPriceNew),
      individualItems: products
        .filter(p => p.role === ProductRole.CORE_PRODUCT)
        .map(serializeProduct)
        .sort((a, b) => (a.buyPriceNew || 0) - (b.buyPriceNew || 0)),
      essentials: products
        .filter(p => p.role === ProductRole.ADDON)
        .map(serializeProduct)
        .sort((a, b) => (a.buyPriceNew || 0) - (b.buyPriceNew || 0))
    };
  },
  ['buy-page-products'],
  { revalidate: 60 }
);

export default async function BuyPage() {
  const { packages, individualItems, essentials } = await getCachedProducts();

  return (
    <div className="max-w-[1360px] mx-auto px-6 pt-16 pb-8">
      <CompactHeader 
        title="Buy Moving Boxes"
        valueProp="Need boxes permanently? We offer new and used durable moving boxes alongside all the packing materials you'll need. Yours to keep, no deposit, free delivery over $99."
      />

      <BuyClientPage packages={packages} individualItems={individualItems} essentials={essentials} />

      <HowItWorks mode="buy" />
    </div>
  );
}
