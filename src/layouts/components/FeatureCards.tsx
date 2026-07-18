'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const CARDS = [
  {
    title: 'POS that bargains with you',
    body: 'Record every sale in seconds with per-line price negotiation and floor enforcement.',
    tint: '#efe3ed',
  },
  {
    title: 'Inventory you can trust',
    body: 'Track stock across outlets with FIFO costing and alerts before you run out.',
    tint: '#d8f3e8',
  },
  {
    title: 'Books that write themselves',
    body: 'Sales and expenses post balanced journals automatically — P&L always ready.',
    tint: '#dcecff',
  },
]

export default function FeatureCards() {
  return (
    <section id="how-it-works" className="bg-[#ffffff] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          viewport={{ once: true }}
          className="mb-12 max-w-2xl sm:mb-16"
        >
          <p className="w-kicker mb-3">Precision solutions</p>
          <h2 className="w-display text-[clamp(32px,5vw,48px)] leading-[1.1]">
            Built for every part of your business
          </h2>
          <p className="mt-4 text-base font-medium text-[#250835]/70">
            In Nigerian retail, the right tools are just the beginning. ShopMaster gives you the full picture.
          </p>
          <Link to="/register" className="w-btn-primary mt-6 inline-flex">
            Get started
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              viewport={{ once: true }}
              className="w-card-illustrative flex min-h-[280px] flex-col justify-end"
              style={{ background: card.tint }}
            >
              <h3
                className="text-[clamp(24px,3vw,32px)] font-bold leading-tight text-[#250835]"
                style={{ fontFamily: 'var(--w-font-display)' }}
              >
                {card.title}
              </h3>
              <p className="mt-3 text-base font-medium text-[#250835]/75">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
