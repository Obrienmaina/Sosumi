// app/api/auth/signin/route.js
// This API route handles traditional email/password user login.

import { NextResponse } from 'next/server';
import connectDB from '@/Lib/config/db'; // Adjust path as needed
import { User } from '@/Lib/models/blogmodel'; // Adjust path as needed
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // For setting cookies

// This route does NOT need 'force-dynamic' unless it uses specific dynamic APIs
// that are not automatically inferred by Next.js (like cookies() for reading,
// but for setting, it's usually fine).

export async function POST(request) {
  await connectDB(); // Ensure database connection

  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) { // Check if user exists and has a password hash (not Google-only)
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user._id, created: Date.now().toString() },
        process.env.JWT_SECRET || 'supersecretjwtkey', // Use fallback for JWT_SECRET
        { expiresIn: '1d' } // Token valid for 1 day
    );

    // Add token to user's tokens array if not already present
    if (!user.tokens.includes(token)) {
        user.tokens.push(token);
        await user.save(); // Save user with new token
    }

    // Set the cookie in the response
    const response = NextResponse.json({ success: true, message: 'Login successful!' }, { status: 200 });
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'Lax',
        path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error during traditional signin:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
