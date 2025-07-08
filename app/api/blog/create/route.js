// app/api/blog/create/route.js
// This API route handles the creation of new blog posts.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/Lib/config/db'; // Adjust path as needed
import { BlogPost, User } from '@/Lib/models/blogmodel'; // Adjust path as needed
import { v2 as cloudinary } from 'cloudinary'; // For image uploads
import slugify from 'slugify'; // For generating URL-friendly slugs

// Configure Cloudinary (ensure these environment variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Force this route to be dynamic to ensure cookies() is correctly handled.
export const dynamic = 'force-dynamic';

// Helper function to authenticate the user
async function authenticateRequest(request) {
  const cookieHeader = request.headers.get('cookie');
  let token = null;

  if (cookieHeader) {
    const cookiesArray = cookieHeader.split(';');
    for (const cookie of cookiesArray) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        token = value;
        break;
      }
    }
  }

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
    console.error("Authentication error in /api/blog/create:", error);
    return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
  }
}

// POST handler for creating a new blog post
export async function POST(request) {
  await connectDB(); // Ensure database connection

  // Authenticate the user
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return NextResponse.json({ success: false, msg: authResult.message }, { status: authResult.status });
  }
  const requestingUser = authResult.user;

  try {
    // Parse multipart/form-data
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const category = formData.get('category')?.toString();
    const content = formData.get('content')?.toString();
    const isPublished = formData.get('isPublished')?.toString() === 'true'; // Convert string to boolean
    const thumbnailFile = formData.get('thumbnail');

    // Basic validation
    if (!title || !description || !category || !content || !thumbnailFile) {
      return NextResponse.json({ success: false, msg: 'Missing required fields or thumbnail.' }, { status: 400 });
    }

    // 1. Upload thumbnail to Cloudinary
    let thumbnailUrl = '';
    if (thumbnailFile instanceof File) {
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
          folder: 'sosumi_blog_thumbnails', // Optional: specify a folder in Cloudinary
          resource_type: 'image',
        }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(buffer);
      });

      if (uploadResult && uploadResult.secure_url) {
        thumbnailUrl = uploadResult.secure_url;
      } else {
        throw new Error('Cloudinary upload failed.');
      }
    } else {
      return NextResponse.json({ success: false, msg: 'Invalid thumbnail file provided.' }, { status: 400 });
    }

    // 2. Generate a unique slug
    let baseSlug = slugify(title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 0;
    let existingBlogWithSlug = null;

    do {
      existingBlogWithSlug = await BlogPost.findOne({ slug: uniqueSlug });
      if (existingBlogWithSlug) {
        counter++;
        uniqueSlug = `${baseSlug}-${counter}`;
      }
    } while (existingBlogWithSlug);

    // 3. Create the new blog post
    const newBlogPost = new BlogPost({
      title,
      slug: uniqueSlug,
      description,
      category,
      content,
      thumbnail: thumbnailUrl, // Use the Cloudinary URL
      authorId: requestingUser._id, // Assign the authenticated user as author
      author: requestingUser.name || requestingUser.username || requestingUser.email, // Use user's name or email
      authorImg: requestingUser.profilePictureUrl || 'https://placehold.co/40x40/cccccc/000000?text=P', // Use user's profile pic or default
      isPublished,
      date: new Date(), // Set current date
      likesCount: 0,
      commentsCount: 0,
      views: 0,
    });

    await newBlogPost.save();

    return NextResponse.json({ success: true, msg: 'Blog post created successfully!', blog: newBlogPost }, { status: 201 });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ success: false, msg: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
