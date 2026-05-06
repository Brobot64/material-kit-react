import Header from 'src/layouts/components/header';
import Hero from 'src/layouts/components/Hero';
import Features from 'src/layouts/components/Features';
import DescriptionBanner from 'src/layouts/components/DescriptionBanner';
import BarcodeFeatures from 'src/layouts/components/BarcodeFeatures';
import FeatureCards from 'src/layouts/components/FeatureCards';
import Pricing from 'src/layouts/components/Pricing';
import FAQ from 'src/layouts/components/FAQ';
import Contact from 'src/layouts/components/Contact';
import Footer from 'src/layouts/components/Footer';

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Header />
      <Hero />
      <Features />
      <DescriptionBanner />
      <BarcodeFeatures />
      <FeatureCards />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
