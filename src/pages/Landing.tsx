import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/landing/Hero';
import { TrustStrip } from '../components/landing/TrustStrip';
import { Features } from '../components/landing/Features';
import { HowVyuhaWorks } from '../components/landing/HowVyuhaWorks';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-900 relative">
      <Navbar />

      {/* Floating Go Back button at top-left */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 bg-white hover:bg-sky-50/50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-sky-200 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back</span>
        </button>
      </div>

      <main className="flex-grow">
        <Hero />
        <TrustStrip />
        <Features />
        <HowVyuhaWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
