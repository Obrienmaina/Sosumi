// app/api/auth/signup/route.js
// This API route handles traditional email/password user registration.

import { NextResponse } from 'next/server';
import connectDB from '@/Lib/config/db'; // Adjust path as needed
import { User } from '@/Lib/models/blogmodel'; // Adjust path as needed
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // For generating JWT after signup

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
    if (password.length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User with this email already exists.' }, { status: 409 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate a default username (can be updated by user later)
    let baseUsername = email.split('@')[0].toLowerCase();
    let generatedUsername = baseUsername;
    let counter = 0;
    let existingUserWithUsername = null;

    // Loop until a truly unique username is found
    do {
        existingUserWithUsername = await User.findOne({ username: generatedUsername });
        if (existingUserWithUsername) {
            counter++;
            generatedUsername = `${baseUsername}${counter}`;
        }
    } while (existingUserWithUsername);


    // Create new user
    const newUser = new User({
      email,
      passwordHash,
      username: generatedUsername, // Assign the generated unique username
      role: 'user', // Default role for new signups
      agreedToTerms: true, // Assuming signup implies agreement
      tokens: [] // Initialize tokens array
    });

    await newUser.save();

    // Optionally generate a token and set a cookie immediately after signup
    // This is good for direct login after registration.
    const token = jwt.sign(
        { id: newUser._id, created: Date.now().toString() },
        process.env.JWT_SECRET || 'supersecretjwtkey',
        { expiresIn: '1d' }
    );
    newUser.tokens.push(token);
    await newUser.save();

    // Set the cookie in the response
    const response = NextResponse.json({ success: true, message: 'Account created successfully! You can now sign in.' }, { status: 201 });
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'Lax',
        path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error during traditional signup:', error);
    // Handle duplicate key error specifically
    if (error.code === 11000) {
        return NextResponse.json({ success: false, message: 'A user with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
