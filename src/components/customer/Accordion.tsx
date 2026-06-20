'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export function AccordionItem({ title, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-brand-charcoal)]/10 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-transparent border-none font-heading font-semibold text-[20px] md:text-[22px] text-[var(--color-brand-charcoal)] cursor-pointer py-2 text-left hover:text-[var(--color-brand-orange)] transition-colors"
      >
        {title}
        <ChevronDown 
          className={`transform transition-transform duration-300 text-[var(--color-brand-orange)] w-6 h-6 ml-4 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        />
      </button>
      
      {/* DOM Rendered for SEO, visual toggle via CSS */}
      <div 
        className={`overflow-hidden transition-all duration-300 font-sans font-normal text-[16px] leading-[1.6] text-[#5A5A52] prose-width ${
          isOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

interface AccordionProps {
  items: { title: string; content: React.ReactNode }[];
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[var(--color-brand-charcoal)]/5">
      {items.map((item, idx) => (
        <AccordionItem key={idx} title={item.title}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
