import { PrismaClient, ProductType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Admin User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@123', salt);
  
  await prisma.adminUser.upsert({
    where: { email: 'admin@hireabox.com.au' },
    update: {},
    create: {
      email: 'admin@hireabox.com.au',
      name: 'System Admin',
      passwordHash,
    },
  });

  // 2. Boxes
  const boxes = [
    { name: 'Large Tea Chest Box', type: ProductType.BOX, hirePrice: 4.35, buyNewPrice: 4.35, deposit: 2.50 },
    { name: 'Medium Book Carton', type: ProductType.BOX, hirePrice: 3.25, buyNewPrice: 3.25, deposit: 1.60 },
    { name: 'Port-a-robe', type: ProductType.BOX, hirePrice: 12.95, buyNewPrice: 12.95, deposit: 5.00 },
  ];

  for (const box of boxes) {
    const existing = await prisma.product.findFirst({ where: { name: box.name } });
    if (!existing) {
      await prisma.product.create({ data: box });
    }
  }

  // 3. Extras (Consumables)
  const extras = [
    { name: 'Tape Dispenser', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 12.00, deposit: 0 },
    { name: 'Tape Roll', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 4.00, deposit: 0 },
    { name: 'Wrapping Paper (5kg)', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 25.00, deposit: 0 },
    { name: 'Bubblewrap (10m)', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 15.00, deposit: 0 },
    { name: 'Protector Bags', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 8.00, deposit: 0 },
    { name: 'Picture Box', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 8.50, deposit: 0 },
    { name: 'Fragile Stickers', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 2.50, deposit: 0 },
    { name: 'Marker Pen', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 3.00, deposit: 0 },
    { name: 'Stanley Knife', type: ProductType.EXTRA, hirePrice: 0, buyNewPrice: 5.00, deposit: 0 },
  ];

  for (const extra of extras) {
    const existing = await prisma.product.findFirst({ where: { name: extra.name } });
    if (!existing) {
      await prisma.product.create({ data: extra });
    }
  }

  // 4. Packages
  const packages = [
    { name: '1-Bedroom Package', type: ProductType.PACKAGE, hirePrice: 155.25, buyNewPrice: 155.25, deposit: 0 },
    { name: '2-Bedroom Package', type: ProductType.PACKAGE, hirePrice: 235.25, buyNewPrice: 235.25, deposit: 0 },
    { name: '3-Bedroom Package', type: ProductType.PACKAGE, hirePrice: 364.35, buyNewPrice: 364.35, deposit: 0 },
    { name: '4-Bedroom Package', type: ProductType.PACKAGE, hirePrice: 508.55, buyNewPrice: 508.55, deposit: 0 },
    { name: '5-Bedroom Package', type: ProductType.PACKAGE, hirePrice: 601.50, buyNewPrice: 601.50, deposit: 0 },
  ];

  for (const pkg of packages) {
    const existing = await prisma.product.findFirst({ where: { name: pkg.name } });
    if (!existing) {
      await prisma.product.create({ data: pkg });
    }
  }

  // 5. Drivers
  const driverData = [
    { email: 'driver1@hireabox.com.au', name: 'John Sydney', city: 'Sydney' },
    { email: 'driver2@hireabox.com.au', name: 'Mark Sydney West', city: 'Sydney' },
    { email: 'driver3@hireabox.com.au', name: 'Sarah Melbourne', city: 'Melbourne' },
    { email: 'driver4@hireabox.com.au', name: 'Dave Perth', city: 'Perth' },
    { email: 'driver5@hireabox.com.au', name: 'Emma Adelaide', city: 'Adelaide' },
  ];

  for (const d of driverData) {
    await prisma.driver.upsert({
      where: { id: d.email }, // Using email as proxy id for upsert would fail if id is uuid, but we'll findFirst
      update: {},
      create: d,
    });
  }

  const drivers = await prisma.driver.findMany();
  const sydneyDriver1 = drivers.find(d => d.email === 'driver1@hireabox.com.au');
  const sydneyDriver2 = drivers.find(d => d.email === 'driver2@hireabox.com.au');
  const melbDriver = drivers.find(d => d.email === 'driver3@hireabox.com.au');
  const perthDriver = drivers.find(d => d.email === 'driver4@hireabox.com.au');
  const adelDriver = drivers.find(d => d.email === 'driver5@hireabox.com.au');

  // 6. Postcode Mappings (Sample ranges)
  const mapPostcodes = async (driverId: string, postcodes: string[]) => {
    for (const pc of postcodes) {
      await prisma.postcodeMapping.upsert({
        where: { postcode: pc },
        update: { driverId },
        create: { postcode: pc, driverId },
      });
    }
  };

  if (sydneyDriver1) await mapPostcodes(sydneyDriver1.id, ['2000', '2010', '2020', '2030', '2040']);
  if (sydneyDriver2) await mapPostcodes(sydneyDriver2.id, ['2100', '2150', '2200', '2750']);
  if (melbDriver) await mapPostcodes(melbDriver.id, ['3000', '3004', '3121', '3141', '3205']);
  if (perthDriver) await mapPostcodes(perthDriver.id, ['6000', '6004', '6005', '6014', '6100']);
  if (adelDriver) await mapPostcodes(adelDriver.id, ['5000', '5006', '5014', '5024', '5045']);

  // 7. Time Slots (Next 7 days for all drivers)
  const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0); // normalize date to midnight for DB storage
    
    // Skip weekends for basic seed
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const driver of drivers) {
      for (const slot of timeSlots) {
        // Find existing to avoid duplicates since no unique constraint on (driverId, date, timeSlot)
        const existingSlot = await prisma.driverAvailability.findFirst({
          where: { driverId: driver.id, date, timeSlot: slot },
        });

        if (!existingSlot) {
          await prisma.driverAvailability.create({
            data: {
              driverId: driver.id,
              date,
              timeSlot: slot,
              status: 'AVAILABLE',
            },
          });
        }
      }
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
