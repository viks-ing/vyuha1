import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/auth/FormError';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../context/CompanyContext';
import { Mail, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, successMessage, login } = useAuth();
  const { resetOnboarding } = useCompany();

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
      resetOnboarding();
      setTimeout(() => {
        navigate('/onboarding');
      }, 1200);
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
