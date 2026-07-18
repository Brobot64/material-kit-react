'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NODES = [
  { label: 'Sales', color: '#7dd3a8', x: '12%', y: '18%' },
  { label: 'Stock', color: '#3ca1ff', x: '58%', y: '12%' },
  { label: 'POS', color: '#ba59ff', x: '28%', y: '48%' },
  { label: 'Team', color: '#ff59f1', x: '68%', y: '42%' },
  { label: 'Reports', color: '#ffd666', x: '42%', y: '72%' },
  { label: 'Offline', color: '#bbcfe4', x: '78%', y: '70%' },
]

export default function Hero() {
  return (
    <section className="w-hero-gradient relative min-h-[100svh] overflow-hidden pt-24 sm:pt-28">
      <div className="relative z-10 mx-auto flex max-w-[1320px] flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:flex-row lg:items-center lg:gap-8 lg:px-8 lg:pb-20 lg:pt-12">
        {/* Copy — ~60% */}
        <motion.div
          className="w-full lg:w-[58%]"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
          }}
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
            }}
            className="mb-4 text-[9px] font-bold uppercase tracking-[1.35px] text-white/75"
          >
            Retail ERP for Nigeria
          </motion.p>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 28 },
              show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
            }}
            className="w-display-hero text-white"
            style={{
              fontFamily: 'var(--w-font-display)',
              fontWeight: 700,
              fontSize: 'clamp(40px, 8vw, 96px)',
              lineHeight: 1,
              letterSpacing: '-0.96px',
            }}
          >
            Where great shops take shape
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
            }}
            className="mt-5 max-w-xl text-base font-medium leading-relaxed text-white/85 sm:text-lg"
          >
            Sales, inventory, employees, and offline POS — built for Nigerian retailers who need
            clarity without the clutter.
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/register"
              className="w-btn-primary !h-11 !bg-[#250835] !px-6 shadow-[0_16px_32px_-4px_rgba(37,8,53,0.4)]"
            >
              Get started
            </Link>
            <Link
              to="/sign-in"
              className="w-btn-secondary !h-11 !bg-white/15 !text-white backdrop-blur-sm hover:!bg-white/25"
            >
              Log in
            </Link>
          </motion.div>
        </motion.div>

        {/* Product mock — ~40% */}
        <motion.div
          className="relative w-full lg:w-[42%]"
          initial={{ opacity: 0, y: 40, rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        >
          <div
            className="animate-float relative mx-auto max-w-md overflow-hidden rounded-[16px] bg-black p-2 shadow-[0_32px_64px_-8px_rgba(37,8,53,0.45)] sm:max-w-lg"
            style={{ transform: 'perspective(1200px) rotateY(-6deg) rotateX(4deg)' }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[#f5f4f5]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#efe3ed,transparent_55%)]" />
              {NODES.map((node) => (
                <div
                  key={node.label}
                  className="absolute rounded-[12px] px-3 py-2 text-[10px] font-bold shadow-[0_8px_16px_-4px_rgba(37,8,53,0.16)]"
                  style={{
                    left: node.x,
                    top: node.y,
                    background: node.color,
                    color: '#250835',
                  }}
                >
                  {node.label}
                </div>
              ))}
              <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 300" fill="none">
                <path d="M70 70 C140 90, 160 140, 180 160" stroke="#ba59ff" strokeWidth="2" />
                <path d="M240 50 C220 120, 200 140, 180 160" stroke="#3ca1ff" strokeWidth="2" />
                <path d="M180 160 C220 180, 260 150, 300 160" stroke="#ff59f1" strokeWidth="2" />
                <path d="M180 160 C200 210, 220 230, 200 250" stroke="#250835" strokeWidth="2" opacity="0.4" />
              </svg>
              <div className="absolute bottom-4 left-4 right-4 rounded-[12px] bg-white/90 p-3 backdrop-blur-sm">
                <div className="text-[9px] font-bold uppercase tracking-[1.35px] text-[#250835]/60">
                  Live dashboard
                </div>
                <div
                  className="mt-1 text-lg font-bold text-[#250835]"
                  style={{ fontFamily: 'var(--w-font-display)' }}
                >
                  Today&apos;s sales · ₦482k
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
