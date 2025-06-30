// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../Lib/config/db';
import { User } from '../../../../Lib/models/BlogModel';

export async function POST(request) {
  await connectDB();

  try {
    const { email, password } = await request.json();

    // 1. Basic Validation (more robust validation should be done with a library)
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 2. Check if user already exists (by email or username)
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    // You might also want to check if a username derived from the email already exists
    // (though for traditional signup, the user might set their own username later)
    // For now, let's keep it simple as username is nullable and only unique for non-null values.
    // If you decide to make username required for traditional signup, you'd need to
    // implement similar username generation/uniqueness check here as in Google OAuth.

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create new user
    const newUser = new User({
      email,
      passwordHash,
      // For traditional signup, initial name, firstName, lastName, country, bio, etc. can be null
      // or default values, to be completed by the user later.
      // username: null, // Allow default null, or implement username generation/input here
      agreedToTerms: false, // User needs to agree
      // tokens array will be populated upon login
    });

    await newUser.save();

    // You might want to automatically log the user in here and return a token,
    // but for now, we'll just indicate success and let them redirect to sign-in.
    return NextResponse.json({ message: 'User registered successfully!' }, { status: 201 });

  } catch (error) {
    console.error('Traditional Signup API Error:', error);

    // Handle Mongoose duplicate key error specifically for unique fields like email or username
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}