'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const EditProfilePage = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    bio: '',
    profilePictureUrl: '',
    gender: '',
    homepageUrl: '',
    company: '',
    city: '',
    interests: '',
  });
  const [photoFile, setPhotoFile] = useState(null); // State to store the uploaded photo file

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file); // Store the file for upload
      const photoURL = URL.createObjectURL(file);
      setProfileData((prevData) => ({ ...prevData, profilePictureUrl: photoURL }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('country', profileData.country);
      formData.append('bio', profileData.bio);
      formData.append('gender', profileData.gender);
      formData.append('homepageUrl', profileData.homepageUrl);
      formData.append('company', profileData.company);
      formData.append('city', profileData.city);
      formData.append('interests', profileData.interests);

      if (photoFile) {
        formData.append('profilePicture', photoFile); // Append the photo file
      }

      const res = await fetch('/api/user-profile-update', {
        method: 'POST',
        body: formData, // Send FormData to the backend
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      alert('Profile updated successfully!');
      router.push('/profile'); // Redirect back to profile page
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('An error occurred while updating your profile.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <div className="flex flex-col gap-4">
        {/* Profile Photo */}
        <div>
          <p className="text-lg font-semibold mb-2">Profile Photo</p>
          <img
            src={profileData.profilePictureUrl || '/images/default-profile.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block"
          />
        </div>

        {/* First Name Input */}
        <div>
          <p className="text-lg font-semibold mb-2">First Name</p>
          <input
            type="text"
            name="firstName"
            value={profileData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Last Name Input */}
        <div>
          <p className="text-lg font-semibold mb-2">Last Name</p>
          <input
            type="text"
            name="lastName"
            value={profileData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Country Input */}
        <div>
          <p className="text-lg font-semibold mb-2">Country</p>
          <input
            type="text"
            name="country"
            value={profileData.country}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Bio Input */}
        <div>
          <p className="text-lg font-semibold mb-2">Bio</p>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            rows="4"
          ></textarea>
        </div>

        {/* Gender Input */}
        <div>
          <p className="text-lg font-semibold mb-2">Gender</p>
          <input
            type="text"
            name="gender"
            value={profileData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Homepage URL Input */}
        <div>
          <p className="text-lg font-semibold mb-2">Homepage URL</p>
          <input
            type="url"
            name="homepageUrl"
            value={profileData.homepageUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Company Input */}
        <div>
          <p className="text-lg font-semibold mb-2">Company</p>
          <input
            type="text"
            name="company"
            value={profileData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* City Input */}
        <div>
          <p className="text-lg font-semibold mb-2">City</p>
          <input
            type="text"
            name="city"
            value={profileData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Interests Input */}
        <div>
          <p className="text-lg font-semibold mb-2">Interests</p>
          <input
            type="text"
            name="interests"
            value={profileData.interests}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfilePage;