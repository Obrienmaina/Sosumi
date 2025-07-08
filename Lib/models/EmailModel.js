// Lib/models/EmailModel.js
// This file defines the Mongoose schema for email subscriptions.

import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({ // Renamed 'Schema' to 'emailSchema' for clarity
    email: {
        type: String,
        required: true,
        unique: true, // Ensure emails are unique
        lowercase: true, // Store emails in lowercase
        trim: true, // Trim whitespace
    },
    // Using timestamps: true is generally preferred for creation/update dates
    // If you specifically need a 'date' field different from 'createdAt', keep it.
    // Otherwise, you can remove this 'date' field and rely on 'createdAt'.
    // date: {
    //     type: Date,
    //     default: Date.now // Correct way to set default to current time on creation
    // }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

const EmailModel = mongoose.models.Email || mongoose.model('Email', emailSchema); // Changed model name to 'Email' for better consistency

export default EmailModel;
