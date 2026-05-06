import FAQ from 'src/layouts/components/FAQ';
import Hero from 'src/layouts/components/Hero';
import Header from 'src/layouts/components/header';
import Footer from 'src/layouts/components/Footer';
import Pricing from 'src/layouts/components/Pricing';
import Contact from 'src/layouts/components/Contact';
import Features from 'src/layouts/components/Features';
import FeatureCards from 'src/layouts/components/FeatureCards';
import BarcodeFeatures from 'src/layouts/components/BarcodeFeatures';
import DescriptionBanner from 'src/layouts/components/DescriptionBanner';

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
