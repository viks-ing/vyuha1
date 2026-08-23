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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased relative">
      {/* Vyuha Logo Watermark Background (Subtle opacity for inner app pages) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] lg:w-[1050px] aspect-square pointer-events-none z-0 flex items-center justify-center opacity-10 sm:opacity-15 mix-blend-multiply select-none">
        <img 
          src="/vyuha-logo.jpg" 
          alt="Vyuha Logo Background" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 relative z-10">
        <TopNavbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-x-hidden">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 py-4 px-8 text-center text-xs text-slate-500 bg-white/90 backdrop-blur-sm">
          VYUHA Supply Chain Intelligence Platform &copy; 2026. Made for Indian Enterprises.
        </footer>
      </div>

      {/* Global Toast System */}
      <Toast />
    </div>
  );

};
