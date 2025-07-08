// app/edit-blog/[slug]/page.tsx
"use client";

import React, { useEffect, useState, useRef, use } from 'react'; // Import useRef and use
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs'; // Assuming you have a Breadcrumbs component

// Define types for blog data
interface BlogData {
  title: string;
  description: string;
  content: string;
  category: string;
  thumbnail: string | null; // Can be null if no image
  isPublished: boolean;
  authorId: string; // Needed for authorization check
}

interface EditBlogPageProps {
  params: { slug: string };
}

const EditBlogPage: React.FC<EditBlogPageProps> = ({ params }) => {
  const router = useRouter();
  const { slug } = use(params); // CORRECTED: Use React.use() to unwrap params

  const [blogData, setBlogData] = useState<BlogData>({
    title: '',
    description: '',
    content: '',
    category: '',
    thumbnail: null,
    isPublished: true,
    authorId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null); // For new image upload
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null); // For image preview
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null); // Ref for contentEditable div


  // --- Fetch Blog Data and User for Authorization ---
  useEffect(() => {
    const fetchBlogAndUser = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch blog post data
        const blogResponse = await axios.get(`/api/blog/${slug}`);
        if (blogResponse.data.success && blogResponse.data.blog) {
          const fetchedBlog = blogResponse.data.blog;
          setBlogData({
            title: fetchedBlog.title,
            description: fetchedBlog.description,
            content: fetchedBlog.content, // Set content from fetched data
            category: fetchedBlog.category,
            thumbnail: fetchedBlog.thumbnail || null,
            isPublished: fetchedBlog.isPublished,
            authorId: fetchedBlog.authorId._id, // Assuming authorId is populated
          });
          setThumbnailPreview(fetchedBlog.thumbnail || null);

          // Set contentEditable div's innerHTML after fetching
          if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = fetchedBlog.content || '';
          }

        } else {
          setError(blogResponse.data.msg || "Blog not found for editing.");
          toast.error(blogResponse.data.msg || "Failed to load blog for editing.");
          setLoading(false);
          return;
        }

        // Fetch current user data for authorization
        const userResponse = await axios.get('/api/auth/user');
        if (userResponse.data.user) {
          setCurrentUserId(userResponse.data.user._id);
          setCurrentUserRole(userResponse.data.user.role);
        } else {
          // If not authenticated, redirect to signin
          toast.error("You must be logged in to edit blogs.");
          router.push('/signin');
          setLoading(false);
          return;
        }

      } catch (err: any) {
        console.error("Error fetching blog or user for editing:", err);
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            toast.error("You are not authorized to edit this blog or not logged in.");
            router.push('/signin');
          } else if (err.response.status === 404) {
            setError("Blog not found.");
            toast.error("Blog not found for editing.");
          } else {
            setError(err.response.data.msg || "Failed to load blog for editing.");
            toast.error(err.response.data.msg || "Failed to load blog for editing.");
          }
        } else {
          setError("Failed to load blog for editing. An unexpected error occurred.");
          toast.error("Failed to load blog for editing. An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogAndUser();
    }
  }, [slug, router]);

  // --- Authorization Check (after initial load) ---
  useEffect(() => {
    if (!loading && blogData.authorId && currentUserId && currentUserRole) {
      if (blogData.authorId !== currentUserId && currentUserRole !== 'admin') {
        toast.error("You are not authorized to edit this blog post.");
        router.push(`/blog/${slug}`); // Redirect back to the blog post
      }
    }
  }, [loading, blogData.authorId, currentUserId, currentUserRole, router, slug]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setBlogData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setBlogData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentInput = () => {
    // Update blogData.content with the innerHTML of the contentEditable div
    if (contentEditableRef.current) {
      setBlogData((prevData) => ({
        ...prevData,
        content: contentEditableRef.current?.innerHTML || '',
      }));
    }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Ctrl+B (or Cmd+B on Mac) for bolding
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault(); // Prevent browser's default bold action if any

      // Ensure the contentEditable div is focused before executing command
      if (contentEditableRef.current) {
        contentEditableRef.current.focus();
        document.execCommand('bold', false, null);
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file)); // Create a local URL for preview
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null); // Clear the file input
    setThumbnailPreview(null); // Clear the preview
    setBlogData(prev => ({ ...prev, thumbnail: null })); // Mark for deletion on backend
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Basic validation
    if (!blogData.title || !blogData.description || !blogData.category || !blogData.content.trim()) {
      toast.error("Please fill in all required fields.");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('description', blogData.description);
      formData.append('content', blogData.content); // Use the HTML content from state
      formData.append('category', blogData.category);
      formData.append('isPublished', String(blogData.isPublished)); // Convert boolean to string

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile); // Append new file
      } else if (blogData.thumbnail === null && thumbnailPreview === null) {
        // If thumbnail was removed by user, send a specific indicator to backend
        formData.append('thumbnail', 'null');
      }
      // If thumbnailFile is null and blogData.thumbnail is not null, it means no change, so don't append anything for thumbnail

      const response = await axios.put(`/api/blog/${slug}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for FormData
        },
      });

      if (response.data.success) {
        toast.success(response.data.msg);
        router.push(`/blog/${response.data.blog.slug}`); // Redirect to updated blog post
      } else {
        toast.error(response.data.msg || "Failed to update blog post.");
        setError(response.data.msg || "Failed to update blog post.");
      }
    } catch (err: any) {
      console.error("Error updating blog post:", err);
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.msg || "An error occurred while updating the blog.");
        setError(err.response.data.msg || "An error occurred while updating the blog.");
      } else {
        toast.error("An unexpected error occurred while updating the blog.");
        setError("An unexpected error occurred while updating the blog.");
      }
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbPaths = [
    { label: 'Home', href: '/' },
    { label: 'Blogs', href: '/blog' },
    { label: blogData.title || 'Loading...', href: `/blog/${slug}` },
    { label: 'Edit', href: `/edit-blog/${slug}` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TailSpin height="80" width="80" color="#4fa94d" ariaLabel="loading" />
        <p className="ml-4 text-gray-700">Loading blog post for editing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => router.push(`/blog/${slug}`)}
          className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  // Final authorization check before rendering the form
  if (blogData.authorId && currentUserId && currentUserRole) {
    if (blogData.authorId !== currentUserId && currentUserRole !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-red-500 text-lg mb-4">You are not authorized to edit this blog post.</p>
          <button
            onClick={() => router.push(`/blog/${slug}`)}
            className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Go to Blog
          </button>
        </div>
      );
    }
  }


  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-10 lg:p-12">
        <Breadcrumbs paths={breadcrumbPaths} />

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Edit Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={blogData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              placeholder="Enter blog title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={blogData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y text-gray-800"
              rows={3}
              placeholder="Enter a short description"
              required
            ></textarea>
          </div>

          {/* Content (contentEditable div) */}
          <div>
            <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">Blog Content</label>
            <div
              id="content"
              ref={contentEditableRef}
              contentEditable="true"
              onInput={handleContentInput}
              onKeyDown={handleContentKeyDown}
              className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg min-h-[200px] prose max-w-none" // Added prose for basic styling
              style={{ whiteSpace: 'pre-wrap' }} // Helps with preserving whitespace
            ></div>
            <p className="text-sm text-gray-500 mt-1">
              You can type, hit Enter for new paragraphs, and use Ctrl+B (or Cmd+B) for bold text.
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-lg font-medium text-gray-700 mb-2">Category</label>
            <select
              id="category"
              name="category"
              value={blogData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
              required
            >
              <option value="">Select a category</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Travel">Travel</option>
              <option value="Tech">Tech</option>
              <option value="Productivity">Productivity</option>
              <option value="Media">Media</option>
              {/* Add more categories as needed */}
            </select>
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Thumbnail Image</label>
            {thumbnailPreview && (
              <div className="mb-4 relative w-full max-w-xs h-48 rounded-md overflow-hidden border border-gray-200">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                  aria-label="Remove thumbnail"
                >
                  <i className="fa-solid fa-times"></i> {/* Font Awesome icon */}
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="block w-full text-sm text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-purple-50 file:text-purple-700
                         hover:file:bg-purple-100"
            />
            <p className="text-sm text-gray-500 mt-2">Upload a new image to replace the current one.</p>
          </div>

          {/* Is Published Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={blogData.isPublished}
              onChange={handleChange}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-base text-gray-900">
              Publish Blog Post
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
                <TailSpin height="20" width="20" color="#fff" ariaLabel="saving" />
            ) : (
                'Save Changes'
            )}
          </button>
        </form>

        <button
          onClick={() => router.push(`/blog/${slug}`)}
          className="mt-8 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditBlogPage;
