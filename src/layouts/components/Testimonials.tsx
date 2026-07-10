'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote:
      'We stopped guessing stock overnight. ShopMaster’s POS and inventory finally match what we sell on the floor in Lagos.',
    name: 'Adaeze Okonkwo',
    role: 'Owner, BrightMart Stores',
    city: 'Lagos',
  },
  {
    quote:
      'Bargaining used to kill our margins. Floor and guide prices keep my sales team honest without slowing the till.',
    name: 'Ibrahim Musa',
    role: 'Outlet Manager',
    city: 'Kano',
  },
  {
    quote:
      'Even when the network drops, we keep selling. Queued sales sync the moment we are back online — that alone paid for the subscription.',
    name: 'Chioma Eze',
    role: 'Operations Lead',
    city: 'Port Harcourt',
  },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-28 overflow-hidden bg-[#070d18]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px] bg-[#a3e635]/[0.04]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-2xl mb-14"
        >
          <p className="text-[#a3e635] text-xs font-black uppercase tracking-[0.22em] mb-4">
            Testimonials
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-[0.95]">
            Built for Nigerian retail floors
          </h2>
          <p className="mt-5 text-slate-400 font-medium leading-relaxed">
            Owners and outlet managers use ShopMaster to run POS, stock, and books — online or offline.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: EASE }}
              viewport={{ once: true, margin: '-40px' }}
              className="group relative rounded-3xl border border-white/[0.08] bg-[#0b1220]/80 p-7 backdrop-blur-sm hover:border-[#a3e635]/25 transition-colors duration-300"
            >
              <div className="text-[#a3e635] text-4xl font-black leading-none mb-5 opacity-70">“</div>
              <p className="text-slate-200 text-[15px] leading-relaxed font-medium mb-8">
                {item.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a3e635]/30 to-[#60a5fa]/20 border border-white/10 flex items-center justify-center text-white text-sm font-black">
                  {item.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="text-white text-sm font-bold">{item.name}</div>
                  <div className="text-slate-500 text-xs font-semibold">
                    {item.role} · {item.city}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
