'use client'

import { motion } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const FEATURES = [
  {
    title: 'Negotiation-Aware POS',
    description:
      'Floor price, guide price, default price. Staff can bargain freely within limits. Every override is logged and auditable.',
    tint: '#efe3ed',
  },
  {
    title: 'Multi-Outlet Inventory',
    description:
      'Run multiple locations from one account. Real-time stock per outlet, FIFO costing, and inter-outlet transfers.',
    tint: '#d8f3e8',
  },
  {
    title: 'Double-Entry Books',
    description:
      'Every sale, salary, and expense posts a balanced journal entry. P&L and balance sheet — always ready.',
    tint: '#dcecff',
  },
  {
    title: 'Role-Based Access',
    description:
      'Owner, store executive, sales rep — each sees only their scope. Onboard staff and audit every action.',
    tint: '#ffe8fb',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-[#f5f4f5] py-20 sm:py-28">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12 text-center sm:mb-16"
        >
          <p className="w-kicker mb-3">The essentials, done right</p>
          <h2
            className="w-display mx-auto max-w-3xl text-[clamp(32px,5vw,48px)] leading-[1.1]"
          >
            Capture and share your operations at the speed of thought
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#250835]/70">
            Everything your shop needs — sales, stock, team, and books — in one calm workspace.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
              viewport={{ once: true, margin: '-40px' }}
              className="w-card-flat hover:-translate-y-1 transition-transform duration-300"
              style={{ background: feature.tint }}
            >
              <p className="w-kicker mb-3 opacity-70">0{i + 1}</p>
              <h3
                className="text-2xl font-bold text-[#250835]"
                style={{ fontFamily: 'var(--w-font-display)' }}
              >
                {feature.title}
              </h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-[#250835]/75">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
