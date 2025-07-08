"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaTwitter, FaFacebook } from "react-icons/fa"; // Import icons from react-icons

export const blog_data = [
  {
    id: 1,
    title: "A Detailed Step-by-Step Guide to Manage Your Lifestyle",
    slug: "detailed-lifestyle-guide",
    description: "How to retire early",
    content: `
      <p>Retiring early might sound like a dream, but it can be a practical and achievable goal with the right planning and discipline. This guide outlines a lifestyle management approach that helps you align your daily habits with long-term financial freedom.</p>
    `,
    image: "/images/photo1.png",
    date: new Date().toISOString(),
    category: "Lifestyle",
    author: "Naki Des",
    author_img: "/images/profile1.jpeg",
    socials: {
      twitter: "#",
      linkedin: "#",
      likes: 0, // Initialize likes property
    },
    comments: [], // Add comments property
  },
  {
    id: 2,
    title: "10 Simple Habits to Improve Your Mental Health",
    slug: "mental-health-habits",
    description: "Practical strategies for everyday calm",
    content: `
      <p>🧠 “10 Simple Habits to Improve Your Mental Health”</p>
      <p>Discover ten practical habits to boost mental wellbeing and reduce stress—real strategies that fit into everyday life.</p>
      <p></p>
      <p>1. Start Your Day Without Your Phone</p>
      <p>Avoid diving into social media or emails the moment you wake up. Instead, stretch, drink water, or take 5 minutes to breathe. Set your own tone for the day.</p>
      <p></p>
      <p>2. Practice Gratitude</p>
      <p>Write down three things you’re thankful for every evening. Studies show that gratitude can significantly improve mood and resilience.</p>
      <p></p>
      <p>3. Get Outside Daily</p>
      <p>Nature exposure—even for 10 minutes—has been linked to lower anxiety and improved concentration. A short walk can do wonders.</p>
      <p></p>
      <p>4. Sleep Like It Matters (Because It Does)</p>
      <p>Create a consistent sleep routine. Wind down with no screens before bed, keep your room cool and dark, and aim for 7–9 hours.</p>
      <p></p>
      <p>5. Move Your Body</p>
      <p>You don’t need a gym membership. Stretching, dancing, or walking all release endorphins that help balance stress hormones.</p>
      <p></p>
      <p>6. Limit Doomscrolling</p>
      <p>Set app limits or “focus time” on your phone. Mindless scrolling adds background stress and disrupts sleep patterns.</p>
      <p></p>
      <p>7. Talk It Out</p>
      <p>Whether with a friend, journal, or therapist, expressing how you feel reduces internal pressure and helps you process emotions.</p>
      <p></p>
      <p>8. Create Tech-Free Zones</p>
      <p>Designate parts of your day or home where phones and screens are off-limits—like the dinner table or your bedroom.</p>
      <p></p>
      <p>9. Practice Mindfulness (Without the Woo-Woo)</p>
      <p>Mindfulness just means paying attention. Try 5 minutes of focused breathing or simply eating a meal without distractions.</p>
      <p></p>
      <p>10. Say “No” Without Guilt</p>
      <p>Overcommitting is a fast track to burnout. Respect your limits. Boundaries are a form of self-respect—not selfishness.</p>
      <p></p>
      <p>“Mental health is not a destination, but a daily practice. Small actions, repeated often, create lasting change.”</p>
    `,
    image: "/images/photo2.png",
    date: new Date().toISOString(),
    category: "Health",
    author: "Amara Ndebele",
    author_img: "/images/profile2.jpeg",
    socials: {
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    id: 3,
    title: "Mastering Your Finances in Your 20s",
    slug: "master-finances-in-20s",
    description: "Budgeting, saving, and investing made simple",
    content: `
      <p>Your 20s are the perfect time to build habits that will set you up for life. Start by creating a realistic budget that includes saving—even small amounts add up. Build an emergency fund to cover at least 3 months of expenses.</p>
      <p>Understand your income and track where your money goes. Learn about compound interest, and don’t shy away from investing in index funds or retirement accounts. Focus on needs over wants and avoid debt traps like buy-now-pay-later schemes.</p>
      <p>*“Being broke in your 20s is normal. Staying broke because you never planned is not.”*</p>
    `,
    image: "/images/photo3.png",
    date: "2025-06-24T12:00:00.000Z",
    category: "Finance",
    author: "Leo Matovu",
    author_img: "/images/profile_icon_3.png",
    socials: {
      twitter: "https://twitter.com/leomatovu",
      linkedin: "https://linkedin.com/in/leomatovu"
    }
  },
  {
    id: 6,
    title: "Traveling on a Budget: Secrets from a Pro",
    slug: "budget-travel-secrets",
    description: "Explore the world without draining your savings",
    content: `
      <p>Budget travel is less about sacrifice and more about strategy. Book flights early, use price alerts, and travel during shoulder seasons. Opt for hostels, shared Airbnbs, or overnight buses to save on accommodation and transit.</p>
      <p>Use local apps for food, transport, and cultural events. Travel light to avoid baggage fees. And remember, slow travel is not only cheaper—it’s also more fulfilling.</p>
      <p>*“A tight budget isn’t a barrier. It’s a creative challenge.”*</p>
    `,
    image: "/images/photo6.png",
    date: "2025-06-24T12:00:00.000Z",
    category: "Travel",
    author: "Tariq L.",
    author_img: "/images/profile_icon_6.png",
    socials: {
      twitter: "https://twitter.com/tariql",
      linkedin: "https://linkedin.com/in/tariql"
    }
  },
  {
    id: 8,
    title: "How I Built My First App in 30 Days",
    slug: "first-app-in-30-days",
    description: "Lessons from a newbie turned full-stack dev",
    content: `
      <p>When I set out to build my first app, I had no idea what I was doing. But I set a 30-day deadline and learned as I went. I chose React for the frontend and Firebase for the backend. The key? Start small and iterate.</p>
      <p>I broke down the idea into screens and features, learned from YouTube and docs, and kept pushing updates—even ugly ones. In the end, I had a working MVP.</p>
      <p>*“Code something ugly. Launch it anyway. Perfection comes later.”*</p>
    `,
    image: "/images/photo8.png",
    date: "2025-06-24T12:00:00.000Z",
    category: "Tech",
    author: "David Z.",
    author_img: "/images/profile_icon_8.png",
    socials: {
      twitter: "https://twitter.com/davidz",
      linkedin: "https://linkedin.com/in/davidz"
    }
  },
];

const FullBlogPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const router = useRouter();
  const [blog, setBlog] = useState<typeof blog_data[0] | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(0); // State for likes
  const [comments, setComments] = useState<string[]>([]); // State for comments
  const [newComment, setNewComment] = useState(""); // State for new comment input

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params; // Unwrap the params Promise
      const foundBlog = blog_data.find((b) => b.slug === resolvedParams.slug);
      setBlog(foundBlog || null);

      // Check if the blog is already bookmarked
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      setBookmarked(bookmarks.includes(resolvedParams.slug));

      // Initialize likes and comments (mock data for now)
      setLikes(foundBlog?.socials.likes || 0);
      setComments(foundBlog?.comments || []);
    };

    fetchParams();
  }, [params]);

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (bookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter((savedSlug: string) => savedSlug !== blog?.slug);
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
      setBookmarked(false);
    } else {
      // Add bookmark
      localStorage.setItem("bookmarks", JSON.stringify([...bookmarks, blog?.slug]));
      setBookmarked(true);
    }
  };

  const handleLike = () => {
    setLikes((prevLikes) => prevLikes + 1);
    // Optionally, send a request to the backend to persist likes
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments((prevComments) => [...prevComments, newComment]);
      setNewComment("");
      // Optionally, send a request to the backend to persist the comment
    }
  };

  // Handle case where blog is not found
  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-800 text-lg">Blog not found.</p>
        <button
          onClick={() => router.push("/blog")}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  const handleShare = (platform: "twitter" | "facebook") => {
    const url = `https://yourwebsite.com/blog/${blog.slug}`;
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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-10 lg:p-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">{blog.title}</h1>
        <p className="text-gray-600 mb-4">
          <strong>Author:</strong> {blog.author}
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Published on:</strong> {new Date(blog.date).toLocaleDateString()}
        </p>
        <Image
          src={blog.image}
          alt={blog.title}
          width={800}
          height={256}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
        {/* Render blog content using dangerouslySetInnerHTML */}
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Like ({likes})
        </button>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className={`mt-8 px-4 py-2 rounded-md ${
            bookmarked ? "bg-purple-500 text-white" : "bg-orange-500 text-white"
          } hover:bg-purple-600 transition-colors`}
        >
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>

        {/* Social Media Sharing Buttons */}
        <div className="mt-8 flex gap-4">
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
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <ul className="space-y-2">
            {comments.map((comment, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded-md">
                {comment}
              </li>
            ))}
          </ul>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mt-4"
            rows={3}
            placeholder="Add a comment..."
          ></textarea>
          <button
            onClick={handleAddComment}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Add Comment
          </button>
        </div>

        <button
          onClick={() => router.push("/blog")}
          className="mt-8 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Back to Blogs
        </button>
      </div>
    </div>
  );
};

export default FullBlogPage;