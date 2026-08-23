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
  const { company, updateUserProfile, resetOnboarding } = useCompany();

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
      const userFullName = result.user?.fullName;
      const userEmail = result.user?.email || email;

      updateUserProfile({
        name: userFullName || (userEmail ? userEmail.split('@')[0] : 'User'),
        email: userEmail,
      });

      setTimeout(() => {
        if (company.isOnboarded || company.info?.companyName) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }, 600);
    }
  };

  const [launchOnboardingOnSandbox, setLaunchOnboardingOnSandbox] = useState<boolean>(true);

  const handleDirectSandboxLogin = async (
    demoEmail = 'admin@vyuha.ai',
    demoPass = 'password123',
    forceOnboarding = false
  ) => {
    const result = await login({ email: demoEmail, password: demoPass });
    if (result) {
      const userFullName = result.user?.fullName;
      const userEmail = result.user?.email || demoEmail;

      updateUserProfile({
        name: userFullName || (userEmail ? userEmail.split('@')[0] : 'Sandbox User'),
        email: userEmail,
      });

      if (forceOnboarding || launchOnboardingOnSandbox) {
        resetOnboarding();
        setTimeout(() => {
          navigate('/onboarding');
        }, 300);
      } else {
        setTimeout(() => {
          if (company.isOnboarded || company.info?.companyName) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }, 400);
      }
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
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Sandbox Demo Accounts</span>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono font-semibold">
              INSTANT ACCESS
            </span>
          </div>

          <p className="text-[11px] text-slate-300">
            Select a sandbox account below. Toggle to input your own custom 3-step company business details or launch directly:
          </p>

          {/* Explicit Toggle for 3-Step Setup Form */}
          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/90 border border-cyan-800/60 cursor-pointer hover:border-cyan-500 transition-all">
            <input
              type="checkbox"
              checked={launchOnboardingOnSandbox}
              onChange={(e) => setLaunchOnboardingOnSandbox(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-100 block">Input Custom 3-Step Business Details Form</span>
              <span className="text-[10px] text-slate-400">
                {launchOnboardingOnSandbox
                  ? 'Opens 3-Step Onboarding Form to enter custom company profile, supply chain & budget metrics.'
                  : 'Skips onboarding and loads standard pre-configured demo baseline.'}
              </span>
            </div>
          </label>

          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">Default Admin Sandbox</span>
                  <p className="text-[11px] text-slate-400 font-mono">admin@vyuha.ai • password123</p>
                </div>
                <span className="text-[9px] bg-sky-950 text-sky-300 px-1.5 py-0.2 rounded font-mono">Recommended</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectSandboxLogin('admin@vyuha.ai', 'password123', true)}
                  disabled={isLoading}
                  className="flex-1 py-1.5 px-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  3-Step Form Setup <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectSandboxLogin('admin@vyuha.ai', 'password123', false)}
                  disabled={isLoading}
                  className="py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-all"
                >
                  Direct Dashboard
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">Enterprise Director Sandbox</span>
                  <p className="text-[11px] text-slate-400 font-mono">enterprise@vyuha.ai • vyuha1234</p>
                </div>
                <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded font-mono">Full Sandbox</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectSandboxLogin('enterprise@vyuha.ai', 'vyuha1234', true)}
                  disabled={isLoading}
                  className="flex-1 py-1.5 px-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  3-Step Form Setup <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectSandboxLogin('enterprise@vyuha.ai', 'vyuha1234', false)}
                  disabled={isLoading}
                  className="py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-all"
                >
                  Direct Dashboard
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">Logistics Lead Sandbox</span>
                  <p className="text-[11px] text-slate-400 font-mono">logistics@vyuha.ai • logistics123</p>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Fleet & Routes</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectSandboxLogin('logistics@vyuha.ai', 'logistics123', true)}
                  disabled={isLoading}
                  className="flex-1 py-1.5 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  3-Step Form Setup <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectSandboxLogin('logistics@vyuha.ai', 'logistics123', false)}
                  disabled={isLoading}
                  className="py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-all"
                >
                  Direct Dashboard
                </button>
              </div>
            </div>
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
