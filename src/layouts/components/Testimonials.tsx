'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote:
      'We stopped guessing stock overnight. ShopMaster’s POS and inventory finally match what we sell on the floor in Lagos.',
    name: 'Adaeze Okonkwo',
    role: 'Owner, BrightMart Stores',
    city: 'Lagos',
    tint: '#efe3ed',
  },
  {
    quote:
      'Bargaining used to kill our margins. Floor and guide prices keep my sales team honest without slowing the till.',
    name: 'Ibrahim Musa',
    role: 'Outlet Manager',
    city: 'Kano',
    tint: '#dcecff',
  },
  {
    quote:
      'Even when the network drops, we keep selling. Queued sales sync the moment we are back online — that alone paid for the subscription.',
    name: 'Chioma Eze',
    role: 'Operations Lead',
    city: 'Port Harcourt',
    tint: '#d8f3e8',
  },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-[#f5f4f5] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12 max-w-2xl sm:mb-14"
        >
          <p className="w-kicker mb-3">Testimonials</p>
          <h2 className="w-display text-[clamp(32px,5vw,48px)] leading-[1.1]">
            Built for Nigerian retail floors
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-[#250835]/70">
            Owners and outlet managers use ShopMaster to run POS, stock, and books — online or offline.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: EASE }}
              viewport={{ once: true, margin: '-40px' }}
              className="w-card-flat hover:-translate-y-1 transition-transform duration-300"
              style={{ background: item.tint }}
            >
              <div
                className="mb-5 text-4xl font-bold leading-none text-[#250835]/25"
                style={{ fontFamily: 'var(--w-font-display)' }}
              >
                &ldquo;
              </div>
              <p className="mb-8 text-[15px] font-medium leading-relaxed text-[#250835]/80">
                {item.quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/70 text-sm font-bold text-[#250835]"
                  style={{ fontFamily: 'var(--w-font-display)' }}
                >
                  {item.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div
                    className="text-sm font-bold text-[#250835]"
                    style={{ fontFamily: 'var(--w-font-display)' }}
                  >
                    {item.name}
                  </div>
                  <div className="text-xs font-semibold text-[#250835]/55">
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
