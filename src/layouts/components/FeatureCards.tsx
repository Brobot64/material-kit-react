'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  {
    title: 'Lightning-Fast POS',
    content: 'Record every sale in seconds with per-line price negotiation. Floor price enforcement means staff can bargain freely — within limits you control. Every override is logged and approved.',
    chart: { label: 'Sales Speed Improvement', value: 87, color: '#a3e635' },
    metric: { value: '3 sec', sub: 'Average checkout time' },
  },
  {
    title: 'Real-Time Inventory',
    content: 'Track stock across all outlets simultaneously. FIFO costing ensures your cost-of-goods is always accurate. Low-stock alerts fire before you run out — never lose a sale to stockout.',
    chart: { label: 'Stock Accuracy Rate', value: 99, color: '#60a5fa' },
    metric: { value: '99.8%', sub: 'Stock accuracy' },
  },
  {
    title: 'Automated Bookkeeping',
    content: 'Every sale, salary, and expense automatically posts the correct double-entry journal. P&L, balance sheet, and trial balance are always ready — zero manual effort, zero errors.',
    chart: { label: 'Time Saved on Accounting', value: 94, color: '#34d399' },
    metric: { value: '94%', sub: 'Less manual work' },
  },
  {
    title: 'Multi-Outlet Management',
    content: 'Manage Lagos Island, Ikeja, and Abuja from one dashboard. Independent stock, independent staff, consolidated reports. Transfer stock between outlets in two clicks.',
    chart: { label: 'Operational Efficiency Gain', value: 76, color: '#f472b6' },
    metric: { value: '5+', sub: 'Outlets managed' },
  },
]

const WEEKLY = [42, 65, 48, 82, 56, 94, 71]

export default function FeatureCards() {
  const [active, setActive] = useState(0)
  const tab = TABS[active]

  return (
    <section id="how-it-works" className="bg-[#08101c] py-28 relative overflow-hidden">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-24" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] rounded-full blur-[130px] bg-[#a3e635]/[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-16"
        >
          <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.22em] mb-4">Precision Solutions</p>
          <h2 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white tracking-tighter leading-[0.92]">
            Built for Every Part<br />
            <span className="text-[#a3e635]">of Your Business</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left: Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="text-slate-400 text-lg leading-relaxed font-medium mb-10 max-w-md">
              In the fast-paced Nigerian retail landscape, having the right tools is just the beginning. ShopMaster gives you the full picture.
            </p>

            <a
              href="/register"
              className="inline-block bg-[#a3e635] hover:bg-[#bef264] text-[#060a14] font-black px-7 py-3.5 rounded-xl transition-all duration-300 text-sm mb-10 shadow-lg shadow-[#a3e635]/20 hover:-translate-y-0.5"
            >
              Get Started
            </a>

            <div className="space-y-2">
              {TABS.map((item, i) => (
                <button
                  key={item.title}
                  onClick={() => setActive(i)}
                  className={`w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden ${
                    active === i
                      ? 'bg-[#a3e635]/[0.08] border-[#a3e635]/30'
                      : 'bg-[#0b1120] border-white/[0.07] hover:border-white/[0.13]'
                  }`}
                >
                  <div className="flex items-center justify-between px-6 py-4.5">
                    <span className={`font-black text-base tracking-tight transition-colors ${active === i ? 'text-[#a3e635]' : 'text-white'}`}>
                      {item.title}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${active === i ? 'rotate-180 text-[#a3e635]' : 'text-slate-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5">
                          <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right: Chart + metrics */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-5"
          >
            {/* Line chart card */}
            <div className="bg-[#0b1120] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sales Trend — Last 6 Months</div>
                <div className="bg-[#a3e635]/[0.1] border border-[#a3e635]/20 rounded-lg px-3 py-1">
                  <span className="text-[#a3e635] text-xs font-black">+18% MoM</span>
                </div>
              </div>

              {/* SVG chart */}
              <div className="relative h-32 w-full mb-2">
                <svg viewBox="0 0 300 90" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,65 C40,60 60,50 90,42 C120,36 140,54 170,30 C200,14 220,32 250,18 C270,10 285,12 300,8"
                    fill="none" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round"
                  />
                  <path
                    d="M0,65 C40,60 60,50 90,42 C120,36 140,54 170,30 C200,14 220,32 250,18 C270,10 285,12 300,8 L300,90 L0,90 Z"
                    fill="url(#chartGrad)"
                  />
                  {/* Data points */}
                  {[[0,65],[60,50],[120,42],[180,30],[240,20],[300,8]].map(([x,y], i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="#a3e635" />
                  ))}
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((m) => <span key={m}>{m}</span>)}
              </div>
            </div>

            {/* Weekly bar chart */}
            <div className="bg-[#0b1120] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Weekly Revenue</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-black px-3 py-1 rounded-lg border"
                    style={{ color: tab.chart.color, borderColor: `${tab.chart.color}25`, background: `${tab.chart.color}0d` }}
                  >
                    {tab.chart.label}: {tab.chart.value}%
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex items-end gap-2 h-20 mb-2">
                {WEEKLY.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md chart-bar"
                      style={{
                        height: `${h * 0.8}px`,
                        background: i === 5 ? '#a3e635' : i === 6 ? 'rgba(163,230,53,0.4)' : 'rgba(255,255,255,0.06)',
                        animationDelay: `${i * 0.06}s`,
                      }}
                    />
                    <span className="text-[9px] text-slate-600 font-semibold">{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Two big stats */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-[#0b1120] border border-white/[0.08] rounded-2xl p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`metric-${active}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-4xl font-black tracking-tighter mb-2"
                    style={{ color: tab.chart.color }}
                  >
                    {tab.metric.value}
                  </motion.div>
                </AnimatePresence>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{tab.metric.sub}</p>
              </div>
              <div className="bg-[#0b1120] border border-white/[0.08] rounded-2xl p-6">
                <div className="text-4xl font-black text-[#60a5fa] tracking-tighter mb-2">4.9★</div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Verified rating from store owners</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
