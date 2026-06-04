'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="bg-[#060a14] py-28 relative overflow-hidden">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          className="relative overflow-hidden rounded-3xl bg-[#0b1120] border border-white/[0.07] px-8 py-20 text-center mb-24"
        >
          {/* Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[220px] bg-[#a3e635]/[0.07] rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[150px] bg-blue-600/[0.07] rounded-full blur-[60px] pointer-events-none" />

          <p className="relative text-[#a3e635] text-xs font-black uppercase tracking-[0.25em] mb-5">Ready to scale?</p>
          <h2 className="relative text-4xl sm:text-5xl lg:text-[4rem] font-black text-white tracking-tighter leading-[0.92] mb-6 max-w-3xl mx-auto">
            Customized Solution to<br />Your Business Goals
          </h2>
          <p className="relative text-slate-400 font-medium leading-relaxed mb-10 max-w-lg mx-auto">
            Our experienced team works closely with you to analyze your specific needs, challenges, and aspirations. No cookie-cutter plans.
          </p>
          <a
            href="/register"
            className="relative inline-block bg-[#a3e635] hover:bg-[#bef264] text-[#060a14] font-black px-10 py-4 rounded-xl transition-all duration-300 text-sm shadow-2xl shadow-[#a3e635]/20 hover:-translate-y-0.5"
          >
            Contact Us →
          </a>
        </motion.div>

        {/* Contact form section */}
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.22em] mb-4">Get in Touch</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-tight mb-5">
              Talk to our team
            </h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-10">
              Have a question about ShopMaster? We typically respond within a few hours on business days.
            </p>

            <div className="space-y-4">
              {[
                {
                  label: 'Email',
                  value: 'hello@tajarah.com',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ),
                  color: '#a3e635',
                },
                {
                  label: 'WhatsApp',
                  value: '+234 800 TAJARAH',
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51a9.526 9.526 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12.004 2C6.478 2 2 6.477 2 12.003a9.993 9.993 0 001.38 5.045L2 22l5.094-1.335A9.972 9.972 0 0012.004 22C17.527 22 22 17.525 22 12.003 22 6.477 17.527 2 12.004 2z" />
                    </svg>
                  ),
                  color: '#34d399',
                },
                {
                  label: 'Location',
                  value: 'Lagos, Nigeria',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  ),
                  color: '#60a5fa',
                },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4 group">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#0b1120] border border-white/[0.08] group-hover:border-white/[0.15] transition-colors shrink-0"
                    style={{ color: c.color }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider">{c.label}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
          >
            {!sent ? (
              <form
                onSubmit={handleSubmit}
                className="bg-[#0b1120] border border-white/[0.08] rounded-2xl p-8 space-y-5"
              >
                {[
                  { key: 'name',    label: 'Your Name',      type: 'text',  placeholder: 'Alhaji Musa Tanko' },
                  { key: 'email',   label: 'Email Address',  type: 'email', placeholder: 'alhaji@tanzakano.com' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{label}</label>
                    <input
                      type={type}
                      required
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-[#131c2e] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-[#a3e635]/40 transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your store and what you need..."
                    className="w-full bg-[#131c2e] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-[#a3e635]/40 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#a3e635] hover:bg-[#bef264] text-[#060a14] font-black py-4 rounded-xl transition-all duration-300 text-sm shadow-lg shadow-[#a3e635]/20 hover:-translate-y-0.5"
                >
                  Send Message →
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#0b1120] border border-[#a3e635]/25 rounded-2xl p-14 text-center"
              >
                <div className="w-16 h-16 bg-[#a3e635]/[0.12] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-2xl font-black text-white mb-3">Message Sent!</h4>
                <p className="text-slate-400 font-medium">We&apos;ll be in touch within 24 hours.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
