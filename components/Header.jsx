import React from 'react';

const Header = () => {
  return (
    <div className="py-5 px-5 md:px-12 lg:px-28">
      
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/images/sosumi.png" // Correct path to the logo
            alt="Sosumi Logo"
            className="w-[130px] h-10 mr-3 sm:w-auto"
          />
        </div>
      </div>

      {/* Title and Paragraph */}
      <div className="text-center my-12">
        <h1 className="text-3xl sm:text-5xl font-medium">Welcome to Sosumi</h1>
        <p className="text-lg text-gray-700 leading-relaxed mt-4 mb-8 max-w-xl mx-auto">
        Discover insights, opinions, and stories from our latest blog entries. Whether you’re here to learn, explore, or simply get inspired — there’s something for everyone.
        </p>

        {/* Buttons below the text */}
        <div className="flex justify-center gap-6">
          <button className="flex items-center gap-2 font-medium py-2 px-6 border border-black">
            Log in
          </button>
          <button className="flex items-center gap-2 font-medium py-2 px-6 bg-black text-white">
            Sign up
          </button>
          <form className='flex justfy-between max-w-[500px] scale-75 sm:scale-100'>
            <input type="email" placeholder="Enter your email" className="border border-gray-300 rounded-l px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="subscribe" className="bg-blue-500 text-white rounded-r px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Header;