'use client'

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-4">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div
          className={`flex h-16 items-center justify-between rounded-[12px] px-4 sm:px-5 transition-all duration-300 ${
            scrolled
              ? 'bg-[#250835]/85 backdrop-blur-xl shadow-[0_16px_32px_-4px_rgba(37,8,53,0.24)] border border-white/10'
              : 'bg-transparent'
          }`}
        >
          <a href="#" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#250835] shadow-[0_8px_16px_-4px_rgba(37,8,53,0.2)]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614" />
              </svg>
            </div>
            <div className="leading-none">
              <div
                className="text-white text-[15px] font-bold tracking-tight"
                style={{ fontFamily: 'var(--w-font-display)' }}
              >
                ShopMaster
              </div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.35px] text-white/70">
                by Tajarah
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-[12px] px-[18px] py-2.5 text-[13px] font-bold tracking-[0.12px] text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/sign-in" className="w-btn-secondary">
              Log in
            </Link>
            <Link to="/register" className="w-btn-primary !bg-white !text-[#250835] hover:!bg-[#efe3ed]">
              Get started
            </Link>
          </div>

          <button
            type="button"
            aria-label="Menu"
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-[12px] text-white hover:bg-white/10"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="mt-2 rounded-[16px] border border-white/10 bg-[#250835]/95 p-4 backdrop-blur-xl lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-[12px] px-4 py-3 text-[13px] font-bold text-white/90 hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/sign-in" className="w-btn-secondary w-full" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link
                to="/register"
                className="w-btn-primary w-full !bg-white !text-[#250835]"
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
