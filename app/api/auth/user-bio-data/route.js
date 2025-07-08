// app/api/auth/user-bio-data/route.js
// This route handles updating the authenticated user's bio.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/Lib/config/db'; // Use alias if configured
import { User } from '@/Lib/models/blogmodel'; // Use alias if configured

export async function POST(request) { // Consider PATCH for partial updates
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

    // 2. Get data from request body
    const { bio } = await request.json();

    // 3. Validate and Update bio field
    // Allow bio to be an empty string, but ensure it's provided in the payload
    if (bio === undefined) { // Check if the key 'bio' is present at all
      return NextResponse.json({ message: 'Bio field is missing from request body.' }, { status: 400 });
    }

    user.bio = bio; // Update the bio
    await user.save(); // Save the updated user document

    // 4. Return Success Response
    // Return updated bio or relevant user data
    return NextResponse.json({ message: 'Bio updated successfully!', user: { bio: user.bio } }, { status: 200 });

  } catch (error) {
    console.error('API /api/auth/user-bio-data error:', error);
    return NextResponse.json({ message: 'Internal server error during bio update.' }, { status: 500 });
  }
}
