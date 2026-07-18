'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PLANS = [
  {
    name: 'Starter',
    tagline: 'Single store, full power',
    monthly: 15000,
    annual: 12000,
    highlight: false,
    features: [
      '1 outlet',
      'Up to 3 staff accounts',
      'Unlimited products',
      'Full POS & sales tracking',
      'Basic inventory management',
      'Auto bookkeeping',
      'PDF receipts',
      'Email support',
    ],
    cta: 'Start free trial',
    ctaLink: '/register',
  },
  {
    name: 'Growth',
    tagline: 'For expanding businesses',
    monthly: 35000,
    annual: 29000,
    highlight: true,
    features: [
      'Up to 5 outlets',
      'Up to 15 staff accounts',
      'Everything in Starter',
      'Multi-outlet stock transfers',
      'Receivables & aging reports',
      'FIFO inventory valuation',
      'Bargaining analytics',
      'Custom receipt branding',
      'Priority support',
    ],
    cta: 'Start free trial',
    ctaLink: '/register',
  },
  {
    name: 'Enterprise',
    tagline: 'Unlimited scale, dedicated care',
    monthly: null,
    annual: null,
    highlight: false,
    features: [
      'Unlimited outlets',
      'Unlimited staff',
      'Everything in Growth',
      'Dedicated account manager',
      'Custom integrations',
      'On-site training',
      'SLA guarantee',
      'Advanced financial reports',
    ],
    cta: 'Contact sales',
    ctaLink: '#contact',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="bg-[#f5f4f5] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="w-kicker mb-3">Pricing</p>
          <h2 className="w-display text-[clamp(32px,5vw,48px)] leading-[1.1]">
            Simple plans in Naira
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base font-medium text-[#250835]/70">
            Start free. Upgrade when your shop grows. Prices in NGN.
          </p>

          <div className="mt-6 inline-flex rounded-[12px] bg-white p-1 shadow-[var(--w-shadow-low)]">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-[10px] px-4 py-2 text-[13px] font-bold ${!annual ? 'bg-[#250835] text-white' : 'text-[#250835]/70'}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-[10px] px-4 py-2 text-[13px] font-bold ${annual ? 'bg-[#250835] text-white' : 'text-[#250835]/70'}`}
            >
              Annual
            </button>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const price = plan.monthly == null ? null : annual ? plan.annual : plan.monthly
            return (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                viewport={{ once: true }}
                className={`w-card-flat flex flex-col ${plan.highlight ? 'ring-2 ring-[#250835]' : ''}`}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-[#e9bded] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1.35px] text-[#250835]">
                    Most popular
                  </span>
                )}
                <h3
                  className="text-2xl font-bold text-[#250835]"
                  style={{ fontFamily: 'var(--w-font-display)' }}
                >
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#250835]/65">{plan.tagline}</p>
                <div className="mt-5 mb-6">
                  {price == null ? (
                    <p className="text-3xl font-bold text-[#250835]" style={{ fontFamily: 'var(--w-font-display)' }}>
                      Custom
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-[#250835]" style={{ fontFamily: 'var(--w-font-display)' }}>
                      ₦{price.toLocaleString()}
                      <span className="text-sm font-semibold text-[#250835]/55">/mo</span>
                    </p>
                  )}
                </div>
                <ul className="mb-8 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm font-semibold text-[#250835]/80">
                      <span className="text-[#ba59ff]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaLink}
                  className={plan.highlight ? 'w-btn-primary w-full' : 'w-btn-secondary w-full border border-[#e9bded]'}
                >
                  {plan.cta}
                </Link>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
