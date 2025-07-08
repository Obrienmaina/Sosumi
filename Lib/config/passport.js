// Lib/config/passport.js
// This file configures Passport.js strategies for authentication.

import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { User } from "@/Lib/models/blogmodel"; // Use alias if configured
import jwt from 'jsonwebtoken';

// Define the Google Callback URL from environment variables
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/google/callback';

// Log the callback URL for debugging purposes
console.log('Passport Google Strategy Callback URL:', GOOGLE_CALLBACK_URL);

// Configure Google OAuth 2.0 Strategy
passport.use(
    'google', // Name of the strategy
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '', // Ensure fallback for safety
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '', // Ensure fallback for safety
        callbackURL: GOOGLE_CALLBACK_URL, // Use the defined environment variable
        passReqToCallback: true // Allows access to req in callback if needed
    }, async (request, accessToken, refreshToken, profile, done) => { // Added 'request' parameter
        try {
            // Find user by email
            let user = await User.findOne({ email: profile.email });

            if (!user) {
                // --- New User: Create a new user profile ---
                // Generate a unique username based on display name or email
                let baseUsername = profile.displayName ?
                                    profile.displayName.replace(/\s/g, '').toLowerCase() :
                                    profile.email.split('@')[0].toLowerCase();

                let generatedUsername = baseUsername;
                let counter = 0;
                let existingUserWithUsername = null;

                // Loop to ensure username is unique
                do {
                    existingUserWithUsername = await User.findOne({ username: generatedUsername });
                    if (existingUserWithUsername) {
                        counter++;
                        generatedUsername = `${baseUsername}${counter}`;
                    }
                } while (existingUserWithUsername);

                // Create new user document
                user = new User({
                    email: profile.email,
                    name: profile.displayName,
                    username: generatedUsername, // Assign the unique username
                    firstName: profile.name?.givenName || null,
                    lastName: profile.name?.familyName || null,
                    profilePictureUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null, // Get profile picture
                    accessToken, // Store Google's access token
                    passwordHash: null, // No password hash for Google-registered users
                    country: null, // To be completed by user
                    agreedToTerms: false, // To be completed by user
                    role: 'user', // Default role for new users
                    tokens: [] // Initialize tokens array
                });
                await user.save();
                console.log("New Google user created:", user.email);

            } else {
                // --- Existing User: Update profile and generate new token ---
                console.log("Existing Google user found:", user.email);
                user.accessToken = accessToken; // Always update access token

                // Update name fields if they've changed on Google's side
                if (profile.displayName && user.name !== profile.displayName) {
                    user.name = profile.displayName;
                }
                if (profile.name?.givenName && user.firstName !== profile.name.givenName) {
                    user.firstName = profile.name.givenName;
                }
                if (profile.name?.familyName && user.lastName !== profile.name.familyName) {
                    user.lastName = profile.name.familyName;
                }
                if (profile.photos && profile.photos.length > 0 && user.profilePictureUrl !== profile.photos[0].value) {
                    user.profilePictureUrl = profile.photos[0].value;
                }
                // Do NOT update username here if it's already set (user might have customized it).
                // If username is null, you could generate one here for older Google users.
            }

            // Generate JWT for the user
            const token = jwt.sign(
                { id: user._id, created: Date.now().toString() },
                process.env.JWT_SECRET || 'supersecretjwtkey', // Use fallback for JWT_SECRET
                { expiresIn: '1d' } // Token valid for 1 day
            );

            // Add token to user's tokens array if not already present
            if (!user.tokens.includes(token)) {
                user.tokens.push(token);
            }
            await user.save(); // Save any updates to the user document

            // Call done() with user object and JWT token in info
            // This token will be used by the /api/auth/google/callback/route.js to set the cookie.
            done(null, user, { message: 'Authentication Successful', token });

        } catch (err) {
            console.error("Passport Google Strategy Error:", err);
            // Pass the error to the done callback
            done(err, false, { message: "Internal server error during authentication" });
        }
    })
);

// Passport serialization/deserialization (only necessary if using session-based authentication)
// If you are purely stateless with JWTs, these are not strictly needed for Passport's core function,
// but they don't hurt and can be useful for other Passport integrations.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
