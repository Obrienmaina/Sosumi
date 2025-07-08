// app/api/blog/[slug]/route.js
// This API route handles fetching, updating, and deleting a single blog post by its slug.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/Lib/config/db'; // Adjust path as needed
import { BlogPost, User } from '@/Lib/models/blogmodel'; // Adjust path as needed
import { v2 as cloudinary } from 'cloudinary'; // For image deletion (if updating/deleting images)

// Configure Cloudinary (ensure these environment variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Force this route to be dynamic to ensure cookies() is correctly handled.
export const dynamic = 'force-dynamic';

// Helper function to authenticate the user (reused from previous routes)
async function authenticateRequest(request) {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value;

  if (!token) {
    return { authenticated: false, status: 401, message: 'Authorization token required.' };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken');
    if (!user) {
      return { authenticated: false, status: 404, message: 'Authenticated user not found.' };
    }
    return { authenticated: true, user: user };
  } catch (error) {
    console.error("Authentication error:", error);
    return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
  }
}

// --- GET Request Handler (Fetch Single Blog Post) ---
export async function GET(request, context) { // Renamed second argument to 'context'
  await connectDB(); // Ensure database connection

  // CORRECTED: Explicitly await context.params to resolve the warning.
  // This forces Next.js to treat the params object in an async-aware manner.
  const { slug } = await context.params;

  try {
    // Find the blog post by its slug
    const blog = await BlogPost.findOne({ slug: slug })
                                .populate('authorId', 'username profilePictureUrl name') // Populate author details
                                .lean(); // Return plain JavaScript object

    if (!blog) {
      return NextResponse.json({ success: false, msg: 'Blog post not found.' }, { status: 404 });
    }

    // Optional: Increment view count here if you want to track views
    // This would typically be a separate PATCH/POST request to avoid side effects on GET
    // For simplicity, we'll just fetch for now.

    // Return the full blog post data
    return NextResponse.json({ success: true, blog: blog }, { status: 200 });

  } catch (error) {
    console.error('Error fetching single blog post:', error);
    return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// --- DELETE Request Handler (Delete Single Blog Post) ---
export async function DELETE(request, context) { // Renamed second argument to 'context'
  await connectDB(); // Ensure database connection

  // Authenticate the user
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return NextResponse.json({ success: false, msg: authResult.message }, { status: authResult.status });
  }
  const requestingUser = authResult.user;

  // CORRECTED: Explicitly await context.params to resolve the warning.
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.json({ success: false, msg: "Blog slug is required for deletion." }, { status: 400 });
  }

  try {
    // 1. Find the blog post by slug to get its details (especially the image URL and authorId)
    const blog = await BlogPost.findOne({ slug: slug });
    if (!blog) {
      return NextResponse.json({ success: false, msg: "Blog post not found." }, { status: 404 });
    }

    // 2. Authorization Check: Only the author or an admin can delete the blog
    if (blog.authorId.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
        return NextResponse.json({ success: false, msg: "Unauthorized to delete this blog post." }, { status: 403 });
    }

    // 3. Delete image from Cloudinary if a thumbnail exists
    if (blog.thumbnail) {
        // Extract public_id from the Cloudinary URL
        // Example URL: https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/folder/public_id.png
        const publicIdMatch = blog.thumbnail.match(/\/upload\/(?:v\d+\/)?([^\/]+)\./); // More robust regex
        if (publicIdMatch && publicIdMatch[1]) {
            const publicId = publicIdMatch[1].replace(/^sosumi_blog_thumbnails\//, ''); // Remove folder prefix if present in public_id
            console.log('Deleting Cloudinary image with public_id:', publicId);
            await cloudinary.uploader.destroy(`sosumi_blog_thumbnails/${publicId}`); // Re-add folder if needed for destruction
            console.log('Cloudinary image deleted successfully.');
        } else {
            console.warn('Could not extract public_id from thumbnail URL:', blog.thumbnail);
        }
    }

    // 4. Delete the blog post from the database
    await BlogPost.findOneAndDelete({ slug: slug }); // Delete by slug

    return NextResponse.json({ success: true, msg: "Blog post deleted successfully." }, { status: 200 });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// You can add a PUT/PATCH handler here for updating blog posts by slug as well.
