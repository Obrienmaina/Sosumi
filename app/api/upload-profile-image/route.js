import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../Lib/config/db'; // Adjust path as needed
import { User } from '../../../Lib/models/blogmodel'; // Adjust path as needed
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary SDK

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This is the named export for the POST method
export async function POST(request) {
  await connectDB();

  try {
    // CORRECTED: Access cookies directly using cookies().get()
    const token = cookies().get('token');

    if (!token?.value) { // Check token.value as token is a ServerCookie object
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // --- Start: Image Upload Logic using Cloudinary ---
    const formData = await request.formData();
    const imageFile = formData.get('profileImage'); // 'profileImage' is the name from the frontend FormData

    if (!imageFile) {
      return NextResponse.json({ message: 'No image file provided.' }, { status: 400 });
    }

    // Convert Blob/File to a Buffer or Data URL for Cloudinary upload
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'sosumi-profile-pictures', resource_type: 'auto' }, // Specify a folder for organization
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result);
        }
      ).end(buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      return NextResponse.json({ message: 'Failed to get image URL from Cloudinary.' }, { status: 500 });
    }

    const imageUrl = uploadResult.secure_url;
    // --- End: Image Upload Logic using Cloudinary ---

    // Return the URL of the uploaded image
    return NextResponse.json({ message: 'Image uploaded successfully!', imageUrl: imageUrl }, { status: 200 });

  } catch (error) {
    console.error('API /api/upload-profile-image error:', error);
    return NextResponse.json({ message: 'Internal server error during image upload.' }, { status: 500 });
  }
}
