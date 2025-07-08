// app/api/blog/route.js
// This API route handles fetching blog posts for the main blog listing page.

import { NextResponse } from 'next/server';
import connectDB from '@/Lib/config/db'; // Adjust path as needed
import { BlogPost } from '@/Lib/models/blogmodel'; // Adjust path as needed

// Force this route to be dynamic if you need to bypass caching
export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB(); // Ensure database connection

  try {
    // Fetch all blog posts that are marked as published.
    // You can add .sort({ date: -1 }) for newest first, or other sorting as needed.
    const blogs = await BlogPost.find({ isPublished: true })
                                .sort({ date: -1 }) // Sort by newest first
                                .select('-content') // Exclude the full content for the listing page
                                .lean(); // Return plain JavaScript objects

    // If no blogs are found, return an empty array
    if (!blogs || blogs.length === 0) { // Added blogs.length === 0 for robust check
      return NextResponse.json({ success: true, blogs: [], msg: 'No published blogs found.' }, { status: 200 });
    }

    return NextResponse.json({ success: true, blogs: blogs }, { status: 200 });

  } catch (error) {
    console.error('Error fetching blog posts for /api/blog:', error);
    return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// You can add other HTTP methods (POST, PUT, DELETE) here if needed for blog management
// For now, this GET method is sufficient for the listing page.
