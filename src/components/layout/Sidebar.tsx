import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';
import {
  LayoutDashboard,
  Zap,
  FlaskConical,
  History,
  Settings,
  User,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { company, resetOnboarding } = useCompany();

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Analysis', path: '/new-analysis', icon: Zap },
    { label: 'Scenario Lab', path: '/scenario-lab', icon: FlaskConical },
    { label: 'History', path: '/history', icon: History },
  ];

  const secondaryNavItems = [
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 backdrop-blur-xl shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/25">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                VYUHA
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-sky-400/80">
                Supply Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Core Platform
            </p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200')} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Account & Config
            </p>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200')} />
                        <span className="flex-1">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Company Avatar Profile */}
        <div className="p-4 border-t border-slate-800/80 shrink-0 bg-slate-900/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-blue-400/30 shadow-sm">
                {company.info.companyName.charAt(0) || 'V'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {company.info.companyName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {company.info.location}
                </p>
              </div>
            </div>
            <button
              onClick={resetOnboarding}
              title="Reset Onboarding State"
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
