import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PasswordResetForm = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/send-otp', { email, purpose: 'password_reset' });
      setStep(2);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (err.response?.status === 429) {
        setError('Too many OTP requests. Please try again later.');
      } else if (err.response?.status === 404 || code === 'USER_NOT_FOUND') {
        setError('No account found with this email address. Please contact administration.');
      } else if (code === 'NOT_ACTIVATED') {
        setError("Account not yet activated. Please use 'Sign Up / Activate Account' first.");
      } else {
        setError(err.response?.data?.error?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp-set-password', { email, otp, password, purpose: 'password_reset' });
      setSuccess(true);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'OTP_EXPIRED_OR_INVALID' || code === 'OTP_INVALID') {
        setError('Invalid or expired OTP. Please check the code and try again.');
      } else {
        setError(err.response?.data?.error?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      await api.post('/auth/send-otp', { email, purpose: 'password_reset' });
      setResendMessage('OTP resent successfully.');
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many OTP requests. Please try again later.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to resend OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Password reset successfully! You can now log in.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Go to Login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1
              ? 'Enter your institute email address to receive an OTP.'
              : `OTP sent to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Institute Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@rgipt.ac.in"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {resendMessage && (
              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">{resendMessage}</p>
              </div>
            )}

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep(1); setError(null); setResendMessage(null); }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:text-blue-300"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="flex items-center justify-between text-sm">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              ← Back to Login
            </Link>
            <Link to="/activate-account" className="font-medium text-blue-600 hover:text-blue-500">
              Need to activate account? Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const ErrorAlert = ({ message }) => (
  <div className="rounded-md bg-red-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
    </div>
  </div>
);

export default PasswordResetForm;
