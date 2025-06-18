const mongoose = require('mongoose');

// 1. BlogPost Schema (from your simpler, second example)
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: { // Stored as a simple string, not an ObjectId reference
    type: String,
    required: true
  },
  author: { // Stored as a simple string (author's name), not an ObjectId reference
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
    default: Date.now // Use Date.now for a function that runs on creation
  }
});

// 2. Comment Schema (Simplified, but referencing BlogPost and User IDs)
const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 3. Bookmark Schema (Simplified, but referencing BlogPost and User IDs)
const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  bookmarkedAt: { type: Date, default: Date.now },
});

// 4. Like Schema (Simplified, but referencing BlogPost and User IDs)
const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  likedAt: { type: Date, default: Date.now },
});

// 5. Category Schema (Simplified)
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// 6. User Schema (Simplified)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // Store hashed password
  bio: String, // Optional
  profilePictureUrl: String, // Optional
  registeredAt: { type: Date, default: Date.now },
});

// Create models (using the safe compilation pattern for hot-reloading environments)
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Export models
module.exports = {
  BlogPost,
  Comment,
  Bookmark,
  Like,
  Category,
  User,
};
