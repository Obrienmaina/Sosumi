// app/api/auth/user/route.js
// This route is for fetching the authenticated user's profile data.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers'; // No longer directly using cookies() from next/headers
import connectDB from '@/Lib/config/db'; // Use alias if configured
import { User } from '@/Lib/models/blogmodel'; // Use alias if configured

// Force this route to be dynamic to ensure it's not cached statically.
export const dynamic = 'force-dynamic';

export async function GET(request) { // Add 'request' parameter to access headers
  await connectDB(); // Ensure database connection

  try {
    // Alternative method to access cookies directly from the request headers
    // This bypasses the next/headers cookies() function which was causing issues.
    const cookieHeader = request.headers.get('cookie');
    let token = null;

    // --- DEBUGGING LOGS ---
    console.log('Incoming Cookie Header:', cookieHeader);
    // --- END DEBUGGING LOGS ---

    if (cookieHeader) {
      const cookiesArray = cookieHeader.split(';');
      for (const cookie of cookiesArray) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') { // Assuming your token cookie is named 'token'
          token = value;
          break;
        }
      }
    }

    // --- DEBUGGING LOGS ---
    console.log('Extracted Token:', token ? 'Token found (length: ' + token.length + ')' : 'No token found');
    // --- END DEBUGGING LOGS ---

    if (!token) { // Check for the token string directly
      return NextResponse.json({ message: 'Not authenticated: Token missing.' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // --- DEBUGGING LOGS ---
      console.log('Token decoded successfully:', decoded);
      // --- END DEBUGGING LOGS ---
    } catch (err) {
      console.error('JWT verification error (likely invalid/expired token):', err);
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    // Find the user by ID and exclude sensitive fields
    const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken');

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Return the user data
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('API /api/user error (catch block):', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// Note: Removed the unused mongoose import and model exports.
// API route files should only export HTTP method handlers (GET, POST, PUT, DELETE).
