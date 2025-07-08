// app/blog/[slug]/page.tsx
// This component displays a single blog post, fetched from the backend.

"use client";

import React, { useEffect, useState, use } from "react"; // Import 'use' hook
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaTwitter, FaFacebook, FaBookmark, FaRegBookmark, FaHeart, FaRegHeart } from "react-icons/fa"; // Import icons
import axios from "axios"; // Import axios for API calls
import { toast } from "react-toastify"; // For notifications
import { TailSpin } from 'react-loader-spinner'; // Example loading spinner
import Breadcrumbs from '@/components/Breadcrumbs'; // Assuming you have a Breadcrumbs component
import Link from 'next/link'; // Import Link for navigation to edit page

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
  authorId: string; // Add authorId to check for authorization
  authorImg: string;
  likesCount: number; // Assuming backend provides this
  commentsCount: number; // Denormalized count of comments
  views: number; // For popularity tracking
}

// Define a type for comments (matching backend Comment model structure)
interface CommentType {
  _id: string;
  userId: { // Populated user object
    _id: string;
    username?: string;
    name?: string;
    profilePictureUrl?: string;
  };
  content: string;
  createdAt: string; // Using createdAt from timestamps
}

// Define props for the component
interface FullBlogPageProps {
  params: { slug: string };
}

