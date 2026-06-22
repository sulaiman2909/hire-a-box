import { ProductRole } from '@prisma/client';
import HireClientPage from './HireClientPage';
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
          { availableForHire: true },
          { role: ProductRole.ADDON }
        ]
      },
      include: {
        packageContents: {
          include: {
            product: true
          }
        }
      },
      orderBy: { hirePrice: 'asc' }
    });

    const serializeProduct = (p: typeof products[0]) => {
      let computedHirePrice = p.hirePrice ? Number(p.hirePrice) : 0;
      let computedDeposit = p.depositPerUnit ? Number(p.depositPerUnit) : 0;

      if (p.role === ProductRole.PACKAGE) {
        computedHirePrice = p.packageContents.reduce((sum, item) => {
          const itemPrice = item.product.role === ProductRole.ADDON ? Number(item.product.buyPriceNew) : Number(item.product.hirePrice);
          return sum + (itemPrice * item.quantity);
        }, 0);
        computedDeposit = p.packageContents.reduce((sum, item) => {
          return sum + (Number(item.product.depositPerUnit) * item.quantity);
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
        hirePrice: computedHirePrice,
        buyPriceNew: rest.buyPriceNew !== null ? Number(rest.buyPriceNew) : null,
        buyPriceUsed: rest.buyPriceUsed !== null ? Number(rest.buyPriceUsed) : null,
        depositPerUnit: computedDeposit,
        dimensions: rest.dimensions,
        spec: rest.spec,
        isActive: rest.isActive,
        createdAt: rest.createdAt,
        updatedAt: rest.updatedAt,
        contents: p.packageContents.map(pc => ({
          productId: pc.product.id,
          name: pc.product.name,
          quantity: pc.quantity,
          hirePrice: pc.product.role === ProductRole.ADDON ? Number(pc.product.buyPriceNew) : Number(pc.product.hirePrice),
          depositPerUnit: Number(pc.product.depositPerUnit)
        }))
      };
    };

    return {
      packages: products.filter(p => p.role === ProductRole.PACKAGE).map(serializeProduct),
      individualItems: products.filter(p => p.role === ProductRole.CORE_PRODUCT).map(serializeProduct),
      essentials: products
        .filter(p => p.role === ProductRole.ADDON)
        .map(serializeProduct)
        .sort((a, b) => (a.buyPriceNew || 0) - (b.buyPriceNew || 0))
    };
  },
  ['hire-page-products'],
  { revalidate: 60 }
);

export default async function HirePage() {
  const { packages, individualItems, essentials } = await getCachedProducts();

  return (
    <div className="max-w-[1360px] mx-auto px-6 pt-16 pb-8">
      <CompactHeader 
        title="Hire Moving Boxes"
        valueProp="Select the packages or individual boxes you need. Keep them for up to 3 months. When you're done, we pick them up and refund your deposit. Free delivery over $65."
      />

      <HireClientPage packages={packages} individualItems={individualItems} essentials={essentials} />

      <HowItWorks mode="hire" />
    </div>
  );
}
