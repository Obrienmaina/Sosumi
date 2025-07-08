// app/page.jsx
// This is your main home page component.
// It will render within the RootLayout defined in app/layout.jsx.

import React from 'react';
import Link from 'next/link'; // <--- ADDED THIS IMPORT

const HomePage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Welcome to Sosumi Blog!</h1>
      <p className="text-lg text-center text-gray-600 mb-12">
        Discover insightful articles on technology, lifestyle, finance, and more.
      </p>

      {/* Add your homepage content here */}
      {/* For example, a list of recent blog posts: */}
      {/* <section className="my-10">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Recent Posts</h2>
        <BlogList /> // Assuming you have a BlogList component
      </section> */}

      <section className="text-center mt-16">
        <p className="text-xl text-gray-700">Start exploring our articles or sign up to join our community!</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/blog" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Browse Blogs
          </Link>
          <Link href="/signup" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Join Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
