import { PrismaClient, ProductRole } from '@prisma/client';
import HireClientPage from './HireClientPage';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function HirePage() {
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
    // If it's a package, compute its price and deposit from contents
    let computedHirePrice = p.hirePrice ? Number(p.hirePrice) : 0;
    let computedDeposit = p.depositPerUnit ? Number(p.depositPerUnit) : 0;

    if (p.role === ProductRole.PACKAGE) {
      computedHirePrice = p.packageContents.reduce((sum, item) => {
        const itemPrice = item.product.role === ProductRole.ADDON ? Number(item.product.buyPriceNew) : Number(item.product.hirePrice);
        return sum + (itemPrice * item.quantity);
      }, 0);
      computedDeposit = p.packageContents.reduce((sum, item) => {
        const isBox = item.product.name.toLowerCase().includes('box');
        return sum + (isBox ? (Number(item.product.depositPerUnit) * item.quantity) : 0);
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
      // Pass the serialized contents for client-side cart explosion
      contents: p.packageContents.map(pc => ({
        productId: pc.product.id,
        name: pc.product.name,
        quantity: pc.quantity,
        hirePrice: pc.product.role === ProductRole.ADDON ? Number(pc.product.buyPriceNew) : Number(pc.product.hirePrice),
        depositPerUnit: pc.product.name.toLowerCase().includes('box') ? Number(pc.product.depositPerUnit) : 0
      }))
    };
  };

  const packages = products.filter(p => p.role === ProductRole.PACKAGE).map(serializeProduct);
  const individualItems = products.filter(p => p.role === ProductRole.CORE_PRODUCT).map(serializeProduct);
  const essentials = products
    .filter(p => p.role === ProductRole.ADDON)
    .map(serializeProduct)
    .sort((a, b) => (a.buyPriceNew || 0) - (b.buyPriceNew || 0));

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-brand-charcoal)] mb-6">
          Hire Moving Boxes
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto font-sans font-medium">
          Select the packages or individual boxes you need. Keep them for up to 3 months. When you're done, we pick them up and refund your deposit!
        </p>
      </div>

      <HireClientPage packages={packages} individualItems={individualItems} essentials={essentials} />
    </div>
  );
}
