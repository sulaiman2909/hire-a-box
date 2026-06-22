'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { OrderStatus, OrderType, OrderSource } from '@prisma/client';

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  source: OrderSource;
  type: OrderType;
  status: OrderStatus;
  createdAt: Date;
  customerName: string;
  deliverySuburb: string;
  deliveryDate: Date;
  deliverySlot: string;
  grandTotal: number;
  driverName: string | null;
};

interface Props {
  orders: AdminOrderRow[];
}

type SortField = 'orderNumber' | 'createdAt' | 'status' | 'driverName' | 'deliveryDate';
type SortDirection = 'asc' | 'desc';

export default function AdminOrdersTable({ orders }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | OrderSource>('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Source Filter
      if (sourceFilter !== 'ALL' && o.source !== sourceFilter) return false;
      
      // Search Filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !o.orderNumber.toLowerCase().includes(term) &&
          !o.customerName.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'driverName') {
        valA = a.driverName || 'UNALLOCATED';
        valB = b.driverName || 'UNALLOCATED';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, searchTerm, sourceFilter, sortField, sortDirection]);

  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    switch (status) {
      case 'UNALLOCATED':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase tracking-wider">UNALLOCATED</span>;
      case 'ALLOCATED':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">ALLOCATED</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">DELIVERED</span>;
      case 'COLLECTED':
        return <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-[10px] font-bold rounded uppercase tracking-wider">COLLECTED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 bg-stone-300 text-stone-600 text-[10px] font-bold rounded uppercase tracking-wider">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded uppercase tracking-wider">{status}</span>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#FDFCFB]">
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search order or customer..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-[var(--color-brand-orange)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-stone-500 text-xs uppercase tracking-wider">Source:</span>
          <select 
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value as any)}
            className="border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[var(--color-brand-orange)] bg-white"
          >
            <option value="ALL">All Orders</option>
            <option value="WEB">Web Only</option>
            <option value="MANUAL">Manual Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('orderNumber')}>
                <div className="flex items-center gap-1">Order # <SortIcon field="orderNumber" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-1">Placed On <SortIcon field="createdAt" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('driverName')}>
                <div className="flex items-center gap-1">Driver <SortIcon field="driverName" /></div>
              </th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => handleSort('deliveryDate')}>
                <div className="flex items-center gap-1">Delivery Date <SortIcon field="deliveryDate" /></div>
              </th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Suburb</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-stone-500">
                  No orders found matching your filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[var(--color-brand-orange)] group-hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-2.5">
                    {order.driverName ? (
                      <span className="text-stone-700 font-medium">{order.driverName}</span>
                    ) : (
                      <span className="text-red-600 font-semibold text-[11px] bg-red-50 px-1.5 py-0.5 rounded border border-red-100">UNALLOCATED</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">{order.type} {order.source === 'MANUAL' && <span className="text-[9px] ml-1 text-stone-400 uppercase tracking-widest">(MANUAL)</span>}</td>
                  <td className="px-4 py-2.5 font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-stone-600">{order.deliverySlot}</td>
                  <td className="px-4 py-2.5 font-medium text-stone-800">{order.customerName}</td>
                  <td className="px-4 py-2.5 text-stone-600">{order.deliverySuburb}</td>
                  <td className="px-4 py-2.5 text-right font-medium">${Number(order.grandTotal).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-100 bg-stone-50 text-xs text-stone-500 font-medium">
        Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
      </div>
    </div>
  );
}
