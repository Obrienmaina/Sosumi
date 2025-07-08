// app/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuPencil } from 'react-icons/lu'; // Assuming you have lucide-react for icons
import axios from 'axios'; // For fetching user data
import { toast } from 'react-toastify'; // For notifications
import { TailSpin } from 'react-loader-spinner'; // For loading indicator
import Image from 'next/image'; // Import Next.js Image component
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

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null); // State to store user data
  const [userBlogs, setUserBlogs] = useState<BlogPostType[]>([]); // State for user's blogs
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false); // New state for inline bio editing
  const [editedBio, setEditedBio] = useState(''); // New state for edited bio content
  const [bioUpdateLoading, setBioUpdateLoading] = useState(false); // Loading state for bio update
  const [bioUpdateError, setBioUpdateError] = useState(''); // Error state for bio update

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfileAndBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user data - CORRECTED API PATH
        const userResponse = await axios.get('/api/auth/user'); // Changed from /api/user to /api/auth/user
        if (userResponse.data.user) {
          setUser(userResponse.data.user);
          // Initialize editedBio with user.bio only if user exists
          setEditedBio(userResponse.data.user.bio || '');
        } else {
          toast.error("Failed to fetch user profile.");
          setError("Failed to fetch user profile.");
          setLoading(false);
          return;
        }

        // Fetch user's blogs
        setBlogsLoading(true);
        try {
          const blogsResponse = await axios.get('/api/user/blogs'); // This path is correct as per previous API route
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

      } catch (err: any) { // Catch axios errors
        console.error('Error fetching user profile:', err);
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          toast.error("You are not authenticated. Please sign in.");
          router.push('/signin');
        } else {
          toast.error(err.response?.data?.message || 'Failed to load profile. Please try logging in again.');
          setError(err.response?.data?.message || 'Failed to load profile. Please try logging in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndBlogs();
  }, [router]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/logout'); // Using axios
      if (res.status === 200) { // Check status code for axios
        toast.success(res.data.message || 'Logged out successfully!');
        router.push('/signin');
      } else {
        // This block might not be hit if axios throws an error for non-2xx statuses
        toast.error(res.data.message || 'Logout failed.');
      }
    } catch (err: any) {
      console.error('Logout error:', err);
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Error during logout.');
      } else {
        toast.error('An unexpected error occurred during logout.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBioUpdate = async () => {
    setBioUpdateLoading(true);
    setBioUpdateError('');
    try {
      const res = await axios.post('/api/auth/user-bio-data', { bio: editedBio }); // Using axios and correct API path

      if (res.status === 200) { // Check status code for axios
        // Update the user state with the new bio from the response (if provided)
        setUser(prevUser => ({ ...prevUser, bio: res.data.user?.bio || editedBio }));
        setIsEditingBio(false); // Exit editing mode
        toast.success(res.data.message || 'Bio updated successfully!');
      } else {
        toast.error(res.data.message || 'Failed to update bio.');
      }
    } catch (err: any) {
      console.error('Bio update error:', err);
      if (axios.isAxiosError(err) && err.response) {
        setBioUpdateError(err.response.data.message || 'An error occurred while updating bio.');
        toast.error(err.response.data.message || 'An error occurred while updating bio.');
      } else {
        setBioUpdateError('An unexpected error occurred while updating bio.');
        toast.error('An unexpected error occurred while updating bio.');
      }
    } finally {
      setBioUpdateLoading(false);
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl text-gray-700">User not loaded. Redirecting...</p>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
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
                <Image // Use Next.js Image component
                  src={user.profilePictureUrl}
                  alt="Profile"
                  width={160} // Set appropriate width
                  height={160} // Set appropriate height
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/160x160/cccccc/333333?text=Profile+Photo')}
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
                <Link href="/profile/edit" className="ml-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
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
