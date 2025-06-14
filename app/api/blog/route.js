import connectDB from "../../../Lib/config/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
// Import all your Mongoose models from your consolidated models file
import { BlogPost, Comment, Bookmark, Like, Category, User } from "../../../Lib/models/BlogModel"; 
import bcrypt from 'bcryptjs'; // For password hashing

// Load the database connection once when the module is initialized
const loadDB = async () => {
    await connectDB();
}
loadDB();

// ---
// GET Request Handler
// ---
export async function GET(request) {
    return NextResponse.json({ msg: "API Working" });
}

// ---
// POST Request Handler
// ---
export async function POST(request) {
    const formData = await request.formData();
    // Get the 'type' field to determine which action to perform
    const type = formData.get('type');

    try {
        switch (type) {
            case 'blogPost': {
                const timestamp = Date.now();
                const imageFile = formData.get('image');// Assuming 'image' is the file input name

                // Basic validation for image file
                if (!imageFile || typeof imageFile === 'string') {
                    return NextResponse.json({ success: false, msg: "Image file is required for blog post." }, { status: 400 });
                }

                // Handle image upload
                const imageByteData = await imageFile.arrayBuffer();
                const buffer = Buffer.from(imageByteData);
                const path = `./public/${timestamp}_${imageFile.name}`;
                await writeFile(path, buffer);
                const imageURL = `/${timestamp}_${imageFile.name}`;

                // Construct blog post data
                const blogData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    author: formData.get('author'),
                    image: imageURL, // Use the URL of the uploaded image
                    authorImg: formData.get('authorImage') // Assuming this is a URL string
                };

                // Validate required fields for BlogPost (Mongoose schema also validates, but early checks are good)
                for (const key of ['title', 'description', 'category', 'author', 'image', 'authorImg']) {
                    if (!blogData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for blog post.` }, { status: 400 });
                    }
                }

                // Create the blog post
                await BlogPost.create(blogData);
                console.log("Blog Post Saved");
                return NextResponse.json({ success: true, msg: "Blog Post Added" });
            }

            case 'comment': {
                // Construct comment data
                const commentData = {
                    postId: formData.get('postId'),
                    userId: formData.get('userId'),
                    content: formData.get('content')
                };

                // Validate required fields
                for (const key of ['postId', 'userId', 'content']) {
                    if (!commentData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for comment.` }, { status: 400 });
                    }
                }

                // Create the comment
                await Comment.create(commentData);
                console.log("Comment Saved");
                return NextResponse.json({ success: true, msg: "Comment Added" });
            }

            case 'bookmark': {
                // Construct bookmark data
                const bookmarkData = {
                    userId: formData.get('userId'),
                    postId: formData.get('postId')
                };

                // Validate required fields
                for (const key of ['userId', 'postId']) {
                    if (!bookmarkData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for bookmark.` }, { status: 400 });
                    }
                }

                // Create the bookmark
                await Bookmark.create(bookmarkData);
                console.log("Bookmark Saved");
                return NextResponse.json({ success: true, msg: "Bookmark Added" });
            }

            case 'like': {
                // Construct like data
                const likeData = {
                    userId: formData.get('userId'),
                    postId: formData.get('postId')
                };

                // Validate required fields
                for (const key of ['userId', 'postId']) {
                    if (!likeData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for like.` }, { status: 400 });
                    }
                }

                // Create the like
                await Like.create(likeData);
                console.log("Like Saved");
                return NextResponse.json({ success: true, msg: "Like Added" });
            }

            case 'category': {
                // Construct category data
                const categoryData = {
                    name: formData.get('name')
                };

                // Validate required fields
                if (!categoryData.name) {
                    return NextResponse.json({ success: false, msg: "Category name is required." }, { status: 400 });
                }

                // Create the category
                await Category.create(categoryData);
                console.log("Category Saved");
                return NextResponse.json({ success: true, msg: "Category Added" });
            }

            case 'user': {
                // Get plain password and hash it
                const plainPassword = formData.get('password');
                if (!plainPassword) {
                    return NextResponse.json({ success: false, msg: "Password is required for user creation." }, { status: 400 });
                }
                const passwordHash = await bcrypt.hash(plainPassword, 10); // Hash the password

                // Construct user data
                const userData = {
                    username: formData.get('username'),
                    email: formData.get('email'),
                    passwordHash: passwordHash, // Use the hashed password
                    bio: formData.get('bio'),
                    profilePictureUrl: formData.get('profilePictureUrl')
                };

                // Validate required fields
                for (const key of ['username', 'email', 'passwordHash']) {
                    if (!userData[key]) {
                        return NextResponse.json({ success: false, msg: `"${key}" is required for user.` }, { status: 400 });
                    }
                }

                // Create the user
                await User.create(userData);
                console.log("User Saved");
                return NextResponse.json({ success: true, msg: "User Added" });
            }

            default:
                // Handle cases where 'type' is missing or unrecognized
                return NextResponse.json({ success: false, msg: "Invalid or missing 'type' parameter in form data." }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in POST handler:", error);
        // Handle specific Mongoose errors like duplicate keys
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return NextResponse.json({ success: false, msg: `Duplicate entry: "${error.keyValue[field]}" already exists for "${field}".` }, { status: 409 });
        }
        // Generic error response
        return NextResponse.json({ success: false, msg: "Internal Server Error", error: error.message }, { status: 500 });
    }
}