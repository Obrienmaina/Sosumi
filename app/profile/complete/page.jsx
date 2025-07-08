'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';

const ProfilePage = () => {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <p className="text-gray-700 mb-4">
        Manage your profile settings, update your bio, and access admin tools.
      </p>

      {/* Profile Actions */}
      <div className="flex gap-4">
        {/* Edit Profile Button */}
        <Link
          href="/profile/edit"
          className="ml-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LuPencil className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Edit Profile</span>
        </Link>

        {/* Admin Page Button */}
        <button
          onClick={() => router.push("/admin")}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Admin Page
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
