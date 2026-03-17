'use client'

import Header from 'src/layouts/components/header'
import Hero from 'src/layouts/components/Hero'
import Features from 'src/layouts/components/Features'
import FeatureCards from 'src/layouts/components/FeatureCards'
import Pricing from 'src/layouts/components/Pricing'
import BarcodeFeature from 'src/layouts/components/BarcodeFeatures'
import DescriptionBanner from 'src/layouts/components/DescriptionBanner'
import Footer from 'src/layouts/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen md:w-7xl ">
      <Header />
      <Hero />
      <Features />
      <FeatureCards />
      <Pricing />
      <BarcodeFeature />
      <DescriptionBanner />
      <Footer />
    </div>
  )
}
