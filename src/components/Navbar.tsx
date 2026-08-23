import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', href: '#product' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Sample Risk Model', href: '#example-prediction' },
  ];

  return (
    <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full bg-white/90 backdrop-blur-md border border-[#0066FF]/15 rounded-[14px] shadow-lg shadow-[#0066FF]/5 px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#0066FF] flex items-center justify-center shadow-sm shadow-[#0066FF]/30 group-hover:scale-105 transition-all">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-lg font-extrabold tracking-wider text-black">
              VYUHA<span className="text-[#0066FF]">.AI</span>
            </span>
            <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase font-bold">Supply Chain Risk ML</span>
          </div>
        </Link>

        {/* Desktop Links (Individual Outlined Navigation Pills) */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-black px-3.5 py-1.5 rounded-[10px] bg-white/60 border border-[#0066FF]/25 hover:border-[#0066FF] hover:bg-[#0066FF]/5 hover:shadow-[0_0_8px_rgba(0,102,255,0.35),0_0_18px_rgba(0,102,255,0.18)] hover:-translate-y-0.5 active:bg-[#0066FF]/6 active:border-[#0066FF] transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-black p-2 rounded-[10px] bg-white border border-[#0066FF]/25 hover:border-[#0066FF] hover:shadow-[0_0_8px_rgba(0,102,255,0.35)] transition-all"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-[#0066FF]/20 rounded-[14px] p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-black px-3.5 py-2 rounded-[10px] bg-white/80 border border-[#0066FF]/25 hover:border-[#0066FF] hover:bg-[#0066FF]/5 hover:shadow-[0_0_8px_rgba(0,102,255,0.35)] transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/signup');
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
