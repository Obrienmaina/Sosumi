import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../Lib/config/db';
import mongoose from 'mongoose';
import { User } from '../../../Lib/models/blogmodel';

// Removed unused userSchema declaration

export async function GET() {
  await connectDB();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('API /api/user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export { BlogPost, Comment, Bookmark, User };