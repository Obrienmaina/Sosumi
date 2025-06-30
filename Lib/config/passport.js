import passport from "passport";
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';
import { User } from "../models/BlogModel"; 
import jwt from 'jsonwebtoken'

passport.use(
    'google',
    new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/api/google/callback'

}, async (accessToken, refreshToken, profile, done) =>{
    try{
        const obj = await User.findOne({ email: profile.email });
        if(!obj) {
            // New User - Generate a unique username
            let baseUsername = profile.displayName ? 
                                profile.displayName.replace(/\s/g, '').toLowerCase() : 
                                profile.email.split('@')[0].toLowerCase();
            
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

            const newUser = new User({
                email: profile.email,
                name: profile.displayName,
                accessToken,
                firstName: profile.name.givenName || null,   // Populate from profile if available
                lastName: profile.name.familyName || null,  // Populate from profile if available
                country: null,         // Initialize for profile completion (Google profile often doesn't have country directly)
                agreedToTerms: false,  // Initialize for profile completion
                passwordHash: null,     // Explicitly set to null for Google-only users
                username: generatedUsername // <<< --- THIS IS THE KEY ADDITION ---
            });
            await newUser.save();

            const token = jwt.sign(
                { id: newUser._id, created: Date.now().toString() },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            newUser.tokens.push(token);
            await newUser.save();
            done(null, newUser, {message: 'Authentication Successful', token});

        } else {
            // User exists, sign in
            // Optional: Update existing user's name/profile fields if they changed in Google
            obj.accessToken = accessToken; // Ensure access token is updated for existing users
            if (profile.displayName && obj.name !== profile.displayName) {
                obj.name = profile.displayName;
            }
            if (profile.name && obj.firstName !== profile.name.givenName) {
                obj.firstName = profile.name.givenName;
            }
            if (profile.name && obj.lastName !== profile.name.familyName) {
                obj.lastName = profile.name.familyName;
            }
            // Do NOT update username here for existing users, as it might be manually set.

            const token = jwt.sign(
                { id: obj._id, created: Date.now().toString() },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            // Only add token if it's not already in the array to avoid duplicates
            if (!obj.tokens.includes(token)) {
                obj.tokens.push(token);
            }
            await obj.save(); // Save any updates made above
            done(null, obj, {message: 'Authentication Successful', token});
        }
    }
    catch(err) {
        console.error("Passport Google Strategy Error:", err); 
        done(err, false, {message: "Internal server error during authentication"});
    }
}
));

// Passport serialization/deserialization (needed if you use sessions, but good practice to have)
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