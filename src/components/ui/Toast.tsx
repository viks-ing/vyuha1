import React from 'react';
import { useCompany } from '../../context/CompanyContext';
import { CheckCircle2, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useCompany();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 bg-slate-900/95 border border-sky-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md">
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
        <span className="text-sm font-medium pr-2">{toastMessage}</span>
      </div>
    </div>
  );
};
