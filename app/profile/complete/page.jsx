'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuUpload, LuLink } from 'react-icons/lu'; // Assuming lucide-react for icons

const ProfileCompletionPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [showUrlInput, setShowUrlInput] = useState(false); // State to toggle URL input
  const [gender, setGender] = useState(''); // New state for Gender
  const [homepageUrl, setHomepageUrl] = useState(''); // New state for Homepage URL
  const [company, setCompany] = useState(''); // New state for Company
  const [city, setCity] = useState(''); // New state for City
  const [interests, setInterests] = useState(''); // New state for Interests

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();

  // --- Fetch current user data on load ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/user');

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/signin');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        const data = await res.json();
        const user = data.user;

        // Pre-fill fields if data exists
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setCountry(user.country || '');
        setAgreedToTerms(user.agreedToTerms || false);
        setBio(user.bio || '');
        setProfilePictureUrl(user.profilePictureUrl || '');
        setGender(user.gender || ''); // Pre-fill gender
        setHomepageUrl(user.homepageUrl || ''); // Pre-fill homepageUrl
        setCompany(user.company || ''); // Pre-fill company
        setCity(user.city || ''); // Pre-fill city
        setInterests(user.interests || ''); // Pre-fill interests

      } catch (err) {
        console.error('Error fetching user data for profile completion:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // --- Handle file selection ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // --- Handle form submission for profile completion ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!agreedToTerms) {
      setError('You must agree to the Terms and Privacy Policy.');
      setLoading(false);
      return;
    }

    let finalProfilePictureUrl = profilePictureUrl;

    // If a file is selected, upload it first
    if (selectedFile) {
      const formData = new FormData();
      formData.append('profileImage', selectedFile);

      try {
        const uploadRes = await fetch('/api/upload-profile-image', { // New upload API route
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErrorData = await uploadRes.json();
          throw new Error(uploadErrorData.message || 'Failed to upload image.');
        }

        const uploadData = await uploadRes.json();
        finalProfilePictureUrl = uploadData.imageUrl; // Get the URL from the upload response
        setMessage('Image uploaded successfully! Saving profile...');
      } catch (uploadErr) {
        console.error('Image upload error:', uploadErr);
        setError(uploadErr.message || 'An error occurred during image upload.');
        setLoading(false);
        return; // Stop submission if image upload fails
      }
    }

    try {
      // Send all profile data to the update endpoint
      const res = await fetch('/api/user-profile-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          country,
          agreedToTerms,
          bio,
          profilePictureUrl: finalProfilePictureUrl, // Use the uploaded URL or direct URL
          gender, // Include new fields
          homepageUrl,
          company,
          city,
          interests,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      setMessage('Profile updated successfully!');
      console.log('Profile updated successfully!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An unexpected error occurred during profile update.');
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-3xl"> {/* Increased max-width */}
        <h1 className="text-4xl font-semibold mb-8 text-gray-800 text-center">Edit User Profile</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            {/* Checkboxes (Placeholders for now) */}
            <div>
              <label className="flex items-center text-gray-700 text-base">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" />
                Show my profile page
              </label>
            </div>
            <div>
              <label className="flex items-center text-gray-700 text-base">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" />
                Show my email address
              </label>
            </div>
            <div>
              <label className="flex items-center text-gray-700 text-base">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" />
                Show my blogs
              </label>
            </div>
            <div>
              <label className="flex items-center text-gray-700 text-base">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2" />
                Show sites I follow
              </label>
            </div>

            {/* Profile Photo Section */}
            <div className="pt-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="profileImageUpload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('profileImageUpload').click();
                    setShowUrlInput(false); // Hide URL input if upload is chosen
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-base font-medium"
                >
                  <LuUpload className="w-5 h-5" /> Upload
                </button>
                <span className="text-gray-500">-or-</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(!showUrlInput); // Toggle URL input visibility
                    setSelectedFile(null); // Clear selected file if URL input is chosen
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-base font-medium"
                >
                  <LuLink className="w-5 h-5" /> Enter Image URL
                </button>
              </div>

              {showUrlInput && (
                <div className="mt-4">
                  <input
                    type="url"
                    id="profilePictureUrl"
                    name="profilePictureUrl"
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="https://example.com/your-image.jpg"
                  />
                </div>
              )}

              {(profilePictureUrl || selectedFile) && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : profilePictureUrl}
                    alt="Profile Preview"
                    className="rounded-full w-32 h-32 object-cover border border-gray-300"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/128x128/cccccc/333333?text=Invalid+URL';
                      e.target.style.filter = 'grayscale(100%)';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Interests */}
            <div className="pt-4">
              <label htmlFor="interests" className="block text-lg font-medium text-gray-700 mb-2">
                Interests
              </label>
              <textarea
                id="interests"
                name="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                rows="4"
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="e.g., Technology, Travel, Cooking"
              ></textarea>
              <button
                type="button"
                className="mt-4 px-6 py-2 bg-[#5936BB] text-white font-medium rounded-full hover:bg-[#4a2bb2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5936BB] text-base transition-colors"
              >
                Update Interests
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-1 space-y-6">
            {/* Gender */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={gender === 'Male'}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700 text-base">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={gender === 'Female'}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700 text-base">Female</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Rather not say"
                    checked={gender === 'Rather not say'}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700 text-base">Rather not say</span>
                </label>
              </div>
            </div>

            {/* Homepage URL */}
            <div>
              <label htmlFor="homepageUrl" className="block text-lg font-medium text-gray-700 mb-2">
                Homepage URL
              </label>
              <input
                type="url"
                id="homepageUrl"
                name="homepageUrl"
                value={homepageUrl}
                onChange={(e) => setHomepageUrl(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="https://your-website.com"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-lg font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Your company name"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-lg font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Your city"
              />
            </div>

            {/* Country (from previous version, keeping it for consistency) */}
            <div>
              <label htmlFor="country" className="block text-lg font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="e.g., USA, Germany"
                required
              />
            </div>

            {/* Terms and Privacy Policy Checkbox (moved to right column for layout) */}
            <div className="flex items-center pt-4">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-gray-700 text-base">
                I agree to{" "}
                <Link href="/terms" className="text-indigo-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          {/* Form Action Buttons (Full Width) */}
          <div className="md:col-span-2 flex justify-center gap-4 mt-8">
            <button
              type="submit"
              className="px-6 py-3 bg-[#5936BB] text-white font-medium rounded-full hover:bg-[#4a2bb2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5936BB] text-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Save Profile'}
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-lg transition-colors"
              // onClick={handleDeleteProfile} // Implement delete profile logic if needed
            >
              Delete Profile
            </button>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-gray-300 text-gray-800 font-medium rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 text-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
