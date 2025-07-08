import { FaTwitter, FaFacebook } from 'react-icons/fa';

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Adjust paths based on your project structure
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sosumiPurple: '#5936BB',
        sosumiDarkPurple: '#4A2BB2',
        sosumiWhite: '#FFFFFF',
        sosumiGray: '#F3F4F6',
      },
    },
  },
  plugins: [],
};

<>
  <div className="bg-sosumiGray p-6 rounded-lg shadow-md">
    <h1 className="text-sosumiPurple font-bold text-2xl">Welcome to Sosumi</h1>
  </div>

  <button
    className="px-4 py-2 bg-sosumiPurple text-sosumiWhite rounded-md hover:bg-sosumiDarkPurple transition-colors"
  >
    Like
  </button>

  <div className="mt-8 flex gap-4">
    <button
      onClick={() => handleShare("twitter")}
      className="flex items-center gap-2 px-4 py-2 bg-sosumiPurple text-sosumiWhite rounded-md hover:bg-sosumiDarkPurple transition-colors"
    >
      <FaTwitter className="w-5 h-5" /> Twitter
    </button>
    <button
      onClick={() => handleShare("facebook")}
      className="flex items-center gap-2 px-4 py-2 bg-sosumiPurple text-sosumiWhite rounded-md hover:bg-sosumiDarkPurple transition-colors"
    >
      <FaFacebook className="w-5 h-5" /> Facebook
    </button>
  </div>
</>