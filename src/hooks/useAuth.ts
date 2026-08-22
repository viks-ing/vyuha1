import { useState } from 'react';
import { authService } from '../services/auth';
import type { 
  LoginCredentials, 
  SignupCredentials, 
  ForgotPasswordParams, 
  ResetPasswordParams 
} from '../services/auth';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await authService.login(credentials);
      if (!response.success) {
        setError(response.error || "Login failed. Please check your credentials.");
        return false;
      }
      setSuccessMessage(response.message || "Login successful.");
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during login.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await authService.signup(credentials);
      if (!response.success) {
        setError(response.error || "Signup failed.");
        return false;
      }
      setSuccessMessage(response.message || "Account created successfully.");
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (params: ForgotPasswordParams) => {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await authService.forgotPassword(params);
      if (!response.success) {
        setError(response.error || "Failed to process request.");
        return false;
      }
      setSuccessMessage(response.message || "Reset link sent.");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (params: ResetPasswordParams) => {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await authService.resetPassword(params);
      if (!response.success) {
        setError(response.error || "Password reset failed.");
        return false;
      }
      setSuccessMessage(response.message || "Password reset successful.");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    successMessage,
    clearMessages,
    login,
    signup,
    forgotPassword,
    resetPassword,
  };
}
