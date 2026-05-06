'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useRevealAnimation } from 'src/hooks/useRevealAnimation'

const PLANS = [
  {
    name: 'Starter',
    tagline: 'Single store, full power',
    monthly: 15000, annual: 12000,
    highlight: false,
    badge: null,
    features: ['1 outlet', 'Up to 3 staff accounts', 'Unlimited products', 'Full POS & sales tracking', 'Basic inventory management', 'Auto bookkeeping', 'PDF receipts', 'Email support'],
    cta: 'Start Free Trial', ctaLink: '/register',
  },
  {
    name: 'Growth',
    tagline: 'For expanding businesses',
    monthly: 35000, annual: 29000,
    highlight: true,
    badge: 'Most Popular',
    features: ['Up to 5 outlets', 'Up to 15 staff accounts', 'Everything in Starter', 'Multi-outlet stock transfers', 'Receivables & aging reports', 'FIFO inventory valuation', 'Bargaining analytics', 'Custom receipt branding', 'Priority support'],
    cta: 'Start Free Trial', ctaLink: '/register',
  },
  {
    name: 'Enterprise',
    tagline: 'Unlimited scale, dedicated care',
    monthly: null, annual: null,
    highlight: false,
    badge: null,
    features: ['Unlimited outlets', 'Unlimited staff', 'Everything in Growth', 'Dedicated account manager', 'Custom integrations', 'On-site training', 'SLA guarantee', 'Advanced financial reports'],
    cta: 'Contact Sales', ctaLink: '#contact',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const sectionRef = useRevealAnimation()

  return (
    <section id="pricing" ref={sectionRef as React.RefObject<HTMLElement>} className="bg-[#0a0e1a] py-28">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-28" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center mb-16">
          <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.92] mb-6">
            Invest in Your<br />
            <span className="text-[#a3e635]">Business Growth</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium max-w-md mx-auto mb-10">
            Start free for 14 days. No credit card required.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-[#0f1629] border border-white/[0.08] rounded-xl p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-lg text-sm font-black transition-all ${!annual ? 'bg-[#a3e635] text-[#080c18] shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-lg text-sm font-black transition-all ${annual ? 'bg-[#a3e635] text-[#080c18] shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Annual <span className={`ml-1 text-[10px] font-black px-2 py-0.5 rounded-full ${annual ? 'bg-[#080c18]/20' : 'bg-[#a3e635]/15 text-[#a3e635]'}`}>−17%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, idx) => (
            <div
              key={plan.name}
              className={`reveal flex flex-col rounded-2xl border transition-all duration-400 ${
                plan.highlight
                  ? 'bg-[#0f1629] border-[#a3e635]/40 shadow-2xl shadow-[#a3e635]/5 scale-[1.03] z-10'
                  : 'bg-[#0f1629] border-white/[0.07] hover:border-white/15'
              }`}
              style={{ animationDelay: `${idx * 0.12}s` }}
            >
              <div className="p-8 flex-1 flex flex-col">
                {plan.badge && (
                  <div className="mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/25 px-3 py-1.5 rounded-full">
                      ✦ {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{plan.name}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-7">{plan.tagline}</p>

                {plan.monthly ? (
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white tracking-tighter">
                        ₦{((annual ? plan.annual : plan.monthly) || 0).toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-sm font-bold">/mo</span>
                    </div>
                    {annual && <p className="text-xs text-[#a3e635] font-bold mt-1">Billed annually — save ₦{((plan.monthly - (plan.annual || 0)) * 12).toLocaleString()}/yr</p>}
                  </div>
                ) : (
                  <div className="mb-8">
                    <div className="text-4xl font-black text-white tracking-tighter">Custom</div>
                    <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Tailored to your scale</p>
                  </div>
                )}

                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-400">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
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
                      ? 'bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] shadow-lg shadow-[#a3e635]/20'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
