import React from 'react';
import Link from 'next/link'; // Make sure Link is imported

const Header = () => {
  return (
    <div className="py-5 px-5 md:px-12 lg:px-28">
      {/* Title and Paragraph */}
      <div className="text-center my-12">
        <h1 className="text-3xl sm:text-5xl font-medium flex items-center justify-center gap-2">
          Welcome to 
          {/* Wrap the image with a Link component */}
          <Link href="/">
            <img
              src="/images/sosumi.png" // Use the same image for the title
              alt="Sosumi Logo"
              className="h-15 inline-block cursor-pointer" // Add cursor-pointer for visual cue
            />
          </Link>
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed mt-4 mb-8 max-w-xl mx-auto">
          Discover insights, opinions, and stories from our latest blog entries. Whether you’re here to learn, explore, or simply get inspired — there’s something for everyone.
        </p>

        {/* Buttons below the text */}
        <div className="flex justify-center gap-6">
          <Link
            href="/signin"
            className="flex items-center gap-2 font-medium py-2 px-6 border bg-[#5936BB] text-white hover:bg-[#8764E8] hover:text-white rounded-full"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-2 font-medium py-2 px-6 bg-[#5936BB] text-white hover:bg-[#8764E8] rounded-full"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;