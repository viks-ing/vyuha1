import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/auth/FormError';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../context/CompanyContext';
import { Mail, LogIn, Zap, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, successMessage, login } = useAuth();
  const { company, updateUserProfile } = useCompany();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await login({ email, password });
    if (result) {
      const userFullName = result.user?.fullName || result.session?.user?.user_metadata?.full_name;
      const userEmail = result.user?.email || result.session?.user?.email || email;

      updateUserProfile({
        name: userFullName || (userEmail ? userEmail.split('@')[0] : 'User'),
        email: userEmail,
      });

      setTimeout(() => {
<<<<<<< HEAD
        if (company.isOnboarded || company.info?.companyName) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }, 600);
=======
        navigate('/onboarding');
      }, 600);
    }
  };

  const handleDirectSandboxLogin = async (demoEmail = 'enterprise@vyuha.ai', demoPass = 'vyuha1234') => {
    const result = await login({ email: demoEmail, password: demoPass });
    if (result) {
      resetOnboarding();
      setTimeout(() => {
        navigate('/onboarding');
      }, 400);
>>>>>>> 8af9088 (feat: Connect Vyuha to live CatBoost ML models, real-time weather APIs, and PostgreSQL/SQLite database persistence)
    }
  };

  return (
    <AuthLayout
      title="Welcome back to Vyuha"
      subtitle="Enter your credentials to access supply chain risk models"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormMessage error={error} success={successMessage} />

        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={fieldErrors.email}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          autoComplete="email"
          required
        />

        <div className="space-y-1">
          <PasswordInput
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={fieldErrors.password}
            autoComplete="current-password"
            required
          />
          
          <div className="flex justify-end pt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 font-semibold"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Login
        </Button>

        {/* Direct Sandbox Login Account Selector Tabs */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Direct Sandbox Login Accounts</span>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono font-semibold">
              INSTANT ACCESS
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Select an account below to log in directly and be routed to input your custom company details:
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDirectSandboxLogin('enterprise@vyuha.ai', 'vyuha1234')}
              disabled={isLoading}
              className="w-full p-2.5 rounded-lg bg-slate-950/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-600/70 transition-all text-left group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Enterprise Director Account</span>
                  <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded font-mono">Full Sandbox</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">enterprise@vyuha.ai • vyuha1234</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => handleDirectSandboxLogin('logistics@vyuha.ai', 'logistics123')}
              disabled={isLoading}
              className="w-full p-2.5 rounded-lg bg-slate-950/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-600/70 transition-all text-left group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Logistics Lead Account</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Fleet & Routes</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">logistics@vyuha.ai • logistics123</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
