"use client";

import React, { useState } from 'react';
import BlogItem from './BlogItem';
import { blog_data } from '../Lib/assets';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All'); // State for category filter

  // Filter blogs based on the selected category
  const filteredBlogs = selectedCategory === 'All'
    ? blog_data
    : blog_data.filter((blog) => blog.category === selectedCategory);

  return (
    <div className="p-8">
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          className={`px-4 py-2 ${selectedCategory === 'All' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('All')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === 'Lifestyle' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('Lifestyle')}
        >
          Lifestyle
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === 'Health' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('Health')}
        >
          Health
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === 'Finance' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('Finance')}
        >
          Finance
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === 'Travel' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('Travel')}
        >
          Travel
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === 'Tech' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('Tech')}
        >
          Tech
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === 'Productivity' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('Productivity')}
        >
          Productivity
        </button>
        <button
          className={`px-4 py-2 ${selectedCategory === 'Media' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('Media')}
        >
          Media
        </button>
      </div>

      {/* Blog Items */}
      <div className="flex flex-wrap justify-center gap-4 p-4"> {/* Flexbox with reduced gap */}
        {filteredBlogs.map((blog) => (
          <BlogItem
            key={blog.id}
            image={blog.image}
            title={blog.title}
            description={blog.description}
          />
        ))}
      </div>
    </div>
  );
};

export default BlogPage;