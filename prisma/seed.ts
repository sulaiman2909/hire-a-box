import { PrismaClient, ProductRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with updated schema...');

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

  // 2. Drivers
  const driverData = [
    { email: 'driver1@hireabox.com.au', name: 'John Sydney', city: 'Sydney' },
    { email: 'driver2@hireabox.com.au', name: 'Mark Sydney West', city: 'Sydney' },
    { email: 'driver3@hireabox.com.au', name: 'Sarah Melbourne', city: 'Melbourne' },
    { email: 'driver4@hireabox.com.au', name: 'Dave Perth', city: 'Perth' },
    { email: 'driver5@hireabox.com.au', name: 'Emma Adelaide', city: 'Adelaide' },
  ];

  for (const d of driverData) {
    await prisma.driver.upsert({
      where: { id: d.email }, // Just finding by email logic, wait we use findFirst below
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

  // 3. Postcode Mappings
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

  // 4. Time Slots
  const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0); 
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const driver of drivers) {
      for (const slot of timeSlots) {
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

  // -------------------------------------------------------------------------------- //
  // NEW CATALOGUE SEEDING
  // -------------------------------------------------------------------------------- //

  // CORE PRODUCTS
  const coreProducts = [
    {
      name: 'Large Tea Chest Box',
      role: ProductRole.CORE_PRODUCT,
      availableForHire: true,
      availableForBuy: true,
      hirePrice: 4.35,
      buyPriceUsed: 4.95,
      buyPriceNew: 5.95,
      depositPerUnit: 2.50,
      dimensions: '430x405x650mm',
      spec: 'Heavy duty',
    },
    {
      name: 'Medium Book Carton Box',
      role: ProductRole.CORE_PRODUCT,
      availableForHire: true,
      availableForBuy: true,
      hirePrice: 3.25,
      buyPriceUsed: 3.95,
      buyPriceNew: 4.95,
      depositPerUnit: 1.60,
      dimensions: '430x315x317mm',
      spec: 'Heavy duty',
    },
    {
      name: 'Port-a-robe Box',
      role: ProductRole.CORE_PRODUCT,
      availableForHire: true,
      availableForBuy: true,
      hirePrice: 12.95,
      buyPriceUsed: 17.95,
      buyPriceNew: 22.95,
      depositPerUnit: 9.00,
      dimensions: '500x600x990mm',
      spec: 'Heavy duty',
    },
    {
      name: 'Tape Dispenser',
      role: ProductRole.CORE_PRODUCT,
      availableForHire: true,
      availableForBuy: true,
      hirePrice: 12.00,
      buyPriceUsed: 15.00,
      buyPriceNew: 18.00,
      depositPerUnit: 10.00,
      spec: 'Does not include tape roll',
    }
  ];

  const createdCore: Record<string, any> = {};

  for (const cp of coreProducts) {
    const existing = await prisma.product.findFirst({ where: { name: cp.name } });
    if (!existing) {
      createdCore[cp.name] = await prisma.product.create({ data: cp });
    } else {
      createdCore[cp.name] = await prisma.product.update({ where: { id: existing.id }, data: cp });
    }
  }

  // ADDONS
  const addons = [
    { name: 'Tape roll', price: 4.00, spec: 'Recommend 1 roll per 15 boxes' },
    { name: 'Wrapping paper 10kg/400 sheets', price: 55.00 },
    { name: 'Wrapping paper 5kg/200 sheets', price: 35.00 },
    { name: 'Bubblewrap 15m roll', price: 20.00 },
    { name: 'Bubblewrap 5m roll', price: 8.00 },
    { name: 'King mattress protector bag', price: 12.00 },
    { name: 'Single mattress protector bag', price: 12.00 },
    { name: '3-seater sofa protector bag', price: 12.00 },
    { name: 'Single-seat sofa protector bag', price: 12.00 },
    { name: 'Dining chair protector bags (Pack of 2)', price: 12.00 },
    { name: 'Picture box', price: 20.00, dimensions: '1040x75x775mm' },
    { name: 'Fragile stickers (Pack of 20)', price: 3.00 },
    { name: 'Cable label stickers (Pack of 2)', price: 3.00 },
    { name: 'Retractable utility knife', price: 5.00 },
    { name: 'Permanent marker pen', price: 4.00 },
  ];

  const createdAddons: Record<string, any> = {};

  for (const addon of addons) {
    const existing = await prisma.product.findFirst({ where: { name: addon.name } });
    const data = {
      name: addon.name,
      role: ProductRole.ADDON,
      availableForHire: false,
      availableForBuy: true,
      buyPriceNew: addon.price,
      depositPerUnit: 0,
      spec: addon.spec,
      dimensions: addon.dimensions
    };
    if (!existing) {
      createdAddons[addon.name] = await prisma.product.create({ data });
    } else {
      createdAddons[addon.name] = await prisma.product.update({ where: { id: existing.id }, data });
    }
  }

  // PACKAGES
  const packagesDef = [
    {
      name: '1-Bedroom Package',
      items: [
        { product: createdCore['Medium Book Carton Box'].id, quantity: 15 },
        { product: createdCore['Large Tea Chest Box'].id, quantity: 10 },
        { product: createdAddons['Tape roll'].id, quantity: 1 },
        { product: createdCore['Tape Dispenser'].id, quantity: 1 },
        { product: createdAddons['Wrapping paper 5kg/200 sheets'].id, quantity: 1 },
        { product: createdAddons['Permanent marker pen'].id, quantity: 1 },
        { product: createdAddons['Bubblewrap 5m roll'].id, quantity: 1 },
      ]
    },
    {
      name: '2-Bedroom Package',
      items: [
        { product: createdCore['Medium Book Carton Box'].id, quantity: 25 },
        { product: createdCore['Large Tea Chest Box'].id, quantity: 20 },
        { product: createdAddons['Tape roll'].id, quantity: 2 },
        { product: createdCore['Tape Dispenser'].id, quantity: 1 },
        { product: createdAddons['Wrapping paper 5kg/200 sheets'].id, quantity: 1 },
        { product: createdAddons['Permanent marker pen'].id, quantity: 1 },
        { product: createdAddons['Bubblewrap 5m roll'].id, quantity: 1 },
      ]
    },
    {
      name: '3-Bedroom Package',
      items: [
        { product: createdCore['Medium Book Carton Box'].id, quantity: 35 },
        { product: createdCore['Large Tea Chest Box'].id, quantity: 25 },
        { product: createdCore['Port-a-robe Box'].id, quantity: 3 },
        { product: createdAddons['Tape roll'].id, quantity: 3 },
        { product: createdCore['Tape Dispenser'].id, quantity: 1 },
        { product: createdAddons['Wrapping paper 10kg/400 sheets'].id, quantity: 1 },
        { product: createdAddons['Permanent marker pen'].id, quantity: 1 },
        { product: createdAddons['Bubblewrap 15m roll'].id, quantity: 1 },
      ]
    },
    {
      name: '4-Bedroom Package',
      items: [
        { product: createdCore['Medium Book Carton Box'].id, quantity: 50 },
        { product: createdCore['Large Tea Chest Box'].id, quantity: 35 },
        { product: createdCore['Port-a-robe Box'].id, quantity: 4 },
        { product: createdAddons['Tape roll'].id, quantity: 4 },
        { product: createdCore['Tape Dispenser'].id, quantity: 1 },
        { product: createdAddons['Wrapping paper 10kg/400 sheets'].id, quantity: 1 },
        { product: createdAddons['Wrapping paper 5kg/200 sheets'].id, quantity: 1 }, // 600 sheets = 400 + 200
        { product: createdAddons['Permanent marker pen'].id, quantity: 1 },
        { product: createdAddons['Bubblewrap 15m roll'].id, quantity: 1 },
      ]
    },
    {
      name: '5-Bedroom Package',
      items: [
        { product: createdCore['Medium Book Carton Box'].id, quantity: 60 },
        { product: createdCore['Large Tea Chest Box'].id, quantity: 45 },
        { product: createdCore['Port-a-robe Box'].id, quantity: 5 },
        { product: createdAddons['Tape roll'].id, quantity: 5 },
        { product: createdCore['Tape Dispenser'].id, quantity: 1 },
        { product: createdAddons['Wrapping paper 10kg/400 sheets'].id, quantity: 1 },
        { product: createdAddons['Wrapping paper 5kg/200 sheets'].id, quantity: 1 }, // 600 sheets = 400 + 200
        { product: createdAddons['Permanent marker pen'].id, quantity: 1 },
        { product: createdAddons['Bubblewrap 15m roll'].id, quantity: 1 },
      ]
    }
  ];

  for (const pkg of packagesDef) {
    const existingPkg = await prisma.product.findFirst({ where: { name: pkg.name } });
    let pkgRecord;
    
    if (!existingPkg) {
      pkgRecord = await prisma.product.create({
        data: {
          name: pkg.name,
          role: ProductRole.PACKAGE,
          availableForHire: true,
          availableForBuy: false, // Packages are typically for hire, but can be adjusted
          description: 'A pre-configured recipe of boxes and packing supplies.'
        }
      });
    } else {
      pkgRecord = await prisma.product.update({
        where: { id: existingPkg.id },
        data: {
          role: ProductRole.PACKAGE,
          availableForHire: true,
          availableForBuy: false,
        }
      });
    }

    // Upsert package items
    // First, delete existing items to avoid duplicates on re-seed
    await prisma.packageItem.deleteMany({
      where: { packageId: pkgRecord.id }
    });

    for (const item of pkg.items) {
      await prisma.packageItem.create({
        data: {
          packageId: pkgRecord.id,
          productId: item.product,
          quantity: item.quantity
        }
      });
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
