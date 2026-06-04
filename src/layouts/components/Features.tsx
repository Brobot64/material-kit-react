'use client'

import { motion, type Variants } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const FEATURES = [
  {
    num: '01',
    title: 'Negotiation-Aware POS',
    description: 'Floor price, guide price, default price. Staff can bargain freely within limits. Every override is logged, manager-approved, and permanently auditable.',
    badge: 'POS',
    accent: '#a3e635',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Multi-Outlet Inventory',
    description: 'Run 5+ locations from one account. Real-time stock per outlet, FIFO costing, low-stock alerts, and inter-outlet transfers with full audit trail.',
    badge: 'Inventory',
    accent: '#60a5fa',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Double-Entry Bookkeeping',
    description: 'Every sale, salary, and expense posts a balanced journal entry automatically. P&L, balance sheet, trial balance — always ready. Zero manual accounting.',
    badge: 'Finance',
    accent: '#34d399',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Role-Based Access',
    description: 'Owner, Store Executive, Sales Rep — each sees only their scope. Onboard staff in one click, assign outlets, set salaries, and audit every action.',
    badge: 'Team',
    accent: '#f472b6',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
]

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
}

export default function Features() {
  return (
    <section id="features" className="bg-[#060a14] py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full blur-[120px] bg-[#a3e635]/[0.04]" />
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="grid lg:grid-cols-2 gap-12 items-end mb-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.22em] mb-4">Everything you need</p>
            <h2 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white tracking-tighter leading-[0.92]">
              Targeted Tools<br />
              for Retail Success
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            className="lg:text-right"
          >
            <p className="text-lg text-slate-400 leading-relaxed mb-6 font-medium max-w-md ml-auto">
              From haggling at the counter to closing the books — ShopMaster handles every part of your operation.
            </p>
            <a
              href="/register"
              className="inline-block bg-[#a3e635] hover:bg-[#bef264] text-[#060a14] font-black px-7 py-3.5 rounded-xl transition-all duration-300 text-sm shadow-lg shadow-[#a3e635]/20 hover:-translate-y-0.5"
            >
              Get Started Free
            </a>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="relative group bg-[#0b1120] border border-white/[0.07] rounded-2xl p-8 hover:border-white/[0.13] overflow-hidden transition-colors duration-400"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(300px at 50% 0%, ${f.accent}06, transparent)` }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-400"
                    style={{ background: `${f.accent}14`, color: f.accent }}
                  >
                    {f.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border"
                      style={{ color: f.accent, borderColor: `${f.accent}22`, background: `${f.accent}0d` }}
                    >
                      {f.badge}
                    </span>
                    <span className="text-[10px] font-black text-slate-600 tabular-nums">{f.num}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{f.description}</p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full rounded-full transition-all duration-500"
                  style={{ background: `linear-gradient(to right, ${f.accent}60, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
