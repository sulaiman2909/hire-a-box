'use client';

import { useState } from 'react';
import ProductCard from '@/components/customer/ProductCard';
import CartSummary from '@/components/customer/CartSummary';
import { calculateOrderTotals, FREE_DELIVERY_THRESHOLD_BUY } from '@/lib/domain/pricing';

// Mock data for prototype
const BUY_PRODUCTS = [
  { id: '1', name: 'Medium Moving Box', description: 'Best for heavy items like books and tools.', price: 2.95, depositAmount: 0 },
  { id: '2', name: 'Large Moving Box', description: 'Best for bulky, lighter items like linens and toys.', price: 3.95, depositAmount: 0 },
  { id: '3', name: 'Packing Tape', description: 'Heavy duty clear packing tape.', price: 4.50, depositAmount: 0 },
  { id: '4', name: 'Bubble Wrap', description: '10m roll for wrapping fragile items.', price: 15.00, depositAmount: 0 },
];

export default function BuyPage() {
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

  const itemsForDomain = BUY_PRODUCTS.map(p => ({
    quantity: cart[p.id] || 0,
    price: p.price,
    depositAmount: 0
  })).filter(item => item.quantity > 0);

  const totals = calculateOrderTotals('BUY', itemsForDomain);
  const subtotal = itemsForDomain.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalItems = itemsForDomain.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Buy Moving Supplies</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Brand new boxes and packing supplies delivered straight to your door. Yours to keep.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        alignContent: 'start',
        paddingBottom: '6rem'
      }}>
        {BUY_PRODUCTS.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            description={p.description}
            price={p.price}
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
        total={totals.saleTotal}
        threshold={FREE_DELIVERY_THRESHOLD_BUY}
        onCheckout={() => alert('Proceeding to Checkout...')}
        isValid={totalItems > 0}
      />
    </div>
  );
}
