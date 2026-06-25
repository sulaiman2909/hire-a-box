'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Calendar, Clock, DollarSign, Package, ShieldAlert, Truck, TrendingUp, PackageSearch } from 'lucide-react';

export default function AdminDashboardClient({ data }: { data: any }) {
  const [pipelineTab, setPipelineTab] = useState<'HIRE' | 'BUY'>('HIRE');
  const statusData = pipelineTab === 'HIRE' ? data.statusCountsHire : data.statusCountsBuy;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[var(--color-brand-charcoal)]">Ops Dashboard</h1>
          <p className="text-stone-500 mt-1">Real-time operational overview and dispatch control.</p>
        </div>
      </div>

      {/* Priority Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.unallocatedCount > 0 ? (
          <Link href="/admin/orders?status=UNALLOCATED" className="block p-4 rounded bg-red-50 border border-red-200 hover:bg-red-100 transition-colors group">
            <div className="flex items-center gap-3 text-red-700">
              <ShieldAlert size={24} className="group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-bold text-lg">Action Needed: {data.unallocatedCount} Unallocated Orders</h3>
                <p className="text-sm text-red-600/80">Orders require manual driver assignment.</p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded bg-green-50 border border-green-200">
            <div className="flex items-center gap-3 text-green-700">
              <AlertCircle size={24} />
              <div>
                <h3 className="font-bold">No Unallocated Orders</h3>
                <p className="text-sm text-green-600/80">All current orders have assigned drivers.</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 rounded bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-3 text-orange-700">
            <Clock size={24} />
            <div>
              <h3 className="font-bold">{data.actionNeededCount} Pending Deliveries</h3>
              <p className="text-sm text-orange-600/80">Scheduled for today or tomorrow.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financials & Liabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Total Revenue (Today) */}
        <div className="bg-white p-5 rounded shadow-sm border border-stone-200">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp size={14} /> Revenue (Today)</div>
          <div className="text-2xl font-bold text-[var(--color-brand-charcoal)] mb-3">
            ${(data.revenueToday.hire + data.revenueToday.sale).toFixed(2)}
          </div>
          <div className="flex justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>Hire: ${data.revenueToday.hire.toFixed(2)}</span>
            <span>Sale: ${data.revenueToday.sale.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Revenue (This Month) */}
        <div className="bg-white p-5 rounded shadow-sm border border-stone-200">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp size={14} /> Revenue (MTD)</div>
          <div className="text-2xl font-bold text-[var(--color-brand-charcoal)] mb-3">
            ${(data.revenueMonth.hire + data.revenueMonth.sale).toFixed(2)}
          </div>
          <div className="flex justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>Hire: ${data.revenueMonth.hire.toFixed(2)}</span>
            <span>Sale: ${data.revenueMonth.sale.toFixed(2)}</span>
          </div>
        </div>

        {/* Deposit Liability */}
        <div className="bg-blue-50 p-5 rounded shadow-sm border border-blue-100">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><DollarSign size={14} /> Deposit Liability</div>
          <div className="text-2xl font-bold text-blue-800 mb-3">
            ${data.depositLiability.toFixed(2)}
          </div>
          <div className="text-xs text-blue-600/80 pt-2 border-t border-blue-100">
            Held across {data.activeHireOrdersCount} active hire orders
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className={`p-5 rounded shadow-sm border ${data.outstandingTotal > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-stone-200'}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${data.outstandingTotal > 0 ? 'text-orange-600' : 'text-stone-400'}`}><DollarSign size={14} /> Outstanding</div>
          <div className={`text-2xl font-bold mb-3 ${data.outstandingTotal > 0 ? 'text-orange-800' : 'text-[var(--color-brand-charcoal)]'}`}>
            ${data.outstandingTotal.toFixed(2)}
          </div>
          <div className={`text-xs pt-2 border-t ${data.outstandingTotal > 0 ? 'text-orange-600/80 border-orange-200' : 'text-stone-500 border-stone-100'}`}>
            Unpaid balance on active orders
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Visual */}
        <div className="lg:col-span-2 bg-white p-5 rounded shadow-sm border border-stone-200">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-6">14-Day Order Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#78716c'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#78716c'}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [name === 'revenue' ? `$${Number(value).toFixed(2)}` : value, name === 'revenue' ? 'Gross Cash Flow' : 'Orders']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dispatch & Order Status */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5"><PackageSearch size={14} /> Pipeline Status</h2>
              <div className="flex bg-stone-100 p-0.5 rounded text-[10px] font-bold uppercase">
                <button 
                  onClick={() => setPipelineTab('HIRE')} 
                  className={`px-2 py-1 rounded transition-colors ${pipelineTab === 'HIRE' ? 'bg-white shadow-sm text-[var(--color-brand-charcoal)]' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Hire
                </button>
                <button 
                  onClick={() => setPipelineTab('BUY')} 
                  className={`px-2 py-1 rounded transition-colors ${pipelineTab === 'BUY' ? 'bg-white shadow-sm text-[var(--color-brand-charcoal)]' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Buy
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600 font-medium">Pending</span>
                <span className="font-bold text-[var(--color-brand-charcoal)]">{statusData?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600 font-medium">Allocated</span>
                <span className="font-bold text-[var(--color-brand-charcoal)]">{statusData?.allocated || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5"><Truck size={14} /> Dispatch Load</h2>
            </div>
            
            <div className="mb-4">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase mb-2">Today</h3>
              {data.dispatchToday.length === 0 ? (
                <p className="text-xs text-stone-500">No deliveries scheduled today.</p>
              ) : (
                <div className="space-y-2">
                  {data.dispatchToday.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-stone-700 font-medium">{d.name} <span className="text-xs text-stone-400">({d.city})</span></span>
                      <span className="font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-stone-400 uppercase mb-2 pt-3 border-t border-stone-100">This Week</h3>
              {data.dispatchThisWeek.length === 0 ? (
                <p className="text-xs text-stone-500">No deliveries scheduled this week.</p>
              ) : (
                <div className="space-y-2">
                  {data.dispatchThisWeek.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-stone-700 font-medium">{d.name} <span className="text-xs text-stone-400">({d.city})</span></span>
                      <span className="font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
