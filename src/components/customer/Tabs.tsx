'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'primary' | 'secondary' | 'pill';
}

export default function Tabs({ tabs, defaultTab, variant = 'primary' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      {variant === 'pill' ? (
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-[#F2EDE4] rounded-[12px] p-1.5 border border-[#E8E1D5] w-full max-w-sm sm:max-w-md relative">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 sm:px-8 py-3 rounded-[10px] font-heading font-semibold text-[15px] sm:text-[16px] transition-all duration-300 relative z-10 ${
                    isActive 
                      ? 'bg-[var(--color-brand-charcoal)] text-white shadow-md' 
                      : 'text-[var(--color-brand-charcoal)] hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`flex border-b ${variant === 'primary' ? 'border-[var(--color-brand-charcoal)]/10' : 'border-[var(--color-brand-kraft)]/30'} mb-6 overflow-x-auto no-scrollbar`}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-heading font-semibold text-[16px] whitespace-nowrap transition-colors border-b-2 ${
                  isActive 
                    ? 'border-[var(--color-brand-orange)] text-[var(--color-brand-orange)]' 
                    : 'border-transparent text-[var(--color-brand-charcoal)]/60 hover:text-[var(--color-brand-charcoal)] hover:bg-[var(--color-brand-charcoal)]/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content (SEO Rule: All content is in DOM, hidden via CSS) */}
      <div className="relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`transition-opacity duration-300 ${
              activeTab === tab.id 
                ? 'opacity-100 block' 
                : 'opacity-0 hidden'
            }`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
