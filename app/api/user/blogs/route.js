// app/api/user/blogs/route.js
// This route fetches blog posts authored by the authenticated user.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../../Lib/config/db'; // Adjust path as needed
import { BlogPost, User } from '../../../../Lib/models/blogmodel'; // Corrected import syntax

// Force this route to be dynamic to ensure cookies() is correctly handled.
export const dynamic = 'force-dynamic';

// Helper function to authenticate the user (reused from other API routes)
async function authenticateRequest(request) {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie || !tokenCookie.value) {
        return { authenticated: false, status: 401, message: 'Authorization token required.' };
    }

    try {
        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || 'supersecretjwtkey');
        const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken');
        if (!user) {
            return { authenticated: false, status: 404, message: 'Authenticated user not found.' };
        }
        return { authenticated: true, user: user };
    } catch (error) {
        console.error("Authentication error in /api/user/blogs:", error);
        return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
    }
}

// --- GET Request Handler (Fetch User's Blogs) ---
export async function GET(request) {
    await connectDB(); // Ensure database connection

    // Authenticate the user
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json({ success: false, msg: authResult.message }, { status: authResult.status });
    }
    const requestingUser = authResult.user;

    try {
        // Fetch blog posts authored by the requesting user, sorted by date (newest first).
        // Select only necessary fields for display on a list, exclude full content.
        const userBlogs = await BlogPost.find({ authorId: requestingUser._id })
                                        .sort({ date: -1 }) // Sort by newest first
                                        .select('-content') // Exclude the full content
                                        .lean(); // Return plain JavaScript objects

        if (!userBlogs || userBlogs.length === 0) {
            return NextResponse.json({ success: true, blogs: [], msg: 'No blogs found for this user.' }, { status: 200 });
        }

        return NextResponse.json({ success: true, blogs: userBlogs }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user blogs:', error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
