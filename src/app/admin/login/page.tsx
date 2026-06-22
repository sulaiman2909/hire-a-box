import React from 'react';
import { signIn } from '@/auth';

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans text-[var(--color-brand-charcoal)]">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden">
        <div className="p-8 text-center border-b border-stone-50 bg-[#FDFCFB]">
          <h1 className="font-heading font-bold text-2xl mb-1 text-[var(--color-brand-charcoal)]">Ops Login</h1>
          <p className="text-sm text-stone-500">Internal system access</p>
        </div>
        
        <div className="p-8">
          <form 
            action={async (formData) => {
              'use server';
              await signIn('credentials', {
                ...Object.fromEntries(formData),
                redirectTo: '/admin/orders',
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@hireabox.com.au"
                className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)] focus:border-transparent text-sm transition-shadow"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)] focus:border-transparent text-sm transition-shadow"
              />
            </div>

            {error === 'CredentialsSignin' && (
              <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600 text-xs font-medium">
                Invalid email or password.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[var(--color-brand-charcoal)] hover:bg-stone-800 text-white font-semibold py-2.5 rounded-md text-sm transition-colors mt-2 shadow-sm"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
