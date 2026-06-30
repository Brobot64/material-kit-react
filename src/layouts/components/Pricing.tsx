'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const PLANS = [
  {
    name: 'Starter',
    tagline: 'Single store, full power',
    monthly: 15000, annual: 12000,
    highlight: false, badge: null,
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
    cta: 'Start Free Trial',
    ctaLink: '/register',
  },
  {
    name: 'Growth',
    tagline: 'For expanding businesses',
    monthly: 35000, annual: 29000,
    highlight: true, badge: 'Most Popular',
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
    cta: 'Start Free Trial',
    ctaLink: '/register',
  },
  {
    name: 'Enterprise',
    tagline: 'Unlimited scale, dedicated care',
    monthly: null, annual: null,
    highlight: false, badge: null,
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
    cta: 'Contact Sales',
    ctaLink: '#contact',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="bg-[#060a14] py-28 relative overflow-hidden">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-24" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[150px] bg-[#a3e635]/[0.025]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-14"
        >
          <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.22em] mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white tracking-tighter leading-[0.92] mb-5">
            Invest in Your<br />
            <span className="text-[#a3e635]">Business Growth</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium max-w-sm mx-auto mb-10">
            Start free for 14 days. No credit card required.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 bg-[#0b1120] border border-white/[0.08] rounded-xl p-1.5">
            {(['Monthly', 'Annual'] as const).map((label, i) => {
              const active = (i === 0) ? !annual : annual
              return (
                <button
                  key={label}
                  onClick={() => setAnnual(i === 1)}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-black transition-all duration-300 ${
                    active ? 'text-[#060a14]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="pricingToggle"
                      className="absolute inset-0 bg-[#a3e635] rounded-lg shadow-lg shadow-[#a3e635]/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                  {label === 'Annual' && (
                    <span className={`relative z-10 ml-1.5 text-[10px] font-black px-2 py-0.5 rounded-full ${
                      active ? 'bg-[#060a14]/20 text-[#060a14]' : 'bg-[#a3e635]/12 text-[#a3e635]'
                    }`}>
                      −17%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-40px' }}
              className={`relative flex flex-col rounded-2xl border transition-all duration-400 ${
                plan.highlight
                  ? 'bg-[#0b1120] border-[#a3e635]/35 shadow-2xl shadow-[#a3e635]/[0.06] lg:scale-[1.03] z-10'
                  : 'bg-[#0b1120] border-white/[0.07] hover:border-white/[0.13]'
              }`}
            >
              {/* Featured glow */}
              {plan.highlight && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-[#a3e635]/[0.06] blur-[60px]" />
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col relative z-10">
                {plan.badge && (
                  <div className="mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#a3e635]/[0.12] text-[#a3e635] border border-[#a3e635]/25 px-3 py-1.5 rounded-full">
                      ✦ {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{plan.name}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-7">{plan.tagline}</p>

                {/* Price */}
                <div className="mb-8">
                  {plan.monthly ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={annual ? 'annual' : 'monthly'}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="text-4xl font-black text-white tracking-tighter"
                          >
                            ₦{((annual ? plan.annual : plan.monthly) ?? 0).toLocaleString()}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-slate-500 text-sm font-bold">/mo</span>
                      </div>
                      {annual && (
                        <p className="text-xs text-[#a3e635] font-bold mt-1">
                          Save ₦{(((plan.monthly ?? 0) - (plan.annual ?? 0)) * 12).toLocaleString()}/yr
                        </p>
                      )}
                    </>
                  ) : (
                    <div>
                      <div className="text-4xl font-black text-white tracking-tighter">Custom</div>
                      <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Tailored to your scale</p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-400">
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#a3e635]"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink}
                  className={`block text-center font-black text-sm py-4 rounded-xl transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-[#a3e635] hover:bg-[#bef264] text-[#060a14] shadow-lg shadow-[#a3e635]/20 hover:-translate-y-0.5'
                      : 'bg-white/[0.05] hover:bg-white/[0.09] text-white border border-white/[0.1] hover:border-white/[0.2]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest"
        >
          {['14-day free trial', 'No credit card required', 'Cancel anytime', '99.9% uptime SLA'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
