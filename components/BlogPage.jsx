"use client";

import React, { useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { blog_data } from "../Lib/assets";

const BlogPage = ({ params }) => {
  const { slug } = params;
  const [selectedCategory, setSelectedCategory] = useState("All");

  const blogData = blog_data.find((blog) => blog.slug === slug);

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-6 flex items-center justify-center">
        <p className="text-gray-800 text-lg">Blog not found.</p>
      </div>
    );
  }

  // Filter blogs based on the selected category
  const filteredBlogs = selectedCategory === "All"
    ? blog_data
    : blog_data.filter((blog) => blog.category === selectedCategory);

  return (
    <div className="p-8">
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          className={`px-4 py-2 ${selectedCategory === "All" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === "Lifestyle" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("Lifestyle")}
        >
          Lifestyle
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === "Health" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("Health")}
        >
          Health
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === "Finance" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("Finance")}
        >
          Finance
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === "Travel" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("Travel")}
        >
          Travel
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === "Tech" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("Tech")}
        >
          Tech
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === "Productivity" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("Productivity")}
        >
          Productivity
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === "Media" ? "bg-black text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedCategory("Media")}
        >
          Media
        </button>
      </div>

      {/* Blog Items */}
      <div className="flex flex-wrap justify-center gap-4 p-4">
        {filteredBlogs.map((blog) => (
          <div key={blog.id} className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
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