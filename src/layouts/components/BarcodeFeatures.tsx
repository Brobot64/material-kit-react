'use client'

import { useState } from 'react'

import { useRevealAnimation } from 'src/hooks/useRevealAnimation'

const TESTIMONIALS = [
  {
    quote: "Choosing ShopMaster was the best decision for our electronics business. The negotiation-aware POS alone has saved us from countless below-cost sales. Results beyond our expectations.",
    name: 'Alhaji Musa Tanko',
    role: 'Owner, Tanko Electronics — Kano',
    avatar: 'MT',
    color: '#a3e635',
  },
  {
    quote: "We manage 3 outlets in Lagos and the multi-outlet stock tracking is a game changer. I can see everything from one screen. My accountant is happy — the books basically close themselves.",
    name: 'Mrs Chidinma Okafor',
    role: 'CEO, Chidi Gadgets — Lagos Island',
    avatar: 'CO',
    color: '#60a5fa',
  },
  {
    quote: "Before ShopMaster, we had no idea who owed us money or how much stock we had. Now I run daily reports in seconds. Even my shop manager uses it without any training.",
    name: 'Ibrahim Sule',
    role: 'Proprietor, ISL Stores — Abuja',
    avatar: 'IS',
    color: '#f472b6',
  },
  {
    quote: "The receipt system is professional-level. My customers love getting proper digital invoices. ShopMaster made my small shop look like a serious business.",
    name: 'Blessing Nwosu',
    role: 'Owner, BN Appliances — Port Harcourt',
    avatar: 'BN',
    color: '#fbbf24',
  },
]

export default function BarcodeFeature() {
  const sectionRef = useRevealAnimation()
  const [current, setCurrent] = useState(0)
  const t = TESTIMONIALS[current]

  return (
    <section id="testimonials" ref={sectionRef as React.RefObject<HTMLElement>} className="bg-[#080c18] py-28">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-28" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Heading */}
          <div className="reveal">
            <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.2em] mb-4">Client Testimonials</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.92] mb-6">
              Satisfied Retailers<br />
              <span className="text-[#a3e635]">Across Nigeria</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10 max-w-md">
              At Tajarah, our mission is to deliver exceptional retail solutions that drive real results for every store owner.
            </p>
            <a href="/register" className="inline-block bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] font-black px-7 py-3.5 rounded-xl transition-all duration-200 text-sm mb-12 shadow-lg shadow-[#a3e635]/20">
              Get Started Free
            </a>

            {/* Avatar stack */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {TESTIMONIALS.map((tt, i) => (
                  <button
                    key={tt.name}
                    onClick={() => setCurrent(i)}
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${current === i ? 'scale-110 border-[#a3e635] z-10' : 'border-[#0f1629]'}`}
                    style={{ background: `${tt.color}25`, color: tt.color }}
                  >
                    {tt.avatar}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted Retailer Showcase</p>
            </div>
          </div>

          {/* Right: Quote card */}
          <div className="reveal delay-200">
            <div className="bg-[#0f1629] border border-white/[0.08] rounded-3xl p-10 lg:p-12 relative overflow-hidden">
              {/* Accent glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ background: t.color }} />

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} className="w-5 h-5 fill-current" style={{ color: t.color }} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl lg:text-2xl font-bold text-white leading-relaxed mb-8 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: `${t.color}20`, color: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white font-black text-base">{t.name}</div>
                  <div className="text-slate-500 text-xs font-semibold mt-0.5">{t.role}</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4 mt-10">
                <button
                  onClick={() => setCurrent((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:border-white/30 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-xs text-slate-500 font-bold tabular-nums">
                  {String(current + 1).padStart(2, '0')}/{String(TESTIMONIALS.length).padStart(2, '0')}
                </span>
                <button
                  onClick={() => setCurrent((current + 1) % TESTIMONIALS.length)}
                  className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:border-white/30 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
