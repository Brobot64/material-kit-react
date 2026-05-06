'use client'

import { useState } from 'react'

import { useRevealAnimation } from 'src/hooks/useRevealAnimation'

export default function Contact() {
  const sectionRef = useRevealAnimation()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" ref={sectionRef as React.RefObject<HTMLElement>} className="bg-[#0a0e1a] py-28">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* CTA Banner — OptiRank dark card style */}
        <div className="reveal relative overflow-hidden rounded-3xl bg-[#0f1629] border border-white/[0.08] px-8 py-20 text-center mb-24">
          {/* Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#a3e635]/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[150px] bg-blue-600/8 rounded-full blur-[60px] pointer-events-none" />

          <p className="relative text-[#a3e635] text-xs font-black uppercase tracking-[0.25em] mb-5">Ready to scale?</p>
          <h2 className="relative text-4xl sm:text-5xl lg:text-[4rem] font-black text-white tracking-tighter leading-[0.92] mb-6 max-w-3xl mx-auto">
            Customized Solution to<br />Your Business Goals
          </h2>
          <p className="relative text-slate-400 font-medium leading-relaxed mb-10 max-w-lg mx-auto">
            Our experienced team works closely with you to analyze your specific needs, challenges, and aspirations. No cookie-cutter plans.
          </p>
          <a
            href="/register"
            className="relative inline-block bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] font-black px-10 py-4 rounded-xl transition-all duration-200 text-sm shadow-2xl shadow-[#a3e635]/20"
          >
            Contact Us →
          </a>
        </div>

        {/* Contact form */}
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div className="reveal">
            <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.2em] mb-4">Get in Touch</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-tight mb-6">
              Talk to our team
            </h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-10">
              Have a question about ShopMaster? We typically respond within a few hours on business days.
            </p>
            <div className="space-y-5">
              {[
                { icon: '📧', label: 'Email', value: 'hello@tajarah.com' },
                { icon: '📱', label: 'WhatsApp', value: '+234 800 TAJARAH' },
                { icon: '📍', label: 'Location', value: 'Lagos, Nigeria' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0f1629] border border-white/[0.08] flex items-center justify-center text-lg">
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider">{c.label}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal delay-200">
            {!sent ? (
              <form onSubmit={handleSubmit} className="bg-[#0f1629] border border-white/[0.08] rounded-2xl p-8 space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Alhaji Musa Tanko"
                    className="w-full bg-[#131c2e] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-[#a3e635]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="alhaji@tanzakano.com"
                    className="w-full bg-[#131c2e] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-[#a3e635]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    required rows={4} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your store and what you need..."
                    className="w-full bg-[#131c2e] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-[#a3e635]/40 transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-[#a3e635] hover:bg-[#bef264] text-[#080c18] font-black py-4 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-[#a3e635]/20">
                  Send Message →
                </button>
              </form>
            ) : (
              <div className="bg-[#0f1629] border border-[#a3e635]/25 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-[#a3e635]/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-2xl font-black text-white mb-3">Message Sent!</h4>
                <p className="text-slate-400 font-medium">We&apos;ll be in touch within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
