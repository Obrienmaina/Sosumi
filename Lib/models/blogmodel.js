import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    BlogPost: {
  _id: ObjectId, // Unique identifier for the blog post
  title: String, // Title of the blog post 
  content: String, // The main content of the post, likely rich text HTML 
  author: ObjectId, // Reference to the User who created the post 
  tags: [String], // Array of tags for better organization and discoverability 
  category: String, // Category of the post (e.g., Technology, Travel) 
  featuredImageUrl: String, // URL to the featured image for the post 
  createdAt: Date, // Timestamp of post creation
  updatedAt: Date, // Timestamp of last update
  isDraft: Boolean, // Indicates if the post is a draft or published 
  uniqueUrlPath: String, // Unique URL path for the post 
  // For 'extra' features:
  likesCount: Number, // Number of likes or ratings 
  commentsCount: Number, // Number of comments
  isLiked: Boolean,
  isBookmarked: Boolean
},

Comment: {
  _id: ObjectId, // Unique identifier for the comment
  postId: ObjectId, // Reference to the BlogPost the comment belongs to 
  userId: ObjectId, // Reference to the User who made the comment 
  content: String, // The text content of the comment
  createdAt: {type: Date,
            default: Date.now()
  } // Timestamp of comment creation
},

Bookmark: {
  _id: ObjectId, // Unique identifier for the bookmark
  userId: ObjectId, // Reference to the User who bookmarked the post 
  postId: ObjectId, // Reference to the BlogPost that was bookmarked 
  bookmarkedAt: {type: Date,
            default: Date.now()
  } // Timestamp of when the post was bookmarked
},

Likes: {
  _id: ObjectId, // Unique identifier for the Likes
  postId: ObjectId, // Reference to the BlogPost that was liked
  likedAt: {type: Date,
            default: Date.now()
  } // Timestamp of when the post was liked
},

Category: {
  _id: ObjectId, // Unique identifier for the Likes
  postId: ObjectId, // Reference to the BlogPost that was liked
  categoryAt: {type: Date,
            default: Date.now()
  } // Timestamp of when the post was liked
},


User: {
  _id: ObjectId, // Unique identifier for the user
  username: String, // Publicly displayed username 
  email: String, // For login and notifications 
  passwordHash: String, // Hashed password for secure login 
  bio: String, // User's public biography 
  profilePictureUrl: String, // URL to the user's profile picture 
  registeredAt: {type: Date,
            default: Date.now()
  } // Timestamp of user registration
  // For 'extra' feature:
}
})

const BlogModel = mongoose.models.blog || mongoose.model('blog', Schema)
export default BlogModel