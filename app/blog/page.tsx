// app/blog/page.tsx
// This component serves as the main blog listing page,
// allowing users to browse, filter, and sort blog posts.

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component
import axios from "axios"; // For fetching data from backend
import { TailSpin } from 'react-loader-spinner'; // For loading indicator
import { toast } from 'react-toastify'; // For notifications
import BlogItem from "@/components/BlogItem"; // Assuming BlogItem is in components/BlogItem.jsx

// Define a type for blog data (should match your backend BlogPost model)
interface BlogItemType {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string; // Assuming 'image' field in DB is 'thumbnail'
  date: string;
  category: string;
  author: string;
  authorImg: string;
  likesCount: number; // Assuming you'll add this to your model
  // Add other fields as per your BlogPost model
}

const BlogListPage = () => { // Renamed for clarity
  const [blogs, setBlogs] = useState<BlogItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date"); // Default sorting by date

  // --- Fetch Blogs from Backend ---
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming your backend API for all published blog posts is /api/blog
        const response = await axios.get('/api/blog'); // Adjust endpoint if needed
        if (response.data.success && Array.isArray(response.data.blogs)) {
          // Filter for published blogs if your /api/blog returns both drafts and published
          const publishedBlogs = response.data.blogs.filter((blog: any) => blog.isPublished !== false);
          setBlogs(publishedBlogs);
        } else {
          toast.error(response.data.msg || "Failed to load blogs.");
          setError(response.data.msg || "Failed to load blogs.");
        }
      } catch (err: any) { // Use 'any' for now, or define a proper error type if available
        console.error("Error fetching blogs:", err);
        // Check if it's an Axios error and handle specific statuses if needed
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.msg || "Failed to load blogs. Please try again.");
          setError(err.response.data.msg || "Failed to load blogs. Please try again.");
        } else {
          toast.error("Failed to load blogs. An unexpected error occurred.");
          setError("Failed to load blogs. An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []); // Empty dependency array means this runs once on mount

  // Filter blogs based on the selected category and search query
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearchQuery =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearchQuery;
  });

  // Sort blogs based on the selected sorting option
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortOption === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // Sort by date (newest first)
    } else if (sortOption === "popularity") {
      // Assuming 'likesCount' or 'views' field exists in your blog model
      // If you don't have a 'views' field, you'll need to implement it on the backend
      return (b.likesCount || 0) - (a.likesCount || 0); // Sort by likes (most likes first)
    }
    return 0;
  });

  return (
    <div className="py-5 px-5 md:px-12 lg:px-28 min-h-screen">
      {/* Title and Paragraph */}
      <div className="text-center my-12">
        <h1 className="text-3xl sm:text-5xl font-medium flex items-center justify-center gap-2">
          Welcome to
          <Link href="/">
            <Image
              src="/images/sosumi.png" // Ensure this path is correct in your public folder
              alt="Sosumi Logo"
              width={250} // Increased width for a bigger logo
              height={90} // Increased height for a bigger logo
              className="inline-block cursor-pointer"
              priority // Prioritize loading the logo
            />
          </Link>
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed mt-4 mb-8 max-w-xl mx-auto">
          Discover insights, opinions, and stories from our latest blog entries. Whether you’re here to learn, explore, or simply get inspired — there’s something for everyone.
        </p>

      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5936BB] focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
        {["All", "Lifestyle", "Health", "Finance", "Travel", "Tech", "Productivity", "Media"].map(
          (category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-[#5936BB] text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          )
        )}
      </div>

      {/* Sorting Options */}
      <div className="mb-8 max-w-xs mx-auto">
        <label htmlFor="sort" className="block text-gray-700 font-medium mb-2">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5936BB] focus:border-transparent"
        >
          <option value="date">Date (Newest First)</option>
          <option value="popularity">Popularity (Most Likes)</option>
        </select>
      </div>

      {/* Blog Items Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <TailSpin height="80" width="80" color="#4fa94d" ariaLabel="loading" />
          <p className="ml-4 text-gray-700">Loading blog posts...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center text-lg mt-8">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Retry</button>
        </div>
      ) : sortedBlogs.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-8">
          <p>No blogs found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4 justify-items-center">
          {sortedBlogs.map((blog) => (
            <BlogItem
              key={blog._id} // Use unique ID from backend
              image={blog.thumbnail} // Use 'thumbnail' field from backend
              title={blog.title}
              description={blog.description}
              link={`/blog/${blog.slug}`} // Link to the individual blog page
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
