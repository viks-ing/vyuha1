import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/auth/FormError';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../context/CompanyContext';
import { User, Mail, UserPlus } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, successMessage, signup } = useAuth();
  const { resetOnboarding, updateUserProfile } = useCompany();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await signup({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (result) {
      updateUserProfile({
        name: fullName,
        email: email,
      });
      resetOnboarding();
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    }
  };

  return (
    <AuthLayout
      title="Create your Vyuha Account"
      subtitle="Join India's leading ML supply chain risk prediction network"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormMessage error={error} success={successMessage} />

        <Input
          label="Full Name"
          type="text"
          placeholder="Rajesh Kumar"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          error={fieldErrors.fullName}
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
          autoComplete="name"
          required
        />

        <Input
          label="Work Email"
          type="email"
          placeholder="rajesh@company.co.in"
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

        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={fieldErrors.password}
          helperText="Must contain at least 8 characters."
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-3 font-semibold"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>

        <div className="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
