import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
        
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="font-mono text-xl font-bold text-slate-900 tracking-wider">
              VYUHA<span className="text-sky-600">.AI</span>
            </span>
          </Link>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
            Vyuha is an India-focused ML-based supply-chain risk prediction platform combining internal company operations with macro-environmental & logistics indicators.
          </p>
          <div className="text-[11px] font-mono text-slate-400 font-semibold">
            ENGINEERED FOR HIGH-RELIABILITY SUPPLY NETWORKS
          </div>
        </div>

        {/* Links Col 1 */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#product" className="hover:text-sky-600 transition-colors">Risk Engine</a></li>
            <li><a href="#example-prediction" className="hover:text-sky-600 transition-colors">Live Simulation</a></li>
            <li><a href="#how-it-works" className="hover:text-sky-600 transition-colors">Pipeline Architecture</a></li>
            <li><span className="text-slate-400 cursor-not-allowed">API Docs (Live at :8000/docs)</span></li>
          </ul>
        </div>

        {/* Links Col 2 */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900">Features</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#features" className="hover:text-sky-600 transition-colors">Predictive Analysis</a></li>
            <li><a href="#features" className="hover:text-sky-600 transition-colors">India Signals Integration</a></li>
            <li><a href="#features" className="hover:text-sky-600 transition-colors">Impact Forecasting</a></li>
            <li><a href="#features" className="hover:text-sky-600 transition-colors">Risk Scoring System</a></li>
          </ul>
        </div>

        {/* Links Col 3 */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900">Account & Access</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/login" className="hover:text-sky-600 transition-colors flex items-center gap-1">Login <ArrowUpRight className="w-3 h-3" /></Link></li>
            <li><Link to="/signup" className="hover:text-sky-600 transition-colors flex items-center gap-1">Get Started <ArrowUpRight className="w-3 h-3" /></Link></li>
            <li><Link to="/forgot-password" className="hover:text-sky-600 transition-colors">Reset Password</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
        <div>
          &copy; {new Date().getFullYear()} Vyuha Intelligence Systems. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Security</span>
        </div>
      </div>
    </footer>
  );
};
