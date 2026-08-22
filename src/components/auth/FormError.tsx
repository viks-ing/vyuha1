import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormMessageProps {
  error?: string | null;
  success?: string | null;
}

export const FormMessage: React.FC<FormMessageProps> = ({ error, success }) => {
  if (!error && !success) return null;

  if (error) {
    return (
      <div className="flex items-start gap-2.5 p-3.5 bg-red-950/60 border border-red-800/60 rounded-lg text-red-300 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div>{error}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-start gap-2.5 p-3.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>{success}</div>
      </div>
    );
  }

  return null;
};
