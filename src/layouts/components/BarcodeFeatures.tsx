'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: "The negotiation-aware POS alone has saved us from countless below-cost sales. Results beyond our expectations.",
    name: 'Alhaji Musa Tanko',
    role: 'Tanko Electronics, Kano',
    avatar: 'MT',
    color: '#a3e635',
    stars: 5,
  },
  {
    quote: "I manage 3 outlets in Lagos and the multi-outlet stock tracking is a game changer. My accountant is happy — the books basically close themselves.",
    name: 'Mrs Chidinma Okafor',
    role: 'Chidi Gadgets, Lagos Island',
    avatar: 'CO',
    color: '#60a5fa',
    stars: 5,
  },
  {
    quote: "Before ShopMaster, we had no idea who owed us money. Now I run daily reports in seconds. Even my shop manager uses it without any training.",
    name: 'Ibrahim Sule',
    role: 'ISL Stores, Abuja',
    avatar: 'IS',
    color: '#f472b6',
    stars: 5,
  },
  {
    quote: "The receipt system is professional-level. My customers love getting proper digital invoices. ShopMaster made my shop look like a serious business.",
    name: 'Blessing Nwosu',
    role: 'BN Appliances, Port Harcourt',
    avatar: 'BN',
    color: '#fbbf24',
    stars: 5,
  },
  {
    quote: "We track everything — sales, stock, debts, salaries. I used to spend weekends doing this manually. ShopMaster gave me my weekends back.",
    name: 'Emeka Eze',
    role: 'EziTech Store, Enugu',
    avatar: 'EE',
    color: '#34d399',
    stars: 5,
  },
  {
    quote: "The reports are incredible. I can see which products sell best, which staff perform well, and where to invest. True business intelligence.",
    name: 'Fatima Abdullahi',
    role: 'FA Electronics, Kaduna',
    avatar: 'FA',
    color: '#a78bfa',
    stars: 5,
  },
]

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="relative flex-shrink-0 w-[360px] bg-[#0b1120] border border-white/[0.07] rounded-2xl p-7 mx-3 hover:border-white/[0.13] transition-colors duration-300 group overflow-hidden">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(200px at 50% 0%, ${t.color}07, transparent)` }}
      />

      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: t.stars }).map((_, i) => (
          <svg key={i} className="w-4 h-4" fill={t.color} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-[15px] text-slate-300 font-medium leading-relaxed mb-6 relative z-10">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
          style={{ background: `${t.color}18`, color: t.color }}
        >
          {t.avatar}
        </div>
        <div>
          <div className="text-white font-black text-sm">{t.name}</div>
          <div className="text-slate-500 text-xs font-medium">{t.role}</div>
        </div>
      </div>
    </div>
  )
}

export default function BarcodeFeature() {
  const row1 = [...TESTIMONIALS, ...TESTIMONIALS]
  const row2 = [...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3)]

  return (
    <section id="testimonials" className="bg-[#060a14] py-28 overflow-hidden">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.22em] mb-4">Client Testimonials</p>
            <h2 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white tracking-tighter leading-[0.92]">
              Satisfied Retailers<br />
              <span className="text-[#a3e635]">Across Nigeria</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            className="flex items-center gap-4"
          >
            {/* Avatar stack */}
            <div className="flex -space-x-2.5">
              {TESTIMONIALS.slice(0, 4).map((t) => (
                <div
                  key={t.name}
                  className="w-9 h-9 rounded-full border-2 border-[#060a14] flex items-center justify-center text-[10px] font-black"
                  style={{ background: `${t.color}1a`, color: t.color }}
                >
                  {t.avatar}
                </div>
              ))}
            </div>
            <div>
              <div className="text-white font-black text-sm">500+ retailers</div>
              <div className="text-slate-500 text-xs">love ShopMaster</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="space-y-5">
        {/* Row 1 — scrolls left */}
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #060a14, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #060a14, transparent)' }}
          />
          <div className="flex animate-marquee">
            {row1.map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #060a14, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #060a14, transparent)' }}
          />
          <div className="flex animate-marquee-reverse">
            {row2.map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
