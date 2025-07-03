import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../Lib/config/db'; // Adjust path as needed
import { User } from '../../../Lib/models/blogmodel'; // Adjust path as needed

export async function POST(request) {
  await connectDB();

  try {
    const token = cookies().get('token'); // Direct access to the cookie

    if (!token?.value) {
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

    const { bio } = await request.json();

    // Update bio field
    if (bio !== undefined) { // Allow setting bio to empty string
      user.bio = bio;
    } else {
      return NextResponse.json({ message: 'Bio field is missing from request.' }, { status: 400 });
    }

    await user.save();

    return NextResponse.json({ message: 'Bio updated successfully!', user: { bio: user.bio } }, { status: 200 });

  } catch (error) {
    console.error('API /api/user-bio-update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
