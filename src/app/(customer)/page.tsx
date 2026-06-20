'use client';

import Link from 'next/link';
import { useState } from 'react';
import Tabs from '@/components/customer/Tabs';
import FAQ from '@/components/customer/FAQ';
import ComparisonTable from '@/components/customer/ComparisonTable';
import SafeImage from '@/components/customer/SafeImage';
import TestimonialsSlider from '@/components/customer/TestimonialsSlider';
import { CheckCircle2, Clock, Truck, ShieldCheck, MapPin, Star, Package, RefreshCw, HandHeart, Check, Info, Users, XCircle, ShoppingCart, CalendarDays, CreditCard, PackageOpen, CalendarCheck, Banknote, Layers, Boxes, Home, Leaf, Award, Wallet, CalendarClock, BadgeCheck, Infinity, BedSingle, BedDouble, Building, Building2, ChevronDown } from 'lucide-react';
import AustraliaMap from '@/components/customer/AustraliaMap';
import TrustStats from '@/components/customer/TrustStats';

export default function LandingPage() {
  const [postcode, setPostcode] = useState('');
  const [postcodeStatus, setPostcodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [postcodeMessage, setPostcodeMessage] = useState('');
  const [homeSize, setHomeSize] = useState<string | null>(null);
  const [pricingMode, setPricingMode] = useState<'hire' | 'buy'>('hire');

  const checkPostcode = () => {
    if (!postcode) return;
    
    // Mock validation logic
    const validPrefixes = ['20', '21', '22', '30', '31', '32', '40', '41', '60', '61'];
    const isValid = validPrefixes.some(prefix => postcode.startsWith(prefix)) && postcode.length === 4;

    if (isValid) {
      setPostcodeStatus('success');
      setPostcodeMessage(`Great! We deliver to ${postcode}`);
    } else {
      setPostcodeStatus('error');
      setPostcodeMessage("Sorry, we don't service this area yet.");
    }
  };

  const boxCounts: Record<string, { med: number, lg: number, hire: string, buy: string }> = {
    '1-bed': { med: 15, lg: 10, hire: '80', buy: '85' },
    '2-bed': { med: 25, lg: 15, hire: '140', buy: '150' },
    '3-bed': { med: 35, lg: 20, hire: '185', buy: '240' },
    '4-bed': { med: 50, lg: 25, hire: '300', buy: '345' },
    '5-bed': { med: 60, lg: 40, hire: '370', buy: '400' },
  };

  const selectedBoxes = boxCounts[homeSize || ''] || boxCounts['3-bed'];
  const totalBoxes = selectedBoxes.med + selectedBoxes.lg;

  return (
    <div className="bg-[var(--color-brand-warm-white)] font-sans text-[var(--color-brand-charcoal)] min-h-screen">

      {/* 2. HERO */}
      <section className="relative pt-0 md:pt-10 bg-[var(--color-brand-warm-white)] overflow-hidden">
        
        {/* Desktop Full-Bleed Image Background */}
        <div className="hidden md:block absolute top-0 bottom-0 right-0 w-[50vw] lg:w-[45vw] z-0">
          <SafeImage 
            src="/hero-image.png" 
            alt="Happy family moving boxes" 
            placeholderLabel="Hero: family with moving boxes" 
            fill 
            className="object-cover object-left-top brightness-105 contrast-105 saturate-[0.95]" 
            priority 
            unoptimized
          />
          {/* Soft feathered gradient fade on the inner edge (left side) blending into background */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--color-brand-warm-white)] to-transparent z-10 pointer-events-none"></div>

          {/* Google Rating Card - Desktop (Upper right staggered) */}
          <div className="absolute top-8 right-8 lg:right-16 z-30 bg-white rounded-[12px] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.08)] flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <svg className="w-10 h-10 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="font-heading font-extrabold text-[32px] text-[#0B1B3D] leading-none tracking-tight">4.8</div>
            <div className="flex flex-col gap-1 mt-0.5">
              <div className="font-sans font-semibold text-[12px] text-[#0B1B3D] leading-none">Star rating on google</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-[#FFC107]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>
            <div className="w-[2px] h-10 bg-[#0B1B3D] mx-1"></div>
            <div className="font-heading font-bold text-[18px] text-[#0B1B3D] leading-none">100+ Reviews</div>
          </div>
        </div>

        {/* Mobile Full-Bleed Background Image */}
        <div className="md:hidden absolute inset-0 z-0">
          <SafeImage 
            src="/hero-image.png" 
            alt="Happy family moving boxes" 
            placeholderLabel="Hero: family with moving boxes" 
            fill 
            className="object-cover object-center brightness-90 contrast-105" 
            priority 
            unoptimized
          />
          {/* Dark gradient scrim for mobile readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-charcoal)] via-[var(--color-brand-charcoal)]/80 to-[var(--color-brand-charcoal)]/30 pointer-events-none" />
        </div>

        {/* Main Content Grid */}
        <div className="max-w-[1360px] mx-auto grid md:grid-cols-2 relative z-20">
          
          {/* Left Text Column */}
          <div className="px-6 py-8 md:py-0 md:min-h-[600px] z-20 flex flex-col justify-center animate-fade-in-up mt-4 md:-mt-8 text-white md:text-[var(--color-brand-charcoal)]">
            <h1 className="font-heading font-semibold text-[42px] md:text-[64px] leading-[1.05] mb-6 tracking-tight text-white md:text-[var(--color-brand-charcoal)]">
              <span className="block">Moving boxes for</span>
              <span className="block relative w-fit">
                hire <span className="text-[var(--color-brand-orange)]">or sale</span>
                {/* Hand-drawn underline echoing over both words */}
                <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-3 md:h-4 text-[var(--color-brand-orange)]" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M2,14 Q25,8 50,14 T98,12" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
                </svg>
              </span>
              <span className="block">delivered free.</span>
            </h1>
            <p className="text-[16px] leading-[1.6] text-white/90 md:text-[#5A5A52] mb-8 prose-width">
              Hire from <span className="font-heading font-bold text-[18px] md:text-[20px] text-white md:text-[var(--color-brand-charcoal)]">$3.25</span> a box with a refundable deposit, or buy new and used boxes. Free next-day delivery in Sydney, Melbourne, Perth and Adelaide with 2-hour windows.
            </p>

            {/* Postcode check */}
            <div className="max-w-sm mb-8">
              <div className="flex bg-white p-1 rounded-md border border-[var(--color-brand-charcoal)]/20 shadow-sm focus-within:border-[var(--color-brand-orange)] transition-colors">
                <input
                  type="text"
                  placeholder="Enter your postcode..."
                  className="flex-grow px-4 py-2 outline-none text-[var(--color-brand-charcoal)] bg-transparent"
                  value={postcode}
                  onChange={(e) => {
                    setPostcode(e.target.value);
                    if (postcodeStatus !== 'idle') setPostcodeStatus('idle');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && checkPostcode()}
                />
                <button 
                  onClick={checkPostcode}
                  className="bg-[var(--color-brand-charcoal)] hover:bg-black text-white px-6 py-2 rounded font-heading font-semibold text-[14px] transition-colors"
                >
                  Check
                </button>
              </div>
              
              {/* Inline status messages */}
              {postcodeStatus === 'success' && (
                <div className="flex items-center gap-2 mt-2 text-[14px] font-semibold text-[var(--color-brand-teal)] animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                  <CheckCircle2 className="w-4 h-4" /> {postcodeMessage}
                </div>
              )}
              {postcodeStatus === 'error' && (
                <div className="flex items-center gap-2 mt-2 text-[14px] font-semibold text-[var(--color-brand-orange)] animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                  <XCircle className="w-4 h-4" /> {postcodeMessage}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-sm sm:max-w-none w-full">
              <Link href="/hire" className="btn-primary w-full sm:w-auto py-3.5 text-[15px]">
                Hire moving boxes
              </Link>
              <Link href="/buy" className="inline-flex items-center justify-center rounded-md w-full sm:w-auto px-6 py-3.5 font-heading font-semibold text-[15px] transition-all duration-200 border-2 border-white text-white hover:bg-white/10 md:border-[var(--color-brand-charcoal)] md:text-[var(--color-brand-charcoal)] md:hover:bg-[var(--color-brand-charcoal)]/5 shadow-sm hover:-translate-y-0.5">
                Buy moving boxes
              </Link>
            </div>
          </div>

          {/* Image container (Right Column) */}
          <div className="hidden md:flex relative min-h-[600px]">
          </div>

        </div>
      </section>

      {/* 3. TRUST STATS BAND */}
      <TrustStats />

      {/* 4. TWO-PATH CARDS */}
      <section className="py-24 bg-[var(--color-brand-warm-white)]">
        <div className="max-w-[1360px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="section-eyebrow">Choose your path</span>
            <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-[1.2]">Do you want to hire or buy?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Hire Card */}
            <div className="bg-white p-8 md:p-10 rounded-[12px] border border-[var(--color-brand-charcoal)]/5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-heading font-bold text-[24px]">Hire moving boxes</h3>
                <span className="bg-[var(--color-brand-orange)] text-white text-[12px] font-heading font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0 ml-2">
                  Popular Choice
                </span>
              </div>
              <div className="flex-grow">
                <p className="text-[16px] leading-[1.6] text-[#5A5A52] mb-8 prose-width">
                  Save more, skip the disposal headache — from <span className="text-[var(--color-brand-orange)] font-semibold">$3.25/box</span>, refundable deposit, we collect, keep up to 3 months.
                </p>
                <ul className="space-y-4 mb-10 text-[16px]">
                  <li className="flex items-center gap-3"><Wallet className="w-5 h-5 text-[var(--color-brand-orange)] shrink-0" /> Small refundable deposit</li>
                  <li className="flex items-center gap-3"><CalendarClock className="w-5 h-5 text-[var(--color-brand-orange)] shrink-0" /> Keep up to 3 months</li>
                  <li className="flex items-center gap-3"><Truck className="w-5 h-5 text-[var(--color-brand-orange)] shrink-0" /> We collect them for free</li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link href="/hire" className="btn-primary w-full text-[16px] py-4">Hire moving boxes →</Link>
                <div className="text-center mt-4 text-[13px] text-[#5A5A52]">Zero waste moving solution</div>
              </div>
            </div>

            {/* Buy Card */}
            <div className="bg-white p-8 md:p-10 rounded-[12px] border border-[var(--color-brand-charcoal)]/5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-heading font-bold text-[24px]">Buy moving boxes</h3>
              </div>
              <div className="flex-grow">
                <p className="text-[16px] leading-[1.6] text-[#5A5A52] mb-8 prose-width">
                  New or used, yours to keep forever — no deposit, free delivery over $99, virgin cardboard or recycled options available.
                </p>
                <ul className="space-y-4 mb-10 text-[16px]">
                  <li className="flex items-center gap-3"><BadgeCheck className="w-5 h-5 text-[var(--color-brand-orange)] shrink-0" /> New or quality-checked used</li>
                  <li className="flex items-center gap-3"><Infinity className="w-5 h-5 text-[var(--color-brand-orange)] shrink-0" /> Pay once, keep forever</li>
                  <li className="flex items-center gap-3"><Truck className="w-5 h-5 text-[var(--color-brand-orange)] shrink-0" /> Free delivery over $99</li>
                </ul>
              </div>
              <div className="mt-auto">
                <Link href="/buy" className="inline-flex items-center justify-center rounded-md w-full px-6 py-4 font-heading font-semibold text-[16px] transition-all duration-200 border-2 border-[var(--color-brand-orange)] text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)] hover:text-white shadow-sm hover:-translate-y-0.5">Buy moving boxes →</Link>
                <div className="text-center mt-4 text-[13px] text-[#5A5A52]">Great for long-term storage</div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Strip */}
          <div className="flex flex-row flex-wrap items-center justify-center gap-y-4 gap-x-6 md:gap-x-12 mt-12 text-[13px] sm:text-[14px] font-semibold text-[#5A5A52]">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A52]" strokeWidth={2} />
              Eco-Friendly
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A52]" strokeWidth={2} />
              Quality Guaranteed
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A52]" strokeWidth={2} />
              Fast Delivery
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A52]" strokeWidth={2} />
              5-Star Service
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (TABBED TIMELINE) */}
      <section id="how-it-works" className="py-24 bg-[var(--color-brand-warm-secondary)]">
        <div className="max-w-[1360px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="section-eyebrow">How it works</span>
            <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-[1.2] mb-4">Ordering moving boxes is easy</h2>
            <p className="text-[16px] leading-[1.6] text-[#5A5A52]">Whether you hire or buy, the process takes minutes.</p>
          </div>

          <div className="p-8 md:p-12 rounded-[16px] border border-[var(--color-brand-charcoal)]/10">
            <Tabs
              variant="pill"
              tabs={[
                {
                  id: 'hire',
                  label: 'I want to hire',
                  content: (
                    <div className="pt-8 w-full max-w-6xl mx-auto">
                      <div className="relative">
                        {/* Mobile Vertical Line */}
                        <div className="absolute top-6 bottom-6 left-[24px] w-[2px] bg-[var(--color-brand-orange)]/30 md:hidden -translate-x-1/2 z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-y-16 gap-x-8 relative">
                          {[
                            { t: 'Order online', d: 'Choose box sizes and quantities', icon: ShoppingCart },
                            { t: 'Pick your window', d: '2-hour delivery window', icon: CalendarDays },
                            { t: 'Pay deposit', d: '$1.60/med · $2.50/lg at checkout', icon: CreditCard },
                            { t: 'Delivery day', d: 'Driver delivers in your window', icon: Truck },
                            { t: 'Pack & unpack', d: 'Keep up to 3 months', icon: PackageOpen },
                            { t: 'Book your pickup', d: 'Online in ~60 seconds', icon: CalendarCheck },
                            { t: 'We collect', d: 'Driver counts boxes at your new address', icon: RefreshCw },
                            { t: 'Deposit refunded', d: 'Within 5 business days', icon: Banknote },
                          ].map((step, i) => {
                            const lgOrder = [1, 2, 3, 4, 8, 7, 6, 5][i];
                            const mdOrder = [1, 2, 4, 3, 5, 6, 8, 7][i];
                            const orderClassesList = [
                              "order-1 md:order-1 lg:order-1",
                              "order-2 md:order-2 lg:order-2",
                              "order-3 md:order-4 lg:order-3",
                              "order-4 md:order-3 lg:order-4",
                              "order-5 md:order-5 lg:order-8",
                              "order-6 md:order-6 lg:order-7",
                              "order-7 md:order-8 lg:order-6",
                              "order-8 md:order-7 lg:order-5"
                            ];
                            const orderClass = orderClassesList[i];

                            const isRightMostLg = lgOrder % 4 === 0;
                            const isRightMostMd = mdOrder % 2 === 0;

                            let lineClasses = "hidden absolute top-1/2 left-[3rem] h-[2px] bg-[var(--color-brand-orange)]/30 -translate-y-1/2 z-0 right-[-2rem] ";
                            if (isRightMostMd && isRightMostLg) {
                              lineClasses += "md:hidden lg:hidden";
                            } else if (isRightMostMd && !isRightMostLg) {
                              lineClasses += "md:hidden lg:block";
                            } else if (!isRightMostMd && isRightMostLg) {
                              lineClasses += "md:block lg:hidden";
                            } else {
                              lineClasses += "md:block lg:block";
                            }

                            const isLogicalEndLg = (i + 1) % 4 === 0;
                            const isLogicalEndMd = (i + 1) % 2 === 0;

                            return (
                              <div key={i} className={`relative z-10 flex flex-row md:flex-col items-start gap-5 w-full group ${orderClass}`}>
                                {/* Number Node & Desktop Connector Wrapper */}
                                <div className="relative shrink-0 w-12 h-12 md:w-full flex md:justify-start">
                                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border-[3px] border-[var(--color-brand-orange)] text-[var(--color-brand-orange)] flex items-center justify-center font-heading font-bold text-[18px] group-hover:bg-[var(--color-brand-orange)] group-hover:text-white transition-colors duration-300">
                                    {i + 1}
                                  </div>
                                  {/* The Horizontal Line */}
                                  <div className={lineClasses}></div>
                                  
                                  {/* Row Connector (Downward Arrow) removed per request */}
                                </div>
                                
                                {/* Content Area */}
                                <div className="flex flex-col mt-0.5 md:mt-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <step.icon className="w-5 h-5 text-[var(--color-brand-orange)]" />
                                    <h3 className="font-heading font-semibold text-[18px] md:text-[20px] text-[var(--color-brand-charcoal)] group-hover:text-[var(--color-brand-orange)] transition-colors">{step.t}</h3>
                                  </div>
                                  <p className="font-sans font-normal text-[14px] md:text-[15px] text-[#5A5A52] leading-[1.6] max-w-[260px] md:max-w-none">{step.d}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-16 bg-white/60 rounded-[12px] p-6 text-center border border-[var(--color-brand-charcoal)]/5 shadow-sm">
                        <div className="flex flex-col md:flex-row flex-wrap justify-center items-start md:items-center gap-y-3 gap-x-4 font-sans font-medium text-[15px] text-[var(--color-brand-charcoal)] w-fit mx-auto text-left md:text-center">
                          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Deposit $1.60/med &middot; $2.50/lg</span>
                          <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                          <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Keep up to 3 months</span>
                          <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                          <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Pickup free</span>
                          <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                          <span className="flex items-center gap-2"><Banknote className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Refund within 5 business days</span>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'buy',
                  label: 'I want to buy',
                  content: (
                    <div className="pt-8 w-full max-w-6xl mx-auto">
                      <div className="relative">
                        {/* Mobile Vertical Line */}
                        <div className="absolute top-6 bottom-6 left-[24px] w-[2px] bg-[var(--color-brand-orange)]/30 md:hidden -translate-x-1/2 z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 md:gap-y-16 gap-x-8 relative max-w-4xl mx-auto">
                          {[
                            { t: 'Choose new or used', d: 'New or quality-checked used', icon: Layers },
                            { t: 'Select size & quantity', d: 'Use the box guide to get the right number', icon: Boxes },
                            { t: 'Pay, no deposit', d: 'Box price only', icon: CreditCard },
                            { t: 'Next-day delivery', d: 'Driver delivers in your window', icon: Truck },
                            { t: 'Pack your home', d: 'Keep forever, no return needed', icon: Package },
                            { t: 'Move in & done', d: 'Keep for storage or your next move', icon: Home }
                          ].map((step, i) => {
                            const lgOrder = [1, 2, 3, 6, 5, 4][i];
                            const mdOrder = [1, 2, 4, 3, 5, 6][i];
                            const orderClassesList = [
                              "order-1 md:order-1 lg:order-1",
                              "order-2 md:order-2 lg:order-2",
                              "order-3 md:order-4 lg:order-3",
                              "order-4 md:order-3 lg:order-6",
                              "order-5 md:order-5 lg:order-5",
                              "order-6 md:order-6 lg:order-4"
                            ];
                            const orderClass = orderClassesList[i];

                            const isRightMostLg = lgOrder % 3 === 0;
                            const isRightMostMd = mdOrder % 2 === 0;

                            let lineClasses = "hidden absolute top-1/2 left-[3rem] h-[2px] bg-[var(--color-brand-orange)]/30 -translate-y-1/2 z-0 right-[-2rem] ";
                            if (isRightMostMd && isRightMostLg) {
                              lineClasses += "md:hidden lg:hidden";
                            } else if (isRightMostMd && !isRightMostLg) {
                              lineClasses += "md:hidden lg:block";
                            } else if (!isRightMostMd && isRightMostLg) {
                              lineClasses += "md:block lg:hidden";
                            } else {
                              lineClasses += "md:block lg:block";
                            }

                            const isLogicalEndLg = (i + 1) % 3 === 0;
                            const isLogicalEndMd = (i + 1) % 2 === 0;

                            return (
                              <div key={i} className={`relative z-10 flex flex-row md:flex-col items-start gap-5 w-full group ${orderClass}`}>
                                {/* Number Node & Desktop Connector Wrapper */}
                                <div className="relative shrink-0 w-12 h-12 md:w-full flex md:justify-start">
                                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border-[3px] border-[var(--color-brand-orange)] text-[var(--color-brand-orange)] flex items-center justify-center font-heading font-bold text-[18px] group-hover:bg-[var(--color-brand-orange)] group-hover:text-white transition-colors duration-300">
                                    {i + 1}
                                  </div>
                                  {/* The Horizontal Line */}
                                  <div className={lineClasses}></div>
                                  
                                  {/* Row Connector (Downward Arrow) removed per request */}
                                </div>
                                
                                {/* Content Area */}
                                <div className="flex flex-col mt-0.5 md:mt-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <step.icon className="w-5 h-5 text-[var(--color-brand-orange)]" />
                                    <h3 className="font-heading font-semibold text-[18px] md:text-[20px] text-[var(--color-brand-charcoal)] group-hover:text-[var(--color-brand-orange)] transition-colors">{step.t}</h3>
                                  </div>
                                  <p className="font-sans font-normal text-[14px] md:text-[15px] text-[#5A5A52] leading-[1.6] max-w-[260px] md:max-w-none">{step.d}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-16 bg-white/60 rounded-[12px] p-6 text-center border border-[var(--color-brand-charcoal)]/5 shadow-sm">
                        <div className="flex flex-col md:flex-row flex-wrap justify-center items-start md:items-center gap-y-3 gap-x-4 font-sans font-medium text-[15px] text-[var(--color-brand-charcoal)] w-fit mx-auto text-left md:text-center">
                          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> No deposit</span>
                          <span className="hidden md:inline text-[var(--color-brand-kraft)]">&bull;</span>
                          <span className="flex items-center gap-2"><PackageOpen className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Pay once, keep forever</span>
                          <span className="hidden md:inline text-[var(--color-brand-kraft)]">&bull;</span>
                          <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Free delivery over $99</span>
                          <span className="hidden md:inline text-[var(--color-brand-kraft)]">&bull;</span>
                          <span className="flex items-center gap-2"><Home className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> No return required</span>
                        </div>
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* 6. BOXES & PRICING MODULE */}
      {/* 6. BOXES & PRICING MODULE */}
      <section className="py-16 bg-[var(--color-brand-warm-white)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Pricing & sizes</span>
            <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-[1.2] mb-4">Simple, transparent pricing</h2>
            <p className="text-[16px] leading-[1.6] text-[#5A5A52]">Hire or buy — no hidden fees, no surprises. Prices shown are per box.</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Estimator */}
            <div className="bg-white p-6 md:p-8 rounded-[12px] border border-[var(--color-brand-charcoal)]/5 shadow-sm lg:sticky lg:top-24 transition-all duration-500">
              <h3 className="font-heading font-semibold text-[20px] md:text-[22px] mb-2 text-center">Not sure how many boxes you need?</h3>
              <p className="text-[14px] text-[#5A5A52] mb-6 text-center">Tell us your home size — we'll do the maths.</p>

              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-6">
                {[
                  { id: '1-bed', label: '1 Bed', Icon: BedSingle },
                  { id: '2-bed', label: '2 Beds', Icon: BedDouble },
                  { id: '3-bed', label: '3 Beds', Icon: Home },
                  { id: '4-bed', label: '4 Beds', Icon: Building },
                  { id: '5-bed', label: '5+ Beds', Icon: Building2 },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setHomeSize(id)}
                    className={`flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-[8px] font-heading font-semibold text-[11px] sm:text-[13px] transition-colors border ${homeSize === id
                        ? 'bg-[var(--color-brand-charcoal)] text-white border-[var(--color-brand-charcoal)] shadow-md'
                        : 'bg-white border-[var(--color-brand-charcoal)]/10 hover:border-[var(--color-brand-charcoal)] text-[var(--color-brand-charcoal)]'
                      }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${homeSize === id ? 'text-white' : 'text-[var(--color-brand-orange)]'}`} />
                    <span className="text-center leading-tight whitespace-nowrap">{label}</span>
                  </button>
                ))}
              </div>

              <div className={`transition-all duration-500 overflow-hidden ${homeSize ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {homeSize && (
                  <>
                    <div className="text-center bg-[var(--color-brand-warm-white)] p-5 rounded-[8px] border border-[var(--color-brand-charcoal)]/5 mb-6 shadow-inner">
                      <div className="font-heading font-semibold text-[16px] md:text-[18px]">
                        We recommend: <span className="text-[var(--color-brand-orange)] font-bold">~{selectedBoxes.med} medium + {selectedBoxes.lg} large</span>
                      </div>
                      
                      <div className="text-[12px] text-[#5A5A52] uppercase tracking-wider font-semibold mt-3">
                        {pricingMode === 'hire' ? 'Live Hire Quote \u2192' : 'Live Purchase Quote \u2192'}
                      </div>
                    </div>

                    <div className="flex justify-center mb-5">
                      <Link 
                        href={`/${pricingMode}?med=${selectedBoxes.med}&lg=${selectedBoxes.lg}`} 
                        className="btn-primary w-full text-center py-3 text-[15px] shadow-[0_8px_30px_rgba(232,89,12,0.2)]"
                      >
                        Add these to my order &rarr;
                      </Link>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-center text-[13px] text-[#5A5A52] leading-[1.6]">
                <span className="font-semibold text-[var(--color-brand-charcoal)]">Need more later?</span> Order a few extra — your first top-up delivery over $35 is free, and we collect unused hire boxes for free!
              </div>
            </div>

            {/* RIGHT COLUMN: Toggle & Cards */}
            <div className="flex flex-col relative">
              <h3 className="font-heading font-semibold text-[20px] md:text-[22px] mb-6 text-center lg:hidden">Step 2: Choose your package</h3>
              
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-[#F2EDE4] rounded-[12px] p-1.5 border border-[#E8E1D5] w-full max-w-sm relative">
                  <button
                    onClick={() => setPricingMode('hire')}
                    className={`flex-1 px-4 py-2.5 rounded-[10px] font-heading font-semibold text-[14px] sm:text-[15px] transition-all duration-300 relative z-10 ${
                      pricingMode === 'hire' ? 'bg-[var(--color-brand-charcoal)] text-white shadow-md' : 'text-[var(--color-brand-charcoal)] hover:text-black'
                    }`}
                  >
                    Hire Boxes
                  </button>
                  <button
                    onClick={() => setPricingMode('buy')}
                    className={`flex-1 px-4 py-2.5 rounded-[10px] font-heading font-semibold text-[14px] sm:text-[15px] transition-all duration-300 relative z-10 ${
                      pricingMode === 'buy' ? 'bg-[var(--color-brand-charcoal)] text-white shadow-md' : 'text-[var(--color-brand-charcoal)] hover:text-black'
                    }`}
                  >
                    Buy Boxes
                  </button>
                </div>
              </div>

              {/* Dynamic Pricing Cards Logic */}
              {(() => {
                const basePrices = {
                  hire: { med: 3.25, lg: 4.35, medDep: 1.60, lgDep: 2.50 },
                  buyNew: { med: 3.95, lg: 4.95 },
                  buyUsed: { med: 2.95, lg: 3.95 }
                };

                const hireCards = homeSize ? [
                  { 
                    title: 'Hire Medium', 
                    price: `$${(selectedBoxes.med * basePrices.hire.med).toFixed(2)}`, 
                    sub: `${selectedBoxes.med} × Medium = $${(selectedBoxes.med * basePrices.hire.med).toFixed(2)} + $${(selectedBoxes.med * basePrices.hire.medDep).toFixed(2)} deposit`, 
                    features: ['430 x 315 x 317mm', 'Keep up to 3 months', 'Deposit refunded in 5 days', 'Free pickup included'], 
                    cta: 'Select Option', 
                    popular: false 
                  },
                  { 
                    title: 'Hire Large', 
                    price: `$${(selectedBoxes.lg * basePrices.hire.lg).toFixed(2)}`, 
                    sub: `${selectedBoxes.lg} × Large = $${(selectedBoxes.lg * basePrices.hire.lg).toFixed(2)} + $${(selectedBoxes.lg * basePrices.hire.lgDep).toFixed(2)} deposit`, 
                    features: ['430 x 405 x 650mm (tea chest)', 'Keep up to 3 months', 'Deposit refunded in 5 days', 'Free pickup included'], 
                    cta: 'Select Option', 
                    popular: true 
                  }
                ] : [
                  { title: 'Hire Medium', price: '$3.25', sub: 'per box + $1.60 refundable deposit', features: ['430 x 315 x 317mm', 'Keep up to 3 months', 'Deposit refunded in 5 days', 'Free pickup included'], cta: 'Hire Medium', popular: false },
                  { title: 'Hire Large', price: '$4.35', sub: 'per box + $2.50 refundable deposit', features: ['430 x 405 x 650mm (tea chest)', 'Keep up to 3 months', 'Deposit refunded in 5 days', 'Free pickup included'], cta: 'Hire Large', popular: true },
                ];

                const buyCards = homeSize ? [
                  { 
                    title: 'Buy New Package', 
                    price: `$${(selectedBoxes.med * basePrices.buyNew.med + selectedBoxes.lg * basePrices.buyNew.lg).toFixed(2)}`, 
                    sub: `${selectedBoxes.med} × Med + ${selectedBoxes.lg} × Lg (New)`, 
                    features: ['Brand new, never used', 'Yours to keep forever', 'Free delivery over $99', 'Full structural strength'], 
                    cta: 'Select Option', 
                    popular: false 
                  },
                  { 
                    title: 'Buy Used Package', 
                    price: `$${(selectedBoxes.med * basePrices.buyUsed.med + selectedBoxes.lg * basePrices.buyUsed.lg).toFixed(2)}`, 
                    sub: `${selectedBoxes.med} × Med + ${selectedBoxes.lg} × Lg (Used)`, 
                    features: ['Quality-checked virgin cardboard', 'Yours to keep forever', 'Free delivery over $99', 'Move-ready structural condition'], 
                    cta: 'Select Option', 
                    popular: true 
                  }
                ] : [
                  { title: 'Buy New', price: '$3.95', sub: 'medium from $3.95 • large from $4.95', features: ['Brand new, never used', 'Yours to keep forever', 'Free delivery over $99', 'Full structural strength'], cta: 'Buy New', popular: false },
                  { title: 'Buy Used', price: '$2.95', sub: 'medium from $2.95 • large from $3.95', features: ['Quality-checked virgin cardboard', 'Yours to keep forever', 'Free delivery over $99', 'Move-ready structural condition'], cta: 'Buy Used', popular: true },
                ];

                const activeCards = pricingMode === 'hire' ? hireCards : buyCards;

                const combinedHireEstimate = homeSize ? (selectedBoxes.med * basePrices.hire.med + selectedBoxes.lg * basePrices.hire.lg).toFixed(2) : '0.00';
                const combinedHireDeposit = homeSize ? (selectedBoxes.med * basePrices.hire.medDep + selectedBoxes.lg * basePrices.hire.lgDep).toFixed(2) : '0.00';

                return (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 relative">
                      {activeCards.map((card, i) => (
                        <div key={`${pricingMode}-${i}`} className={`relative bg-white rounded-[12px] p-6 border ${card.popular ? 'border-[var(--color-brand-orange)] shadow-[0_8px_30px_rgba(232,89,12,0.15)]' : 'border-[var(--color-brand-charcoal)]/10 shadow-sm'} flex flex-col transition-all duration-300 ${homeSize ? 'bg-[#FAFAFA]' : ''}`}>
                          {card.popular && (
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--color-brand-orange)] text-white text-[11px] font-heading font-semibold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm z-10">
                              Most popular
                            </div>
                          )}
                          <h4 className="font-heading font-semibold text-[18px] md:text-[20px] mb-2">{card.title}</h4>
                          <div className="font-heading font-bold text-[32px] md:text-[42px] leading-[1.15] text-[var(--color-brand-orange)] mb-2 tabular-nums tracking-tight">{card.price}</div>
                          <div className={`text-[13px] ${homeSize ? 'text-[var(--color-brand-charcoal)] font-semibold' : 'text-[#5A5A52]'} mb-6 min-h-[40px]`}>{card.sub}</div>

                          <ul className="space-y-3 mb-8 flex-grow text-[14px] md:text-[15px]">
                            {card.features.map((f, j) => (
                              <li key={j} className="flex items-start gap-3">
                                <Check className="text-[var(--color-brand-teal)] w-4 h-4 mt-0.5 shrink-0" strokeWidth={3} />
                                {f}
                              </li>
                            ))}
                          </ul>

                          {/* Action Button */}
                          <Link href={`/${pricingMode}`} className="btn-primary w-full text-center py-2.5 text-[15px] opacity-0 pointer-events-none absolute h-0 w-0">
                            {/* Hidden visually, handled by left column CTA when homeSize is active */}
                            {card.cta}
                          </Link>
                          {!homeSize && (
                            <Link href={`/${pricingMode}`} className="btn-primary w-full text-center py-2.5 text-[15px]">
                              {card.cta}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Combined Hire Estimate Ribbon */}
                    {homeSize && pricingMode === 'hire' && (
                      <div className="mt-6 bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/20 p-4 rounded-[10px] text-center animate-fade-in shadow-sm">
                        <span className="font-heading font-semibold text-[16px] text-[var(--color-brand-charcoal)]">
                          Combined Hire Estimate: <span className="font-bold text-[var(--color-brand-orange)]">${combinedHireEstimate}</span> + ${combinedHireDeposit} deposit
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SLIDER */}
      <TestimonialsSlider />

      {/* 8. RESOURCES HUB (TABBED) */}
      <section id="resources" className="py-24 bg-[var(--color-brand-charcoal)] text-white">
        <div className="max-w-[1360px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="section-eyebrow text-[var(--color-brand-warm-white)]">Resources hub</span>
            <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-[1.2] mb-4 text-white">Everything you need to know</h2>
          </div>

          <div className="bg-white text-[var(--color-brand-charcoal)] p-8 rounded-[12px]">
            <Tabs
              variant="primary"
              tabs={[

                {
                  id: 'packing',
                  label: 'Packing Guide',
                  content: (
                    <div className="pt-6 grid md:grid-cols-3 gap-6">
                      {[
                        { n: '01', title: 'Heavy items in medium boxes', p: 'Books, crockery, and tools should go in medium boxes. A large box packed with heavy items becomes impossible to lift safely.' },
                        { n: '02', title: 'Wrap fragile items individually', p: 'Use butchers paper or bubble wrap for every fragile piece. Do not rely on items cushioning each other — they won\'t.' },
                        { n: '03', title: 'Fill boxes to the top', p: 'Partially filled boxes collapse when stacked. Fill any gaps with scrunched paper or linen before sealing.' },
                        { n: '04', title: 'Label every box by room', p: 'Write the destination room on all four sides. Add a rough contents list so you can prioritise which boxes to open first.' },
                        { n: '05', title: 'Pack a "first night" box last', p: 'The last box you pack should be the first you open — kettle, phone charger, toilet paper, a change of clothes.' },
                        { n: '06', title: 'Leave a few boxes open', p: 'Keep a small number of boxes open for last-minute essentials, but seal completed boxes properly so they stack safely.' },
                      ].map(step => (
                        <div key={step.n} className="bg-[var(--color-brand-warm-white)] p-6 rounded-[8px]">
                          <div className="font-heading font-bold text-[34px] leading-[1.15] text-[var(--color-brand-orange)] mb-2 opacity-50 tabular-nums">{step.n}</div>
                          <h4 className="font-heading font-semibold text-[20px] mb-2">{step.title}</h4>
                          <p className="text-[14px] text-[#5A5A52] leading-[1.6]">{step.p}</p>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  id: 'costs',
                  label: 'Cost Guide 2026',
                  content: (
                    <div className="pt-6">
                      <h3 className="font-heading font-semibold text-[20px] md:text-[22px] mb-4">Cost of moving boxes in Australia (2026)</h3>
                      <ComparisonTable
                        headerTheme="navy"
                        columns={[
                          { key: 'size', header: 'Home Size' },
                          { key: 'hire', header: 'Hire Package (inc. deposit)' },
                          { key: 'net', header: 'Net Hire Cost (deposit returned)' },
                          { key: 'buynew', header: 'Buy New' },
                          { key: 'buyused', header: 'Buy Used' },
                        ]}
                        data={[
                          { size: 'Studio / 1 Bed', hire: '~$65–$90', net: '~$40–$55', buynew: '$174.75', buyused: '~$83.75' },
                          { size: '2 Bedrooms', hire: '~$120–$160', net: '~$75–$100', buynew: '$267.75', buyused: '~$152.75' },
                          { size: '3 Bedrooms', hire: '~$185–$240', net: '~$115–$150', buynew: '$421.85', buyused: '~$246.85' },
                          { size: '4 Bedrooms', hire: '~$300–$360', net: '~$175–$225', buynew: '$587.55', buyused: '~$345.55' },
                        ]}
                      />
                    </div>
                  )
                },
                {
                  id: 'comparisons',
                  label: 'Comparisons',
                  content: (
                    <div className="pt-6 space-y-12">
                      <div>
                        <h3 className="font-heading font-semibold text-[20px] md:text-[22px] mb-4">Cardboard boxes vs plastic crates</h3>
                        <ComparisonTable
                          headerTheme="orange"
                          columns={[
                            { key: 'factor', header: 'Factor' },
                            { key: 'hireabox', header: 'Cardboard Boxes (Hire A Box)' },
                            { key: 'plastic', header: 'Plastic Moving Crates (Hire)' },
                          ]}
                          data={[
                            { factor: 'Cost', hireabox: 'Low – from $3.25/box', plastic: 'High – typically $5–$8/crate/week' },
                            { factor: 'Stackability in truck', hireabox: 'Excellent – flat edges stack perfectly', plastic: 'Good' },
                            { factor: 'Weight', hireabox: 'Light – easy to carry', plastic: 'Heavy – 3-4kg empty' },
                            { factor: 'Fit irregular items', hireabox: 'Yes – packing paper fills all gaps', plastic: 'Fixed shape – gaps remain' },
                            { factor: 'Deposit/cost recovery', hireabox: 'Deposit fully refunded on return', plastic: 'Hire cost – no refund' },
                            { factor: 'Environmental', hireabox: '100% recyclable cardboard', plastic: 'Reusable plastic' },
                          ]}
                        />
                      </div>
                    </div>
                  )
                },
                {
                  id: 'delivery',
                  label: 'Delivery Areas',
                  content: (
                    <div className="pt-6">
                      <div className="text-center mb-10">
                        <h3 className="font-heading font-semibold text-[20px] md:text-[24px] mb-2 text-[var(--color-brand-charcoal)]">We deliver across four Australian cities</h3>
                        <p className="text-[16px] text-[#5A5A52]">Providing fast, reliable moving box delivery to major metropolitan areas.</p>
                      </div>

                      {/* Map Graphic (Hidden on very small screens, scales otherwise) */}
                      <div className="hidden sm:block relative max-w-[600px] mx-auto mb-16 aspect-[5/4]">
                        <AustraliaMap className="w-full h-full text-[var(--color-brand-orange)] opacity-15" />
                        
                        {/* Approximate Pin Placements */}
                        <div className="absolute top-[68%] left-[83%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="text-[var(--color-brand-orange)] w-5 h-5 mb-1" />
                          <span className="font-heading font-semibold text-[12px] text-[var(--color-brand-charcoal)]">Sydney</span>
                        </div>
                        
                        <div className="absolute top-[82%] left-[76%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="text-[var(--color-brand-orange)] w-5 h-5 mb-1" />
                          <span className="font-heading font-semibold text-[12px] text-[var(--color-brand-charcoal)]">Melbourne</span>
                        </div>
                        
                        <div className="absolute top-[75%] left-[68%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="text-[var(--color-brand-orange)] w-5 h-5 mb-1" />
                          <span className="font-heading font-semibold text-[12px] text-[var(--color-brand-charcoal)]">Adelaide</span>
                        </div>
                        
                        <div className="absolute top-[65%] left-[25%] flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="text-[var(--color-brand-orange)] w-5 h-5 mb-1" />
                          <span className="font-heading font-semibold text-[12px] text-[var(--color-brand-charcoal)]">Perth</span>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { city: 'Sydney', text: 'CBD, Eastern Suburbs, North Shore, Inner West, Western Sydney, Hills District and more.' },
                          { city: 'Melbourne', text: 'CBD, Inner North, Inner South, Bayside, Eastern Suburbs, Western Suburbs and more.' },
                          { city: 'Perth', text: 'CBD, Northern Suburbs, Southern Suburbs, Eastern Suburbs, Swan Valley and more.' },
                          { city: 'Adelaide', text: 'CBD, Inner East, North Adelaide, Southern Suburbs, Hills and more.' },
                        ].map(loc => (
                          <div key={loc.city} className="border border-[var(--color-brand-charcoal)]/10 p-6 rounded-md bg-[var(--color-brand-warm-white)]/50">
                            <h4 className="font-heading font-bold text-[18px] mb-3 flex items-center gap-2 text-[var(--color-brand-charcoal)]">
                              <MapPin className="text-[var(--color-brand-orange)] w-5 h-5 shrink-0" />
                              Moving Boxes {loc.city}
                            </h4>
                            <p className="text-[14px] text-[#5A5A52] leading-[1.6]">{loc.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <FAQ />

    </div>
  );
}
