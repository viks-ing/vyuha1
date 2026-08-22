import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';
import {
  Bell,
  Menu,
  User,
  Settings,
  ChevronDown,
  ShieldAlert,
  Search,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TopNavbarProps {
  onToggleMobileSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { company, alerts, userProfile } = useCompany();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return { title: 'Executive Risk Dashboard', category: 'Overview' };
      case '/new-analysis':
        return { title: 'New Risk Analysis Engine', category: 'Analytics' };
      case '/scenario-lab':
        return { title: 'Scenario Simulation Lab', category: 'Simulations' };
      case '/history':
        return { title: 'Analysis Audit Trail', category: 'Logs & Reports' };
      case '/profile':
        return { title: 'Company & Supply Profile', category: 'Organization' };
      case '/settings':
        return { title: 'System Preferences & Alerts', category: 'Configuration' };
      default:
        return { title: 'Supply Intelligence Platform', category: 'VYUHA' };
    }
  };

  const page = getPageTitle(location.pathname);
  const criticalCount = alerts.filter((a) => a.severity === 'Critical' || a.severity === 'High').length;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden border border-slate-200"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {location.pathname !== '/dashboard' && (
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 bg-slate-50 hover:bg-sky-50/50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-sky-200 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer mr-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>VYUHA</span>
            <span>/</span>
            <span className="text-sky-600 font-semibold">{page.category}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 leading-none mt-0.5">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-3">
        {/* Search Bar - Hidden on smallest screens */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search risks, routes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          />
        </div>

        {/* Live Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Monitoring
        </div>

        {/* Notifications Alert Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Active Risk Alerts"
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {criticalCount}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-bold text-slate-900">Active Supply Chain Alerts</span>
                </div>
                <Badge variant="Critical">{alerts.length} Active</Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {alerts.slice(0, 3).map((alt) => (
                  <div key={alt.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{alt.title}</span>
                      <Badge variant={alt.severity}>{alt.severity}</Badge>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{alt.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-400">Updated 5 mins ago</span>
                <Link to="/dashboard" onClick={() => setShowAlertsDropdown(false)} className="text-sky-600 font-semibold hover:underline">
                  View All Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User / Company Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {userProfile.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-xs">
              <p className="font-bold text-slate-800 leading-tight">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{company.info.companyName || 'Enterprise'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{userProfile.name}</p>
                <p className="text-[11px] text-slate-500">{userProfile.email}</p>
                <p className="text-[10px] text-sky-600 font-medium mt-0.5">{company.info.companyName || 'Enterprise'}</p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-left"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" /> Company Profile
                </button>

                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings & Alerts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
