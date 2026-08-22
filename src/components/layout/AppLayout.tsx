import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Toast } from '../ui/Toast';
import { ArrowLeft } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <TopNavbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-x-hidden">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 bg-white hover:bg-sky-50/50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-sky-200 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Go Back</span>
          </button>
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 py-4 px-8 text-center text-xs text-slate-500 bg-white">
          VYUHA Supply Chain Intelligence Platform &copy; 2026. Made for Indian Enterprises.
        </footer>
      </div>

      {/* Global Toast System */}
      <Toast />
    </div>
  );
};
