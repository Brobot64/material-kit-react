'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

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
    <section id="faq" className="bg-[#ffffff] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">

          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            viewport={{ once: true, margin: '-60px' }}
            className="lg:sticky lg:top-28"
          >
            <p className="w-kicker mb-3">FAQ</p>
            <h2
              className="w-display text-[clamp(32px,5vw,48px)] leading-[1.1] mb-5"
            >
              Questions &<br />Answers
            </h2>
            <p className="text-base font-medium leading-relaxed text-[#250835]/70 mb-8">
              Everything you need to know about ShopMaster. Can&apos;t find your answer?{' '}
              <a href="#contact" className="font-bold text-[#250835] underline decoration-[#e9bded] underline-offset-2 hover:decoration-[#250835]">
                Talk to us.
              </a>
            </p>

            {/* Stats */}
            <div className="w-card-flat bg-[#efe3ed] !p-5 space-y-4">
              {[
                { label: 'Avg setup time', value: '< 30 min' },
                { label: 'Free trial', value: '14 days' },
                { label: 'Support response', value: '< 4 hrs' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="w-kicker opacity-70">{s.label}</span>
                  <span
                    className="text-sm font-bold text-[#250835]"
                    style={{ fontFamily: 'var(--w-font-display)' }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-3"
          >
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-[12px] border transition-all duration-300 ${
                  open === i
                    ? 'border-[#e9bded] bg-[#efe3ed]/40 shadow-[var(--w-shadow-low)]'
                    : 'border-[#250835]/8 bg-white shadow-[var(--w-shadow-low)] hover:border-[#e9bded]'
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="w-kicker w-5 shrink-0 tabular-nums opacity-50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[15px] font-bold leading-snug transition-colors sm:text-base ${
                        open === i ? 'text-[#250835]' : 'text-[#250835]/90'
                      }`}
                      style={{ fontFamily: 'var(--w-font-display)' }}
                    >
                      {faq.q}
                    </span>
                  </div>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border transition-all duration-300 ${
                      open === i
                        ? 'border-[#250835]/20 bg-[#250835] text-white'
                        : 'border-[#250835]/10 bg-[#f5f4f5] text-[#250835]/50'
                    }`}
                  >
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pl-[2.75rem] sm:px-6 sm:pb-6 sm:pl-[4.25rem]">
                        <p className="text-sm font-medium leading-relaxed text-[#250835]/70">{faq.a}</p>
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
