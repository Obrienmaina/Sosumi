// app/api/auth/signin/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../../../Lib/models/BlogModel'; // Adjust path
import connectDB from '../../../../Lib/config/db'; // Adjust path
import { setCookie } from 'cookies-next'; // For setting HTTP-only cookie

export async function POST(request) {
    await connectDB(); // Ensure DB connection for each request

    try {
        const { email, password } = await request.json();

        // 1. Validate input: Check if email and password are provided
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required.' },
                { status: 400 }
            );
        }

        // 2. Find user by email in the database
        const user = await User.findOne({ email });

        // If no user is found with the given email
        if (!user) {
            // Provide a generic message for security (don't reveal if email exists)
            return NextResponse.json(
                { message: 'Invalid credentials.' },
                { status: 401 }
            );
        }

        // 3. Compare provided password with hashed password in DB
        // Check if the user has a passwordHash (i.e., registered traditionally)
        if (!user.passwordHash) {
            // If passwordHash is null/undefined, it means they registered via Google.
            return NextResponse.json(
                { message: 'This account was registered via Google. Please sign in with Google.' },
                { status: 401 }
            );
        }

        // Compare the provided plain password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        // If passwords do not match
        if (!isMatch) {
            // Provide a generic message for security
            return NextResponse.json(
                { message: 'Invalid credentials.' },
                { status: 401 }
            );
        }

        // 4. Generate JSON Web Token (JWT)
        const token = jwt.sign(
            { id: user._id, created: Date.now().toString() }, // Payload: user ID and creation timestamp
            process.env.JWT_SECRET, // Secret key from environment variables for signing
            { expiresIn: '1d' } // Token expires in 1 day (you can adjust this)
        );

        // Optional: Store the new token in the user's tokens array in the database.
        // This is useful for managing multiple active sessions or invalidating specific tokens.
        // If you enable this, remember to uncomment `await user.save()` below.
        // if (!user.tokens) {
        //     user.tokens = []; // Initialize if it doesn't exist
        // }
        // user.tokens.push(token);
        // await user.save(); // Save the user document with the new token

        // 5. Set the HTTP-only cookie and send the success response
        const response = NextResponse.json(
            { message: 'Login successful!', user: { id: user._id, email: user.email, name: user.name } },
            { status: 200 }
        );

        // Set the 'token' cookie.
        // It's HTTP-only for security (JS cannot access), secure in production (HTTPS only),
        // and SameSite=Lax for CSRF protection.
        setCookie("token", token, {
            req: request, // The incoming Next.js Request object
            res: response, // The outgoing Next.js Response object
            maxAge: 60 * 60 * 24 * 7, // Cookie expires in 1 week (adjust as needed)
            httpOnly: true, // Crucial for security
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'Lax', // Protects against CSRF attacks
            path: '/' // Makes the cookie available across the entire domain
        });

        return response; // Send the constructed response with the cookie

    } catch (error) {
        console.error("Traditional Login Error:", error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
