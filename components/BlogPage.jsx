"use client";

import React, { useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { blog_data } from "../Lib/assets";

const BlogPage = ({ params }) => {
  const { slug } = params;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date"); // Default sorting by date

  const blogData = blog_data.find((blog) => blog.slug === slug);

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-6 flex items-center justify-center">
        <p className="text-gray-800 text-lg">Blog not found.</p>
      </div>
    );
  }

  // Filter blogs based on the selected category and search query
  const filteredBlogs = blog_data.filter((blog) => {
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
      return new Date(b.date) - new Date(a.date); // Sort by date (newest first)
    } else if (sortOption === "popularity") {
      return b.views - a.views; // Sort by popularity (most views first)
    }
    return 0;
  });

  return (
    <div className="p-8">
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "All" ? "bg-[#5936BB] text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "Lifestyle"
              ? "bg-[#5936BB] text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("Lifestyle")}
        >
          Lifestyle
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "Health"
              ? "bg-[#5936BB] text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("Health")}
        >
          Health
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "Finance"
              ? "bg-[#5936BB] text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("Finance")}
        >
          Finance
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "Travel"
              ? "bg-[#5936BB] text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("Travel")}
        >
          Travel
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "Tech"
              ? "bg-[#5936BB] text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("Tech")}
        >
          Tech
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "Productivity"
              ? "bg-[#5936BB] text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("Productivity")}
        >
          Productivity
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "Media"
              ? "bg-[#5936BB] text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory("Media")}
        >
          Media
        </button>
      </div>

      {/* Sorting Options */}
      <div className="mb-8">
        <label htmlFor="sort" className="block text-gray-700 font-medium mb-2">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="date">Date</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>

      {/* Blog Items */}
      <div className="flex flex-wrap justify-center gap-4 p-4">
        {sortedBlogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm"
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800">{blog.title}</h2>
            <p className="text-gray-600 mt-2">{blog.description}</p>
            <Link
              href={`/blog/${blog.slug}`} // Navigate to the dynamic blog page
              className="text-indigo-500 hover:underline mt-4 inline-block"
            >
              Read More
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;