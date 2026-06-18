import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Clean existing data
  await prisma.refund.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.postcodeMapping.deleteMany();
  await prisma.driverAvailability.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.product.deleteMany();
  await prisma.adminUser.deleteMany();

  // 2. Create Admin User
  await prisma.adminUser.create({
    data: {
      email: 'admin@hireabox.com.au',
      name: 'Admin',
      passwordHash: 'dummy_hash_for_prototype' // In a real app, use bcrypt
    }
  });

  // 3. Create Products
  const products = [
    { name: 'Medium box (430×315×317mm)', type: ProductType.BOX, hirePrice: 3.25, buyNewPrice: 3.95, buyUsedPrice: 2.95, deposit: 2.00 },
    { name: 'Large / tea chest box (430×405×650mm)', type: ProductType.BOX, hirePrice: 4.35, buyNewPrice: 4.95, buyUsedPrice: 3.95, deposit: 2.50 },
    { name: 'Porta-robe (with rail)', type: ProductType.BOX, hirePrice: 12.95, buyNewPrice: null, buyUsedPrice: null, deposit: 5.00 },
    { name: 'Tape dispenser', type: ProductType.EXTRA, hirePrice: 12.00, buyNewPrice: 12.00, buyUsedPrice: null, deposit: 0.00 },
    { name: '1 Bedroom Home bundle', type: ProductType.PACKAGE, hirePrice: 155.00, buyNewPrice: null, buyUsedPrice: null, deposit: 50.00 },
    { name: '3 Bedroom Home bundle', type: ProductType.PACKAGE, hirePrice: 350.00, buyNewPrice: null, buyUsedPrice: null, deposit: 100.00 },
    { name: '5 Bedroom Home bundle', type: ProductType.PACKAGE, hirePrice: 602.00, buyNewPrice: null, buyUsedPrice: null, deposit: 200.00 },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // 4. Create Drivers & Postcodes
  const drivers = [
    { name: 'Driver 1', email: 'driver1@hireabox.example.com', postcodes: ['2000', '2079'] },
    { name: 'Driver 2', email: 'driver2@hireabox.example.com', postcodes: ['2080', '2234'] },
    { name: 'Driver 3', email: 'driver3@hireabox.example.com', postcodes: ['3000', '3207'] },
    { name: 'Driver 4', email: 'driver4@hireabox.example.com', postcodes: ['6000', '6199'] },
    { name: 'Driver 5', email: 'driver5@hireabox.example.com', postcodes: ['5000', '5199'] }
  ];

  for (const d of drivers) {
    const driver = await prisma.driver.create({
      data: {
        name: d.name,
        email: d.email,
        phone: '0400000000',
      }
    });

    // We'll create a few discrete postcode entries representing the range boundaries
    // In a real system you'd either expand the range to discrete mappings, or use start/end columns.
    // Given the `PostcodeMapping` model is a simple 1:1, we will just seed the start/end to prove it works.
    await prisma.postcodeMapping.create({ data: { postcode: d.postcodes[0], driverId: driver.id } });
    if (d.postcodes[1]) {
      await prisma.postcodeMapping.create({ data: { postcode: d.postcodes[1], driverId: driver.id } });
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
