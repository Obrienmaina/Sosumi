// app/components/Header.jsx
'use client'; // Mark as client component if using useRouter or other client-side hooks

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation'; // For active link styling and programmatic navigation
import { assets } from '@/Assets/assets'; // Assuming you have a logo in your assets
import axios from 'axios'; // For logout API call
import { toast } from 'react-toastify'; // For notifications

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [userName, setUserName] = useState(''); // State to store user's name

  // Check login status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/user'); // Fetch user data
        if (response.data.user) {
          setIsLoggedIn(true);
          setUserName(response.data.user.firstName || response.data.user.email); // Use first name or email
        } else {
          setIsLoggedIn(false);
          setUserName('');
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserName('');
        // console.error("Auth check failed:", error); // Log for debugging, but don't show toast for expected 401
      }
    };
    checkAuthStatus();
  }, [pathname]); // Re-check auth status if path changes (e.g., after login/logout)

  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      if (response.data.message) {
        toast.success(response.data.message);
        setIsLoggedIn(false);
        setUserName('');
        router.push('/signin'); // Redirect to sign-in page after logout
      } else {
        toast.error("Logout failed.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout.");
    }
  };

  const getLinkClasses = (path) => {
    return `font-medium px-4 py-2 rounded-md transition-colors duration-200
            ${pathname === path ? 'text-[#5936BB] bg-white shadow-sm' : 'text-gray-700 hover:text-[#5936BB] hover:bg-gray-100'}`;
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200">
      {/* Logo */}
      <Link href="/">
        <Image src={assets.logo} width={120} height={40} alt="Sosumi Blog Logo" priority />
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/" className={getLinkClasses('/')}>
          Home
        </Link>
        <Link href="/blog" className={getLinkClasses('/blog')}>
          Blogs
        </Link>
        {isLoggedIn && (
          <Link href="/profile" className={getLinkClasses('/profile')}>
            Profile
          </Link>
        )}

        {/* This is the "Create Blog" link, now UNCOMMENTED */}
        {isLoggedIn && (
          <Link href="/create-blog" className={getLinkClasses('/create-blog')}>
            Create Blog
          </Link>
        )}
        {/* Add other navigation links as needed */}
      </nav>

      {/* Auth Buttons / User Info */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <span className="text-gray-700 font-medium hidden sm:inline-block">Welcome, {userName}!</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/signin" className="px-4 py-2 border border-[#5936BB] text-[#5936BB] rounded-full hover:bg-[#5936BB] hover:text-white transition-colors duration-200">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-[#5936BB] text-white rounded-full hover:bg-[#4a2bb2] transition-colors duration-200">
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Icon (Optional: implement a mobile menu) */}
      {/* <div className="md:hidden">
        <button className="text-gray-700 text-2xl">
          <i className="fa-solid fa-bars"></i>
        </button>
      </div> */}
    </header>
  );
};

export default Header;
