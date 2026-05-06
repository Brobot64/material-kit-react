'use client'

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080c18]/95 backdrop-blur-xl border-b border-white/[0.06] py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#a3e635] rounded-lg flex items-center justify-center shadow-lg shadow-[#a3e635]/25">
              <svg className="w-5 h-5 text-[#080c18]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614" />
              </svg>
            </div>
            <div className="leading-none">
              <div className="text-white font-black text-lg tracking-tight">ShopMaster</div>
              <div className="text-[9px] text-[#a3e635]/60 font-bold tracking-[0.2em] uppercase">by Tajarah</div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-slate-400 hover:text-white text-sm font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/sign-in" className="text-slate-400 hover:text-white text-sm font-semibold transition-colors px-4 py-2">
              Log In
            </Link>
            <Link to="/register" className="bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] text-sm font-black px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-[#a3e635]/20">
              Get Started
            </Link>
          </div>

          {/* Mobile button */}
          <button className="lg:hidden text-white p-2 rounded-lg hover:bg-white/5 transition" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#080c18] border-t border-white/[0.06] px-4 py-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/5 transition-colors">
              {link.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link to="/sign-in" className="text-center text-white border border-white/10 rounded-lg py-3 font-bold hover:bg-white/5 transition">Log In</Link>
            <Link to="/register" className="text-center bg-[#a3e635] text-[#080c18] font-black rounded-lg py-3">Get Started</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
