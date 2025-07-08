// app/api/blog/[id]/route.js
// This API route handles deleting a specific blog post by its ID.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/Lib/config/db'; // Adjust path as needed
import { BlogPost, User } from '@/Lib/models/blogmodel'; // Adjust path as needed
import { v2 as cloudinary } from 'cloudinary'; // For image deletion

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

// DELETE handler for deleting a blog post
export async function DELETE(request, { params }) {
  await connectDB(); // Ensure database connection

  // Authenticate the user
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return NextResponse.json({ success: false, msg: authResult.message }, { status: authResult.status });
  }
  const requestingUser = authResult.user;

  const { id } = params; // Get the blog ID from the dynamic route segment

  if (!id) {
    return NextResponse.json({ success: false, msg: "Blog ID is required for deletion." }, { status: 400 });
  }

  try {
    // 1. Find the blog post to get its details (especially the image URL)
    const blog = await BlogPost.findById(id);
    if (!blog) {
      return NextResponse.json({ success: false, msg: "Blog post not found." }, { status: 404 });
    }

    // 2. Authorization Check: Only the author or an admin can delete the blog
    if (blog.authorId.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
        return NextResponse.json({ success: false, msg: "Unauthorized to delete this blog post." }, { status: 403 });
    }

    // 3. Delete image from Cloudinary
    // Extract public_id from the Cloudinary URL
    // Example URL: https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/folder/public_id.png
    const publicIdMatch = blog.thumbnail.match(/\/upload\/(?:v\d+\/)?([^\.]+)\./);
    if (publicIdMatch && publicIdMatch[1]) {
        const publicId = publicIdMatch[1];
        console.log('Deleting Cloudinary image with public_id:', publicId);
        await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary image deleted successfully.');
    } else {
        console.warn('Could not extract public_id from thumbnail URL:', blog.thumbnail);
    }

    // 4. Delete the blog post from the database
    await BlogPost.findByIdAndDelete(id);

    return NextResponse.json({ success: true, msg: "Blog post deleted successfully." }, { status: 200 });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
