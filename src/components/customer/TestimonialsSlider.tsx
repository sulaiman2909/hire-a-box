import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Nicole Bertolani',
    time: '3 months ago',
    text: "Gui and his team were absolutely awesome at handling our move. The team was on time, professional and super quick. They even helped with furniture assembly etc. We've used this team 4 times now and we're always happy with the service we receive.",
    initials: 'N',
    color: 'bg-purple-600',
  },
  {
    name: 'Andrew Kerr',
    time: '5 months ago',
    text: "I recently had my CBD unit flooded by a damaged HWS and had to move out during the drying out and repairs. My insurance company organised Hire A Mover to move my furniture out, store it during repairs and return everything just before ...",
    initials: 'A',
    color: 'bg-teal-600',
  },
  {
    name: 'Phaedra H',
    time: 'a month ago',
    text: "We had the boys move us and I cannot praise them enough. They are extremely professional & take a lot of care and attention to all of the items they are moving. If I could give them more than 5 stars I would. They listened to all our requests and delivered without hesitation.",
    initials: 'P',
    color: 'bg-orange-500',
  },
  {
    name: 'Garry Eade',
    time: '7 months ago',
    text: "A big thank you to the team at hire a mover, in particular Tali, Gisselle and Rubens, for always being there to support myself and my colleagues at Urban Building Solutions. Nothing is ever too hard and the odd miracle is performed when we need urgent turn arounds. Breakage is the least I've come across in this industry in 20 years, pricing is reasonable and allows us to ensure our clients aren't being over charged and the team on the ground are friendly, professional and careful, hands down the best movers in the business.",
    initials: 'G',
    color: 'bg-green-600',
  },
  {
    name: 'Heather Aragona',
    time: '4 months ago',
    text: "Thank you to everyone at hire a mover for making our moving experience as easy as possible. From start to finish nothing was too much for the team. They were all so lovely to talk to and the care they took with our belongings was so nice to see. I would recommend Hire A Mover to anyone who is relocating",
    initials: 'H',
    color: 'bg-indigo-600',
  },
  {
    name: 'Angie',
    time: '4 months ago',
    text: "We had these guys move for us yesterday 21/1/2026 to Bulimba and they were sensational. Friendly, helpful (eg reading the labels and placing boxes accordingly) and fast. Apparently they're available in all major cities. Will use again.",
    initials: 'A',
    color: 'bg-slate-500',
  },
];

export default function TestimonialsSlider() {
  // Duplicate array to create the infinite scroll effect seamlessly
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-24 bg-[var(--color-brand-warm-secondary)] overflow-hidden border-t border-[var(--color-brand-charcoal)]/5">
      <div className="max-w-[1360px] mx-auto px-6 mb-12 text-center">
        <span className="section-eyebrow uppercase tracking-[0.1em] font-semibold text-[var(--color-brand-orange)] font-heading">REAL REVIEWS</span>
        <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-[1.2] text-[var(--color-brand-charcoal)]">Loved by thousands</h2>
      </div>

      <div className="relative w-full overflow-hidden flex group">
        {/* Left/Right fading gradient masks */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* Marquee Track */}
        <div className="flex w-[200%] animate-marquee gap-6 group-hover:[animation-play-state:paused]">
          {duplicatedTestimonials.map((review, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-[350px] md:w-[450px] bg-[var(--color-brand-warm-white)] p-8 rounded-[12px] border border-[var(--color-brand-charcoal)]/5 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${review.color}`}>
                  {review.initials}
                </div>
                <div>
                  <div className="font-heading font-semibold text-[16px] text-[#2B2B28]">{review.name}</div>
                  <div className="font-sans font-normal text-[14px] text-[#7A756D]">{review.time}</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4 text-[#FABB05]">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p className="font-sans font-normal text-[16px] leading-[1.6] text-[#2B2B28] italic opacity-95 flex-grow">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
