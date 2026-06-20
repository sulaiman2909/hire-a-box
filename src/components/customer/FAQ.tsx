'use client';

import { Accordion } from '@/components/customer/Accordion';

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-[var(--color-brand-warm-white)]">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="text-center mb-16">
          <span className="section-eyebrow">Frequently asked questions</span>
          <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-[1.2]">Moving box questions — answered</h2>
        </div>

        <Accordion items={[
          { 
            title: 'Is it cheaper to hire or buy moving boxes in Australia?', 
            content: <p>Hiring is cheaper if you plan to return the boxes within 3 months. When you hire with Hire A Box, you pay a small refundable deposit per box — $1.60 per medium box, $2.50 per large box — which is fully refunded within 5 business days of collection. If you plan to keep the boxes permanently, or need them for longer than 3 months, buying is the better option. Both hire and purchase start from $3.25 per box.</p> 
          },
          { 
            title: 'How does moving box hire work?', 
            content: <p>Simply order online, select a 2-hour delivery window, and we deliver right to your door. You pack and move at your own pace (up to 3 months). When you're finished, book a free collection online. Once collected, your deposit is refunded directly to your card.</p> 
          },
          { 
            title: 'How much is the deposit on hired moving boxes?', 
            content: <p>The deposit is $1.60 for a medium box and $2.50 for a large box. Porta Robes have a $5.00 deposit.</p> 
          },
          { 
            title: 'Which moving box size do I need?', 
            content: (
              <>
                <p className="mb-4">We offer medium and large moving boxes, plus wardrobe boxes for hanging clothes.</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-[var(--color-brand-warm-white)]/50 border border-[var(--color-brand-charcoal)]/5 rounded-md">
                    <strong className="block text-[var(--color-brand-orange)] mb-1">Medium Box</strong>
                    <p className="text-[14px]">The workhorse of any move. Best for heavy items like books, crockery, tools, and canned goods.</p>
                  </div>
                  <div className="p-4 bg-[var(--color-brand-warm-white)]/50 border border-[var(--color-brand-charcoal)]/5 rounded-md">
                    <strong className="block text-[var(--color-brand-orange)] mb-1">Large Box (Tea Chest)</strong>
                    <p className="text-[14px]">Use for lighter, bulky items. Best for pots, pans, linens, lampshades, toys, and clothes.</p>
                  </div>
                </div>
              </>
            )
          },
          { 
            title: 'How many moving boxes do I need?', 
            content: (
              <>
                <p className="mb-4">Most people underestimate how many boxes they need. Use this guide as a starting point — and remember, your first hire top-up delivery is free!</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse mt-2">
                    <thead>
                      <tr className="border-b-2 border-[var(--color-brand-charcoal)]/10">
                        <th className="py-3 px-2 font-semibold">Home Size</th>
                        <th className="py-3 px-2 font-semibold">Medium Boxes</th>
                        <th className="py-3 px-2 font-semibold">Large Boxes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[var(--color-brand-charcoal)]/5">
                        <td className="py-3 px-2">1 Bedroom / Studio</td>
                        <td className="py-3 px-2">15</td>
                        <td className="py-3 px-2">10</td>
                      </tr>
                      <tr className="border-b border-[var(--color-brand-charcoal)]/5">
                        <td className="py-3 px-2">2 Bedrooms</td>
                        <td className="py-3 px-2">25</td>
                        <td className="py-3 px-2">15</td>
                      </tr>
                      <tr className="border-b border-[var(--color-brand-charcoal)]/5">
                        <td className="py-3 px-2">3 Bedrooms</td>
                        <td className="py-3 px-2">35</td>
                        <td className="py-3 px-2">20</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2">4+ Bedrooms</td>
                        <td className="py-3 px-2">50+</td>
                        <td className="py-3 px-2">30+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )
          },
          { 
            title: 'How to pack moving boxes like a professional', 
            content: (
              <>
                <p className="mb-4">Good packing is the difference between a smooth move and a stressful one. Follow these professional tips:</p>
                <ul className="space-y-3 list-disc pl-5">
                  <li><strong>Heavy items in medium boxes:</strong> Books, canned goods, and heavy tools should always go into medium boxes so they don't become too heavy to lift safely.</li>
                  <li><strong>Wrap fragile items individually:</strong> Use packing paper or bubble wrap for every fragile item. Don't rely on items padding each other.</li>
                  <li><strong>Label every box by room AND contents:</strong> Make the destination room the LARGEST text on the box. Add a quick bulleted list of contents so you know which boxes to open first.</li>
                </ul>
              </>
            )
          },
          { 
            title: 'Do you deliver moving boxes to my suburb?', 
            content: <p>We deliver across the metropolitan areas of Sydney, Melbourne, Perth, and Adelaide. Check your postcode in our delivery checker at the top of the page.</p> 
          },
        ]} />
      </div>
    </section>
  );
}
