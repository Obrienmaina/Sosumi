// app/api/auth/user-profile-update/route.js
// This route handles comprehensive updates to the authenticated user's profile,
// including text fields and profile image upload (to Cloudinary).

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/Lib/config/db'; // Use alias if configured
import { User } from '@/Lib/models/blogmodel'; // Use alias if configured
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary SDK

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) { // Consider using PUT or PATCH for updates
  await connectDB(); // Ensure database connection

  try {
    // 1. Authenticate User
    const tokenCookie = cookies().get('token');

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
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

    // 2. Parse FormData (Next.js handles this directly, no formidable needed)
    const formData = await request.formData();

    // 3. Handle Profile Image Upload (if provided)
    const profileImageFile = formData.get('profilePicture'); // Name from frontend FormData

    if (profileImageFile && profileImageFile instanceof Blob && profileImageFile.size > 0) {
      const arrayBuffer = await profileImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'sosumi-profile-pictures',
            resource_type: 'auto',
            // public_id: `user-${user._id}-profile`, // Optional: specific public ID
            overwrite: true, // Overwrite existing image if public_id is same
          },
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
        return NextResponse.json({ message: 'Failed to upload profile image to Cloudinary.' }, { status: 500 });
      }
      user.profilePictureUrl = uploadResult.secure_url; // Update user's profile picture URL
    }
    // If no new image is provided, the existing profilePictureUrl remains unchanged.

    // 4. Update other profile fields from FormData
    // Use formData.get() for each field.
    // Ensure you handle boolean values (e.g., agreedToTerms) correctly as formData.get() returns strings.
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const country = formData.get('country');
    const agreedToTerms = formData.get('agreedToTerms'); // This will be a string "true" or "false"
    const bio = formData.get('bio');
    const gender = formData.get('gender');
    const homepageUrl = formData.get('homepageUrl');
    const company = formData.get('company');
    const city = formData.get('city');
    const interests = formData.get('interests'); // This might be a comma-separated string or JSON string from frontend

    if (firstName !== null) user.firstName = firstName;
    if (lastName !== null) user.lastName = lastName;
    if (country !== null) user.country = country;
    if (agreedToTerms !== null) user.agreedToTerms = agreedToTerms === 'true'; // Convert string to boolean
    if (bio !== null) user.bio = bio;
    if (gender !== null) user.gender = gender === '' ? null : gender; // Allow null for empty string
    if (homepageUrl !== null) user.homepageUrl = homepageUrl;
    if (company !== null) user.company = company;
    if (city !== null) user.city = city;
    // For interests, if it's a string, you might need to parse it into an array
    if (interests !== null) {
      try {
        user.interests = JSON.parse(interests); // If frontend sends JSON string
      } catch (e) {
        user.interests = interests.split(',').map(s => s.trim()); // If frontend sends comma-separated string
      }
    }

    await user.save(); // Save all updated fields

    // 5. Return Success Response
    // Return the updated user object (excluding sensitive data)
    const updatedUser = await User.findById(user._id).select('-passwordHash -tokens -accessToken');
    return NextResponse.json({ message: 'Profile updated successfully!', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('API /api/user-profile-update error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ message: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ message: 'Internal server error during profile update.' }, { status: 500 });
  }
}
