import { useEffect } from 'react'

import FAQ from 'src/layouts/components/FAQ'
import Hero from 'src/layouts/components/Hero'
import Header from 'src/layouts/components/header'
import Footer from 'src/layouts/components/Footer'
import Pricing from 'src/layouts/components/Pricing'
import Contact from 'src/layouts/components/Contact'
import Features from 'src/layouts/components/Features'
import FeatureCards from 'src/layouts/components/FeatureCards'
import Testimonials from 'src/layouts/components/Testimonials'
import BarcodeFeatures from 'src/layouts/components/BarcodeFeatures'
import DescriptionBanner from 'src/layouts/components/DescriptionBanner'

function useLenis() {
  useEffect(() => {
    let rafId: number
    let lenis: any = null

    import('lenis').then(({ default: Lenis }) => {
      lenis = new (Lenis as any)({ lerp: 0.09, smoothWheel: true, touchMultiplier: 1.5 })
      const raf = (time: number) => {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    })

    return () => {
      if (lenis) lenis.destroy()
      cancelAnimationFrame(rafId)
    }
  }, [])
}

export default function HomePage() {
  useLenis()

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f4f5] text-[#250835] antialiased selection:bg-[#e9bded] selection:text-[#250835]">
      <Header />
      <Hero />
      <Features />
      <DescriptionBanner />
      <BarcodeFeatures />
      <FeatureCards />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}
