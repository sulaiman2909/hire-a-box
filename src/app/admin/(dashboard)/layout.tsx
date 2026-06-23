import React from 'react';
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { LogOut, PackageSearch, Truck, Calendar, PlusCircle, LayoutDashboard } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session) {
    // Should be handled by middleware, but fallback here
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen bg-stone-50 text-[var(--color-brand-charcoal)] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <Link href="/admin">
            <img src="/header-logo.png" alt="Hire A Box" className="h-8 w-auto object-contain" />
          </Link>
          <div className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full uppercase tracking-wider shrink-0 ml-2">Admin</div>
        </div>
        
        <div className="p-4 flex-grow">
          <nav className="space-y-1">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-50 text-stone-700 font-medium transition-colors"
            >
              <LayoutDashboard size={18} className="text-stone-400" />
              Dashboard
            </Link>
            <Link 
              href="/admin/orders" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-50 text-stone-700 font-medium transition-colors"
            >
              <PackageSearch size={18} className="text-stone-400" />
              Orders
            </Link>
            <Link 
              href="/admin/calendar" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-50 text-stone-700 font-medium transition-colors"
            >
              <Calendar size={18} className="text-stone-400" />
              Driver Calendar
            </Link>

          </nav>
        </div>

        <div className="p-4 border-t border-stone-100">
          <div className="mb-4 px-3">
            <p className="text-sm font-semibold truncate">{session.user?.name}</p>
            <p className="text-xs text-stone-500 truncate">{session.user?.email}</p>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/admin/login' });
            }}
          >
            <button 
              type="submit"
              className="flex items-center justify-center w-full gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium text-sm transition-colors"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-stone-50/50">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
