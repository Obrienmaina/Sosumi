// app/api/blogs/[slug]/comments/route.js
// This route handles adding and fetching comments for a specific blog post.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../../../Lib/config/db'; // Adjust path as needed
import { BlogPost, Comment, User } from '../../../../../Lib/models/blogmodel'; // Adjust path as needed
import mongoose from 'mongoose'; // For ObjectId validation

// --- Authentication Middleware Helper ---
// This function checks if the request is authenticated and returns the user.
// It's a reusable helper for protected API routes.
async function authenticateRequest(request) {
    const tokenCookie = cookies().get('token');

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
        console.error("Authentication error in /api/blogs/[slug]/comments:", error);
        return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
    }
}

// --- POST Request Handler (Add Comment) ---
// This route allows an authenticated user to add a comment to a blog post.
export async function POST(request, context) { // Renamed second argument to 'context'
    await connectDB(); // Ensure database connection

    // CORRECTED: Explicitly await context.params to resolve the warning.
    const { slug } = await context.params;
    const { content } = await request.json(); // Get comment content from request body

    try {
        // 1. Validate input
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ success: false, msg: 'Comment content cannot be empty.' }, { status: 400 });
        }

        // Apply authentication check
        const authResult = await authenticateRequest(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ success: false, msg: authResult.message }, { status: authResult.status });
        }
        const requestingUser = authResult.user;


        // 2. Find the blog post by slug
        const blogPost = await BlogPost.findOne({ slug });

        if (!blogPost) {
            return NextResponse.json({ success: false, msg: 'Blog post not found.' }, { status: 404 });
        }

        // 3. Create a new comment document
        const newComment = await Comment.create({
            postId: blogPost._id,
            userId: requestingUser._id,
            content: content.trim(),
        });

        // 4. Increment the denormalized commentsCount on the BlogPost model
        blogPost.commentsCount = (blogPost.commentsCount || 0) + 1;
        await blogPost.save();

        // 5. Return success response with the newly created comment (and potentially user info)
        // Populate the user details for the returned comment if needed by frontend
        const populatedComment = await Comment.findById(newComment._id).populate('userId', 'username profilePictureUrl name');

        return NextResponse.json(
            { success: true, msg: 'Comment added successfully!', comment: populatedComment },
            { status: 201 } // 201 Created
        );

    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// --- GET Request Handler (Fetch Comments) ---
// This route fetches all comments for a specific blog post.
// It can be public or protected depending on your requirements.
export async function GET(request, context) { // Renamed second argument to 'context'
    await connectDB(); // Ensure database connection

    // CORRECTED: Explicitly await context.params to resolve the warning.
    const { slug } = await context.params;

    try {
        // 1. Find the blog post by slug
        const blogPost = await BlogPost.findOne({ slug });

        if (!blogPost) {
            return NextResponse.json({ success: false, msg: 'Blog post not found.' }, { status: 404 });
        }

        // 2. Find all comments for this blog post
        // Populate userId to get commenter's username and profile picture
        const comments = await Comment.find({ postId: blogPost._id })
                                      .populate('userId', 'username profilePictureUrl name') // Select fields to populate
                                      .sort({ createdAt: 1 }); // Sort by oldest first

        // 3. Return the comments
        return NextResponse.json({ success: true, comments }, { status: 200 });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
