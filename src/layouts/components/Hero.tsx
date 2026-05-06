'use client'

import { Link } from 'react-router-dom'

const TRUST_CITIES = ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan', 'Enugu', 'Kaduna']

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#080c18] flex items-center overflow-hidden pt-20">
      {/* Background glows */}
      <div className="absolute top-[-100px] left-[-200px] w-[700px] h-[700px] bg-[#a3e635]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">

          {/* ── Left: Text ── */}
          <div>
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 bg-[#a3e635]/10 border border-[#a3e635]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-[#a3e635] rounded-full animate-pulse" />
              <span className="text-[#a3e635] text-xs font-bold tracking-widest uppercase">Trusted by 500+ Nigerian Retailers</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up delay-100 text-6xl sm:text-7xl lg:text-[5.5rem] font-black text-white leading-[0.92] tracking-tighter mb-8">
              Run Your<br />
              Store Like<br />
              <span className="text-[#a3e635]">A Boss.</span>
            </h1>

            <p className="animate-fade-in-up delay-200 text-lg text-slate-400 leading-relaxed mb-10 max-w-lg font-medium">
              The all-in-one shop management system for Nigerian retailers.
              Inventory, negotiation-aware POS, and bulletproof bookkeeping — from one dashboard.
            </p>

            {/* Search/CTA bar — OptiRank style */}
            <div className="animate-fade-in-up delay-300 relative max-w-md mb-12">
              <div className="flex items-center bg-[#0f1629] border border-white/10 rounded-xl p-1.5 shadow-2xl focus-within:border-[#a3e635]/40 transition-all">
                <div className="pl-3 pr-2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Your store name..."
                  className="flex-1 bg-transparent border-none outline-none text-white font-semibold placeholder:text-slate-600 text-sm py-2"
                />
                <Link to="/register" className="bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] px-5 py-2.5 rounded-lg font-black text-sm whitespace-nowrap transition-all duration-200">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up delay-400 flex items-center gap-10">
              {[
                { value: '500+', label: 'Active Stores' },
                { value: '₦2B+', label: 'Sales Tracked' },
                { value: '99.9%', label: 'Uptime' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Dashboard mockup ── */}
          <div className="relative animate-fade-in-right delay-200 hidden lg:block">

            {/* Main dashboard card */}
            <div className="relative z-10 bg-[#0f1629] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-[#a3e635]/70" />
                </div>
                <div className="text-xs text-slate-500 font-semibold">ShopMaster Dashboard</div>
                <div className="w-16 h-1.5 bg-white/5 rounded-full" />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  { label: "Today's Sales", value: '₦487,500', up: true, pct: '+12%' },
                  { label: 'Items Sold', value: '124', up: true, pct: '+8%' },
                  { label: 'Outstanding', value: '₦94,200', up: false, pct: '-3%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#131c2e] rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-white font-black text-sm">{stat.value}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${stat.up ? 'text-[#a3e635]' : 'text-red-400'}`}>{stat.pct}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="px-4 pb-2">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Weekly Revenue</div>
                <div className="flex items-end gap-2 h-24">
                  {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-md transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: i === 5 ? '#a3e635' : i === 6 ? 'rgba(163,230,53,0.5)' : 'rgba(255,255,255,0.07)',
                        }}
                      />
                      <div className="text-[9px] text-slate-600 font-semibold">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent sales */}
              <div className="px-4 py-3 border-t border-white/[0.06]">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2.5">Recent Transactions</div>
                <div className="space-y-2">
                  {[
                    { item: 'Samsung S24 Ultra', outlet: 'Lagos Island', amount: '₦485,000', paid: true },
                    { item: 'Infinix Hot 40 Pro', outlet: 'Ikeja Branch', amount: '₦156,000', paid: true },
                    { item: 'LG Smart TV 43"', outlet: 'Lekki Outlet', amount: '₦320,000', paid: false },
                  ].map((tx) => (
                    <div key={tx.item} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#a3e635]/10 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white text-[11px] font-semibold">{tx.item}</div>
                          <div className="text-slate-600 text-[9px]">{tx.outlet}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-[11px] font-bold">{tx.amount}</div>
                        <div className={`text-[9px] font-bold ${tx.paid ? 'text-[#a3e635]' : 'text-amber-400'}`}>
                          {tx.paid ? 'PAID' : 'PARTIAL'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card: Inventory alert */}
            <div className="animate-float absolute -top-6 -right-6 z-20 bg-[#0f1629] border border-[#a3e635]/20 rounded-2xl p-4 shadow-2xl shadow-black/40 min-w-[180px]">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#a3e635]/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" />
                  </svg>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory</div>
              </div>
              <div className="text-white font-black text-lg">1,247</div>
              <div className="text-[#a3e635] text-[10px] font-bold">Items In Stock</div>
              <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full">
                <div className="h-full w-[78%] bg-[#a3e635] rounded-full" />
              </div>
            </div>

            {/* Floating card: New sale */}
            <div className="animate-float delay-500 absolute -bottom-6 -left-6 z-20 bg-[#0f1629] border border-white/[0.08] rounded-2xl p-4 shadow-2xl shadow-black/40">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">New Sale Recorded</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-black text-sm">₦285,000</div>
                  <div className="text-slate-500 text-[10px]">Receipt #4491 • Just now</div>
                </div>
              </div>
            </div>

            {/* Subtle grid bg */}
            <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(163,230,53,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          </div>

        </div>

        {/* Cities trust strip */}
        <div className="mt-20 pt-10 border-t border-white/[0.06]">
          <p className="text-center text-xs text-slate-600 font-bold uppercase tracking-widest mb-6">Retailers across Nigeria rely on ShopMaster</p>
          <div className="flex items-center justify-center flex-wrap gap-8">
            {TRUST_CITIES.map((city) => (
              <span key={city} className="text-slate-500 font-black text-sm tracking-wider">{city}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
