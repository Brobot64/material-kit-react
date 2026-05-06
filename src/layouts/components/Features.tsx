'use client'

import { useRevealAnimation } from 'src/hooks/useRevealAnimation'

const FEATURES = [
  {
    title: 'Negotiation-Aware POS',
    description: 'Floor price, guide price, default price. Staff can bargain freely within limits. Every override is logged, approved, and auditable.',
    icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>),
    badge: 'POS', accent: '#a3e635',
  },
  {
    title: 'Multi-Outlet Inventory',
    description: 'Run 5+ locations from one account. Real-time stock per outlet, FIFO costing, low-stock alerts, and inter-outlet transfers.',
    icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>),
    badge: 'Inventory', accent: '#60a5fa',
  },
  {
    title: 'Double-Entry Bookkeeping',
    description: 'Every sale, salary, and expense posts a balanced journal entry automatically. P&L, balance sheet, trial balance — all ready.',
    icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>),
    badge: 'Finance', accent: '#34d399',
  },
  {
    title: 'Role-Based Access',
    description: 'Owner, Store Executive, Sales Rep — each sees only their scope. Onboard staff in one click, assign outlets, set salaries.',
    icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>),
    badge: 'Team', accent: '#f472b6',
  },
]

export default function Features() {
  const sectionRef = useRevealAnimation()

  return (
    <section id="features" ref={sectionRef as React.RefObject<HTMLElement>} className="bg-[#080c18] py-28">
      {/* Top divider accent */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-28" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row — OptiRank split layout */}
        <div className="reveal grid lg:grid-cols-2 gap-12 items-end mb-20">
          <div>
            <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.2em] mb-4">Everything you need</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.92]">
              Targeted Tools<br />
              for Retail Success
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-lg text-slate-400 leading-relaxed mb-6 font-medium max-w-md ml-auto">
              From haggling at the counter to closing the books at month-end — ShopMaster handles every part of your operation.
            </p>
            <a href="/register" className="inline-block bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] font-black px-7 py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-[#a3e635]/20">
              Get Started Free
            </a>
          </div>
        </div>

        {/* Feature cards 2×2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((feature, idx) => (
            <div
              key={feature.title}
              className="reveal bg-[#0f1629] border border-white/[0.07] rounded-2xl p-8 hover:border-white/15 hover:bg-[#131c2e] transition-all duration-400 group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-400"
                  style={{ background: `${feature.accent}15`, color: feature.accent }}
                >
                  {feature.icon}
                </div>
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border"
                  style={{ color: feature.accent, borderColor: `${feature.accent}25`, background: `${feature.accent}10` }}
                >
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
