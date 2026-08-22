import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/auth/FormError';
import { useAuth } from '../hooks/useAuth';
import { KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo_token';

  const { isLoading, error, successMessage, resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Token state check (mock token validation)
  const isTokenInvalid = token === 'invalid';

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await resetPassword({
      newPassword,
      confirmPassword,
      token,
    });

    if (result) {
      // Redirect to /login after successful password update
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  if (isTokenInvalid) {
    return (
      <AuthLayout
        title="Invalid or Expired Link"
        subtitle="This password reset link is invalid or has expired."
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200 mb-1">Reset Link Expired</p>
              Security tokens expire after 1 hour. Please request a new password reset link.
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/forgot-password')}
          >
            Request New Link
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-slate-400 hover:text-cyan-400">
              Back to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below to reset your Vyuha account access"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormMessage error={error} success={successMessage} />

        <PasswordInput
          label="New Password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
          }}
          error={fieldErrors.newPassword}
          helperText="Must contain at least 8 characters."
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Re-enter new password"
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
          className="w-full mt-2 font-semibold"
          isLoading={isLoading}
          leftIcon={<KeyRound className="w-4 h-4" />}
        >
          Reset Password
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
