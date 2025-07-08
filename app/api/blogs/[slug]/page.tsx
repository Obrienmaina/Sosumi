// app/blog/[slug]/page.tsx
// This component displays a single blog post, fetched from the backend.

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaTwitter, FaFacebook, FaBookmark, FaRegBookmark, FaHeart, FaRegHeart } from "react-icons/fa"; // Import icons
import axios from "axios"; // Import axios for API calls
import { toast } from "react-toastify"; // For notifications
import { TailSpin } from 'react-loader-spinner'; // Example loading spinner

// Define a type for your blog post structure (should match your backend model)
interface BlogPostType {
  _id: string; // MongoDB ID
  title: string;
  slug: string;
  description: string;
  content: string; // HTML content
  thumbnail: string; // Renamed from 'image' to 'thumbnail' to match backend
  date: string;
  category: string;
  author: string;
  authorImg: string;
  likesCount: number; // Assuming backend provides this
  comments: { _id: string; userId: string; content: string; date: string }[]; // Array of comments
  // Add other fields as per your BlogPost model
}

// Define props for the component
interface FullBlogPageProps {
  params: { slug: string };
}

const FullBlogPage: React.FC<FullBlogPageProps> = ({ params }) => {
  const router = useRouter();
  const { slug } = params; // Directly access slug from params

  const [blog, setBlog] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [userLiked, setUserLiked] = useState(false); // Track if current user liked
  const [likesCount, setLikesCount] = useState(0); // Actual likes count from backend
  const [comments, setComments] = useState<
    { _id: string; userId: string; content: string; date: string }[]
  >([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);


  // --- Fetch Blog Data from Backend ---
  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming your backend API for single blog post is /api/blog?slug=<slug>
        // Or better, a dedicated route like /api/blogs/[slug]
        const response = await axios.get(`/api/blog?slug=${slug}`); // Adjust endpoint as per your backend
        if (response.data.success && response.data.blog) {
          const fetchedBlog: BlogPostType = response.data.blog;
          setBlog(fetchedBlog);
          setLikesCount(fetchedBlog.likesCount || 0); // Initialize likes from fetched data
          setComments(fetchedBlog.comments || []); // Initialize comments from fetched data

          // Check bookmark status (still local for now, but can be backend-driven)
          const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
          setBookmarked(bookmarks.includes(fetchedBlog.slug));

          // Check if user has liked this post (requires backend check)
          // You'd need another API call here, e.g., /api/blogs/[slug]/likes/status
          // For now, assume false or implement a simple check if backend provides user's like status
          // setUserLiked(response.data.userLiked || false);

        } else {
          setError(response.data.msg || "Blog not found.");
          toast.error(response.data.msg || "Failed to load blog.");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog. Please try again.");
        toast.error("Failed to load blog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]); // Re-run when slug changes

  // --- Handle Bookmark (Client-side for now, consider backend for sync) ---
  const handleBookmark = () => {
    if (!blog) return;

    // For a backend-driven bookmark, you'd make an API call here.
    // Example: axios.post('/api/blogs/bookmark', { postId: blog._id });
    // And update state based on API response.

    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    let updatedBookmarks;
    if (bookmarked) {
      updatedBookmarks = bookmarks.filter((savedSlug: string) => savedSlug !== blog.slug);
      toast.info("Bookmark removed!");
    } else {
      updatedBookmarks = [...bookmarks, blog.slug];
      toast.success("Blog bookmarked!");
    }
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    setBookmarked(!bookmarked);
  };

  // --- Handle Like (Requires Backend API) ---
  const handleLike = async () => {
    if (!blog || likeLoading) return;

    setLikeLoading(true);
    try {
      // Assuming your backend API for likes is /api/blogs/[slug]/likes
      // This API should handle toggling the like status for the authenticated user
      const response = await axios.post(`/api/blogs/${blog.slug}/likes`); // Adjust endpoint
      if (response.data.success) {
        setLikesCount(response.data.likesCount); // Update count from backend
        setUserLiked(response.data.userLiked); // Update user's like status
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg || "Failed to update like.");
      }
    } catch (error) {
      console.error("Error liking blog:", error);
      toast.error("An error occurred while liking the blog.");
    } finally {
      setLikeLoading(false);
    }
  };

  // --- Handle Add Comment (Requires Backend API) ---
  const handleAddComment = async () => {
    if (!blog || !newComment.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      // Assuming your backend API for comments is /api/blogs/[slug]/comments
      const response = await axios.post(`/api/blogs/${blog.slug}/comments`, {
        content: newComment,
        // userId: (fetched from token on backend)
      });
      if (response.data.success && response.data.comment) {
        setComments((prevComments) => [...prevComments, response.data.comment]); // Add new comment from backend
        setNewComment("");
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg || "Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("An error occurred while adding the comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  // --- Handle Social Share ---
  const handleShare = (platform: "twitter" | "facebook") => {
    if (!blog) return;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${blog.slug}`; // Use env variable for base URL
    const text = `Check out this blog: ${blog.title}`;
    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      );
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TailSpin height="80" width="80" color="#4fa94d" ariaLabel="loading" />
        <p className="ml-4 text-gray-700">Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => router.push("/blog")} // Or router.back()
          className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  if (!blog) { // Should be caught by error state, but as a fallback
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-800 text-lg mb-4">Blog not found.</p>
        <button
          onClick={() => router.push("/blog")}
          className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-10 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">{blog.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
            <Image src={blog.authorImg} alt={blog.author} width={40} height={40} className="rounded-full object-cover"/>
            <p><strong>Author:</strong> {blog.author}</p>
            <p><strong>Published on:</strong> {new Date(blog.date).toLocaleDateString()}</p>
        </div>

        <Image
          src={blog.thumbnail} // Use 'thumbnail' as per backend model
          alt={blog.title}
          width={800}
          height={400} // Adjusted height for better aspect ratio
          className="w-full h-48 sm:h-64 object-cover rounded-lg mb-6"
          priority // Prioritize loading for LCP
        />
        {/* Render blog content using dangerouslySetInnerHTML */}
        <div
          className="text-gray-700 leading-relaxed prose prose-lg max-w-none" // Added prose classes for better typography
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>

        {/* Action Buttons: Like, Bookmark, Share */}
        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
              userLiked ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-500 text-white hover:bg-blue-600"
            } ${likeLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {likeLoading ? (
                <TailSpin height="20" width="20" color="#fff" ariaLabel="loading" />
            ) : userLiked ? (
                <FaHeart className="w-5 h-5" />
            ) : (
                <FaRegHeart className="w-5 h-5" />
            )}
            Like ({likesCount})
          </button>

          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
              bookmarked ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-orange-500 text-white hover:bg-orange-600"
            } ${bookmarkLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {bookmarkLoading ? (
                <TailSpin height="20" width="20" color="#fff" ariaLabel="loading" />
            ) : bookmarked ? (
                <FaBookmark className="w-5 h-5" />
            ) : (
                <FaRegBookmark className="w-5 h-5" />
            )}
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>

          <button
            onClick={() => handleShare("twitter")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <FaTwitter className="w-5 h-5" /> Twitter
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            <FaFacebook className="w-5 h-5" /> Facebook
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Comments ({comments.length})</h3>
          <div className="space-y-4 mb-6">
            {comments.length > 0 ? (
                comments.map((comment, index) => (
                    <div key={comment._id || index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-800">{comment.content}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            By User {comment.userId.substring(0, 8)}... on {new Date(comment.date).toLocaleDateString()}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
          </div>

          <h4 className="text-xl font-semibold mb-3 text-gray-800">Add a Comment</h4>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
            rows={4}
            placeholder="Write your comment here..."
            disabled={commentLoading}
          ></textarea>
          <button
            onClick={handleAddComment}
            disabled={commentLoading || !newComment.trim()}
            className={`mt-4 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center gap-2 ${
              commentLoading || !newComment.trim() ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {commentLoading ? (
                <TailSpin height="20" width="20" color="#fff" ariaLabel="loading" />
            ) : (
                'Add Comment'
            )}
          </button>
        </div>

        <button
          onClick={() => router.push("/blog")}
          className="mt-12 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          Back to Blogs
        </button>
      </div>
    </div>
  );
};

export default FullBlogPage;
