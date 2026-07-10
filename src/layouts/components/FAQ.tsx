'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'Do I need accounting knowledge to use ShopMaster?',
    a: 'No. ShopMaster handles double-entry bookkeeping automatically. When you record a sale, purchase, or salary payment, the correct journal entries are created for you. You just run your business.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. Every plan includes a 14-day free trial with no credit card required. You get full access to all features during the trial period.',
  },
  {
    q: 'Can I manage multiple store locations?',
    a: 'Absolutely. The Growth and Enterprise plans support multiple outlets with independent stock tracking, individual staff teams, and consolidated business-wide reports from one dashboard.',
  },
  {
    q: 'How does the negotiation-aware POS work?',
    a: 'You set three price tiers per product: Floor Price (minimum allowed), Guide Price (bargaining anchor), and Default Sale Price. Staff can negotiate freely within these boundaries — any sale below floor requires manager approval and is logged with a reason.',
  },
  {
    q: 'Can I use ShopMaster offline?',
    a: 'Yes. Catalog, customers, and POS can keep running when the network drops. Sales are queued on the device and sync automatically as soon as you are back online. Install the PWA for the best offline experience.',
  },
  {
    q: 'What reports are available?',
    a: 'P&L statement, balance sheet, trial balance, daily/weekly/monthly sales summaries, top-selling products, inventory valuation, receivables aging, staff performance, and cashier-level audit trails.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. All data is encrypted at rest and in transit. We run on enterprise-grade cloud infrastructure with automated daily backups. Your data is never shared with third parties.',
  },
  {
    q: 'What happens when my subscription ends?',
    a: 'Your account moves to read-only mode — you can still view and export all your data. We give you a 30-day grace period to renew before any data is affected.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-[#08101c] py-28 relative overflow-hidden">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-24" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[120px] bg-[#60a5fa]/[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-20 items-start">

          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            className="lg:sticky lg:top-28"
          >
            <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.22em] mb-4">FAQ</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-[0.92] mb-6">
              Questions &<br />Answers
            </h2>
            <p className="text-slate-400 font-medium leading-relaxed mb-8">
              Everything you need to know about ShopMaster. Can&apos;t find your answer?{' '}
              <a href="#contact" className="text-[#a3e635] hover:underline font-bold">Talk to us.</a>
            </p>

            {/* Stats */}
            <div className="bg-[#0b1120] border border-white/[0.08] rounded-2xl p-5 space-y-4">
              {[
                { label: 'Avg setup time', value: '< 30 min' },
                { label: 'Free trial', value: '14 days' },
                { label: 'Support response', value: '< 4 hrs' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                  <span className="text-sm font-black text-[#a3e635]">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-2"
          >
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  open === i
                    ? 'bg-[#0b1120] border-[#a3e635]/25'
                    : 'bg-[#0b1120] border-white/[0.07] hover:border-white/[0.13]'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-7 py-5 text-left gap-4"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-black text-slate-600 tabular-nums w-5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`font-black text-base transition-colors ${open === i ? 'text-[#a3e635]' : 'text-white'}`}>
                      {faq.q}
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                    open === i ? 'border-[#a3e635]/40 bg-[#a3e635]/10' : 'border-white/[0.1]'
                  }`}>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${open === i ? 'rotate-180 text-[#a3e635]' : 'text-slate-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-7 pb-6 pl-[4.25rem]">
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
