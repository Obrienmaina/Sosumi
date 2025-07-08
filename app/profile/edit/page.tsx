// app/profile/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

// Define a type for your user profile data
interface UserProfileData {
  firstName: string;
  lastName: string;
  country: string;
  bio: string;
  profilePictureUrl: string;
  gender: string;
  homepageUrl: string;
  company: string;
  city: string;
  interests: string; // Assuming comma-separated string or JSON string for simplicity
  agreedToTerms: boolean; // Add this field for profile completion
  // Add other fields from your User model as needed
}

const EditProfilePage = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    country: '',
    bio: '',
    profilePictureUrl: '', // Will be fetched from backend or set by local preview
    gender: '',
    homepageUrl: '',
    company: '',
    city: '',
    interests: '',
    agreedToTerms: false, // Default
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null); // State to store the uploaded photo file
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [saving, setSaving] = useState(false); // For save operation
  const [error, setError] = useState<string | null>(null);

  // --- Fetch current user profile data on component mount ---
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // CORRECTED: API call path for fetching user data
        const response = await axios.get('/api/auth/user'); // Changed from /api/user to /api/auth/user
        if (response.data.user) {
          const user = response.data.user;
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            country: user.country || '',
            bio: user.bio || '',
            profilePictureUrl: user.profilePictureUrl || '/images/default-profile.png',
            gender: user.gender || '',
            homepageUrl: user.homepageUrl || '',
            company: user.company || '',
            city: user.city || '',
            interests: Array.isArray(user.interests) ? user.interests.join(', ') : (user.interests || ''), // Convert array to string
            agreedToTerms: user.agreedToTerms || false,
          });
        } else {
          toast.error("Failed to load profile data.");
          setError("Failed to load profile data.");
        }
      } catch (err: any) {
        console.error('Error fetching current user profile:', err);
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          toast.error("You are not authenticated. Please sign in.");
          router.push('/signin'); // Redirect to sign-in if not authenticated
        } else {
          toast.error(err.response?.data?.message || "An error occurred while loading profile.");
          setError(err.response?.data?.message || "An error occurred while loading profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserProfile();
  }, [router]); // Dependency on router for potential redirect

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file); // Store the file for upload
      const photoURL = URL.createObjectURL(file);
      setProfileData((prevData) => ({ ...prevData, profilePictureUrl: photoURL }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null); // Clear previous errors

    try {
      const formData = new FormData();
      // Append all profile data fields
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('country', profileData.country);
      formData.append('bio', profileData.bio);
      formData.append('gender', profileData.gender);
      formData.append('homepageUrl', profileData.homepageUrl);
      formData.append('company', profileData.company);
      formData.append('city', profileData.city);
      // For interests, convert back to a format your backend expects (e.g., JSON string or comma-separated)
      formData.append('interests', profileData.interests); // Assuming backend handles string or parses it

      // Convert boolean to string for FormData
      formData.append('agreedToTerms', String(profileData.agreedToTerms));

      if (photoFile) {
        formData.append('profilePicture', photoFile); // Append the photo file if selected
      }

      // Use the consolidated profile update API route
      const res = await fetch('/api/auth/user-profile-update', { // Corrected API path
        method: 'POST', // Or 'PUT' / 'PATCH' if you change backend method
        body: formData, // Send FormData to the backend
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      toast.success(data.message || 'Profile updated successfully!');
      router.push('/profile'); // Redirect back to profile page

    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'An error occurred while updating your profile.');
      setError(err.message || 'An error occurred while updating your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TailSpin height="80" width="80" color="#4fa94d" ariaLabel="loading" />
        <p className="ml-4 text-gray-700">Loading profile data...</p>
      </div>
    );
  }

  if (error && !loading) { // Only show error if not loading initially
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => router.reload()} // Reload page to try fetching again
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Profile Photo */}
          <div>
            <p className="text-lg font-semibold mb-2 text-gray-700">Profile Photo</p>
            <img
              src={profileData.profilePictureUrl} // This will show local preview or fetched URL
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-gray-300 shadow-sm"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block text-sm text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-purple-50 file:text-purple-700
                         hover:file:bg-purple-100"
            />
          </div>

          {/* First Name Input */}
          <div>
            <label htmlFor="firstName" className="block text-lg font-semibold mb-2 text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name Input */}
          <div>
            <label htmlFor="lastName" className="block text-lg font-semibold mb-2 text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profileData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="Enter your last name"
            />
          </div>

          {/* Country Input */}
          <div>
            <label htmlFor="country" className="block text-lg font-semibold mb-2 text-gray-700">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={profileData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="Enter your country"
            />
          </div>

          {/* Bio Input */}
          <div>
            <label htmlFor="bio" className="block text-lg font-semibold mb-2 text-gray-700">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y text-gray-800"
              rows={4}
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          {/* Gender Input (Consider a select dropdown for predefined options) */}
          <div>
            <label htmlFor="gender" className="block text-lg font-semibold mb-2 text-gray-700">Gender</label>
            <input
              type="text"
              id="gender"
              name="gender"
              value={profileData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="e.g., Male, Female, Rather not say"
            />
          </div>

          {/* Homepage URL Input */}
          <div>
            <label htmlFor="homepageUrl" className="block text-lg font-semibold mb-2 text-gray-700">Homepage URL</label>
            <input
              type="url"
              id="homepageUrl"
              name="homepageUrl"
              value={profileData.homepageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Company Input */}
          <div>
            <label htmlFor="company" className="block text-lg font-semibold mb-2 text-gray-700">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={profileData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="Your company name"
            />
          </div>

          {/* City Input */}
          <div>
            <label htmlFor="city" className="block text-lg font-semibold mb-2 text-gray-700">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={profileData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="Your city"
            />
          </div>

          {/* Interests Input (Consider a multi-select or tag input for better UX) */}
          <div>
            <label htmlFor="interests" className="block text-lg font-semibold mb-2 text-gray-700">Interests (comma-separated)</label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={profileData.interests}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="e.g., coding, hiking, cooking"
            />
          </div>

          {/* Agreed to Terms Checkbox (Crucial for profile completion) */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="agreedToTerms"
              name="agreedToTerms"
              checked={profileData.agreedToTerms}
              onChange={(e) => setProfileData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="agreedToTerms" className="ml-2 block text-base text-gray-900">
              I agree to the <Link href="/terms" className="text-indigo-600 hover:underline">terms and conditions</Link>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full px-6 py-3 bg-purple-500 text-white font-medium rounded-md hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center gap-2 ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
                <TailSpin height="20" width="20" color="#fff" ariaLabel="loading" />
            ) : (
                'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
