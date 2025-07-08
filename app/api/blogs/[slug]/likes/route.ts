// app/api/blogs/[slug]/likes/route.ts
// This route handles toggling likes for a specific blog post.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../../../Lib/config/db'; // Adjust path as needed
import { BlogPost, Like, User } from '../../../../../Lib/models/blogmodel'; // Adjust path as needed
import mongoose from 'mongoose'; // For ObjectId validation

// --- Authentication Middleware Helper ---
// This function checks if the request is authenticated and returns the user.
// It's a reusable helper for protected API routes.
async function authenticateRequest(request: Request) {
    // CORRECTED: Explicitly await cookies() to resolve the warning.
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie || !tokenCookie.value) {
        return { authenticated: false, status: 401, message: 'Authorization token required.' };
    }

    try {
        const decoded: any = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || 'supersecretjwtkey');
        // Fetch user to ensure they exist and are active.
        const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken');
        if (!user) {
            return { authenticated: false, status: 404, message: 'Authenticated user not found.' };
        }
        return { authenticated: true, user: user };
    } catch (error) {
        console.error("Authentication error in /api/blogs/[slug]/likes:", error);
        return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
    }
}

// --- POST Request Handler (Toggle Like) ---
// This route allows an authenticated user to like or unlike a blog post.
export async function POST(request: Request, context: { params: { slug: string } }) { // Renamed second argument to 'context'
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

        // 2. Check if the user has already liked this post
        const existingLike = await Like.findOne({
            userId: requestingUser._id,
            postId: blogPost._id,
        });

        let newLikesCount = blogPost.likesCount;
        let userLiked = false;
        let message = '';

        if (existingLike) {
            // User has already liked, so unlike (delete the like)
            await Like.findByIdAndDelete(existingLike._id);
            newLikesCount = Math.max(0, blogPost.likesCount - 1); // Ensure count doesn't go below zero
            userLiked = false;
            message = 'Blog unliked successfully!';
        } else {
            // User has not liked, so like (create a new like)
            await Like.create({
                userId: requestingUser._id,
                postId: blogPost._id,
            });
            newLikesCount = blogPost.likesCount + 1;
            userLiked = true;
            message = 'Blog liked successfully!';
        }

        // 3. Update the denormalized likesCount on the BlogPost model
        blogPost.likesCount = newLikesCount;
        await blogPost.save();

        // 4. Return success response with updated likes count and user's like status
        return NextResponse.json(
            { success: true, msg: message, likesCount: newLikesCount, userLiked: userLiked },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// --- GET Request Handler (Optional: Check if user liked a post) ---
// This route can be used by the frontend to check if the current user has liked a specific post.
export async function GET(request: Request, context: { params: { slug: string } }) { // Renamed second argument to 'context'
    await connectDB();

    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        // If not authenticated, assume user has not liked
        return NextResponse.json({ success: true, userLiked: false, msg: 'Not authenticated, assuming not liked.' }, { status: 200 });
    }
    const requestingUser = authResult.user;

    // CORRECTED: Explicitly await context.params to resolve the warning.
    const { slug } = await context.params;

    try {
        const blogPost = await BlogPost.findOne({ slug });
        if (!blogPost) {
            return NextResponse.json({ success: false, msg: 'Blog post not found.' }, { status: 404 });
        }

        const userLiked = await Like.exists({
            userId: requestingUser._id,
            postId: blogPost._id,
        });

        return NextResponse.json({ success: true, userLiked: !!userLiked }, { status: 200 });

    } catch (error: any) {
        console.error('Error checking like status:', error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
