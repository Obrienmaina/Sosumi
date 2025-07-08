// app/api/blog/[slug]/route.js
// This API route handles fetching, updating, and deleting a single blog post by its slug.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/Lib/config/db'; // Adjust path as needed
import { BlogPost, User } from '@/Lib/models/blogmodel'; // Adjust path as needed
import { v2 as cloudinary } from 'cloudinary'; // For image deletion (if updating/deleting images)
import slugify from 'slugify'; // For generating slugs

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
  const cookieStore = await cookies(); // Await cookies()
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

// --- PUT Request Handler (Update Single Blog Post) ---
export async function PUT(request, context) {
    await connectDB();

    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json({ success: false, msg: authResult.message }, { status: authResult.status });
    }
    const requestingUser = authResult.user;

    const { slug: currentSlug } = await context.params; // Get the slug from URL params

    try {
        // 1. Find the existing blog post
        const blogPost = await BlogPost.findOne({ slug: currentSlug });
        if (!blogPost) {
            return NextResponse.json({ success: false, msg: 'Blog post not found.' }, { status: 404 });
        }

        // 2. Authorization Check: Only the author or an admin can update the blog
        if (blogPost.authorId.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
            return NextResponse.json({ success: false, msg: "Unauthorized to update this blog post." }, { status: 403 });
        }

        // 3. Parse FormData for updates (text fields + potential image)
        const formData = await request.formData();

        const title = formData.get('title');
        const description = formData.get('description');
        const content = formData.get('content');
        const category = formData.get('category');
        const isPublished = formData.get('isPublished') === 'true'; // Convert string to boolean
        const thumbnailFile = formData.get('thumbnail'); // The new thumbnail file (if any)

        // 4. Validate required fields
        if (!title || !description || !content || !category) {
            return NextResponse.json({ success: false, msg: "Missing required blog fields (title, description, content, category)." }, { status: 400 });
        }

        // 5. Generate new slug if title changed
        let newSlug = blogPost.slug; // Default to old slug
        if (title !== blogPost.title) {
            newSlug = slugify(title, { lower: true, strict: true, locale: 'en' });
            // Check if the new slug already exists for another blog post
            const existingBlogWithNewSlug = await BlogPost.findOne({ slug: newSlug });
            if (existingBlogWithNewSlug && existingBlogWithNewSlug._id.toString() !== blogPost._id.toString()) {
                return NextResponse.json({ success: false, msg: "A blog with this title already exists (slug conflict)." }, { status: 409 });
            }
        }

        // 6. Handle thumbnail update
        if (thumbnailFile && thumbnailFile instanceof Blob && thumbnailFile.size > 0) {
            // Delete old image from Cloudinary if it exists
            if (blogPost.thumbnail) {
                const publicIdMatch = blogPost.thumbnail.match(/\/upload\/(?:v\d+\/)?([^\/]+)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = publicIdMatch[1].replace(/^sosumi_blog_thumbnails\//, '');
                    await cloudinary.uploader.destroy(`sosumi_blog_thumbnails/${publicId}`);
                }
            }

            // Upload new image to Cloudinary
            const arrayBuffer = await thumbnailFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'sosumi_blog_thumbnails', // Consistent folder for blog thumbnails
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary thumbnail upload error:', error);
                            return reject(error);
                        }
                        resolve(result);
                    }
                ).end(buffer);
            });

            if (!uploadResult || !uploadResult.secure_url) {
                return NextResponse.json({ success: false, msg: 'Failed to upload new thumbnail image.' }, { status: 500 });
            }
            blogPost.thumbnail = uploadResult.secure_url; // Update thumbnail URL
        } else if (thumbnailFile === 'null' || thumbnailFile === '') { // Frontend explicitly sent 'null' or empty string to remove thumbnail
            if (blogPost.thumbnail) {
                const publicIdMatch = blogPost.thumbnail.match(/\/upload\/(?:v\d+\/)?([^\/]+)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = publicIdMatch[1].replace(/^sosumi_blog_thumbnails\//, '');
                    await cloudinary.uploader.destroy(`sosumi_blog_thumbnails/${publicId}`);
                }
            }
            blogPost.thumbnail = null; // Set thumbnail to null
        }
        // If thumbnailFile is null/undefined and not 'null' string, it means no change to thumbnail

        // 7. Update blog post fields
        blogPost.title = title;
        blogPost.slug = newSlug; // Update slug if title changed
        blogPost.description = description;
        blogPost.content = content;
        blogPost.category = category;
        blogPost.isPublished = isPublished;

        await blogPost.save(); // Save the updated blog post

        return NextResponse.json({ success: true, msg: "Blog post updated successfully!", blog: blogPost }, { status: 200 });

    } catch (error) {
        console.error('Error updating blog post:', error);
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({ success: false, msg: messages.join(', ') }, { status: 400 });
        }
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
