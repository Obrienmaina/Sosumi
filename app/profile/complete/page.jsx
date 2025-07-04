'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const ProfileCompletionPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-3xl">
        <h1 className="text-4xl font-semibold mb-8 text-gray-800 text-center">User Profile</h1>

        {/* Existing Profile Information */}

        {/* Add Blog and Edit Drafts Buttons */}
        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={() => router.push('/admin/addBlog')}
            className="px-6 py-3 bg-[#5936BB] text-white font-medium rounded-full hover:bg-[#4a2bb2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5936BB] text-lg transition-colors"
          >
            Add Blog
          </button>
          <button
            onClick={() => router.push('/admin/editDrafts')}
            className="px-6 py-3 bg-[#FF5733] text-white font-medium rounded-full hover:bg-[#E94E2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5733] text-lg transition-colors"
          >
            Edit Drafts
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
