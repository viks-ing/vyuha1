import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/landing/Hero';
import { TrustStrip } from '../components/landing/TrustStrip';
import { Features } from '../components/landing/Features';
import { HowVyuhaWorks } from '../components/landing/HowVyuhaWorks';
import { RiskPrediction } from '../components/landing/RiskPrediction';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-900">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TrustStrip />
        <Features />
        <HowVyuhaWorks />
        <RiskPrediction />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
