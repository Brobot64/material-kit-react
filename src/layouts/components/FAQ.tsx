'use client'

import { useState } from 'react'

import { useRevealAnimation } from 'src/hooks/useRevealAnimation'

const FAQS = [
  { q: 'Do I need accounting knowledge to use ShopMaster?', a: 'No. ShopMaster handles double-entry bookkeeping automatically. When you record a sale, purchase, or salary payment, the correct journal entries are created for you. You just run your business.' },
  { q: 'Is there a free trial?', a: 'Yes. Every plan includes a 14-day free trial with no credit card required. You get full access to all features during the trial period.' },
  { q: 'Can I manage multiple store locations?', a: 'Absolutely. The Growth and Enterprise plans support multiple outlets with independent stock tracking, individual staff teams, and consolidated business-wide reports from one dashboard.' },
  { q: 'How does the negotiation-aware POS work?', a: 'You set three price tiers per product: Floor Price (minimum allowed), Guide Price (bargaining anchor), and Default Sale Price (what shows at checkout). Staff can negotiate freely within these boundaries — any sale below floor requires manager approval and is logged with a reason.' },
  { q: 'Can I use ShopMaster offline?', a: 'ShopMaster is a cloud-based system. It requires an internet connection to sync data across outlets and ensure your records are always up to date. We recommend a stable connection for POS use.' },
  { q: 'What reports are available?', a: 'P&L statement, balance sheet, trial balance, daily/weekly/monthly sales summaries, top-selling products, inventory valuation, receivables aging report, staff performance, and cashier-level audit trails.' },
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted at rest and in transit. We run on enterprise-grade cloud infrastructure with automated daily backups. Your data is never shared with third parties.' },
  { q: 'What happens when my subscription ends?', a: 'Your account moves to read-only mode — you can still view and export all your data. We give you a 30-day grace period to renew before any data is affected.' },
]

export default function FAQ() {
  const sectionRef = useRevealAnimation()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" ref={sectionRef as React.RefObject<HTMLElement>} className="bg-[#080c18] py-28">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-28" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-16">
          <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.2em] mb-4">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-[0.92]">
            Questions &<br />Answers
          </h2>
        </div>

        <div className="reveal space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${open === i ? 'bg-[#0f1629] border-[#a3e635]/25' : 'bg-[#0f1629] border-white/[0.07] hover:border-white/15'}`}
            >
              <button
                className="w-full flex items-center justify-between px-7 py-5 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`font-black text-base transition-colors ${open === i ? 'text-[#a3e635]' : 'text-white'}`}>{faq.q}</span>
                <svg className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180 text-[#a3e635]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-7 pb-6">
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
