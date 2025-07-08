// app/profile/complete/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import axios from 'axios'; // For fetching user data
import { toast } from 'react-toastify'; // For notifications
import { TailSpin } from 'react-loader-spinner'; // For loading indicator

const ProfileCompletePage = () => { // Renamed for clarity
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // State to store user data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user data from your API (e.g., /api/user)
        const response = await axios.get('/api/user'); // Corrected path
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          toast.error("Failed to fetch user profile.");
          setError("Failed to fetch user profile.");
        }
      } catch (err: any) { // This is valid TypeScript syntax
        console.error("Error fetching user profile:", err);
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          toast.error("You are not authenticated. Please sign in.");
          router.push('/signin'); // Redirect to sign-in if not authenticated
        } else {
          toast.error(err.response?.data?.message || "An error occurred while fetching profile.");
          setError(err.response?.data?.message || "An error occurred while fetching profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TailSpin height="80" width="80" color="#4fa94d" ariaLabel="loading" />
        <p className="ml-4 text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link href="/signin" className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <p className="text-gray-700 mb-4">
        Manage your profile settings, update your bio, and access admin tools.
      </p>

      {/* Display user's basic info if available */}
      {user && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-lg font-semibold">Welcome, {user.firstName || user.email}!</p>
          {user.email && <p className="text-gray-600">Email: {user.email}</p>}
          {user.role && <p className="text-gray-600">Role: {user.role}</p>}
          {/* Add more profile details here if desired */}
        </div>
      )}

      {/* Profile Actions */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Edit Profile Button */}
        <Link
          href="/profile/edit"
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
        >
          <LuPencil className="w-5 h-5 mr-1" />
          <span>Edit Profile</span>
        </Link>

        {/* Admin Page Button (conditionally rendered) */}
        {user && user.role === 'admin' && ( // Assuming 'admin' is the role for administrators
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Admin Page
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletePage;
