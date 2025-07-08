// app/components/BlogItem.jsx
'use client'; // Mark as client component if it has interactive elements or uses hooks

import React from 'react';
import Link from 'next/link'; // Import Link for internal navigation
import Image from 'next/image'; // Import Image for optimized images

const BlogItem = ({ image, title, description, link }) => {
  return (
    <div className="max-w-[330px] sm:max-w-[300px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
      <Link href={link}> {/* Wrap the entire card or just the image/title for clickability */}
        <Image
          src={image}
          alt={title}
          width={300} // Set appropriate width for optimization
          height={200} // Set appropriate height for optimization
          className="w-full h-[200px] object-cover"
          priority // Prioritize loading for above-the-fold content
        />
      </Link>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{description}</p> {/* line-clamp for consistent description height */}
        <Link
          href={link}
          className="text-indigo-600 hover:underline font-medium"
        >
          Read More
        </Link>
      </div>
    </div>
  );
};

// No PropTypes needed if using TypeScript or just for clarity in JS
// BlogItem.propTypes = {
//   image: PropTypes.string.isRequired,
//   title: PropTypes.string.isRequired,
//   description: PropTypes.string.isRequired,
//   link: PropTypes.string.isRequired,
// };

export default BlogItem;
