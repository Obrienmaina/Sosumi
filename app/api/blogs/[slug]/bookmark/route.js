// app/api/blogs/[slug]/bookmark/route.js
// This route handles toggling bookmarks for a specific blog post.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../../../Lib/config/db'; // Adjust path as needed
import { BlogPost, Bookmark, User } from '../../../../../Lib/models/blogmodel'; // Adjust path as needed
import mongoose from 'mongoose'; // For ObjectId validation

// --- Authentication Middleware Helper ---
// This function checks if the request is authenticated and returns the user.
// It's a reusable helper for protected API routes.
async function authenticateRequest(request) {
    // CORRECTED: Explicitly await cookies() to resolve the warning.
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie || !tokenCookie.value) {
        return { authenticated: false, status: 401, message: 'Authorization token required.' };
    }

    try {
        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || 'supersecretjwtkey');
        // Fetch user to ensure they exist and are active.
        const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken');
        if (!user) {
            return { authenticated: false, status: 404, message: 'Authenticated user not found.' };
        }
        return { authenticated: true, user: user };
    } catch (error) {
        console.error("Authentication error in /api/blogs/[slug]/bookmark:", error);
        return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
    }
}

// --- POST Request Handler (Toggle Bookmark) ---
// This route allows an authenticated user to bookmark or unbookmark a blog post.
export async function POST(request, context) { // Renamed second argument to 'context'
    await connectDB(); // Ensure database connection

    // Apply authentication check
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json({ success: false, msg: authResult.message }, { status: authResult.status });
    }
    const requestingUser = authResult.user;

    // CORRECTED: Explicitly await context.params to resolve the warning.
    const { slug } = await context.params;

    try {
        // 1. Find the blog post by slug
        const blogPost = await BlogPost.findOne({ slug });

        if (!blogPost) {
            return NextResponse.json({ success: false, msg: 'Blog post not found.' }, { status: 404 });
        }

        // 2. Check if the user has already bookmarked this post
        const existingBookmark = await Bookmark.findOne({
            userId: requestingUser._id,
            postId: blogPost._id,
        });

        let bookmarked = false;
        let message = '';

        if (existingBookmark) {
            // User has already bookmarked, so unbookmark (delete the bookmark)
            await Bookmark.findByIdAndDelete(existingBookmark._id);
            bookmarked = false;
            message = 'Bookmark removed successfully!';
        } else {
            // User has not bookmarked, so bookmark (create a new bookmark)
            await Bookmark.create({
                userId: requestingUser._id,
                postId: blogPost._id,
            });
            bookmarked = true;
            message = 'Blog bookmarked successfully!';
        }

        // 3. Return success response with updated bookmark status
        return NextResponse.json(
            { success: true, msg: message, bookmarked: bookmarked },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// --- GET Request Handler (Check Bookmark Status) ---
// This route can be used by the frontend to check if the current user has bookmarked a specific post.
export async function GET(request, context) { // Renamed second argument to 'context'
    await connectDB();

    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        // If not authenticated, assume user has not bookmarked
        return NextResponse.json({ success: true, bookmarked: false, msg: 'Not authenticated, assuming not bookmarked.' }, { status: 200 });
    }
    const requestingUser = authResult.user;

    // CORRECTED: Explicitly await context.params to resolve the warning.
    const { slug } = await context.params;

    try {
        const blogPost = await BlogPost.findOne({ slug });
        if (!blogPost) {
            return NextResponse.json({ success: false, msg: 'Blog post not found.' }, { status: 404 });
        }

        const bookmarked = await Bookmark.exists({
            userId: requestingUser._id,
            postId: blogPost._id,
        });

        return NextResponse.json({ success: true, bookmarked: !!bookmarked }, { status: 200 });

    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
