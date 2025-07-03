// app/api/route.js (or wherever this file is located)
import connectDB from "../../../Lib/config/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { BlogPost, Comment, Bookmark, Like, Category, User } from "../../../Lib/models/blogmodel";
import bcrypt from 'bcryptjs';
import fs from 'fs'; // Use import for fs if using ES modules consistently
import jwt from 'jsonwebtoken'; // For token verification

// --- Middleware for Authentication (Highly Recommended) ---
// This is a simple example. For production, consider dedicated middleware
// or a helper function that can be reused across protected routes.
async function authenticateRequest(request) {
    const token = request.cookies.get('token')?.value; // Access cookie from Next.js request object

    if (!token) {
        return { authenticated: false, status: 401, message: 'Authorization token required.' };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken'); // Fetch user but exclude sensitive fields
        if (!user) {
            return { authenticated: false, status: 404, message: 'Authenticated user not found.' };
        }
        return { authenticated: true, user: user }; // Return authenticated status and user object
    } catch (error) {
        console.error("Authentication error:", error);
        return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
    }
}

// ---
// GET Request Handler
// ---
export async function GET(request) {
    await connectDB(); // Ensure DB connection for each request

    // Example: Only authenticated users can access certain GET data
    // const authResult = await authenticateRequest(request);
    // if (!authResult.authenticated) {
    //     return NextResponse.json({ message: authResult.message }, { status: authResult.status });
    // }

    // Your existing GET logic
    return NextResponse.json({ msg: "API Working" });
}

