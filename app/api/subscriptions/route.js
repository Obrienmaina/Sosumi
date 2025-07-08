// app/api/subscriptions/route.js
// This file handles API requests for email subscriptions.

import { ConnectDB } from "@/Lib/config/db"; // Ensure this path is correct, consider using aliases
import EmailModel from "@/Lib/models/EmailModel"; // Ensure this path is correct, consider using aliases
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'; // For token verification
import { User } from "@/Lib/models/blogmodel"; // Assuming User model is here for auth

// --- Authentication Middleware Helper ---
// This function checks if the request is authenticated and returns the user.
// It's a reusable helper for protected API routes.
async function authenticateRequest(request) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return { authenticated: false, status: 401, message: 'Authorization token required.' };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch user to ensure they exist and are active.
        // Select only necessary fields, exclude sensitive ones.
        const user = await User.findById(decoded.id).select('-passwordHash -tokens -accessToken');
        if (!user) {
            return { authenticated: false, status: 404, message: 'Authenticated user not found.' };
        }
        // Optional: Check for admin role if this route is admin-only
        // if (user.role !== 'admin') {
        //     return { authenticated: false, status: 403, message: 'Forbidden: Admin access required.' };
        // }
        return { authenticated: true, user: user };
    } catch (error) {
        console.error("Authentication error in /api/subscriptions:", error);
        return { authenticated: false, status: 403, message: 'Invalid or expired token.' };
    }
}


// --- POST Request Handler (Add new subscription) ---
// This route allows users to subscribe to emails.
// It typically does NOT require authentication, but needs input validation.
export async function POST(request) {
    await ConnectDB(); // Connect to the database for this request

    try {
        const formData = await request.formData();
        const email = formData.get('email');

        // Basic input validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({ success: false, msg: "Valid email is required." }, { status: 400 });
        }

        // Check if email already exists to prevent duplicates
        const existingEmail = await EmailModel.findOne({ email });
        if (existingEmail) {
            return NextResponse.json({ success: false, msg: "This email is already subscribed." }, { status: 409 });
        }

        const emailData = { email }; // Use shorthand for object property if key and value are same
        await EmailModel.create(emailData);

        return NextResponse.json({ success: true, msg: "Email Subscribed Successfully!" }, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("Error in POST /api/subscriptions:", error);
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return NextResponse.json({ success: false, msg: "This email is already subscribed." }, { status: 409 });
        }
        return NextResponse.json({ success: false, msg: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// --- GET Request Handler (Fetch all subscriptions) ---
// This route should be protected and only accessible by authorized administrators.
export async function GET(request) {
    await ConnectDB(); // Connect to the database for this request

    // Apply authentication and authorization check
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json({ message: authResult.message }, { status: authResult.status });
    }
    // Further authorization: Check if the authenticated user has an 'admin' role
    // This assumes your User model has a 'role' field.
    if (authResult.user.role !== 'admin') { // Replace 'admin' with your actual admin role value
        return NextResponse.json({ message: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    try {
        // Fetch all emails, sorted by date (newest first)
        const emails = await EmailModel.find({}).sort({ date: -1 });
        return NextResponse.json({ emails, success: true }, { status: 200 });

    } catch (error) {
        console.error("Error in GET /api/subscriptions:", error);
        return NextResponse.json({ success: false, msg: "Error fetching emails", error: error.message }, { status: 500 });
    }
}

// --- DELETE Request Handler (Delete a subscription) ---
// This route should also be protected and only accessible by authorized administrators.
export async function DELETE(request) {
    await ConnectDB(); // Connect to the database for this request

    // Apply authentication and authorization check
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json({ message: authResult.message }, { status: authResult.status });
    }
    // Further authorization: Check if the authenticated user has an 'admin' role
    if (authResult.user.role !== 'admin') { // Replace 'admin' with your actual admin role value
        return NextResponse.json({ message: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    try {
        const id = request.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, msg: "Subscription ID is required for deletion." }, { status: 400 });
        }

        const result = await EmailModel.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ success: false, msg: "Subscription not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, msg: "Subscription Deleted Successfully!" }, { status: 200 });

    } catch (error) {
        console.error("Error in DELETE /api/subscriptions:", error);
        return NextResponse.json({ success: false, msg: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
