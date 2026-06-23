'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { createOrder } from '@/app/actions/createOrder';
import { OrderSource } from '@prisma/client';

type Props = {
  products: any[];
};

type ItemLine = {
  id: string;
  productId: string;
  quantity: number;
  lineType: 'HIRE' | 'BUY_NEW' | 'BUY_USED';
};

const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00'
];

export default function ManualOrderClient({ products }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Customer Form
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  
  // Delivery Form
  const [delivery, setDelivery] = useState({ 
    address: '', 
    suburb: '', 
    postcode: '', 
    pickupPostcode: '', 
    date: new Date().toISOString().split('T')[0], 
    slot: TIME_SLOTS[0] 
  });

  // Items Form
  const [items, setItems] = useState<ItemLine[]>([]);

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), productId: '', quantity: 1, lineType: 'HIRE' }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemLine, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Please add at least one item.');
      return;
    }

    if (!items.every(i => i.productId && i.quantity > 0)) {
      setError('Please complete all item lines.');
      return;
    }

    startTransition(async () => {
      try {
        // Construct synthetic cart state
        const hireItems: any[] = [];
        const buyItems: any[] = [];

        for (const line of items) {
          const product = products.find(p => p.id === line.productId);
          if (!product) continue;

          // If product is a PACKAGE, explode it into its contents
          if (product.role === 'PACKAGE' && product.packageContents) {
            for (const pc of product.packageContents) {
              const subProduct = pc.product;
              if (line.lineType === 'HIRE') {
                hireItems.push({
                  productId: subProduct.id,
                  quantity: line.quantity * pc.quantity,
                  price: subProduct.role === 'ADDON' ? (subProduct.buyPriceNew || 0) : (subProduct.hirePrice || 0),
                  depositAmount: subProduct.depositPerUnit || 0,
                  isUsed: subProduct.role !== 'ADDON'
                });
              } else {
                buyItems.push({
                  productId: subProduct.id,
                  quantity: line.quantity * pc.quantity,
                  price: line.lineType === 'BUY_NEW' ? (subProduct.buyPriceNew || 0) : (subProduct.buyPriceUsed || 0),
                  depositAmount: 0,
                  isUsed: line.lineType === 'BUY_USED'
                });
              }
            }
          } else {
            // Standard individual product
            if (line.lineType === 'HIRE') {
              hireItems.push({
                productId: product.id,
                quantity: line.quantity,
                price: product.role === 'ADDON' ? (product.buyPriceNew || 0) : (product.hirePrice || 0),
                depositAmount: product.depositPerUnit || 0,
                isUsed: product.role !== 'ADDON'
              });
            } else {
              buyItems.push({
                productId: product.id,
                quantity: line.quantity,
                price: line.lineType === 'BUY_NEW' ? (product.buyPriceNew || 0) : (product.buyPriceUsed || 0),
                depositAmount: 0,
                isUsed: line.lineType === 'BUY_USED'
              });
            }
          }
        }

        // A cart can only be hire OR buy according to standard logic, but let's see.
        // Actually, the web checkout forces hire or buy cart via tabs, but the database allows mixed?
        // createOrder logic assumes it's one or the other based on `isHire = params.cartState.hireItems.length > 0;`
        // If hireItems exist, it creates a HIRE order. Let's strictly enforce this in the UI.
        const hasHire = hireItems.length > 0;
        const hasBuy = buyItems.length > 0;
        if (hasHire && hasBuy) {
          throw new Error("Cannot mix Hire and Buy items in a single order due to deposit rules. Please create two separate orders.");
        }

        const cartState = {
          hireItems,
          buyItems,
          promoCode: '',
          pickupPostcode: delivery.pickupPostcode || undefined
        };

        const orderId = await createOrder({
          cartState,
          customerDetails: customer,
          deliveryDetails: {
            address: delivery.address,
            suburb: delivery.suburb,
            postcode: delivery.postcode,
            pickupPostcode: cartState.pickupPostcode,
            date: new Date(delivery.date),
            slot: delivery.slot
          },
          source: OrderSource.MANUAL,
          isPaid: false // Unpaid by default for manual orders
        });

        // Redirect to new order detail
        router.push(`/admin/orders/${orderId}`);
      } catch (err: any) {
        setError(err.message || 'An error occurred creating the order.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ opacity: isPending ? 0.6 : 1 }}>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details */}
        <div className="bg-white p-6 rounded shadow-sm border border-stone-200 space-y-4">
          <h2 className="font-bold text-[var(--color-brand-charcoal)] border-b border-stone-100 pb-2">Customer Details</h2>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Full Name</label>
            <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Email</label>
              <input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Phone</label>
              <input required type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white p-6 rounded shadow-sm border border-stone-200 space-y-4">
          <h2 className="font-bold text-[var(--color-brand-charcoal)] border-b border-stone-100 pb-2">Delivery Details</h2>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Street Address</label>
            <input required type="text" value={delivery.address} onChange={e => setDelivery({...delivery, address: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Suburb</label>
              <input required type="text" value={delivery.suburb} onChange={e => setDelivery({...delivery, suburb: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Postcode</label>
              <input required type="text" value={delivery.postcode} onChange={e => setDelivery({...delivery, postcode: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Date</label>
              <input required type="date" value={delivery.date} onChange={e => setDelivery({...delivery, date: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Time Slot</label>
              <select required value={delivery.slot} onChange={e => setDelivery({...delivery, slot: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[var(--color-brand-orange)]">
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Pickup Postcode (For Hire Only)</label>
            <input type="text" value={delivery.pickupPostcode} onChange={e => setDelivery({...delivery, pickupPostcode: e.target.value})} className="w-full border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-brand-orange)]" />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <h2 className="font-bold text-[var(--color-brand-charcoal)]">Order Items</h2>
          <button type="button" onClick={handleAddItem} className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded hover:bg-stone-200 transition-colors">
            <Plus size={14} /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center p-8 text-stone-400 text-sm border-2 border-dashed border-stone-100 rounded">
            No items added yet. Click "Add Item" to begin.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const selectedProduct = products.find(p => p.id === item.productId);
              return (
              <div key={item.id} className="flex items-center gap-3 bg-stone-50 p-3 rounded border border-stone-100">
                <div className="flex-1">
                  <select required value={item.productId} onChange={e => {
                      const newProductId = e.target.value;
                      const newProduct = products.find(p => p.id === newProductId);
                      let newLineType = item.lineType;
                      
                      if (newProduct) {
                        const validTypes = [];
                        if (newProduct.role === 'PACKAGE') {
                          validTypes.push('HIRE');
                          validTypes.push('BUY_NEW'); // Buy for packages
                        } else if (newProduct.role === 'ADDON') {
                          validTypes.push('BUY_NEW');
                        } else {
                          // CORE_PRODUCT
                          if (newProduct.hirePrice !== null) validTypes.push('HIRE');
                          if (newProduct.buyPriceNew !== null) validTypes.push('BUY_NEW');
                          if (newProduct.buyPriceUsed !== null) validTypes.push('BUY_USED');
                        }
                        
                        if (!validTypes.includes(newLineType) && validTypes.length > 0) {
                           newLineType = validTypes[0] as any;
                        }
                      }
                      
                      setItems(items.map(i => i.id === item.id ? { ...i, productId: newProductId, lineType: newLineType } : i));
                  }} className="w-full border border-stone-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[var(--color-brand-orange)]">
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-40">
                  <select required value={item.lineType} onChange={e => updateItem(item.id, 'lineType', e.target.value)} disabled={!selectedProduct} className="w-full border border-stone-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[var(--color-brand-orange)] disabled:bg-stone-100 disabled:text-stone-400">
                    {!selectedProduct ? (
                      <option value="">-</option>
                    ) : selectedProduct.role === 'PACKAGE' ? (
                      <>
                        <option value="HIRE">Hire</option>
                        <option value="BUY_NEW">Buy</option>
                      </>
                    ) : selectedProduct.role === 'ADDON' ? (
                      <option value="BUY_NEW">Buy</option>
                    ) : (
                      <>
                        {selectedProduct.hirePrice !== null && (
                          <option value="HIRE">Hire</option>
                        )}
                        {selectedProduct.buyPriceNew !== null && (
                          <option value="BUY_NEW">Buy (New)</option>
                        )}
                        {selectedProduct.buyPriceUsed !== null && (
                          <option value="BUY_USED">Buy (Used)</option>
                        )}
                      </>
                    )}
                  </select>
                </div>
                <div className="w-24">
                  <input required type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} className="w-full border border-stone-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[var(--color-brand-orange)]" />
                </div>
                <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-brand-charcoal)] text-white font-semibold rounded shadow hover:bg-stone-800 transition-colors disabled:opacity-50">
          <Save size={18} /> {isPending ? 'Processing...' : 'Create Order'}
        </button>
      </div>

    </form>
  );
}
