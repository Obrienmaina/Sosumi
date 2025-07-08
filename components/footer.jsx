// app/components/footer.jsx
'use client'; // Ensure it's a client component if using useEffect/useState

import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // This ensures the year is always rendered client-side and matches the client's time
    setCurrentYear(new Date().getFullYear());
  }, []); // Empty dependency array means this runs once on client mount

  return (
    <footer className="bg-[#57597F] text-white py-6 mt-auto"> {/* mt-auto pushes footer to bottom */}
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © {currentYear} Sosumi Blog. All rights reserved.
        </p>
        <div className="flex justify-center gap-4 mt-4 text-2xl">
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="X (formerly Twitter)"
          >
            <i className="fa-brands fa-x-twitter"></i>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-500 transition-colors"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook"></i>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-pink-400 transition-colors"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
