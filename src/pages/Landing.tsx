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
import { RippleGrid } from '../components/ui/ripple-grid';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-900 relative overflow-x-hidden">
      {/* Interactive Full-Screen Background RippleGrid Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden flex justify-center items-center opacity-45 hover:opacity-70 transition-opacity duration-500 pointer-events-auto">
        <RippleGrid
          cellSize={50}
          pulseColor="#38bdf8"
          cellColor="rgba(241, 245, 249, 0.4)"
          filledCellColor="rgba(14, 165, 233, 0.55)"
          borderColor="rgba(226, 232, 240, 0.7)"
          borderWidth={1}
          pulseScale={1.25}
          pulseDuration={400}
          rippleDelay={40}
          interactive={true}
        />
      </div>

      {/* Foreground Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar />
        </div>

        {/* Floating Go Back button at top-left */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4 pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 bg-white/90 backdrop-blur-md hover:bg-sky-50/50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-sky-200 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
        </div>

        <main className="flex-grow pointer-events-auto">
          <Hero />
          <TrustStrip />
          <Features />
          <HowVyuhaWorks />
          <CTASection />
        </main>

        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};
