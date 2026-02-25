'use client';

import {
  BackgroundEffects,
  LandingV2Header,
  HeroSection,
  ProductScreenshot,
  FeaturesSection,
  CTASection,
  LandingV2Footer,
} from '@/components/landing-v2';

export default function LandingV2Client() {
  return (
    <div
      className="relative w-full min-h-screen text-white overflow-x-hidden"
      style={{ backgroundColor: '#000', fontFamily: 'var(--font-montserrat), Montserrat, sans-serif' }}
    >
      <BackgroundEffects />

      <div className="relative">
        <LandingV2Header />
        <HeroSection />
      </div>

      <ProductScreenshot />
      <FeaturesSection />
      <CTASection />
      <LandingV2Footer />
    </div>
  );
}
