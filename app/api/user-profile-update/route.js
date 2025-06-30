import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../Lib/config/db'; // Adjust path as needed
import { User } from '../../../Lib/models/BlogModel'; // Adjust path as needed

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

    const {
      firstName,
      lastName,
      country,
      agreedToTerms,
      bio,
      profilePictureUrl,
      gender,      // New field from frontend
      homepageUrl, // New field from frontend
      company,     // New field from frontend
      city,        // New field from frontend
      interests    // New field from frontend
    } = await request.json();

    // Update fields (only if they are provided in the request body)
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (country !== undefined) user.country = country;
    if (agreedToTerms !== undefined) user.agreedToTerms = agreedToTerms;
    if (bio !== undefined) user.bio = bio;
    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;

    // FIX: Handle gender enum validation by converting empty string to null
    if (gender !== undefined) {
      user.gender = gender === '' ? null : gender; // Convert empty string to null for enum
    }

    if (homepageUrl !== undefined) user.homepageUrl = homepageUrl;
    if (company !== undefined) user.company = company;
    if (city !== undefined) user.city = city;
    if (interests !== undefined) user.interests = interests;

    await user.save();

    return NextResponse.json({ message: 'Profile updated successfully!', user }, { status: 200 });

  } catch (error) {
    console.error('API /api/user-profile-update error:', error);

    // More specific error handling for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ message: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
