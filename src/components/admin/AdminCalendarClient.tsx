'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { toggleSlotStatus } from '@/app/actions/calendarActions';
import Link from 'next/link';

type Props = {
  drivers: any[];
  availabilities: any[];
  orders: any[];
};

const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00'
];

// Helper to get start of week (Monday)
const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

export default function AdminCalendarClient({ drivers, availabilities, orders }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [weekStart, setWeekStart] = useState<Date>(() => getStartOfWeek(new Date()));
  const [filterCity, setFilterCity] = useState<string>('Sydney'); // Default to Sydney since it has the failover
  
  // Extract unique cities
  const cities = useMemo(() => Array.from(new Set(drivers.map(d => d.city))), [drivers]);

  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  // Generate the 7 days of the week
  const days = useMemo(() => {
    const d = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      d.push(date);
    }
    return d;
  }, [weekStart]);

  // Filter drivers by selected city
  const visibleDrivers = useMemo(() => {
    if (!filterCity) return drivers;
    return drivers.filter(d => d.city === filterCity);
  }, [drivers, filterCity]);

  // Handle click on a slot
  const handleSlotClick = (driverId: string, dateStrLocal: string, slot: string, currentStatus: string, hasOrder: boolean) => {
    if (hasOrder) {
      // Don't toggle booked slots
      return;
    }
    
    // Optimistic / start transition
    startTransition(async () => {
      try {
        await toggleSlotStatus(driverId, dateStrLocal, slot, currentStatus === 'AVAILABLE');
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <div className="bg-white rounded shadow-sm border border-[#C8A47C] overflow-hidden" style={{ opacity: isPending ? 0.6 : 1 }}>
      {/* Toolbar */}
      <div className="p-4 border-b border-stone-200 bg-[#FDFCFB] flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-stone-100 rounded p-1">
            <button onClick={handlePrevWeek} className="p-1 hover:bg-white rounded text-stone-600 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-2 text-sm font-bold text-[#2B2B28]">
              <CalendarIcon size={14} className="text-[#E8590C]" />
              Week of {weekStart.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <button onClick={handleNextWeek} className="p-1 hover:bg-white rounded text-stone-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-stone-400" />
            <select 
              value={filterCity} 
              onChange={e => setFilterCity(e.target.value)}
              className="text-sm font-medium bg-transparent border-none focus:ring-0 text-[#2B2B28] cursor-pointer"
            >
              <option value="">Select City</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white border border-stone-200"></div>
            <span className="text-[#2B2B28]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-50 border border-[#E8590C]"></div>
            <span className="text-[#2B2B28]">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#2B2B28] border border-[#2B2B28]"></div>
            <span className="text-stone-500">Blocked out</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-[#FDFCFB] border-b border-r border-[#C8A47C]/30 w-32 min-w-[120px]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Time Slot</span>
              </th>
              {days.map(day => (
                <th key={day.toISOString()} className="p-3 bg-[#FDFCFB] border-b border-r border-[#C8A47C]/30 min-w-[140px] text-center">
                  <div className="font-bold text-[#2B2B28]">{day.toLocaleDateString('en-AU', { weekday: 'short' })}</div>
                  <div className="text-[10px] font-semibold text-stone-500 uppercase">{day.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <React.Fragment key={slot}>
                {/* We map over drivers for each slot so that the slot groups the drivers */}
                {visibleDrivers.map((driver, index) => {
                  const isFirstDriver = index === 0;
                  const isLastDriver = index === visibleDrivers.length - 1;

                  return (
                    <tr key={`${slot}-${driver.id}`}>
                      <td className={`p-3 border-r border-[#C8A47C]/30 bg-stone-50 font-medium text-sm text-[#2B2B28] whitespace-nowrap ${isLastDriver ? 'border-b border-[#C8A47C]' : 'border-b border-stone-200'}`}>
                        {isFirstDriver ? (
                          <div className="flex flex-col">
                            <span className="font-bold mb-1">{slot}</span>
                            <span className="text-xs text-stone-500">{driver.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-500">{driver.name}</span>
                        )}
                      </td>
                      {days.map(day => {
                        // Generate the strict YYYY-MM-DD string for local day without timezone shifting
                        const dateStrLocal = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;

                        // Find availability for this driver, date, slot
                        // Prisma returns DB Dates as UTC midnight, so `.toISOString().split('T')[0]` correctly extracts exactly the stored YYYY-MM-DD
                        const avail = availabilities.find(a => 
                          a.driverId === driver.id && 
                          new Date(a.date).toISOString().split('T')[0] === dateStrLocal &&
                          a.timeSlot === slot
                        );

                        // Find if there is an order for this driver, date, slot
                        const order = orders.find(o => 
                          o.driverId === driver.id &&
                          new Date(o.deliveryDate).toISOString().split('T')[0] === dateStrLocal &&
                          o.deliverySlot === slot
                        );

                        // Determine state
                        let status = avail ? avail.status : 'AVAILABLE'; // Default is available if no record exists
                        const hasOrder = !!order;

                        let cellClass = `p-3 border-r border-[#C8A47C]/30 text-center transition-colors relative cursor-pointer ${isLastDriver ? 'border-b border-[#C8A47C]' : 'border-b border-stone-200'} `;
                        
                        if (hasOrder) {
                          cellClass += "bg-orange-50 hover:bg-orange-100 cursor-default";
                        } else if (status === 'UNAVAILABLE') {
                          cellClass += "bg-[#2B2B28] hover:bg-stone-800 text-white";
                        } else {
                          cellClass += "bg-white hover:bg-stone-50";
                        }

                        return (
                          <td 
                            key={`${driver.id}-${dateStrLocal}`} 
                            className={cellClass}
                            onClick={() => handleSlotClick(driver.id, dateStrLocal, slot, status, hasOrder)}
                          >
                            {hasOrder ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-[#E8590C] uppercase mb-0.5 tracking-wider">Booked</span>
                                <Link href={`/admin/orders/${order.id}`} className="text-xs font-bold text-[#2B2B28] hover:underline hover:text-[#E8590C]">
                                  {order.orderNumber}
                                </Link>
                              </div>
                            ) : status === 'UNAVAILABLE' ? (
                              <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Blocked</div>
                            ) : (
                              <div className="text-[10px] font-medium text-stone-200 group-hover:text-stone-300">Available</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {visibleDrivers.length === 0 && (
          <div className="p-12 text-center text-stone-500 font-medium">
            No drivers found for this city.
          </div>
        )}
      </div>
    </div>
  );
}
