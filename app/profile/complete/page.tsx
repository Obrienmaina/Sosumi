// app/profile/complete/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import axios from 'axios'; // For fetching user data
import { toast } from 'react-toastify'; // For notifications
import { TailSpin } from 'react-loader-spinner'; // For loading indicator
import BlogItem from '@/components/BlogItem'; // Assuming you have a BlogItem component

interface BlogPostType {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  date: string;
  category: string;
  author: string;
  authorImg: string;
  likesCount: number;
  commentsCount: number;
  views: number;
}

const ProfileCompletePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // State to store user data
  const [userBlogs, setUserBlogs] = useState<BlogPostType[]>([]); // State for user's blogs
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfileAndBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user data
        const userResponse = await axios.get('/api/user');
        if (userResponse.data.user) {
          setUser(userResponse.data.user);
        } else {
          toast.error("Failed to fetch user profile.");
          setError("Failed to fetch user profile.");
          setLoading(false);
          return;
        }

        // Fetch user's blogs
        setBlogsLoading(true);
        try {
          const blogsResponse = await axios.get('/api/user/blogs'); // New API route
          if (blogsResponse.data.success) {
            setUserBlogs(blogsResponse.data.blogs);
          } else {
            console.warn("Could not fetch user blogs:", blogsResponse.data.msg);
            setUserBlogs([]); // Ensure it's an empty array on failure
          }
        } catch (blogsErr: any) {
          console.error("Error fetching user blogs:", blogsErr);
          if (axios.isAxiosError(blogsErr) && blogsErr.response?.status === 401) {
            // This is handled by the main user fetch, but good to note.
          } else {
            toast.error("An error occurred while fetching your blogs.");
          }
          setUserBlogs([]); // Ensure it's an empty array on error
        } finally {
          setBlogsLoading(false);
        }

      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          toast.error("You are not authenticated. Please sign in.");
          router.push('/signin');
        } else {
          toast.error(err.response?.data?.message || "An error occurred while fetching profile.");
          setError(err.response?.data?.message || "An error occurred while fetching profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndBlogs();
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
      <div className="flex flex-wrap gap-4 items-center mb-12">
        {/* Edit Profile Button */}
        <Link
          href="/profile/edit"
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
        >
          <LuPencil className="w-5 h-5 mr-1" />
          <span>Edit Profile</span>
        </Link>

        {/* Admin Page Button (conditionally rendered) */}
        {user && user.role === 'admin' && (
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Admin Page
          </button>
        )}
      </div>

      {/* Recent Blogs Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Recent Blogs</h2>
        {blogsLoading ? (
          <div className="flex justify-center items-center h-40">
            <TailSpin height="50" width="50" color="#4fa94d" ariaLabel="loading-blogs" />
            <p className="ml-4 text-gray-700">Loading your blogs...</p>
          </div>
        ) : userBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBlogs.map((blog) => (
              <BlogItem
                key={blog._id}
                image={blog.thumbnail}
                title={blog.title}
                description={blog.description}
                link={`/blog/${blog.slug}`} // Link to the full blog post
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md text-center text-gray-600">
            <p className="mb-4">You haven't created any blog posts yet.</p>
            <Link href="/create-blog" className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Create Your First Blog
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileCompletePage;
