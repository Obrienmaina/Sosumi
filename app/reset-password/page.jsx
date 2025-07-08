// app/reset-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify'; // Import toast

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null); // State to store the token
  const [initialError, setInitialError] = useState<string | null>(null); // For errors during token retrieval

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setInitialError('Password reset token is missing from the URL. Please request a new link.');
      toast.error('Password reset token is missing from the URL. Please request a new link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!token) {
      toast.error('No reset token found. Please request a new password reset link.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      toast.success(data.message || 'Your password has been reset successfully!');
      setPassword('');
      setConfirmPassword('');
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/signin');
      }, 3000); // Redirect after 3 seconds
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      toast.error(err.message || 'An unexpected error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-semibold mb-8 text-gray-800 text-center">Reset Password</h1>

        {/* Removed direct message/error divs, toast will handle notifications */}
        {initialError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{initialError}</span>
          </div>
        )}

        {!token && !initialError ? ( // Show loading or message while token is being read
          <p className="text-center text-gray-600">Loading reset token...</p>
        ) : token ? ( // Only show form if token is present
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#5936BB] text-white font-medium rounded-full hover:bg-[#4a2bb2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5936BB] text-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : null}

        <p className="mt-6 text-center text-gray-700 text-base">
          <Link href="/signin" className="text-indigo-600 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
