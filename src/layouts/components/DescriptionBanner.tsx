'use client'

import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const STATS = [
  {
    value: 500, suffix: '+', label: 'Retail Stores',
    description: 'Active businesses across Nigeria using ShopMaster daily',
    tint: '#efe3ed',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  },
  {
    value: 2, prefix: '₦', suffix: 'B+', label: 'Sales Tracked',
    description: 'Total transaction value recorded through the platform this year',
    tint: '#dcecff',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    value: 4.9, suffix: '/5', label: 'Avg Rating',
    description: 'From verified store owners who use ShopMaster every day',
    tint: '#ffe8fb',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    value: 99.9, suffix: '%', label: 'Uptime SLA',
    description: 'Your store keeps running 24/7 — even when you are not there',
    tint: '#d8f3e8',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
]

function AnimatedNumber({
  target, prefix = '', suffix = '', inView,
}: {
  target: number; prefix?: string; suffix?: string; inView: boolean
}) {
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current) return undefined
    startedRef.current = true

    const isFloat = !Number.isInteger(target)
    const duration = 1800
    const stepMs = 16
    const steps = duration / stepMs
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(isFloat ? Math.round(current * 10) / 10 : Math.floor(current))
      }
    }, stepMs)

    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span>
      {prefix}{Number.isInteger(target) ? count : count.toFixed(1)}{suffix}
    </span>
  )
}

export default function DescriptionBanner() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="relative overflow-hidden bg-[#ffffff] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8" ref={sectionRef}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12 text-center sm:mb-16"
        >
          <p className="w-kicker mb-3">By the numbers</p>
          <h2 className="w-display text-[clamp(32px,5vw,48px)] leading-[1.1]">
            The platform Nigerian retailers trust
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: EASE }}
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="w-card-flat hover:-translate-y-1 transition-transform duration-300"
              style={{ background: stat.tint }}
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/60 text-[#250835] transition-transform duration-300 group-hover:scale-110"
              >
                {stat.icon}
              </div>

              <div
                className="mb-1 text-4xl font-bold tabular-nums tracking-tight text-[#250835] sm:text-5xl"
                style={{ fontFamily: 'var(--w-font-display)' }}
              >
                <AnimatedNumber
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  inView={inView}
                />
              </div>

              <div className="w-kicker mb-3 opacity-80">{stat.label}</div>
              <p className="text-sm font-medium leading-relaxed text-[#250835]/65">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
