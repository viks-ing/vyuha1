import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/auth/FormError';
import { useAuth } from '../hooks/useAuth';
import { Mail, Send, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { isLoading, error, successMessage, forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  const validateForm = () => {
    if (!email.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await forgotPassword({ email });
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your registered work email and we'll send instructions to reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormMessage error={error} success={successMessage} />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(undefined);
          }}
          error={emailError}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          autoComplete="email"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 font-semibold"
          isLoading={isLoading}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Send Reset Link
        </Button>

        <div className="text-center pt-4 border-t border-slate-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
