'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[#f5f4f5] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          viewport={{ once: true, margin: '-60px' }}
          className="relative mb-16 overflow-hidden rounded-[16px] bg-[#efe3ed] px-6 py-16 text-center sm:mb-20 sm:px-8 sm:py-20"
        >
          <p className="w-kicker relative mb-4">Ready to scale?</p>
          <h2
            className="relative mx-auto mb-5 max-w-3xl text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight text-[#250835]"
            style={{ fontFamily: 'var(--w-font-display)' }}
          >
            Customized Solution to<br />Your Business Goals
          </h2>
          <p className="relative mx-auto mb-8 max-w-lg text-base font-medium leading-relaxed text-[#250835]/70">
            Our experienced team works closely with you to analyze your specific needs, challenges, and aspirations. No cookie-cutter plans.
          </p>
          <a href="/register" className="w-btn-primary relative px-10">
            Contact Us →
          </a>
        </motion.div>

        {/* Contact form section */}
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">

          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="w-kicker mb-3">Get in Touch</p>
            <h3
              className="mb-5 text-[clamp(28px,4vw,40px)] font-bold leading-tight text-[#250835]"
              style={{ fontFamily: 'var(--w-font-display)' }}
            >
              Talk to our team
            </h3>
            <p className="mb-10 text-base font-medium leading-relaxed text-[#250835]/70">
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
                  tint: '#efe3ed',
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
                  tint: '#d8f3e8',
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
                  tint: '#dcecff',
                },
              ].map((c) => (
                <div key={c.label} className="group flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-[#250835] transition-colors"
                    style={{ background: c.tint }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div className="w-kicker opacity-60">{c.label}</div>
                    <div className="mt-0.5 text-sm font-semibold text-[#250835]">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            viewport={{ once: true, margin: '-60px' }}
          >
            {!sent ? (
              <form
                onSubmit={handleSubmit}
                className="w-card-flat space-y-5 !p-6 sm:!p-8"
              >
                {[
                  { key: 'name',    label: 'Your Name',      type: 'text',  placeholder: 'Alhaji Musa Tanko' },
                  { key: 'email',   label: 'Email Address',  type: 'email', placeholder: 'alhaji@tanzakano.com' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="w-kicker mb-2 block opacity-70">{label}</label>
                    <input
                      type={type}
                      required
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full rounded-[12px] border border-[#250835]/10 bg-[#f5f4f5] px-4 py-3.5 text-sm font-medium text-[#250835] placeholder:text-[#250835]/35 transition-colors focus:border-[#e9bded] focus:outline-none focus:ring-2 focus:ring-[#e9bded]/40"
                    />
                  </div>
                ))}

                <div>
                  <label className="w-kicker mb-2 block opacity-70">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your store and what you need..."
                    className="w-full resize-none rounded-[12px] border border-[#250835]/10 bg-[#f5f4f5] px-4 py-3.5 text-sm font-medium text-[#250835] placeholder:text-[#250835]/35 transition-colors focus:border-[#e9bded] focus:outline-none focus:ring-2 focus:ring-[#e9bded]/40"
                  />
                </div>

                <button type="submit" className="w-btn-primary w-full !h-12">
                  Send Message →
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="w-card-flat bg-[#efe3ed] p-10 text-center sm:p-14"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[12px] bg-white shadow-[var(--w-shadow-low)]">
                  <svg className="h-8 w-8 text-[#250835]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4
                  className="mb-3 text-2xl font-bold text-[#250835]"
                  style={{ fontFamily: 'var(--w-font-display)' }}
                >
                  Message Sent!
                </h4>
                <p className="font-medium text-[#250835]/70">We&apos;ll be in touch within 24 hours.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
