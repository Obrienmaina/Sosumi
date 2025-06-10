import React from 'react';
import sosumi from './sosumi.png';

const Header = () => {
  return (
    <div className="py-5 px-5 md:px-12 lg:px-28">
      
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={sosumi}
            width={180}
            alt="Logo"
            className="w-[130px] h-10 mr-3 sm:w-auto"
          />
        </div>
      </div>

      {/* Title and Paragraph */}
      <div className="text-center my-12">
        <h1 className="text-3xl sm:text-5xl font-medium">Welcome to Sosumi</h1>
        <p className="text-lg text-gray-700 leading-relaxed mt-4 mb-8 max-w-xl mx-auto">
        Discover insights, opinions, and stories from our latest blog entries. Whether you’re here to learn, explore, or simply get inspired — there’s something for everyone.
        .
        </p>

        {/* Buttons below the text */}
        <div className="flex justify-center gap-6">
          <button className="flex items-center gap-2 font-medium py-2 px-6 border border-black">
            Log in
          </button>
          <button className="flex items-center gap-2 font-medium py-2 px-6 bg-black text-white">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;