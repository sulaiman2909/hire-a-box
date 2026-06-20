'use client';

import { useState } from 'react';
import ProductCard from '@/components/customer/ProductCard';
import CartSummary from '@/components/customer/CartSummary';
import { calculateOrderTotals, FREE_DELIVERY_THRESHOLD_HIRE } from '@/lib/domain/pricing';
import { calculateDeposits } from '@/lib/domain/deposits';

// Mock data for prototype (in production this would come from Prisma)
const HIRE_PRODUCTS = [
  { id: '1', name: 'Medium Moving Box', description: 'Best for heavy items like books and tools.', price: 3.25, depositAmount: 2.00 },
  { id: '2', name: 'Large Moving Box', description: 'Best for bulky, lighter items like linens and toys.', price: 4.35, depositAmount: 2.50 },
  { id: '3', name: 'Porta Robe Box', description: 'Hang your clothes straight from the wardrobe.', price: 16.50, depositAmount: 5.00 },
];

export default function HirePage() {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleQuantityChange = (id: string, qty: number) => {
    setCart(prev => {
      const newCart = { ...prev, [id]: qty };
      // Automatically open drawer if it's the first item added
      const prevTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      const newTotal = Object.values(newCart).reduce((a, b) => a + b, 0);
      if (prevTotal === 0 && newTotal > 0) {
        setIsDrawerOpen(true);
      }
      return newCart;
    });
  };

  // Prepare items for domain logic
  const itemsForDomain = HIRE_PRODUCTS.map(p => ({
    quantity: cart[p.id] || 0,
    price: p.price,
    depositAmount: p.depositAmount
  })).filter(item => item.quantity > 0);

  // Use domain logic
  const totals = calculateOrderTotals('HIRE', itemsForDomain);
  const subtotal = itemsForDomain.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const depositTotal = calculateDeposits(itemsForDomain);

  const totalItems = itemsForDomain.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Hire Moving Boxes</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Select the boxes you need. Keep them for up to 3 months. When you're done, we pick them up and refund your deposit!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        alignContent: 'start',
        paddingBottom: '6rem' // Ensure space for floating button
      }}>
        {HIRE_PRODUCTS.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            description={p.description}
            price={p.price}
            depositAmount={p.depositAmount}
            quantity={cart[p.id] || 0}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      {/* Floating View Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn-primary"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 90,
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          🛒 View Cart ({totalItems})
        </button>
      )}

      {/* Cart Summary Drawer */}
      <CartSummary
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        subtotal={subtotal}
        deliveryFee={totals.deliveryFee}
        depositTotal={depositTotal}
        total={totals.hireTotal}
        threshold={FREE_DELIVERY_THRESHOLD_HIRE}
        onCheckout={() => alert('Proceeding to Checkout...')}
        isValid={totalItems > 0}
      />
    </div>
  );
}
