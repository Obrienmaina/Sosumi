// Lib/models/blogmodel.js
// This file defines all Mongoose schemas and models for the blog application.

import mongoose from 'mongoose'; // Use import for ES Modules

// 1. User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true, // Ensure username is unique if provided
    sparse: true, // Allows multiple documents to have a null username
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email must be unique
    lowercase: true, // Store emails in lowercase
    trim: true, // Trim whitespace
  },
  passwordHash: { // Stores hashed password for traditional logins
    type: String,
    default: null
  },
  name: { type: String, trim: true }, // Full name (e.g., from Google profile)
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  country: { type: String, trim: true },
  agreedToTerms: { type: Boolean, default: false },
  accessToken: { type: String, default: null }, // Google OAuth access token
  tokens: [{ type: String }], // Array to store active JWTs for sessions
  bio: { type: String, default: '', maxlength: 500 }, // User biography
  profilePictureUrl: { type: String, default: null }, // URL to profile image (Cloudinary)
  registeredAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Rather not say', null], // Enum for predefined options
    default: null
  },
  homepageUrl: { type: String, default: null, trim: true },
  company: { type: String, default: null, trim: true },
  city: { type: String, default: null, trim: true },
  interests: { type: [String], default: [] }, // Changed to array of strings for interests
  role: {
    type: String,
    enum: ['user', 'admin'], // Define roles for authorization
    default: 'user',
  },
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// 2. BlogPost Schema
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: { // Unique URL-friendly identifier for the blog post
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: { // Short summary
    type: String,
    required: true,
    trim: true,
  },
  content: { // Full content (can be HTML from Draft.js)
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  authorId: { // Reference to the User who authored the post
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  author: { // Denormalized author name for quick display (optional, can be populated)
    type: String,
    required: true,
    trim: true,
  },
  authorImg: { // Denormalized author image for quick display (optional, can be populated)
    type: String,
    required: true,
  },
  thumbnail: { // URL to the main image for the blog post (Cloudinary URL)
    type: String,
    required: true, // Make required if every blog must have a thumbnail
  },
  date: { // Publication date
    type: Date,
    default: Date.now,
  },
  isPublished: { // For draft functionality
    type: Boolean,
    default: true,
  },
  likesCount: { // Denormalized count of likes
    type: Number,
    default: 0,
  },
  commentsCount: { // Denormalized count of comments
    type: Number,
    default: 0,
  },
  views: { // Optional: for popularity sorting
    type: Number,
    default: 0,
  }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// 3. Comment Schema
const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  // No need for createdAt here if timestamps: true is used
}, { timestamps: true });

// 4. Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  // No need for bookmarkedAt here if timestamps: true is used
}, { timestamps: true });

// 5. Like Schema
const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  // No need for likedAt here if timestamps: true is used
}, { timestamps: true });

// 6. Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // No need for createdAt here if timestamps: true is used
}, { timestamps: true });


// Create models (using the safe compilation pattern)
// This prevents Mongoose from trying to recompile models if they already exist.
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
export const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Export all models as named exports
// module.exports = { ... } is for CommonJS. Use export for ES Modules.
