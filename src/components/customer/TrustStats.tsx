'use client';

import { useEffect, useState, useRef } from 'react';

function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      requestAnimationFrame(() => setCount(end));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutExpo
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(easeOut * end);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return { count, elementRef };
}

interface StatItemProps {
  value: number;
  suffix?: string;
  title: string;
  subtitle?: string;
  isGoogle?: boolean;
  decimals?: number;
}

function StatItem({ value, suffix = '', title, subtitle, isGoogle = false, decimals = 0 }: StatItemProps) {
  const { count, elementRef } = useCountUp(value, 1500);
  
  const displayValue = count === value ? value : count;
  const formattedCount = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.floor(displayValue).toLocaleString('en-US');
  
  return (
    <div ref={elementRef} className="flex flex-col items-center px-2 py-4">
      <div className="font-poppins font-bold text-[36px] md:text-[52px] leading-[1.1] text-[var(--color-brand-orange)] mb-2 tabular-nums flex items-baseline justify-center">
        {formattedCount}{suffix}
      </div>
      <div className="text-[13px] md:text-[14px] font-bold uppercase tracking-wider text-[var(--color-brand-charcoal)] mb-1.5 flex items-center justify-center gap-2 text-center leading-tight">
        {isGoogle && (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {title}
      </div>
      {subtitle && (
        <div className="text-[13px] text-[var(--color-brand-charcoal)]/60 text-center max-w-[200px] leading-snug font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function TrustStats() {
  return (
    <section className="bg-[var(--color-brand-warm-secondary)] border-y border-black/5 text-[var(--color-brand-charcoal)] py-16 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-6">
        
        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-stretch">
          
          {/* Left Column: Stats 2x2 Grid */}
          <div className="relative grid grid-cols-2 gap-y-12 lg:gap-y-16 py-6 md:py-10">
            {/* Partial subtle dividers */}
            <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-black/5 -translate-y-1/2 pointer-events-none hidden md:block"></div>
            <div className="absolute left-1/2 top-[10%] bottom-[10%] w-px bg-black/5 -translate-x-1/2 pointer-events-none hidden md:block"></div>

            {/* Mobile dividers (slightly different positioning for optimal mobile view) */}
            <div className="absolute top-1/2 left-[5%] right-[5%] h-px bg-black/5 -translate-y-1/2 pointer-events-none md:hidden"></div>
            <div className="absolute left-1/2 top-[5%] bottom-[5%] w-px bg-black/5 -translate-x-1/2 pointer-events-none md:hidden"></div>

            <StatItem 
              value={42000} 
              suffix="+" 
              title="Customers" 
              subtitle="— since 2009" 
            />
            <StatItem 
              value={15} 
              suffix="+" 
              title="Years" 
              subtitle="in business" 
            />
            <StatItem 
              value={4} 
              suffix="" 
              title="Cities" 
              subtitle="Sydney, Melbourne, Perth, Adelaide" 
            />
            <StatItem 
              value={4.8} 
              suffix="★" 
              title="Rated on Google" 
              isGoogle={true} 
              decimals={1}
            />
          </div>

          {/* Right Column: Testimonial Card */}
          <div className="h-full rounded-[16px] p-8 md:p-10 border border-[var(--color-brand-charcoal)]/10 relative flex flex-col justify-between">
            <svg className="w-10 h-10 text-[var(--color-brand-orange)]/10 absolute top-6 left-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            
            <p className="text-[17px] md:text-[18px] text-[var(--color-brand-charcoal)] leading-[1.7] font-sans font-normal italic relative z-10 mb-8 mt-4 opacity-90">
              &quot;Have used Hire A Box for 4 moves and highly recommend them. Very responsive, quality products efficiently delivered. Really makes the stress of moving just a bit easier. The pickup when you are ready even months after the move, is amazing. They&apos;ve thought of everything so you won&apos;t have to. The package sizes per home size are spot on too.&quot;
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 mt-auto pt-6 border-t border-[var(--color-brand-charcoal)]/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-orange)]/10 flex items-center justify-center font-heading font-bold text-[var(--color-brand-orange)] text-[16px] shrink-0 border border-[var(--color-brand-orange)]/20">
                  S
                </div>
                <div className="text-[15px] font-sans font-semibold text-[var(--color-brand-charcoal)] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 leading-tight">
                  Sarah <span className="opacity-60 font-normal">· 5 out of 5</span>
                </div>
              </div>
              
              <a href="#testimonials" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[var(--color-brand-charcoal)]/10 rounded-full shadow-sm text-[13px] font-heading font-semibold text-[var(--color-brand-charcoal)] hover:shadow-md hover:border-[var(--color-brand-charcoal)]/20 hover:-translate-y-0.5 transition-all group shrink-0 w-fit">
                Read all reviews
                <svg className="w-4 h-4 text-[var(--color-brand-orange)] group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
