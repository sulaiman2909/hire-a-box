'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Package, Truck, PackagePlus, Warehouse, Menu, X, Phone, Mail, ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/customer/CartProvider';

export default function CustomerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state, openCart } = useCart();
  
  const hireCount = state.hireItems.reduce((acc, item) => acc + item.quantity, 0);
  const buyCount = state.buyItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalItems = hireCount + buyCount;

  const handleOpenCart = () => {
    if (buyCount > 0 && hireCount === 0) {
      openCart('buy');
    } else {
      openCart('hire');
    }
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col shadow-md">
      {/* Top Tier: White Background */}
      <div className="bg-white border-b border-[var(--color-brand-charcoal)]/10 relative z-20">
        <div className="max-w-[1360px] mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center shrink-0 py-2">
            <img src="/header-logo.png" alt="Hire A Box" className="h-12 sm:h-16 w-auto object-contain" />
          </Link>

          {/* Center: Hire Group Service Links (Desktop) */}
          <div className="hidden xl:flex items-center h-full absolute left-1/2 -translate-x-1/2 border-l border-[var(--color-brand-charcoal)]/10">
            <Link href="/" className="flex items-center gap-2 px-6 h-full text-[#E8590C] hover:bg-black/5 transition-colors font-poppins font-bold text-[16px] border-r border-[var(--color-brand-charcoal)]/10">
              <Package className="w-5 h-5 shrink-0" /> BOXES
            </Link>
            <a href="https://www.hireamover.com.au/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 h-full text-[#2B9CD8] hover:bg-black/5 transition-colors font-poppins font-bold text-[16px] border-r border-[var(--color-brand-charcoal)]/10">
              <Truck className="w-5 h-5 shrink-0" /> MOVING
            </a>
            <a href="https://hireapacker.com.au/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 h-full text-[#8B5C9E] hover:bg-black/5 transition-colors font-poppins font-bold text-[16px] border-r border-[var(--color-brand-charcoal)]/10">
              <PackagePlus className="w-5 h-5 shrink-0" /> PACKING
            </a>
            <a href="https://hirestorage.com.au/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 h-full text-[#5BB94A] hover:bg-black/5 transition-colors font-poppins font-bold text-[16px] border-r border-[var(--color-brand-charcoal)]/10">
              <Warehouse className="w-5 h-5 shrink-0" /> STORAGE
            </a>
          </div>

          {/* Right: CTA & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-stretch shadow-sm hover:shadow-md transition-shadow rounded-md">
              <Link 
                href="/hire"
                className="bg-[var(--color-brand-orange)] text-white hover:bg-[#c94d0a] transition-colors py-2 px-4 sm:py-2.5 sm:px-6 text-[13px] sm:text-[14px] font-poppins font-semibold uppercase tracking-wide flex items-center justify-center rounded-l-md relative"
              >
                Hire
              </Link>
              <Link 
                href="/buy"
                className="bg-[var(--color-brand-charcoal)] text-white hover:bg-[#1a1a18] transition-colors py-2 px-4 sm:py-2.5 sm:px-6 text-[13px] sm:text-[14px] font-poppins font-semibold uppercase tracking-wide flex items-center justify-center rounded-r-md relative"
              >
                Buy Now
              </Link>
            </div>
            <button 
              onClick={handleOpenCart}
              className="relative p-2 text-[var(--color-brand-charcoal)] hover:text-[var(--color-brand-orange)] transition-colors ml-2 mr-1 sm:mr-2"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-[var(--color-brand-orange)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
            <button
              className="xl:hidden p-1.5 sm:p-2 text-[var(--color-brand-charcoal)] hover:text-[var(--color-brand-orange)] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tier: Solid Orange Bar (Desktop) */}
      <div className="bg-[var(--color-brand-orange)] text-white hidden xl:block relative z-10">
        <div className="max-w-[1360px] mx-auto px-6 h-12 flex items-center justify-between">
          {/* Primary Nav */}
          <nav className="flex items-center gap-8 font-poppins font-semibold text-[16px] tracking-wide">
            <Link href="/hire" className="hover:text-white/80 transition-colors uppercase">Hire Boxes</Link>
            <Link href="/buy" className="hover:text-white/80 transition-colors uppercase">Buy Boxes</Link>
            <a href="/#testimonials" className="hover:text-white/80 transition-colors uppercase">Testimonials</a>
            <a href="/#faq" className="hover:text-white/80 transition-colors uppercase">FAQ</a>
            <a href="/#resources" className="hover:text-white/80 transition-colors uppercase">Resources</a>
          </nav>

          {/* Phone & Email Links */}
          <div className="flex items-center gap-6 font-poppins text-[16px] font-semibold">
            <a href="tel:1300858446" className="flex items-center gap-2 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/40">
              <Phone className="w-5 h-5 shrink-0" /> 1300 858 446
            </a>
            <a href="mailto:enquiries@hireabox.com.au" className="flex items-center gap-2 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/40">
              <Mail className="w-5 h-5 shrink-0" /> enquiries@hireabox.com.au
            </a>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white absolute top-full left-0 right-0 shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[calc(100vh-64px)] z-0 border-t border-[var(--color-brand-charcoal)]/5">
          {/* Primary Nav */}
          <nav className="flex flex-col p-6 space-y-5 font-poppins font-bold text-[16px] uppercase text-[var(--color-brand-charcoal)] border-b border-black/5">
            <Link href="/hire" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-brand-orange)] transition-colors">Hire Boxes</Link>
            <Link href="/buy" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-brand-orange)] transition-colors">Buy Boxes</Link>
            <a href="/#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-brand-orange)] transition-colors">Testimonials</a>
            <a href="/#faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-brand-orange)] transition-colors">FAQ</a>
            <a href="/#resources" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-brand-orange)] transition-colors">Resources</a>
          </nav>

          {/* Service Links Grid */}
          <div className="p-6 grid grid-cols-2 gap-4 border-b border-black/5 bg-[var(--color-brand-warm-white)]/50">
            <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-[#5A5A52] mb-1">Our Services</span>
            <Link href="/" className="flex items-center gap-2 text-[#E8590C] font-poppins font-bold text-[15px] p-3 bg-white rounded-md shadow-sm border border-black/5 hover:bg-black/5" onClick={() => setIsMobileMenuOpen(false)}>
              <Package className="w-5 h-5 shrink-0" /> Boxes
            </Link>
            <a href="https://www.hireamover.com.au/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#2B9CD8] font-poppins font-bold text-[15px] p-3 bg-white rounded-md shadow-sm border border-black/5 hover:bg-black/5" onClick={() => setIsMobileMenuOpen(false)}>
              <Truck className="w-5 h-5 shrink-0" /> Moving
            </a>
            <a href="https://hireapacker.com.au/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#8B5C9E] font-poppins font-bold text-[15px] p-3 bg-white rounded-md shadow-sm border border-black/5 hover:bg-black/5" onClick={() => setIsMobileMenuOpen(false)}>
              <PackagePlus className="w-5 h-5 shrink-0" /> Packing
            </a>
            <a href="https://hirestorage.com.au/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#5BB94A] font-poppins font-bold text-[15px] p-3 bg-white rounded-md shadow-sm border border-black/5 hover:bg-black/5" onClick={() => setIsMobileMenuOpen(false)}>
              <Warehouse className="w-5 h-5 shrink-0" /> Storage
            </a>
          </div>

          {/* Contact */}
          <div className="p-6 flex flex-col gap-4 font-sans text-sm font-semibold text-[var(--color-brand-charcoal)]">
            <a href="tel:1300858446" className="flex items-center gap-3 hover:text-[var(--color-brand-orange)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--color-brand-orange)]/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[var(--color-brand-orange)]" />
              </div>
              1300 858 446
            </a>
            <a href="mailto:enquiries@hireabox.com.au" className="flex items-center gap-3 hover:text-[var(--color-brand-orange)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--color-brand-orange)]/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[var(--color-brand-orange)]" />
              </div>
              <span className="truncate">enquiries@hireabox.com.au</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
