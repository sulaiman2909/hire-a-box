'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function AccordionItem({ title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className={`bg-white rounded-[8px] border transition-colors duration-300 ${isOpen ? 'border-[var(--color-brand-orange)] shadow-sm' : 'border-[var(--color-brand-charcoal)]/10 hover:border-[var(--color-brand-orange)]/50'}`}>
      <button 
        onClick={onToggle}
        className="w-full flex justify-between items-center bg-transparent border-none font-sans font-semibold text-[15px] md:text-[16px] text-[var(--color-brand-charcoal)] cursor-pointer p-5 text-left transition-colors"
      >
        <span className="pr-4 leading-snug">{title}</span>
        <div className="shrink-0 w-6 h-6 flex items-center justify-center text-[var(--color-brand-orange)]">
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>
      
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 font-sans font-normal text-[14px] md:text-[15px] leading-[1.6] text-[#5A5A52]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: { title: string; content: React.ReactNode }[];
}

export function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenId(openId === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {items.filter((_, idx) => idx % 2 === 0).map((item, idx) => {
            const originalIndex = idx * 2;
            return (
              <AccordionItem 
                key={originalIndex} 
                title={item.title} 
                isOpen={openId === originalIndex} 
                onToggle={() => toggle(originalIndex)}
              >
                {item.content}
              </AccordionItem>
            );
          })}
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {items.filter((_, idx) => idx % 2 !== 0).map((item, idx) => {
            const originalIndex = idx * 2 + 1;
            return (
              <AccordionItem 
                key={originalIndex} 
                title={item.title} 
                isOpen={openId === originalIndex} 
                onToggle={() => toggle(originalIndex)}
              >
                {item.content}
              </AccordionItem>
            );
          })}
        </div>
      </div>
    </div>
  );
}