// ---
// POST Request Handler
// ---
export async function POST(request) {
    await connectDB(); // Ensure DB connection for each request

    // --- Apply Authentication for POST requests ---
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json({ message: authResult.message }, { status: authResult.status });
    }
    const requestingUser = authResult.user; // The user who made the request

    const formData = await request.formData();
    const type = formData.get('type');

    try {
        switch (type) {
            case 'blogPost': {
                // Example: Only a specific role or the author can create blog posts
                // if (requestingUser.role !== 'admin' && requestingUser.id !== 'some-author-id') {
                //     return NextResponse.json({ success: false, msg: "Unauthorized to create blog posts." }, { status: 403 });
                // }

                const timestamp = Date.now();
                const imageFile = formData.get('image');

                if (!imageFile || typeof imageFile === 'string') {
                    return NextResponse.json({ success: false, msg: "Image file is required for blog post." }, { status: 400 });
                }

                const imageByteData = await imageFile.arrayBuffer();
                const buffer = Buffer.from(imageByteData);
                const path = `./public/${timestamp}_${imageFile.name}`;
                await writeFile(path, buffer);
                const imageURL = `/${timestamp}_${imageFile.name}`;

                const blogData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    author: formData.get('author'), // Consider using requestingUser.name or ID here
                    image: imageURL,
                    authorImg: formData.get('authorImage')
                };

                for (const key of ['title', 'description', 'category', 'author', 'image', 'authorImg']) {
                    if (!blogData[key]) {
                        // Clean up partially uploaded file if validation fails here
                        fs.unlink(path, (err) => { if (err) console.error("Error deleting temp file:", err); });
                        return NextResponse.json({ success: false, msg: `"${key}" is required for blog post.` }, { status: 400 });
                    }
                }

                await BlogPost.create(blogData);
                console.log("Blog Post Saved");
                return NextResponse.json({ success: true, msg: "Blog Post Added" });
            }

            case 'comment': {
                const commentData = {
                    postId: formData.get('postId'),
                    userId: requestingUser._id, // Use authenticated user's ID
                    content: formData.get('content')
                };

                for (const key of ['postId', 'userId', 'content']) {
                    if (!commentData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for comment.` }, { status: 400 });
                    }
                }

                await Comment.create(commentData);
                console.log("Comment Saved");
                return NextResponse.json({ success: true, msg: "Comment Added" });
            }

            case 'bookmark': {
                const bookmarkData = {
                    userId: requestingUser._id, // Use authenticated user's ID
                    postId: formData.get('postId')
                };

                for (const key of ['userId', 'postId']) {
                    if (!bookmarkData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for bookmark.` }, { status: 400 });
                    }
                }

                await Bookmark.create(bookmarkData);
                console.log("Bookmark Saved");
                return NextResponse.json({ success: true, msg: "Bookmark Added" });
            }

            case 'like': {
                const likeData = {
                    userId: requestingUser._id, // Use authenticated user's ID
                    postId: formData.get('postId')
                };

                for (const key of ['userId', 'postId']) {
                    if (!likeData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for like.` }, { status: 400 });
                    }
                }

                await Like.create(likeData);
                console.log("Like Saved");
                return NextResponse.json({ success: true, msg: "Like Added" });
            }

            case 'category': {
                // Example: Only admins can add categories
                // if (requestingUser.role !== 'admin') {
                //     return NextResponse.json({ success: false, msg: "Unauthorized to add categories." }, { status: 403 });
                // }
                const categoryData = {
                    name: formData.get('name')
                };

                if (!categoryData.name) {
                    return NextResponse.json({ success: false, msg: "Category name is required." }, { status: 400 });
                }

                await Category.create(categoryData);
                console.log("Category Saved");
                return NextResponse.json({ success: true, msg: "Category Added" });
            }

            case 'user': {
                // This case handles traditional username/email/password signups.
                // It should typically NOT be protected by the above authentication middleware
                // as it's the route for creating a *new* user.
                // You might move this to a separate '/api/signup-traditional' route for clarity.

                const plainPassword = formData.get('password');
                if (!plainPassword) {
                    return NextResponse.json({ success: false, msg: "Password is required for user creation." }, { status: 400 });
                }
                const passwordHash = await bcrypt.hash(plainPassword, 10);

                const userData = {
                    username: formData.get('username'),
                    email: formData.get('email'),
                    passwordHash: passwordHash,
                    bio: formData.get('bio'),
                    profilePictureUrl: formData.get('profilePictureUrl')
                };

                for (const key of ['username', 'email', 'passwordHash']) {
                    if (!userData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for user.` }, { status: 400 });
                    }
                }

                await User.create(userData);
                console.log("User Saved (Traditional Signup)");
                return NextResponse.json({ success: true, msg: "User Added" });
            }

            default:
                return NextResponse.json({ success: false, msg: "Invalid or missing 'type' parameter in form data." }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in POST handler:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return NextResponse.json({ success: false, msg: `Duplicate entry: "${error.keyValue[field]}" already exists for "${field}".` }, { status: 409 });
        }
        return NextResponse.json({ success: false, msg: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// ---
// DELETE Request Handler
// ---
export async function DELETE(request) {
    await connectDB(); // Ensure DB connection for each request

    // --- Apply Authentication for DELETE requests ---
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json({ message: authResult.message }, { status: authResult.status });
    }
    // You might also check if the requestingUser has admin privileges or owns the blog post

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, msg: "Blog ID is required for deletion." }, { status: 400 });
    }

    try {
        // Find the blog post to get the image path
        const blog = await BlogPost.findById(id); // Corrected from BlogModel to BlogPost
        if (!blog) {
            return NextResponse.json({ success: false, msg: "Blog post not found." }, { status: 404 });
        }

        // Optional: Check if the requesting user is the author or an admin
        // if (blog.authorId.toString() !== authResult.user._id.toString() && authResult.user.role !== 'admin') {
        //     return NextResponse.json({ success: false, msg: "Unauthorized to delete this blog post." }, { status: 403 });
        // }

        // Delete the associated image file
        const imagePath = `./public${blog.image}`;
        if (fs.existsSync(imagePath)) { // Check if file exists before trying to unlink
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting blog image file:", err);
            });
        }

        // Delete the blog post from the database
        await BlogPost.findByIdAndDelete(id); // Corrected from BlogModel to BlogPost
        return NextResponse.json({ success: true, msg: "Blog Deleted" });
    } catch (error) {
        console.error("Error in DELETE handler:", error);
        return NextResponse.json({ success: false, msg: "Internal Server Error", error: error.message }, { status: 500 });
    }
}