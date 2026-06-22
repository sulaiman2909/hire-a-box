import Link from 'next/link';
import { PackageOpen } from 'lucide-react';

export default function CustomerFooter() {
  return (
    <footer id="contact" className="bg-[var(--color-brand-charcoal)] text-white pt-20 pb-10 border-t-8 border-[var(--color-brand-orange)] mt-auto">
      {/* Cross-Sell Strip */}
      <div className="max-w-[1360px] mx-auto px-6 mb-16">
        <div className="bg-[var(--color-brand-orange)] rounded-[12px] p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-lg">
          <div>
            <h3 className="text-2xl font-bold mb-2">Complete your move</h3>
            <p className="opacity-90 font-medium">Book a Hire A Mover or Hire A Packer service and get 10% back on your boxes!</p>
          </div>
          <button className="mt-6 md:mt-0 bg-white text-[var(--color-brand-orange)] font-bold py-3 px-8 rounded-md hover:bg-[var(--color-brand-warm-white)] transition-colors whitespace-nowrap">
            Claim 10% Rebate
          </button>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-heading text-[var(--color-brand-orange)] tracking-tight mb-4">
            <PackageOpen className="text-white w-8 h-8" strokeWidth={2.5} />
            HIRE A BOX
          </Link>
          <p className="text-sm opacity-70 mb-6">
            Hire A Box hires and sells durable cardboard moving boxes and packing materials for moving homes or offices.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4 text-[var(--color-brand-kraft)]">Contact Us</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li>Head Office Level 1, 1-5 Link Road Zetland NSW 2017</li>
            <li>1300 858 446</li>
            <li>orders@hireabox.com.au</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4 text-[var(--color-brand-kraft)]">Cities We Service</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li>Adelaide</li>
            <li>Melbourne</li>
            <li>Sydney</li>
            <li>Perth</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4 text-[var(--color-brand-kraft)]">Our Services</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li><a href="https://www.hireamover.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-orange)] transition-colors">Moving (Hire A Mover)</a></li>
            <li><Link href="/" className="hover:text-[var(--color-brand-orange)] transition-colors">Box Hire (Hire A Box)</Link></li>
            <li><a href="https://www.hireapacker.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-orange)] transition-colors">Packing (Hire A Packer)</a></li>
            <li><a href="https://www.hirestorage.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-orange)] transition-colors">Storage (Hire Storage)</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-6 text-center text-xs opacity-50 pt-8 border-t border-white/10">
        © {new Date().getFullYear()} Hire A Box Pty Ltd (ABN: 49 145 620 533). All rights reserved.
      </div>
    </footer>
  );
}
