'use client'

import Hero from 'src/layouts/components/Hero'
import Header from 'src/layouts/components/header'
import Footer from 'src/layouts/components/Footer'
import Pricing from 'src/layouts/components/Pricing'
import Features from 'src/layouts/components/Features'
import FeatureCards from 'src/layouts/components/FeatureCards'
import BarcodeFeature from 'src/layouts/components/BarcodeFeatures'
import DescriptionBanner from 'src/layouts/components/DescriptionBanner'

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
