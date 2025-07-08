// app/api/auth/upload-profile-image/route.js
// This route handles uploading a user's profile image to Cloudinary
// and updating the user's profilePictureUrl in the database.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/Lib/config/db'; // Use alias if configured, e.g., '@/lib/config/db'
import { User } from '@/Lib/models/blogmodel'; // Use alias if configured, e.g., '@/lib/models/blogmodel'
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary SDK

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  await connectDB(); // Ensure database connection

  try {
    // 1. Authenticate User
    const tokenCookie = cookies().get('token'); // Access the token cookie

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ message: 'Not authenticated: Token missing.' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verification error:', err);
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // 2. Process Image Upload
    const formData = await request.formData();
    const imageFile = formData.get('profileImage'); // 'profileImage' is the name from the frontend FormData

    if (!imageFile || !(imageFile instanceof Blob)) { // Ensure it's a Blob/File object
      return NextResponse.json({ message: 'No valid image file provided.' }, { status: 400 });
    }

    // Convert Blob/File to a Buffer for Cloudinary upload
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'sosumi-profile-pictures', // Organize uploads into a specific folder
          resource_type: 'auto', // Automatically determine resource type (image, video, raw)
          // Optional: Add transformations here if needed, e.g., { width: 200, height: 200, crop: 'fill' }
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result);
        }
      ).end(buffer); // End the stream with the image buffer
    });

    if (!uploadResult || !uploadResult.secure_url) {
      return NextResponse.json({ message: 'Failed to get image URL from Cloudinary.' }, { status: 500 });
    }

    const imageUrl = uploadResult.secure_url;

    // 3. Update User's profilePictureUrl in the database
    user.profilePictureUrl = imageUrl;
    await user.save(); // Save the updated user document

    // 4. Return Success Response
    return NextResponse.json(
      { message: 'Profile image uploaded and updated successfully!', imageUrl: imageUrl },
      { status: 200 }
    );

  } catch (error) {
    console.error('API /api/auth/upload-profile-image error:', error);
    // Generic error message for client, log detailed error on server
    return NextResponse.json({ message: 'Internal server error during image upload.' }, { status: 500 });
  }
}
