'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu'; // Assuming you have lucide-react for icons

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false); // New state for inline bio editing
  const [editedBio, setEditedBio] = useState(''); // New state for edited bio content
  const [bioUpdateLoading, setBioUpdateLoading] = useState(false); // Loading state for bio update
  const [bioUpdateError, setBioUpdateError] = useState(''); // Error state for bio update

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/user');

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push('/signin');
            return;
          }
          throw new Error('Failed to fetch user profile.');
        }

        const data = await res.json();
        setUser(data.user);
        setEditedBio(data.user.bio || ''); // Initialize editedBio with current user bio

        // Uncomment this line if you want to enforce profile completion redirect
        // if (!data.user.firstName || !data.user.lastName || !data.user.country || !data.user.agreedToTerms) {
        //     console.log('Profile incomplete, redirecting to completion page.');
        //     router.push('/profile/complete');
        //     return;
        // }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/signin');
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

  const handleBioUpdate = async () => {
    setBioUpdateLoading(true);
    setBioUpdateError('');
    try {
      const res = await fetch('/api/user-bio-update', { // New API route for bio update
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editedBio }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update bio.');
      }

      // Update the user state with the new bio
      setUser(prevUser => ({ ...prevUser, bio: editedBio }));
      setIsEditingBio(false); // Exit editing mode
      console.log('Bio updated successfully!');
    } catch (err) {
      console.error('Bio update error:', err);
      setBioUpdateError(err.message || 'An error occurred while updating bio.');
    } finally {
      setBioUpdateLoading(false);
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

              {/* Bio Editing Section */}
              <div className="mt-4 p-4 bg-gray-100 rounded-md text-gray-700 leading-relaxed max-w-full">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-lg">Bio</h4>
                    {!isEditingBio && (
                        <button
                            onClick={() => setIsEditingBio(true)}
                            className="text-indigo-600 hover:underline text-sm flex items-center"
                        >
                            <LuPencil className="w-4 h-4 mr-1" /> Edit
                        </button>
                    )}
                </div>
                {bioUpdateError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative text-sm mb-2" role="alert">
                        {bioUpdateError}
                    </div>
                )}
                {isEditingBio ? (
                  <div>
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                      rows="4"
                      placeholder="Tell us about yourself..."
                      disabled={bioUpdateLoading}
                    ></textarea>
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        onClick={handleBioUpdate}
                        className="px-4 py-2 bg-[#5936BB] text-white font-medium rounded-md hover:bg-[#4a2bb2] text-sm transition-colors"
                        disabled={bioUpdateLoading}
                      >
                        {bioUpdateLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingBio(false);
                          setEditedBio(user.bio || ''); // Revert to original bio on cancel
                          setBioUpdateError(''); // Clear error on cancel
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 text-sm transition-colors"
                        disabled={bioUpdateLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">
                    {user.bio || <span className="italic text-gray-500">No bio available.</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <p className="text-gray-700 text-lg md:col-span-2">
            <strong>On Sosumi since:</strong> {formatDate(user.registeredAt)}
          </p>
          <p className="text-gray-700 text-lg">
            <strong>First Name:</strong> {user.firstName || <span className="italic text-gray-500">Not set</span>}
          </p>
          <p className="text-gray-700 text-lg">
            <strong>Last Name:</strong> {user.lastName || <span className="italic text-gray-500">Not set</span>}
          </p>
          <p className="text-gray-700 text-lg">
            <strong>Country:</strong> {user.country || <span className="italic text-gray-500">Not set</span>}
          </p>
          <p className="text-gray-700 text-lg">
            <strong>Gender:</strong> {user.gender || <span className="italic text-gray-500">Not set</span>}
          </p>
          <p className="text-gray-700 text-lg">
            <strong>Company:</strong> {user.company || <span className="italic text-gray-500">Not set</span>}
          </p>
          <p className="text-gray-700 text-lg">
            <strong>City:</strong> {user.city || <span className="italic text-gray-500">Not set</span>}
          </p>
          {user.homepageUrl && (
            <p className="text-gray-700 text-lg md:col-span-2">
              <strong>Homepage:</strong> <a href={user.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{user.homepageUrl}</a>
            </p>
          )}
          {user.interests && (
            <p className="text-gray-700 text-lg md:col-span-2">
              <strong>Interests:</strong> {user.interests}
            </p>
          )}
          <p className="text-gray-700 text-lg md:col-span-2">
            <strong>Agreed to Terms:</strong> {user.agreedToTerms ? 'Yes' : 'No'}
          </p>
          <p className="text-gray-700 text-lg md:col-span-2">
            <strong>Profile views:</strong> {user.profileViews || 0}
          </p>
        </div>

        {/* Recent Blogs Section - Placeholder */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Blogs</h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => ( // Reduced to 3 placeholders for compactness
              <div key={index} className="bg-gray-100 p-4 rounded-md animate-pulse h-16">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Platforms - Placeholder */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          Social media platforms (placeholder)
        </div>

        {/* Logout Button */}
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
