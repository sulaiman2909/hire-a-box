'use client';

import { useState } from 'react';

import { Package, BedSingle, BedDouble, Home, Building, Warehouse } from 'lucide-react';
import { getProductImageUrl } from '@/lib/domain/images';

function getPackageIcon(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('1-bed')) return BedSingle;
  if (lowerName.includes('2-bed')) return BedDouble;
  if (lowerName.includes('3-bed')) return Home;
  if (lowerName.includes('4-bed')) return Building;
  if (lowerName.includes('5-bed')) return Warehouse;
  return Package;
}

interface ProductCardProps {
  id: string;
  name: string;
  description: string | null;
  dimensions?: string | null;
  spec?: string | null;
  price: number;
  depositAmount?: number;
  quantity: number;
  quantityUsed?: number;
  onQuantityChange: (id: string, newQuantity: number, isUsed?: boolean) => void;
  isPackage?: boolean;
  onSelectPackage?: () => void;
  contents?: { name: string; quantity: number }[];
  pricingMode?: 'hire' | 'buy';
  buyPriceNew?: number | null;
  buyPriceUsed?: number | null;
}

export default function ProductCard({
  id,
  name,
  description,
  dimensions,
  spec,
  price,
  depositAmount,
  quantity,
  quantityUsed,
  onQuantityChange,
  isPackage,
  onSelectPackage,
  contents,
  pricingMode = 'hire',
  buyPriceNew,
  buyPriceUsed
}: ProductCardProps) {
  const [isUsedSelected, setIsUsedSelected] = useState(false);
  
  const isBuyMode = pricingMode === 'buy';
  const hasNew = buyPriceNew !== null && buyPriceNew !== undefined;
  const hasUsed = buyPriceUsed !== null && buyPriceUsed !== undefined;
  const showToggle = isBuyMode && !isPackage && hasNew && hasUsed;
  
  const isUsed = hasUsed && isUsedSelected;
  const displayPrice = showToggle 
    ? (isUsed ? buyPriceUsed! : buyPriceNew!)
    : price;
    
  const activeQuantity = (showToggle && isUsed) ? (quantityUsed || 0) : quantity;

  return (
    <div className="bg-white rounded-xl border border-[#E6E0D4] shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md h-full">
      {/* Image Area - Hidden for Packages */}
      {!isPackage && (
        <div className="p-4 bg-white flex items-center justify-center border-b border-[var(--border-color)]">
          <img src={getProductImageUrl(name)} alt={name} className="w-full h-full max-h-[160px] object-contain" />
        </div>
      )}
      
      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        {isPackage ? (
          <div className="flex items-center gap-2 mb-4">
            {(() => {
              const Icon = getPackageIcon(name);
              return <Icon className="w-5 h-5 text-[var(--color-brand-orange)] flex-shrink-0" />;
            })()}
            <h3 className="text-lg font-heading font-semibold text-[var(--color-brand-charcoal)] leading-tight">
              {name}
            </h3>
          </div>
        ) : (
          <h3 className="text-lg font-heading font-semibold text-[var(--color-brand-charcoal)] mb-1 leading-tight">
            {name}
          </h3>
        )}
        
        {/* Specs & Dimensions */}
        {(dimensions || spec) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {dimensions && (
              <span className="text-xs font-semibold px-2 py-1 bg-[var(--color-brand-kraft)]/10 text-[var(--color-brand-kraft-deep)] rounded">
                {dimensions}
              </span>
            )}
            {spec && (
              <span className="text-xs font-semibold px-2 py-1 bg-[var(--color-brand-kraft)]/10 text-[var(--color-brand-kraft-deep)] rounded">
                {spec}
              </span>
            )}
          </div>
        )}

        {isPackage && contents ? (
          <div className="mb-4 flex-grow">
            <ul className="text-sm text-[#6B6862] leading-snug space-y-2">
              {contents.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-semibold text-[var(--color-brand-charcoal)] min-w-[28px]">{item.quantity}x</span>
                  <span className="flex-1">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : description ? (
          <p className="text-[#6B6862] text-sm mb-4 flex-grow leading-snug">
            {description}
          </p>
        ) : (
          <div className="mb-4 flex-grow" />
        )}
        
        {showToggle && (
          <div className="flex gap-2 mb-4 bg-[var(--color-brand-warm-secondary)] p-1 rounded-md">
            <button 
              onClick={() => setIsUsedSelected(false)}
              className={`flex-1 py-1.5 px-3 text-[13px] font-semibold rounded-md transition-all ${
                !isUsedSelected 
                  ? 'bg-white text-[var(--color-brand-orange)] shadow-sm' 
                  : 'bg-transparent text-[#6B6862] hover:text-[var(--color-brand-charcoal)]'
              }`}
            >
              New
            </button>
            <button 
              onClick={() => setIsUsedSelected(true)}
              className={`flex-1 py-1.5 px-3 text-[13px] font-semibold rounded-md transition-all ${
                isUsedSelected 
                  ? 'bg-white text-[var(--color-brand-orange)] shadow-sm' 
                  : 'bg-transparent text-[#6B6862] hover:text-[var(--color-brand-charcoal)]'
              }`}
            >
              Used
            </button>
          </div>
        )}
        
        {/* Price & Deposit */}
        <div className="flex flex-col mb-4">
          <span className="text-xl font-bold text-[var(--color-brand-orange)] leading-none">
            ${displayPrice.toFixed(2)}
          </span>
          {depositAmount !== undefined && depositAmount > 0 && (
            <span className="text-xs font-medium text-[#9A9791] mt-1">
              + ${depositAmount.toFixed(2)} refundable deposit
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto">
          {isPackage ? (
            <button 
              onClick={onSelectPackage}
              className="w-full btn-primary py-2.5 text-sm font-semibold rounded-md shadow-sm transition-all hover:shadow-md"
            >
              Select Package
            </button>
          ) : (
            <div className="bg-[var(--color-brand-warm-secondary)] rounded-md p-1 flex items-center justify-between">
              <button 
                onClick={() => onQuantityChange(id, Math.max(0, activeQuantity - 1), showToggle ? isUsedSelected : false)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-lg font-medium transition-colors ${
                  activeQuantity > 0 
                    ? 'bg-white text-[var(--color-brand-charcoal)] shadow-sm hover:bg-stone-50' 
                    : 'text-[#9A9791] cursor-default'
                }`}
                disabled={activeQuantity <= 0}
              >
                -
              </button>
              
              <span className="font-bold text-base min-w-[32px] text-center text-[var(--color-brand-charcoal)]">
                {activeQuantity}
              </span>
              
              <button 
                onClick={() => onQuantityChange(id, activeQuantity + 1, showToggle ? isUsedSelected : false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-lg font-medium bg-[var(--color-brand-orange)] text-white shadow-sm transition-colors hover:bg-orange-700"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
