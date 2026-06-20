import React from 'react';
import { Check, X } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}

interface ComparisonTableProps {
  columns: Column[];
  data: Record<string, any>[];
  headerTheme?: 'navy' | 'orange';
}

export default function ComparisonTable({ columns, data, headerTheme = 'navy' }: ComparisonTableProps) {
  const headerBgClass = headerTheme === 'navy' 
    ? 'bg-[var(--color-brand-charcoal)] text-[var(--color-brand-warm-white)]'
    : 'bg-[var(--color-brand-orange)] text-white';

  return (
    <div className="w-full overflow-x-auto rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.04)] border border-[var(--color-brand-charcoal)]/5">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className={headerBgClass}>
            {columns.map((col, idx) => (
              <th 
                key={col.key} 
                className={`p-4 font-sans font-bold text-[16px] ${idx === 0 ? 'rounded-tl-[8px]' : ''} ${idx === columns.length - 1 ? 'rounded-tr-[8px]' : ''} text-${col.align || 'left'}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white text-[#5A5A52] font-sans font-normal text-[16px] leading-[1.6] tabular-nums">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`border-b border-[var(--color-brand-charcoal)]/5 ${rowIndex % 2 !== 0 ? 'bg-[var(--color-brand-warm-white)]/50' : ''}`}
            >
              {columns.map((col) => {
                const cellValue = row[col.key];
                const isTick = cellValue === true || cellValue === 'tick' || cellValue === '✓';
                const isCross = cellValue === false || cellValue === 'cross' || cellValue === '✗';
                
                let renderValue = cellValue;
                if (isTick) {
                  renderValue = <Check className="text-[var(--color-brand-teal)] w-5 h-5" strokeWidth={3} aria-hidden="true" />;
                } else if (isCross) {
                  renderValue = <X className="text-[#A0A09B] w-5 h-5" strokeWidth={3} aria-hidden="true" />;
                }

                return (
                  <td key={`${rowIndex}-${col.key}`} className={`p-4 text-${col.align || 'left'} ${col.key === 'feature' ? 'font-semibold text-[var(--color-brand-charcoal)]' : ''}`}>
                    {renderValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
