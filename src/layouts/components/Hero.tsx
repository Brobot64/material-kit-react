'use client'

import { Link } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'

const CITIES = ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan', 'Enugu', 'Kaduna', 'Benin City']

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const bgY   = useTransform(scrollYProgress, [0, 1], ['0%', '-35%'])
  const dashY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-24">

      {/* ── Parallax background layer ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        {/* Orb 1 — lime */}
        <div
          className="animate-orb absolute -top-[15%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[130px]"
          style={{
            background: 'radial-gradient(circle, rgba(163,230,53,0.10) 0%, transparent 65%)',
            transform: `translate3d(${mouse.x * -18}px, ${mouse.y * -12}px, 0)`,
            transition: 'transform 2.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />
        {/* Orb 2 — blue */}
        <div
          className="animate-orb-delay absolute -bottom-[10%] -right-[5%] w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,0.09) 0%, transparent 65%)',
            transform: `translate3d(${mouse.x * 12}px, ${mouse.y * 9}px, 0)`,
            transition: 'transform 3s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />
        {/* Orb 3 — violet */}
        <div
          className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)',
            transform: `translate3d(${mouse.x * 8}px, ${mouse.y * -6}px, 0)`,
            transition: 'transform 3.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />

        {/* Subtle dot-grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 w-full">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">

          {/* ── Left: Text ── */}
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Live badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 bg-[#a3e635]/[0.08] border border-[#a3e635]/[0.14] rounded-full px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3e635] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a3e635]" />
              </span>
              <span className="text-[#a3e635] text-xs font-bold tracking-widest uppercase">
                Live — 500+ stores active now
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-[4.2rem] sm:text-[5rem] lg:text-[5.5rem] font-black text-white leading-[0.88] tracking-tighter mb-7"
            >
              The
              <br />
              <span className="text-[#a3e635]">Operating</span>
              <br />
              System for
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">Nigerian Retail.</span>
                <span
                  className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-[#a3e635]/30"
                  style={{ transform: 'scaleX(1)', transformOrigin: 'left' }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-[440px] font-medium"
            >
              Inventory, negotiation-aware POS, and double-entry books — with offline sales that sync the moment you reconnect.
            </motion.p>

            {/* CTA row */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                to="/register"
                className="group relative bg-[#a3e635] hover:bg-[#bef264] text-[#060a14] px-8 py-4 rounded-xl font-black text-sm transition-all duration-300 shadow-xl shadow-[#a3e635]/25 hover:shadow-[#a3e635]/40 hover:-translate-y-0.5"
              >
                Start Free Trial →
              </Link>
              <a
                href="#how-it-works"
                className="group flex items-center gap-3 text-slate-400 hover:text-white font-semibold text-sm transition-colors duration-200"
              >
                <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center group-hover:border-[#a3e635]/40 transition-colors">
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                See how it works
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-0 pt-8 border-t border-white/[0.06]"
            >
              {[
                { value: '500+', label: 'Active Stores' },
                { value: '₦2B+', label: 'Sales Tracked' },
                { value: '99.9%', label: 'Uptime' },
              ].map((s, i) => (
                <div key={s.label} className="relative flex-1 text-center first:text-left last:text-right">
                  {i > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-white/[0.08]" />
                  )}
                  <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Dashboard mockup ── */}
          <motion.div style={{ y: dashY }} className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              {/* Main card */}
              <div className="bg-[#0b1120] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl shadow-black/70">
                {/* Window chrome */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#070c17]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                    <div className="w-3 h-3 rounded-full bg-[#a3e635]/60" />
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-1.5">
                    <div className="w-2 h-2 bg-[#a3e635] rounded-full animate-pulse" />
                    <span className="text-xs text-slate-400 font-medium">shopmaster.ng/dashboard</span>
                  </div>
                  <div className="w-14" />
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 px-5 py-2.5 border-b border-white/[0.04] bg-[#08101c]">
                  {['Overview', 'Sales', 'Inventory', 'Reports'].map((tab, i) => (
                    <span
                      key={tab}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg ${
                        i === 0
                          ? 'bg-[#a3e635]/[0.12] text-[#a3e635]'
                          : 'text-slate-500'
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3 p-4">
                  {[
                    { label: "Today's Revenue", value: '₦487,500', up: true,  pct: '+12%' },
                    { label: 'Items Sold',      value: '124 units', up: true,  pct: '+8%' },
                    { label: 'Outstanding',     value: '₦94,200',  up: false, pct: '-3%' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#0d1828] rounded-xl p-3 border border-white/[0.04]">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">{stat.label}</div>
                      <div className="text-white font-black text-sm mb-1">{stat.value}</div>
                      <div className={`text-[10px] font-bold ${stat.up ? 'text-[#a3e635]' : 'text-red-400'}`}>
                        {stat.pct} vs yesterday
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Weekly Revenue</span>
                    <span className="text-[10px] font-bold text-[#a3e635] bg-[#a3e635]/[0.08] border border-[#a3e635]/20 px-2 py-0.5 rounded-md">₦2.1M total</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-[72px]">
                    {[38, 62, 47, 78, 53, 92, 68].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md chart-bar"
                          style={{
                            height: `${h * 0.72}px`,
                            background:
                              i === 5 ? '#a3e635'
                              : i === 6 ? 'rgba(163,230,53,0.45)'
                              : 'rgba(255,255,255,0.06)',
                            animationDelay: `${0.8 + i * 0.06}s`,
                          }}
                        />
                        <span className="text-[9px] text-slate-600 font-semibold">
                          {['M','T','W','T','F','S','S'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transactions */}
                <div className="px-4 py-3.5 border-t border-white/[0.05] bg-[#070c17]">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2.5">Recent Transactions</div>
                  <div className="space-y-2.5">
                    {[
                      { item: 'Samsung S24 Ultra', outlet: 'Lagos Island', amount: '₦485,000', paid: true },
                      { item: 'LG Smart TV 55"',   outlet: 'Ikeja Branch', amount: '₦450,000', paid: true },
                      { item: 'iPhone 15 Pro',     outlet: 'Lekki Outlet', amount: '₦960,000', paid: false },
                    ].map((tx) => (
                      <div key={tx.item} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#a3e635]/[0.08] flex items-center justify-center shrink-0">
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
                          <div className={`text-[9px] font-bold uppercase ${tx.paid ? 'text-[#a3e635]' : 'text-amber-400'}`}>
                            {tx.paid ? 'Paid' : 'Partial'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating card: inventory */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, x: 20, y: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="animate-float absolute -top-7 -right-7 z-20 bg-[#0b1120] border border-[#a3e635]/25 rounded-2xl p-4 shadow-2xl shadow-black/60 min-w-[185px]"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#a3e635]/[0.1] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stock Level</span>
                </div>
                <div className="text-2xl font-black text-white">1,247</div>
                <div className="text-[#a3e635] text-[10px] font-bold mb-2">Items in stock</div>
                <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] rounded-full" style={{ width: '78%' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-600">78% capacity</span>
                  <span className="text-[9px] text-[#a3e635] font-bold">Healthy</span>
                </div>
              </motion.div>

              {/* Floating card: new sale */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, x: -20, y: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ delay: 1.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="animate-float delay-500 absolute -bottom-7 -left-7 z-20 bg-[#0b1120] border border-white/[0.08] rounded-2xl p-4 shadow-2xl shadow-black/60"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sale Recorded</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/[0.10] flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">₦485,000</div>
                    <div className="text-slate-500 text-[10px]">Receipt #4491 · Just now</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Glow behind dashboard */}
            <div className="absolute inset-0 -z-10 scale-110 blur-3xl bg-[#a3e635]/[0.025] rounded-3xl" />
          </motion.div>
        </div>

        {/* Cities strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-24 pt-10 border-t border-white/[0.05]"
        >
          <p className="text-center text-[11px] text-slate-600 font-bold uppercase tracking-[0.22em] mb-6">
            Retailers across Nigeria rely on ShopMaster
          </p>
          <div className="flex items-center justify-center flex-wrap gap-10">
            {CITIES.map((city) => (
              <span key={city} className="text-slate-500 hover:text-slate-300 font-black text-sm tracking-wider transition-colors duration-200">
                {city}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 border border-white/[0.12] rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-[#a3e635] rounded-full animate-scroll-dot" />
        </div>
      </motion.div>
    </section>
  )
}
