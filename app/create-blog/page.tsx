// app/create-blog/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

const CreateBlogPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    content: '', // Add content property to state
    isPublished: true, // Default to published, or false for draft
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null); // Ref for contentEditable div

  // Set initial content for contentEditable div when component mounts or content changes
  useEffect(() => {
    if (contentEditableRef.current && formData.content !== contentEditableRef.current.innerHTML) {
      contentEditableRef.current.innerHTML = formData.content;
    }
  }, [formData.content]); // Dependency on formData.content

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' && 'checked' in e.target
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleContentInput = () => {
    // Update formData.content with the innerHTML of the contentEditable div
    if (contentEditableRef.current) {
      setFormData((prevData) => ({
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
        document.execCommand('bold', false, null); // Use null for consistency
      }
    }
    // Note: 'Enter' key for new paragraphs is usually handled automatically by contentEditable
    // The browser's default behavior for 'Enter' in contentEditable is to insert a <p> or <div>,
    // which should be handled by the 'prose' class for display.
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!thumbnailFile) {
      toast.error('Please upload a thumbnail image.');
      setLoading(false);
      return;
    }

    // Check contentEditable div's actual content, not just trimmed state, as it might contain HTML like <p><br></p>
    const currentContent = contentEditableRef.current?.innerHTML.trim();
    if (!currentContent || currentContent === '<br>') { // Check for empty or just a line break
      toast.error('Blog content cannot be empty.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('content', formData.content); // Use the HTML content from state
    data.append('isPublished', String(formData.isPublished)); // Convert boolean to string
    data.append('thumbnail', thumbnailFile); // Append the thumbnail file

    try {
      // Assuming your backend API for adding blogs is /api/blog/create
      const response = await axios.post('/api/blog/create', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      if (response.data.success) {
        toast.success(response.data.msg || 'Blog post created successfully!');
        router.push('/blog'); // Redirect to the blog list page
      } else {
        toast.error(response.data.msg || 'Failed to create blog post.');
      }
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.msg || 'An error occurred while creating the blog post.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-semibold mb-8 text-gray-800 text-center">Create New Blog Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Enter blog title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="A brief summary of your blog post"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-lg font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
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
            </select>
          </div>

          {/* Replaced textarea with contentEditable div for rich text */}
          <div>
            <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">
              Blog Content
            </label>
            <div className="relative">
              <div
                id="content"
                ref={contentEditableRef}
                contentEditable="true"
                onInput={handleContentInput}
                onKeyDown={handleContentKeyDown}
                className="mt-1 block w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg min-h-[200px] prose max-w-none"
                style={{ whiteSpace: 'pre-wrap' }}
                aria-label="Write your blog content here..."
              ></div>
              {(!formData.content || formData.content === '<br>') && (
                <span
                  className="pointer-events-none absolute left-4 top-3 text-gray-400 select-none"
                  style={{ userSelect: 'none' }}
                >
                  Write your blog content here...
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              You can type, hit Enter for new paragraphs, and use Ctrl+B (or Cmd+B) for bold text.
            </p>
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-lg font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-lg text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
              Publish immediately
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#5936BB] text-white font-medium rounded-full hover:bg-[#4a2bb2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5936BB] text-lg transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <TailSpin height="20" width="20" color="#fff" ariaLabel="loading" />
                Creating...
              </>
            ) : (
              'Create Blog Post'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogPage;
