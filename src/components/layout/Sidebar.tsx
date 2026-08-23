import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';
import { useAuthContext } from '../../context/AuthContext';
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
  Navigation,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { logout } = useAuthContext();

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Route Intelligence', path: '/route-intelligence', icon: Navigation },
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 backdrop-blur-xl shadow-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header with Official VYUHA Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/vyuha-logo.png"
              alt="VYUHA Supply Intelligence Logo"
              className="h-10 w-auto object-contain hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-lg font-extrabold tracking-wider text-slate-900 leading-none block">
                VYUHA
              </span>
              <span className="block text-[9px] uppercase font-bold tracking-widest text-[#0066FF] mt-0.5">
                Supply Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Core Platform
            </p>
            <nav className="space-y-1.5">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold transition-all group relative border',
                        isActive
                          ? 'bg-[#0066FF]/6 text-black border-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,0.35),0_0_18px_rgba(0,102,255,0.18)]'
                          : 'bg-white/60 text-black border-[#0066FF]/25 hover:border-[#0066FF] hover:bg-[#0066FF]/5 hover:shadow-[0_0_8px_rgba(0,102,255,0.35),0_0_18px_rgba(0,102,255,0.18)] hover:-translate-y-0.5'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-[#0066FF]' : 'text-black group-hover:text-[#0066FF]')} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-600" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
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
                          ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600')} />
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
        <div className="p-4 border-t border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                {company.info.companyName.charAt(0) || 'V'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {company.info.companyName || 'My Enterprise'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {company.info.location || 'India'}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
