'use client'

import { motion } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

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
    <footer className="relative overflow-hidden bg-[#ffffff] border-t border-[#250835]/6">
      {/* Top CTA banner */}
      <div className="relative overflow-hidden bg-[#efe3ed] border-b border-[#250835]/6">
        <div className="relative z-10 mx-auto max-w-[1320px] px-4 py-14 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            viewport={{ once: true, margin: '-40px' }}
          >
            <p className="w-kicker mb-4 opacity-70">
              Start for free today
            </p>
            <h3
              className="w-display mb-6 text-[clamp(28px,4vw,48px)] leading-[1.1]"
            >
              Ready to run your store
              <br />
              <span className="text-[#ba59ff]">like a boss?</span>
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <a href="/register" className="w-btn-primary px-8">
                Get Started Free →
              </a>
              <a href="#contact" className="w-btn-secondary border border-[#e9bded] px-8">
                Talk to Sales
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8 sm:py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12 lg:mb-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="mb-7 flex w-fit items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#250835] shadow-[var(--w-shadow-low)]">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614" />
                </svg>
              </div>
              <div className="leading-none">
                <div
                  className="text-lg font-bold tracking-tight text-[#250835]"
                  style={{ fontFamily: 'var(--w-font-display)' }}
                >
                  ShopMaster
                </div>
                <div className="w-kicker mt-1 opacity-60">by Tajarah</div>
              </div>
            </a>

            <p className="mb-7 max-w-xs text-sm font-medium leading-relaxed text-[#250835]/65">
              The next-generation retail ERP built for the unique challenges of the Nigerian market. Inventory, POS, bookkeeping — all in one.
            </p>

            <p className="mb-5 text-xs font-semibold text-[#250835]/50">hello@tajarah.com</p>

            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#250835]/8 bg-[#f5f4f5] text-[#250835]/50 transition-all duration-200 hover:border-[#e9bded] hover:bg-[#efe3ed] hover:text-[#250835]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="w-kicker mb-5 sm:mb-6">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block text-sm font-semibold text-[#250835]/60 transition-colors duration-200 hover:text-[#250835]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#250835]/8 pt-8 sm:flex-row">
          <p className="w-kicker opacity-50">
            © {new Date().getFullYear()} Tajarah Technologies Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#ba59ff]" />
              <span className="w-kicker opacity-50">Built for Nigeria</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3ca1ff]" />
              <span className="w-kicker opacity-50">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