const FullBlogPage: React.FC<FullBlogPageProps> = ({ params }) => {
  const router = useRouter();

  // CORRECTED: Use React.use() to unwrap params as suggested by Next.js warning.
  const { slug } = use(params);

  const [blog, setBlog] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for interactive features
  const [bookmarked, setBookmarked] = useState(false);
  const [userLiked, setUserLiked] = useState(false); // Track if current user liked
  const [likesCount, setLikesCount] = useState(0); // Actual likes count from backend
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");

  // Loading states for actions
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // State for current user's ID and role for authorization checks
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);


  // --- Fetch Blog Data and Interactive States from Backend ---
  useEffect(() => {
    const fetchBlogAndInteractiveStates = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Blog Post Data
        const blogResponse = await axios.get(`/api/blog/${slug}`);
        if (blogResponse.data.success && blogResponse.data.blog) {
          const fetchedBlog: BlogPostType = blogResponse.data.blog;
          setBlog(fetchedBlog);
          setLikesCount(fetchedBlog.likesCount || 0); // Initialize likes from fetched data
        } else {
          setError(blogResponse.data.msg || "Blog not found.");
          toast.error(blogResponse.data.msg || "Failed to load blog.");
          setLoading(false);
          return; // Stop execution if blog not found
        }

        // 2. Fetch Current User's Data for Authorization
        try {
          const userResponse = await axios.get('/api/auth/user');
          if (userResponse.data.user) {
            setCurrentUserId(userResponse.data.user._id);
            setCurrentUserRole(userResponse.data.user.role);
          }
        } catch (userErr: any) {
          // It's okay if user is not logged in, just won't have auth for actions
          console.warn("User not authenticated or error fetching user data:", userErr);
          setCurrentUserId(null);
          setCurrentUserRole(null);
        }

        // 3. Fetch User's Like Status
        try {
          const likeStatusResponse = await axios.get(`/api/blogs/${slug}/likes`);
          if (likeStatusResponse.data.success) {
            setUserLiked(likeStatusResponse.data.userLiked);
          } else {
            console.warn("Could not fetch like status:", likeStatusResponse.data.msg);
          }
        } catch (likeErr: any) {
          // 401 means not authenticated, which is fine for public pages.
          // Other errors might indicate a problem.
          if (axios.isAxiosError(likeErr) && likeErr.response?.status === 401) {
            console.error("Error fetching like status: Not authenticated."); // Specific message for 401
          } else if (axios.isAxiosError(likeErr) && likeErr.response?.status === 404) {
             console.error("Error fetching like status: API route not found (404)."); // Specific message for 404
          } else {
            console.error("Error fetching like status:", likeErr);
          }
          setUserLiked(false); // Default to not liked if error or not authenticated
        }

        // 4. Fetch User's Bookmark Status
        try {
          const bookmarkStatusResponse = await axios.get(`/api/blogs/${slug}/bookmark`);
          if (bookmarkStatusResponse.data.success) {
            setBookmarked(bookmarkStatusResponse.data.bookmarked);
          } else {
            console.warn("Could not fetch bookmark status:", bookmarkStatusResponse.data.msg);
          }
        } catch (bookmarkErr: any) {
          if (axios.isAxiosError(bookmarkErr) && bookmarkErr.response?.status === 404) {
            console.warn("Bookmark API route not found (404). Ensure app/api/blogs/[slug]/bookmark/route.js exists.");
          } else if (axios.isAxiosError(bookmarkErr) && bookmarkErr.response?.status !== 401) {
            console.error("Error fetching bookmark status:", bookmarkErr);
          }
          setBookmarked(false); // Default to not bookmarked if error or not authenticated
        }

        // 5. Fetch Comments
        try {
          const commentsResponse = await axios.get(`/api/blogs/${slug}/comments`);
          if (commentsResponse.data.success) {
            setComments(commentsResponse.data.comments || []);
          } else {
            console.warn("Could not fetch comments:", commentsResponse.data.msg);
          }
        } catch (commentsErr: any) {
          console.error("Error fetching comments:", commentsErr);
          setComments([]); // Default to empty array if error
        }

      } catch (err: any) { // Catch any errors from the main blog fetch
        console.error("Error fetching blog or interactive states:", err);
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.msg || "Failed to load blog post. Please try again.");
          toast.error(err.response.data.msg || "Failed to load blog post. Please try again.");
        } else {
          setError("Failed to load blog post. An unexpected error occurred.");
          toast.error("Failed to load blog post. An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogAndInteractiveStates();
    }
  }, [slug]); // Re-run when slug changes

  // --- Handle Bookmark (Now Backend-driven) ---
  const handleBookmark = async () => {
    if (!blog || bookmarkLoading) return;

    setBookmarkLoading(true);
    try {
      const response = await axios.post(`/api/blogs/${blog.slug}/bookmark`);
      if (response.data.success) {
        setBookmarked(response.data.bookmarked); // Update state based on backend response
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg || "Failed to update bookmark.");
      }
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Please sign in to bookmark blogs.");
        router.push('/signin');
      } else {
        toast.error("An error occurred while bookmarking the blog.");
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  // --- Handle Like (Backend-driven) ---
  const handleLike = async () => {
    if (!blog || likeLoading) return;

    setLikeLoading(true);
    try {
      const response = await axios.post(`/api/blogs/${blog.slug}/likes`);
      if (response.data.success) {
        setLikesCount(response.data.likesCount); // Update count from backend
        setUserLiked(response.data.userLiked); // Update user's like status
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg || "Failed to update like.");
      }
    } catch (error: any) {
      console.error("Error liking blog:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Please sign in to like blogs.");
        router.push('/signin');
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error("Like API route not found. Please ensure app/api/blogs/[slug]/likes/route.ts exists.");
      } else {
        toast.error("An error occurred while liking the blog.");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  // --- Handle Add Comment (Backend-driven) ---
  const handleAddComment = async () => {
    if (!blog || !newComment.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      const response = await axios.post(`/api/blogs/${blog.slug}/comments`, {
        content: newComment,
      });
      if (response.data.success && response.data.comment) {
        setComments((prevComments) => [...prevComments, response.data.comment]); // Add new comment from backend
        setNewComment("");
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg || "Failed to add comment.");
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Please sign in to comment.");
        router.push('/signin');
      } else {
        toast.error("An error occurred while adding the comment.");
      }
    } finally {
      setCommentLoading(false);
    }
  };

  // --- Handle Social Share ---
  const handleShare = (platform: "twitter" | "facebook") => {
    if (!blog) return;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/blog/${blog.slug}`; // Use env variable or current origin
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

  // --- Check if current user can edit this blog ---
  const canEdit = blog && currentUserId && (blog.authorId === currentUserId || currentUserRole === 'admin');


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

  const breadcrumbPaths = [
    { label: 'Home', href: '/' },
    { label: 'Blogs', href: '/blog' },
    { label: blog.title, href: `/blog/${blog.slug}` },
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-10 lg:p-12">
        <Breadcrumbs paths={breadcrumbPaths} />

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">{blog.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
            <Image src={blog.authorImg} alt={blog.author} width={40} height={40} className="rounded-full object-cover"/>
            <p><strong>Author:</strong> {blog.author}</p>
            <p><strong>Published on:</strong> {new Date(blog.date).toLocaleDateString()}</p>
        </div>

        {/* Edit Blog Button (Conditional Rendering) */}
        {canEdit && (
          <div className="mb-6 text-right">
            <Link
              href={`/edit-blog/${blog.slug}`}
              className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
            >
              Edit Blog
            </Link>
          </div>
        )}

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
                        <div className="flex items-center mb-2">
                            {comment.userId?.profilePictureUrl && (
                                <Image
                                    src={comment.userId.profilePictureUrl}
                                    alt={comment.userId.username || comment.userId.name || 'User'}
                                    width={30}
                                    height={30}
                                    className="rounded-full object-cover mr-2"
                                />
                            )}
                            <p className="font-medium text-gray-800">
                                {comment.userId?.username || comment.userId?.name || `User ${comment.userId?._id.substring(0, 8)}...`}
                            </p>
                            <span className="text-sm text-gray-500 ml-auto">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
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
