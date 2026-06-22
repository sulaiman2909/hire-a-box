const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latestOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!latestOrder) {
    console.log("No orders found");
    return;
  }

  console.log("Latest Order ID:", latestOrder.id);
  console.log("Created At:", latestOrder.createdAt);
  console.log("Items:");
  latestOrder.items.forEach(item => {
    console.log(`- ${item.product.name} (Role: ${item.product.role}) - Price: ${item.price} - isUsed: ${item.isUsed}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
