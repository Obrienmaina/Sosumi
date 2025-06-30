'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu'; // Assuming you have lucide-react for icons

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // This API route will read the httpOnly token and return user data
        const res = await fetch('/api/user'); // You need to create this API route

        if (!res.ok) {
          // If not authenticated, redirect to sign-in page
          if (res.status === 401 || res.status === 403) {
            router.push('/signin');
            return;
          }
          throw new Error('Failed to fetch user profile.');
        }

        const data = await res.json();
        setUser(data.user);

        // Optional: If you decide that /profile should only be for fully complete profiles,
        // and some data is missing, you could redirect to /profile/complete from here too.
        // However, the callback already handles the initial redirect. This is a double check.
        if (!data.user.firstName || !data.user.lastName || !data.user.country || !data.user.agreedToTerms) {
            console.log('Profile incomplete, redirecting to completion page.');
            // router.push('/profile/complete'); // Temporarily commented out to show profile even if incomplete for styling purposes
            // return;
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile. Please try logging in again.');
        // Consider redirecting to an error page or sign-in on critical error
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/logout', { method: 'POST' }); // You'll need to create this logout route
      if (res.ok) {
        router.push('/signin'); // Redirect to login page after logout
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Logout failed.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Error during logout.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link href="/signin" className="text-indigo-600 hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-700">User not loaded. Redirecting...</p>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-10 lg:p-12">
        {/* Profile Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center flex-grow">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = 'https://placehold.co/160x160/cccccc/333333?text=Profile+Photo')}
                />
              ) : (
                <span className="text-gray-500 text-center text-sm md:text-base">Profile Photo</span>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-3xl font-bold text-gray-800 break-words max-w-[calc(100%-60px)]">
                  {user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email)}
                </h2>
                <Link href="/profile/complete" className="ml-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <LuPencil className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Edit</span>
                </Link>
              </div>
              <p className="text-gray-700 text-lg mt-2">
                <strong>Email:</strong> {user.email}
              </p>
              {user.bio ? (
                <p className="mt-4 p-4 bg-gray-100 rounded-md text-gray-700 leading-relaxed max-w-full">
                  {user.bio}
                </p>
              ) : (
                <div className="mt-4 p-4 bg-gray-100 rounded-md h-24 w-full flex items-center justify-center text-gray-500 italic">
                  No bio available. <Link href="/profile/complete" className="ml-1 text-indigo-600 hover:underline">Add one?</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Stats Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-700 text-lg">
            <strong>On Sosumi since:</strong> {formatDate(user.registeredAt)}
          </p>
          <p className="text-gray-700 text-lg mt-2">
            <strong>Profile views:</strong> {user.profileViews || 0} {/* Assuming profileViews might be a field */}
          </p>
          {user.country && (
            <p className="text-gray-700 text-lg mt-2">
              <strong>Country:</strong> {user.country}
            </p>
          )}
          {user.agreedToTerms !== undefined && (
            <p className="text-gray-700 text-lg mt-2">
              <strong>Agreed to Terms:</strong> {user.agreedToTerms ? 'Yes' : 'No'}
            </p>
          )}
        </div>

        {/* Recent Blogs Section - Placeholder */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Blogs</h3>
          <div className="space-y-4">
            {/* Placeholder for blog entries */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-md animate-pulse h-16">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
            {/* In a real app, you would fetch and map over user.recentBlogs */}
          </div>
        </div>

        {/* Social Media Platforms - Placeholder */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          Social media platforms (placeholder)
        </div>

        {/* Logout Button (Moved to bottom or a separate settings area) */}
        <div className="mt-8 text-center">
            <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-lg transition-colors"
                disabled={loading}
            >
                {loading ? 'Logging Out...' : 'Logout'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
