import React from 'react';
import { Star, Info } from 'lucide-react';

interface CompactHeaderProps {
  title: string;
  valueProp: string;
  packagesHref?: string;
  individualHref?: string;
}

export default function CompactHeader({ 
  title, 
  valueProp
}: CompactHeaderProps) {
  return (
    <div className="bg-[var(--color-brand-warm-secondary)] rounded-2xl p-6 md:p-8 mb-12 border border-[var(--color-brand-charcoal)]/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-[var(--color-brand-orange)]">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-sm font-semibold text-[var(--color-brand-charcoal)]">4.8 / 5</span>
            <span className="text-sm text-[#5A5A52] hidden sm:inline">(100+ Reviews)</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-[var(--color-brand-charcoal)] mb-3 leading-tight">
            {title}
          </h1>
          
          <p className="text-[15px] md:text-[16px] text-[#5A5A52] font-medium leading-relaxed">
            {valueProp}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 shrink-0">
          <a 
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-brand-orange)] text-white font-semibold rounded shadow-sm hover:bg-orange-700 transition-colors text-[15px]"
          >
            <Info className="w-4 h-4" />
            How it works
          </a>
        </div>

      </div>
    </div>
  );
}
