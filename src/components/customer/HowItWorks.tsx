import React from 'react';
import { ShoppingCart, CalendarDays, CreditCard, Truck, PackageOpen, CalendarCheck, RefreshCw, Banknote, Layers, Boxes, Package, Home, ShieldCheck, BadgeCheck } from 'lucide-react';

interface HowItWorksProps {
  mode: 'hire' | 'buy';
}

export default function HowItWorks({ mode }: HowItWorksProps) {
  const isHire = mode === 'hire';

  return (
    <section id="how-it-works" className="py-16 bg-[var(--color-brand-warm-secondary)] rounded-2xl border border-[var(--color-brand-charcoal)]/5 mt-16 mb-4">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[13px] font-heading font-semibold uppercase tracking-[0.08em] mb-4 block text-[var(--color-brand-orange)]">How it works</span>
          <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-[1.2] mb-4">
            {isHire ? 'Hiring moving boxes is easy' : 'Buying moving boxes is easy'}
          </h2>
          <p className="text-[16px] leading-[1.6] text-[#5A5A52]">The process takes minutes.</p>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          {isHire ? (
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

                  return (
                    <div key={i} className={`relative z-10 flex flex-row md:flex-col items-start gap-5 w-full group ${orderClass}`}>
                      <div className="relative shrink-0 w-12 h-12 md:w-full flex md:justify-start">
                        <div className="relative z-10 w-12 h-12 rounded-full bg-white border-[3px] border-[var(--color-brand-orange)] text-[var(--color-brand-orange)] flex items-center justify-center font-heading font-bold text-[18px] group-hover:bg-[var(--color-brand-orange)] group-hover:text-white transition-colors duration-300">
                          {i + 1}
                        </div>
                        <div className={lineClasses}></div>
                      </div>
                      
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

              <div className="mt-16 bg-white/60 rounded-[12px] p-6 text-center border border-[var(--color-brand-charcoal)]/5 shadow-sm">
                <div className="flex flex-col md:flex-row flex-wrap justify-center items-start md:items-center gap-y-3 gap-x-4 font-sans font-medium text-[15px] text-[var(--color-brand-charcoal)] w-fit mx-auto text-left md:text-center">
                  <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> 20% cheaper than buying</span>
                  <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                  <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Keep up to 3 months</span>
                  <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                  <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Free delivery over $65</span>
                  <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                  <span className="flex items-center gap-2"><Banknote className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Refund within 5 business days</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-6 relative">
                {/* Desktop Connecting Line */}
                <div className="hidden lg:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-[var(--color-brand-orange)]/30 -translate-y-1/2 z-0"></div>

                {[
                  { t: 'Choose new or used', d: 'New or quality-checked used', icon: BadgeCheck },
                  { t: 'Select size & qty', d: 'Use the box guide to get the right number', icon: ShoppingCart },
                  { t: 'Pay — no deposit', d: 'Box price only', icon: CreditCard },
                  { t: 'Delivery window', d: 'Driver delivers in your chosen time', icon: Truck },
                  { t: 'Keep them forever', d: 'No return needed, no collection', icon: Home }
                ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center gap-4 group">
                    <div className="relative shrink-0 w-12 h-12 rounded-full bg-[var(--color-brand-warm-secondary)] border-[3px] border-[var(--color-brand-orange)] text-[var(--color-brand-orange)] flex items-center justify-center font-heading font-bold text-[18px] group-hover:bg-[var(--color-brand-orange)] group-hover:text-white transition-colors duration-300 z-10 mx-auto">
                      {i + 1}
                    </div>
                    
                    <div className="flex flex-col lg:items-center mt-1 lg:mt-0 w-full">
                      <div className="flex items-center lg:justify-center gap-2 mb-1.5">
                        <step.icon className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" />
                        <h3 className="font-heading font-semibold text-[15px] md:text-[16px] text-[var(--color-brand-charcoal)] group-hover:text-[var(--color-brand-orange)] transition-colors leading-tight">{step.t}</h3>
                      </div>
                      <p className="font-sans font-medium text-[13px] text-[#5A5A52] leading-[1.5] max-w-[220px]">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 bg-white/60 rounded-[12px] p-6 text-center border border-[var(--color-brand-charcoal)]/5 shadow-sm">
                <div className="flex flex-col md:flex-row flex-wrap justify-center items-start md:items-center gap-y-3 gap-x-4 font-sans font-medium text-[15px] text-[var(--color-brand-charcoal)] w-fit mx-auto text-left md:text-center">
                  <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> No deposit</span>
                  <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                  <span className="flex items-center gap-2"><PackageOpen className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Pay once, keep forever</span>
                  <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                  <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> Free delivery over $99</span>
                  <span className="hidden md:inline text-[var(--color-brand-charcoal)]/30">&bull;</span>
                  <span className="flex items-center gap-2"><Home className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" /> No return required</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
