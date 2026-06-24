'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MapPin, Calendar, Clock, User, Phone, CheckCircle, XCircle, RefreshCw, Truck, Edit2, Save, X, Trash2, Loader2 } from 'lucide-react';
import { updateOrderAllocation, resendOrderEmail, updateOrderDeliveryAddress, updateOrderPayment, deleteOrder, resolveDeposit, updateOrderStatus } from '@/app/actions/orderAdminActions';

type Props = {
  order: any;
  drivers: { id: string; name: string; city: string }[];
  availabilities: { driverId: string; timeSlot: string }[];
};

export default function AdminOrderDetailClient({ order, drivers, availabilities }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Allocation Edit State
  const [isEditingAllocation, setIsEditingAllocation] = useState(false);
  const [editDriverId, setEditDriverId] = useState<string>(order.driverId || '');
  const [editDate, setEditDate] = useState<string>(new Date(order.deliveryDate).toISOString().split('T')[0]);
  const [editSlot, setEditSlot] = useState<string>(order.deliverySlot);
  const [allocationError, setAllocationError] = useState('');

  // Delivery Address Edit State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddress, setEditAddress] = useState({
    deliveryAddress: order.deliveryAddress || '',
    deliverySuburb: order.deliverySuburb || '',
    deliveryPostcode: order.deliveryPostcode || '',
    pickupPostcode: order.pickupPostcode || ''
  });

  // Payment Edit State
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editAmountPaid, setEditAmountPaid] = useState<number>(order.amountPaid);

  // Deposit Resolution State
  const [isResolvingDeposit, setIsResolvingDeposit] = useState(false);
  const [resolveType, setResolveType] = useState<'REFUND' | 'FORFEIT'>('REFUND');
  const remainingDeposit = order.depositTotal - order.depositRefunded - order.depositForfeited;
  const [resolveAmount, setResolveAmount] = useState<number>(remainingDeposit);
  const [resolveReason, setResolveReason] = useState<string>('');

  // Sync state with server props when Next.js refreshes the data
  React.useEffect(() => {
    setEditDriverId(order.driverId || '');
    setEditDate(new Date(order.deliveryDate).toISOString().split('T')[0]);
    setEditSlot(order.deliverySlot);
    
    setEditAddress({
      deliveryAddress: order.deliveryAddress || '',
      deliverySuburb: order.deliverySuburb || '',
      deliveryPostcode: order.deliveryPostcode || '',
      pickupPostcode: order.pickupPostcode || ''
    });
    
    setEditAmountPaid(order.amountPaid);
  }, [order]);

  const handleResolveDeposit = () => {
    startTransition(async () => {
      try {
        const res = await resolveDeposit(order.id, resolveAmount, resolveType, resolveReason);
        if (res && 'error' in res) {
          alert((res as any).error);
          return;
        }
        setIsResolvingDeposit(false);
        setResolveReason('');
        router.refresh();
      } catch (err: any) {
        alert(err.message || 'Failed to resolve deposit.');
      }
    });
  };

  const handleSaveAddress = () => {
    const postcodeRegex = /^\d{4}$/;
    if (!postcodeRegex.test(editAddress.deliveryPostcode)) {
      alert('Delivery Postcode must be exactly 4 digits.');
      return;
    }
    if (order.type === 'HIRE' && editAddress.pickupPostcode && !postcodeRegex.test(editAddress.pickupPostcode)) {
      alert('Pickup Postcode must be exactly 4 digits.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateOrderDeliveryAddress(order.id, {
          deliveryAddress: editAddress.deliveryAddress,
          deliverySuburb: editAddress.deliverySuburb,
          deliveryPostcode: editAddress.deliveryPostcode,
          pickupPostcode: order.type === 'HIRE' ? editAddress.pickupPostcode : undefined,
        });
        if (res && 'error' in res) {
          alert((res as any).error);
          return;
        }
        
        if (res && 'warning' in res && (res as any).warning) {
          alert((res as any).warning);
        }
        
        setIsEditingAddress(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message || 'Failed to update address.');
      }
    });
  };

  const handleSaveAllocation = () => {
    setAllocationError('');
    startTransition(async () => {
      try {
        const res = await updateOrderAllocation(order.id, editDriverId || null, editDate, editSlot);
        if (res && 'error' in res) {
          setAllocationError((res as any).error);
          return;
        }
        setIsEditingAllocation(false);
        router.refresh();
      } catch (err: any) {
        setAllocationError(err.message || 'Failed to update allocation.');
      }
    });
  };

  const handleSavePayment = () => {
    startTransition(async () => {
      try {
        const res = await updateOrderPayment(order.id, editAmountPaid);
        if (res && 'error' in res) {
          alert((res as any).error);
          return;
        }
        setIsEditingPayment(false);
        router.refresh();
      } catch (err: any) {
        alert(err.message || 'Failed to update payment.');
      }
    });
  };

  const handleResendEmail = (type: 'CLIENT' | 'DRIVER') => {
    if (isEditingAllocation || isEditingAddress || isEditingPayment) {
      alert('You have unsaved changes open. Please click "Save" on your edits before resending the email so the client receives the updated information.');
      return;
    }

    if (!confirm(`Are you sure you want to resend the ${type} email?`)) return;
    startTransition(async () => {
      try {
        const res = await resendOrderEmail(order.id, type);
        if (res && 'error' in res) {
          alert((res as any).error);
        } else {
          router.refresh();
        }
      } catch (err: any) {
        alert(err.message || 'Failed to send email.');
      }
    });
  };

  const handleDeleteOrder = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    const input = prompt(`DANGER: Are you sure you want to completely delete order ${order.orderNumber}? This action cannot be undone.\n\nType ${code} to confirm.`);
    if (input !== code.toString()) {
      if (input !== null) alert('Incorrect confirmation code. Deletion cancelled.');
      return;
    }
    
    startTransition(async () => {
      try {
        const res = await deleteOrder(order.id);
        if (res && 'error' in res) {
          alert((res as any).error);
          return;
        }
        router.push('/admin'); // Redirect back to dashboard after deletion
      } catch (err: any) {
        alert(err.message || 'Failed to delete order.');
      }
    });
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!confirm(`Are you sure you want to change the order status to ${newStatus}?`)) return;
    startTransition(async () => {
      try {
        const res = await updateOrderStatus(order.id, newStatus as any);
        if (res && 'error' in res) {
          alert((res as any).error);
          return;
        }
        router.refresh();
      } catch (err: any) {
        alert(err.message || 'Failed to update status.');
      }
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'UNALLOCATED') return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase tracking-wider animate-pulse border border-red-200">UNALLOCATED</span>;
    if (status === 'ALLOCATED') return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">ALLOCATED</span>;
    if (status === 'DELIVERED') return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">DELIVERED</span>;
    if (status === 'COLLECTED') return <span className="px-2.5 py-1 bg-stone-200 text-stone-700 text-xs font-bold rounded uppercase tracking-wider">COLLECTED</span>;
    return <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded uppercase tracking-wider">{status}</span>;
  };

  // Derived available slots for the selected editDate/editDriver
  // Note: For simplicity in UI, if they change date, we might not have slots downloaded.
  // In a robust app, we'd fetch slots dynamically via an API on date change.
  // Here, we just warn if they pick a slot that isn't pre-loaded as available.

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-[var(--color-brand-orange)] animate-spin mb-3" />
          <p className="text-[var(--color-brand-charcoal)] font-semibold text-lg shadow-sm bg-white px-4 py-2 rounded-full">Saving changes...</p>
        </div>
      )}
      <div className="space-y-6 opacity-100 transition-opacity" style={{ opacity: isPending ? 0.6 : 1 }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-bold text-[var(--color-brand-charcoal)]">{order.orderNumber}</h1>
            <select
              value={order.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={isPending}
              className={`px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider outline-none cursor-pointer border ${
                order.status === 'UNALLOCATED' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' :
                order.status === 'ALLOCATED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 border-green-200' :
                order.status === 'COLLECTED' ? 'bg-stone-200 text-stone-700 border-stone-300' :
                'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              <option value="PENDING">PENDING</option>
              <option value="UNALLOCATED">UNALLOCATED</option>
              <option value="ALLOCATED">ALLOCATED</option>
              <option value="DELIVERED">DELIVERED</option>
              {order.type === 'HIRE' && (
                <option value="COLLECTED">COLLECTED</option>
              )}
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <span className="text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-0.5 rounded">{order.type}</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded border border-orange-200">{order.source}</span>
          </div>
          <p className="text-sm text-stone-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDeleteOrder}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-sm font-medium rounded transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button 
            onClick={() => handleResendEmail('CLIENT')}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded transition-colors"
          >
            <Mail size={14} /> Resend Client
          </button>
          {order.driverId && (
            <button 
              onClick={() => handleResendEmail('DRIVER')}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded transition-colors"
            >
              <Truck size={14} /> Resend Driver
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white p-5 rounded shadow-sm border border-stone-200">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><User size={14} /> Customer</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-stone-800">{order.customerName}</p>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <Mail size={14} className="text-stone-400" />
              <a href={`mailto:${order.customerEmail}`} className="hover:text-[var(--color-brand-orange)]">{order.customerEmail}</a>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <Phone size={14} className="text-stone-400" />
              <a href={`tel:${order.customerPhone}`} className="hover:text-[var(--color-brand-orange)]">{order.customerPhone}</a>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white p-5 rounded shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14} /> Delivery</h2>
            {!isEditingAddress && (
              <button onClick={() => setIsEditingAddress(true)} className="text-stone-400 hover:text-[var(--color-brand-orange)]">
                <Edit2 size={14} />
              </button>
            )}
          </div>
          
          {!isEditingAddress ? (
            <div className="space-y-3 text-sm">
              <div className="text-stone-600">
                <p className="font-medium text-stone-800">{order.deliveryAddress}</p>
                <p>{order.deliverySuburb} {order.deliveryPostcode}</p>
              </div>
              {order.type === 'HIRE' && order.pickupPostcode && (
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-500 mb-0.5">Pickup Details:</p>
                  <p className="text-stone-800 font-medium">Postcode: {order.pickupPostcode}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Street Address</label>
                <input type="text" value={editAddress.deliveryAddress} onChange={e => setEditAddress({...editAddress, deliveryAddress: e.target.value})} className="w-full border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand-orange)]" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Suburb</label>
                  <input type="text" value={editAddress.deliverySuburb} onChange={e => setEditAddress({...editAddress, deliverySuburb: e.target.value})} className="w-full border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand-orange)]" />
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Postcode</label>
                  <input type="text" value={editAddress.deliveryPostcode} onChange={e => setEditAddress({...editAddress, deliveryPostcode: e.target.value})} className="w-full border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand-orange)]" />
                </div>
              </div>
              {order.type === 'HIRE' && (
                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Pickup Postcode</label>
                  <input type="text" value={editAddress.pickupPostcode} onChange={e => setEditAddress({...editAddress, pickupPostcode: e.target.value})} className="w-full border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand-orange)]" />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveAddress} className="flex-1 bg-[var(--color-brand-charcoal)] text-white font-semibold py-1.5 rounded text-xs hover:bg-stone-800 transition-colors">Save</button>
                <button onClick={() => setIsEditingAddress(false)} className="flex-1 bg-stone-100 text-stone-600 font-semibold py-1.5 rounded text-xs hover:bg-stone-200 transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Allocation Info */}
        <div className={`p-5 rounded shadow-sm border ${order.status === 'UNALLOCATED' ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${order.status === 'UNALLOCATED' ? 'text-red-500' : 'text-stone-400'}`}>
              <Truck size={14} /> Allocation
            </h2>
            {!isEditingAllocation && (
              <button onClick={() => setIsEditingAllocation(true)} className="text-stone-400 hover:text-[var(--color-brand-orange)]">
                <Edit2 size={14} />
              </button>
            )}
          </div>

          {!isEditingAllocation ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className={order.status === 'UNALLOCATED' ? 'text-red-400' : 'text-stone-400'} />
                <span className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className={order.status === 'UNALLOCATED' ? 'text-red-400' : 'text-stone-400'} />
                <span className="font-medium">{order.deliverySlot}</span>
              </div>
              <div className="pt-2 border-t border-stone-100/50">
                {order.driver ? (
                  <div className="font-semibold text-[var(--color-brand-charcoal)]">{order.driver.name} <span className="text-xs text-stone-400 font-normal">({order.driver.city})</span></div>
                ) : (
                  <div className="font-bold text-red-600">ACTION REQUIRED: Assign Driver</div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Date</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand-orange)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Time Slot</label>
                <select value={editSlot} onChange={e => setEditSlot(e.target.value)} className="w-full border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand-orange)] bg-white">
                  <option value="08:00-10:00">08:00-10:00</option>
                  <option value="10:00-12:00">10:00-12:00</option>
                  <option value="12:00-14:00">12:00-14:00</option>
                  <option value="14:00-16:00">14:00-16:00</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Driver</label>
                <select value={editDriverId} onChange={e => setEditDriverId(e.target.value)} className="w-full border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand-orange)] bg-white">
                  <option value="">-- Unallocated --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
                  ))}
                </select>
              </div>
              {allocationError && <p className="text-xs text-red-600 font-medium">{allocationError}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveAllocation} className="flex-1 bg-[var(--color-brand-charcoal)] text-white font-semibold py-1.5 rounded text-xs hover:bg-stone-800 transition-colors">Save</button>
                <button onClick={() => setIsEditingAllocation(false)} className="flex-1 bg-stone-100 text-stone-600 font-semibold py-1.5 rounded text-xs hover:bg-stone-200 transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Items & Totals (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-[#FDFCFB]">
              <h2 className="font-bold text-[var(--color-brand-charcoal)]">Line Items</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Line Type</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-stone-800">
                        {item.product.name} {item.isUsed ? <span className="text-xs text-stone-400 font-normal ml-1">(Used)</span> : ''}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {order.type === 'HIRE' && Number(item.depositPerUnit) > 0 ? (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">HIRE</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase">PURCHASE</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-stone-600">${Number(item.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--color-brand-charcoal)]">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Strict Totals Block */}
            <div className="bg-[#FDFCFB] border-t border-stone-200 p-6 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                {Number(order.hireTotal) > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Hire Total</span>
                    <span>${Number(order.hireTotal).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.buyTotal) > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Sale Total</span>
                    <span>${Number(order.buyTotal).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.depositTotal) > 0 && (
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>Refundable Deposit</span>
                    <span>${Number(order.depositTotal).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.deliveryFee) > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Cost</span>
                    <span>${Number(order.deliveryFee).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-${Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-base text-[var(--color-brand-charcoal)]">
                  <span>Grand Total</span>
                  <span>${Number(order.grandTotal).toFixed(2)}</span>
                </div>
                <div className="pt-2 flex items-center justify-between text-stone-500 font-medium group">
                  <span>Paid</span>
                  {!isEditingPayment ? (
                    <div className="flex items-center gap-2">
                      <span>${Number(order.amountPaid).toFixed(2)}</span>
                      <button onClick={() => setIsEditingPayment(true)} className="opacity-0 group-hover:opacity-100 text-[var(--color-brand-orange)] transition-opacity">
                        <Edit2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-stone-400">$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        className="w-20 border border-stone-200 rounded px-1.5 py-0.5 text-right text-xs focus:outline-none focus:border-[var(--color-brand-orange)]"
                        value={editAmountPaid}
                        onChange={e => setEditAmountPaid(parseFloat(e.target.value) || 0)}
                      />
                      <button onClick={handleSavePayment} className="text-green-600 hover:text-green-700 ml-1"><Save size={12} /></button>
                      <button onClick={() => setIsEditingPayment(false)} className="text-stone-400 hover:text-stone-600"><X size={12} /></button>
                    </div>
                  )}
                </div>
                <div className="pt-1 flex justify-between font-bold text-[var(--color-brand-orange)]">
                  <span>Outstanding</span>
                  <span>${(Number(order.grandTotal) - Number(order.amountPaid)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Management Block */}
          {order.type === 'HIRE' && order.depositTotal > 0 && (
            <div className="bg-white rounded shadow-sm border border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-[#FDFCFB]">
                <h2 className="font-bold text-[var(--color-brand-charcoal)]">Deposit Management</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-stone-50 rounded border border-stone-100 text-center">
                    <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Total Held</div>
                    <div className="text-lg font-bold text-stone-700">${order.depositTotal.toFixed(2)}</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-100 text-center">
                    <div className="text-[10px] font-bold text-green-600/80 uppercase mb-1">Refunded</div>
                    <div className="text-lg font-bold text-green-700">${order.depositRefunded.toFixed(2)}</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-100 text-center">
                    <div className="text-[10px] font-bold text-orange-600/80 uppercase mb-1">Forfeited</div>
                    <div className="text-lg font-bold text-orange-700">${order.depositForfeited.toFixed(2)}</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-100 text-center">
                    <div className="text-[10px] font-bold text-blue-600/80 uppercase mb-1">Remaining</div>
                    <div className="text-lg font-bold text-blue-800">${remainingDeposit.toFixed(2)}</div>
                  </div>
                </div>

                {remainingDeposit > 0 && !isResolvingDeposit && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setResolveType('REFUND'); setResolveAmount(remainingDeposit); setIsResolvingDeposit(true); }}
                      className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium rounded transition-colors text-sm flex-1"
                    >
                      Refund Deposit
                    </button>
                    <button 
                      onClick={() => { setResolveType('FORFEIT'); setResolveAmount(remainingDeposit); setIsResolvingDeposit(true); }}
                      className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-medium rounded transition-colors text-sm flex-1"
                    >
                      Forfeit Deposit (Revenue)
                    </button>
                  </div>
                )}

                {isResolvingDeposit && (
                  <div className={`p-4 rounded border ${resolveType === 'REFUND' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <h3 className={`font-bold text-sm mb-3 ${resolveType === 'REFUND' ? 'text-green-800' : 'text-orange-800'}`}>
                      {resolveType === 'REFUND' ? 'Refund Deposit to Customer' : 'Forfeit Deposit to Revenue'}
                    </h3>
                    <div className="flex gap-4 mb-3">
                      <div className="w-1/3">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Amount ($)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          max={remainingDeposit}
                          className="w-full border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:border-[var(--color-brand-orange)]"
                          value={resolveAmount}
                          onChange={e => setResolveAmount(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Reason (Optional)</label>
                        <input 
                          type="text" 
                          className="w-full border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:border-[var(--color-brand-orange)]"
                          value={resolveReason}
                          placeholder={resolveType === 'REFUND' ? 'e.g. Boxes returned in good condition' : 'e.g. Damaged boxes'}
                          onChange={e => setResolveReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleResolveDeposit} 
                        disabled={resolveAmount <= 0 || resolveAmount > remainingDeposit || isPending}
                        className={`px-4 py-1.5 text-white font-semibold rounded text-sm transition-colors flex items-center gap-2 ${
                          resolveType === 'REFUND' 
                            ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                            : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
                        }`}
                      >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                        {isPending && resolveType === 'REFUND' ? 'Processing Gateway...' : isPending ? 'Processing...' : `Confirm ${resolveType === 'REFUND' ? 'Refund' : 'Forfeit'}`}
                      </button>
                      <button 
                        onClick={() => setIsResolvingDeposit(false)} 
                        className="px-4 py-1.5 bg-white border border-stone-200 text-stone-600 font-semibold rounded text-sm hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {order.depositResolutions && order.depositResolutions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-3">Resolution History</h3>
                    <ul className="space-y-2">
                      {order.depositResolutions.map((res: any) => (
                        <li key={res.id} className="flex justify-between items-center text-sm p-3 bg-stone-50 rounded border border-stone-100">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${res.type === 'REFUND' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {res.type}
                              </span>
                              <span className="font-semibold text-stone-800">${res.amount.toFixed(2)}</span>
                            </div>
                            {res.reason && <p className="text-xs text-stone-500">{res.reason}</p>}
                          </div>
                          <div className="text-xs text-stone-400">
                            {new Date(res.processedAt).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Email Logs (1 column) */}
        <div className="bg-white rounded shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-stone-100 bg-[#FDFCFB]">
            <h2 className="font-bold text-[var(--color-brand-charcoal)]">Email History</h2>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {order.emailLogs.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-500">No emails logged.</div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {order.emailLogs.map((log: any) => (
                  <li key={log.id} className="p-4 hover:bg-stone-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-stone-700">{log.templateType.replace('_', ' ')}</span>
                      {log.status === 'SUCCESS' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded"><CheckCircle size={10} /> SENT</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded"><XCircle size={10} /> FAILED</span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 space-y-0.5">
                      <p><span className="font-medium">To:</span> {log.toEmail}</p>
                      <p><span className="font-medium">Date:</span> {new Date(log.sentAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
