'use client'

import { useState } from 'react'

import { useRevealAnimation } from 'src/hooks/useRevealAnimation'

const ACCORDION_ITEMS = [
  {
    title: 'Lightning-Fast POS',
    content: 'Record every sale in seconds with per-line price negotiation. Floor price enforcement means staff can bargain freely — within limits you control. Every override is logged and approved.',
  },
  {
    title: 'Real-Time Inventory Control',
    content: 'Track stock across all outlets simultaneously. FIFO costing ensures your cost-of-goods is always accurate. Low-stock alerts fire before you run out.',
  },
  {
    title: 'Automated Bookkeeping',
    content: 'Every sale, salary payment, and expense automatically posts the correct double-entry journal. P&L, balance sheet, and trial balance are always ready — zero manual effort.',
  },
  {
    title: 'Multi-Outlet Management',
    content: 'Manage Lagos Island, Ikeja, and Abuja from one dashboard. Independent stock, independent staff, consolidated reports. Transfer stock between outlets in two clicks.',
  },
]

export default function FeatureCards() {
  const sectionRef = useRevealAnimation()
  const [open, setOpen] = useState(0)

  return (
    <section id="how-it-works" ref={sectionRef as React.RefObject<HTMLElement>} className="bg-[#0a0e1a] py-28">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-28" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="reveal text-center mb-16">
          <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.2em] mb-4">Precision Solutions</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.92]">
            Built for Every Part<br />
            <span className="text-[#a3e635]">of Your Business</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* Left: description + accordion */}
          <div className="reveal">
            <p className="text-slate-400 text-lg leading-relaxed font-medium mb-10 max-w-md">
              In the fast-paced and competitive retail landscape, having the right tools is just the beginning. ShopMaster gives you the full picture.
            </p>
            <a href="/register" className="inline-block bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] font-black px-7 py-3.5 rounded-xl transition-all duration-200 text-sm mb-12 shadow-lg shadow-[#a3e635]/20">
              Get Started
            </a>

            <div className="space-y-2">
              {ACCORDION_ITEMS.map((item, i) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${open === i ? 'bg-[#a3e635]/10 border-[#a3e635]/30' : 'bg-[#0f1629] border-white/[0.07] hover:border-white/15'}`}
                >
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                    onClick={() => setOpen(open === i ? -1 : i)}
                  >
                    <span className={`font-black text-base tracking-tight transition-colors ${open === i ? 'text-[#a3e635]' : 'text-white'}`}>
                      {item.title}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${open === i ? 'rotate-180 text-[#a3e635]' : 'text-slate-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {open === i && (
                    <div className="px-6 pb-5">
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: metric visual + big stats */}
          <div className="reveal delay-200 space-y-5">
            {/* Sales trend card */}
            <div className="bg-[#0f1629] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sales Trend</div>
                <div className="bg-[#a3e635]/15 border border-[#a3e635]/25 rounded-lg px-3 py-1">
                  <span className="text-[#a3e635] text-xs font-black">+18% this month</span>
                </div>
              </div>

              {/* SVG line chart */}
              <div className="relative h-28 w-full mb-2">
                <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 C40,55 60,45 90,40 C120,35 140,50 170,30 C200,15 220,35 250,20 C270,12 285,15 300,10" fill="none" stroke="#a3e635" strokeWidth="2.5" />
                  <path d="M0,60 C40,55 60,45 90,40 C120,35 140,50 170,30 C200,15 220,35 250,20 C270,12 285,15 300,10 L300,80 L0,80 Z" fill="url(#lineGrad)" />
                  {/* Peak point */}
                  <circle cx="300" cy="10" r="4" fill="#a3e635" />
                  <text x="268" y="7" fill="#a3e635" fontSize="8" fontWeight="bold">₦2.1M</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => <span key={m}>{m}</span>)}
              </div>
            </div>

            {/* Two big stats */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-[#0f1629] border border-white/[0.08] rounded-2xl p-6">
                <div className="text-5xl font-black text-[#a3e635] tracking-tighter mb-2">500+</div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Retail businesses that run on ShopMaster daily</p>
              </div>
              <div className="bg-[#0f1629] border border-white/[0.08] rounded-2xl p-6">
                <div className="text-5xl font-black text-[#60a5fa] tracking-tighter mb-2">4.9★</div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Verified rating from store owners nationwide</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
