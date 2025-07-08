import mongoose from 'mongoose';

// 1. BlogPost Schema
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  authorImg: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// 2. Comment Schema
const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 3. Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  bookmarkedAt: { type: Date, default: Date.now },
});

// 4. Like Schema
const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  likedAt: { type: Date, default: Date.now },
});

// 5. Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true, default: null },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, default: null },
  name: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  country: { type: String },
  agreedToTerms: { type: Boolean, default: false },
  accessToken: { type: String },
  tokens: [{ type: String }],
  bio: { type: String, default: '' }, // Define once
  profilePictureUrl: { type: String, default: null }, // Define once
  registeredAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  // Add other new fields here if they are not already present:
  gender: { type: String, enum: ['Male', 'Female', 'Rather not say', null], default: null },
  homepageUrl: { type: String, default: null },
  company: { type: String, default: null },
  city: { type: String, default: null },
  interests: { type: String, default: '' },
});

// 6. Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  type: { type: String, enum: ['like', 'comment'], required: true }, // Type of notification
  message: { type: String, required: true }, // Notification message
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }, // Whether the notification has been read
});

// Create models (using the safe compilation pattern)
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Export models
module.exports = {
  BlogPost,
  Comment,
  Bookmark,
  Like,
  Category,
  User,
  Notification, // Export Notification model
};
