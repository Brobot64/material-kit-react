'use client'

import { motion } from 'framer-motion'

const LINKS = {
  Product: [
    { label: 'Features',     href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing',      href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ',          href: '#faq' },
  ],
  Company: [
    { label: 'About Tajarah', href: '#' },
    { label: 'Blog',          href: '#' },
    { label: 'Careers',       href: '#' },
    { label: 'Contact',       href: '#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy',   href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Data Processing',  href: '#' },
  ],
}

const SOCIALS = [
  {
    label: 'X',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.237-1.667-2.237-.909 0-1.451.613-1.688 1.213-.087.216-.109.517-.109.817v5.776h-3.554s.05-9.368 0-10.322h3.554v1.462c.456-.704 1.279-1.706 3.107-1.706 2.269 0 3.97 1.481 3.97 4.66v5.906zM5.337 9.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 10.019H3.555V9.11h3.564v10.342zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51a9.526 9.526 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2C6.478 2 2 6.477 2 12.003a9.993 9.993 0 001.38 5.045L2 22l5.094-1.335A9.972 9.972 0 0012.004 22C17.527 22 22 17.525 22 12.003 22 6.477 17.527 2 12.004 2z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#040810] border-t border-white/[0.05] relative overflow-hidden">
      {/* Top CTA banner */}
      <div className="relative overflow-hidden bg-[#0b1120] border-b border-white/[0.05]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-[#a3e635]/[0.06] rounded-full blur-[80px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.22em] mb-4">
              Start for free today
            </p>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-6">
              Ready to run your store
              <br />
              <span className="text-[#a3e635]">like a boss?</span>
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/register"
                className="bg-[#a3e635] hover:bg-[#bef264] text-[#060a14] font-black px-8 py-3.5 rounded-xl transition-all duration-300 text-sm shadow-xl shadow-[#a3e635]/25 hover:-translate-y-0.5"
              >
                Get Started Free →
              </a>
              <a
                href="#contact"
                className="text-slate-400 hover:text-white font-semibold text-sm border border-white/[0.1] hover:border-white/[0.2] px-8 py-3.5 rounded-xl transition-all duration-300"
              >
                Talk to Sales
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-3 mb-7 w-fit">
              <div className="w-9 h-9 bg-[#a3e635] rounded-xl flex items-center justify-center shadow-lg shadow-[#a3e635]/20">
                <svg className="w-5 h-5 text-[#060a14]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614" />
                </svg>
              </div>
              <div className="leading-none">
                <div className="text-white font-black text-lg tracking-tight">ShopMaster</div>
                <div className="text-[9px] text-[#a3e635]/60 font-bold tracking-[0.2em] uppercase">by Tajarah</div>
              </div>
            </a>

            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-7 max-w-xs">
              The next-generation retail ERP built for the unique challenges of the Nigerian market. Inventory, POS, bookkeeping — all in one.
            </p>

            <p className="text-xs text-slate-600 font-semibold mb-5">hello@tajarah.com</p>

            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-400 hover:text-[#a3e635] hover:border-[#a3e635]/30 hover:bg-[#a3e635]/[0.06] transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-black text-white uppercase tracking-[0.18em] mb-6">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 font-semibold hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Tajarah Technologies Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] inline-block animate-pulse" />
              Built for Nigeria
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              99.9% Uptime
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
