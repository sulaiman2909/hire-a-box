import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  label: string;
  aspectRatio?: string;
}

export default function ImagePlaceholder({ label, aspectRatio = 'aspect-[4/3]' }: ImagePlaceholderProps) {
  return (
    <div className={`w-full bg-[var(--color-brand-kraft)]/20 ${aspectRatio} flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--color-brand-kraft)] text-[var(--color-brand-charcoal)]/60`}>
      <ImageIcon className="w-12 h-12 mb-3 text-[var(--color-brand-kraft-deep)]" aria-hidden="true" />
      <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-xs mt-1 opacity-70">(Image Pending)</span>
    </div>
  );
}
