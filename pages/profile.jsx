"use client";

import React from "react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center space-x-6 mb-8">
          <img
            src="/images/profile-photo.jpg"
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-indigo-500"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">John Doe</h1>
            <p className="text-gray-600">Web Developer & Blogger</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-indigo-600">12</h2>
            <p className="text-gray-600">Blogs</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-indigo-600">120</h2>
            <p className="text-gray-600">Likes</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-indigo-600">5</h2>
            <p className="text-gray-600">Followers</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Blogs</h2>
        <ul className="space-y-4">
          <li className="p-4 bg-gray-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-indigo-600">How to Build a React App</h3>
            <p className="text-gray-600">Published on June 20, 2025</p>
          </li>
          <li className="p-4 bg-gray-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-indigo-600">Understanding Tailwind CSS</h3>
            <p className="text-gray-600">Published on June 15, 2025</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;