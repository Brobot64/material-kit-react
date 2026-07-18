'use client'

import { motion } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const TESTIMONIALS = [
  {
    quote: "The negotiation-aware POS alone has saved us from countless below-cost sales. Results beyond our expectations.",
    name: 'Alhaji Musa Tanko',
    role: 'Tanko Electronics, Kano',
    avatar: 'MT',
    tint: '#efe3ed',
    stars: 5,
  },
  {
    quote: "I manage 3 outlets in Lagos and the multi-outlet stock tracking is a game changer. My accountant is happy — the books basically close themselves.",
    name: 'Mrs Chidinma Okafor',
    role: 'Chidi Gadgets, Lagos Island',
    avatar: 'CO',
    tint: '#dcecff',
    stars: 5,
  },
  {
    quote: "Before ShopMaster, we had no idea who owed us money. Now I run daily reports in seconds. Even my shop manager uses it without any training.",
    name: 'Ibrahim Sule',
    role: 'ISL Stores, Abuja',
    avatar: 'IS',
    tint: '#d8f3e8',
    stars: 5,
  },
  {
    quote: "The receipt system is professional-level. My customers love getting proper digital invoices. ShopMaster made my shop look like a serious business.",
    name: 'Blessing Nwosu',
    role: 'BN Appliances, Port Harcourt',
    avatar: 'BN',
    tint: '#ffe8fb',
    stars: 5,
  },
  {
    quote: "We track everything — sales, stock, debts, salaries. I used to spend weekends doing this manually. ShopMaster gave me my weekends back.",
    name: 'Emeka Eze',
    role: 'EziTech Store, Enugu',
    avatar: 'EE',
    tint: '#e9bded',
    stars: 5,
  },
  {
    quote: "The reports are incredible. I can see which products sell best, which staff perform well, and where to invest. True business intelligence.",
    name: 'Fatima Abdullahi',
    role: 'FA Electronics, Kaduna',
    avatar: 'FA',
    tint: '#bbcfe4',
    stars: 5,
  },
]

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div
      className="relative mx-3 w-[min(360px,calc(100vw-2rem))] flex-shrink-0 overflow-hidden rounded-[12px] p-6 shadow-[var(--w-shadow-low)] transition-transform duration-300 hover:-translate-y-0.5 sm:p-7"
      style={{ background: t.tint }}
    >
      {/* Stars */}
      <div className="mb-5 flex gap-1">
        {Array.from({ length: t.stars }).map((_, i) => (
          <svg key={i} className="h-4 w-4 text-[#250835]/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="relative z-10 mb-6 text-[15px] font-medium leading-relaxed text-[#250835]/80">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/70 text-xs font-bold text-[#250835]"
          style={{ fontFamily: 'var(--w-font-display)' }}
        >
          {t.avatar}
        </div>
        <div>
          <div
            className="text-sm font-bold text-[#250835]"
            style={{ fontFamily: 'var(--w-font-display)' }}
          >
            {t.name}
          </div>
          <div className="text-xs font-medium text-[#250835]/55">{t.role}</div>
        </div>
      </div>
    </div>
  )
}

export default function BarcodeFeature() {
  const row1 = [...TESTIMONIALS, ...TESTIMONIALS]
  const row2 = [...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3)]

  return (
    <section className="overflow-hidden bg-[#f5f4f5] py-20 sm:py-28">
      <div className="mx-auto mb-12 max-w-[1320px] px-4 sm:mb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="w-kicker mb-3">Client Testimonials</p>
            <h2 className="w-display text-[clamp(32px,5vw,56px)] leading-[1.05]">
              Satisfied Retailers<br />
              <span className="text-[#ba59ff]">Across Nigeria</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            viewport={{ once: true, margin: '-60px' }}
            className="flex items-center gap-4"
          >
            {/* Avatar stack */}
            <div className="flex -space-x-2.5">
              {TESTIMONIALS.slice(0, 4).map((t) => (
                <div
                  key={t.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#f5f4f5] text-[10px] font-bold text-[#250835]"
                  style={{ background: t.tint }}
                >
                  {t.avatar}
                </div>
              ))}
            </div>
            <div>
              <div
                className="text-sm font-bold text-[#250835]"
                style={{ fontFamily: 'var(--w-font-display)' }}
              >
                500+ retailers
              </div>
              <div className="text-xs font-medium text-[#250835]/55">love ShopMaster</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="space-y-5">
        {/* Row 1 — scrolls left */}
        <div className="relative">
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 sm:w-32"
            style={{ background: 'linear-gradient(to right, #f5f4f5, transparent)' }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 sm:w-32"
            style={{ background: 'linear-gradient(to left, #f5f4f5, transparent)' }}
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
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 sm:w-32"
            style={{ background: 'linear-gradient(to right, #f5f4f5, transparent)' }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 sm:w-32"
            style={{ background: 'linear-gradient(to left, #f5f4f5, transparent)' }}
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
