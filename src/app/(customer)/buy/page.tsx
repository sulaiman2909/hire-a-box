import { PrismaClient, ProductRole } from '@prisma/client';
import BuyClientPage from './BuyClientPage';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function BuyPage() {
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
        // Buy packages use the USED price for core boxes, and NEW price for addons
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
      depositPerUnit: 0, // CRITICAL: Buying never requires a deposit
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
        depositPerUnit: 0 // No deposits for buy
      }))
    };
  };

  // Ensure packages only contain ones where contents exist or are appropriately defined
  const packages = products
    .filter(p => p.role === ProductRole.PACKAGE)
    .map(serializeProduct)
    .sort((a, b) => a.buyPriceNew - b.buyPriceNew);

  const individualItems = products
    .filter(p => p.role === ProductRole.CORE_PRODUCT)
    .map(serializeProduct)
    .sort((a, b) => (a.buyPriceNew || 0) - (b.buyPriceNew || 0));

  const essentials = products
    .filter(p => p.role === ProductRole.ADDON)
    .map(serializeProduct)
    .sort((a, b) => (a.buyPriceNew || 0) - (b.buyPriceNew || 0));

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-brand-charcoal)] mb-6">
          Buy Moving Boxes & Supplies
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto font-sans font-medium">
          Need boxes permanently? We offer new and used durable moving boxes alongside all the packing materials you'll need.
        </p>
      </div>

      <BuyClientPage packages={packages} individualItems={individualItems} essentials={essentials} />
    </div>
  );
}
