'use client';

import { assets } from '@/Assets/assets';
import axios from 'axios';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Editor, EditorState } from 'draft-js';
import Breadcrumbs from "@/components/Breadcrumbs";

const AddBlogPage = () => {
  const router = useRouter();
  const breadcrumbPaths = [
    { href: "/", label: "Home" },
    { href: "/admin", label: "Admin" },
    { href: "/admin/addBlog", label: "Add Blog" },
  ];

  const [image, setImage] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [data, setData] = useState({
    title: "",
    category: "Startup",
    author: "Alex Bennett",
    authorImg: "/author_img.png"
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const content = editorState.getCurrentContent().getPlainText();

    // Basic validation
    if (!image) {
      toast.error("Please upload a thumbnail image.");
      return;
    }
    if (!data.title.trim()) {
      toast.error("Please enter a blog title.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter blog content.");
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', content); // Plain text content from Draft.js
    formData.append('category', data.category);
    formData.append('author', data.author);
    formData.append('authorImg', data.authorImg);
    formData.append('image', image);

    try {
      const response = await axios.post('/api/blog', formData);
      if (response.data.success) {
        toast.success(response.data.msg);
        setImage(false);
        setEditorState(EditorState.createEmpty()); // Reset editor content
        setData({
          title: "",
          category: "Startup",
          author: "Alex Bennett",
          authorImg: "/author_img.png"
        });
        router.push('/profile/complete'); // Redirect after successful submission
      } else {
        toast.error(response.data.msg || "Error adding blog");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.msg || "An error occurred with the server.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error submitting blog:", error);
    }
  };

  const onSaveDraftHandler = async (e) => {
    e.preventDefault();

    const content = editorState.getCurrentContent().getPlainText();

    // Basic validation for drafts
    if (!data.title.trim()) {
      toast.error("Please enter a blog title.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter blog content.");
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', content); // Plain text content from Draft.js
    formData.append('category', data.category);
    formData.append('author', data.author);
    formData.append('authorImg', data.authorImg);
    formData.append('image', image);

    try {
      const response = await axios.post('/api/draft', formData); // Save as draft endpoint
      if (response.data.success) {
        toast.success("Draft saved successfully!");
        setImage(false);
        setEditorState(EditorState.createEmpty()); // Reset editor content
        setData({
          title: "",
          category: "Startup",
          author: "Alex Bennett",
          authorImg: "/author_img.png"
        });
      } else {
        toast.error(response.data.msg || "Error saving draft");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.msg || "An error occurred with the server.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error saving draft:", error);
    }
  };

  return (
    <div>
      <Breadcrumbs paths={breadcrumbPaths} />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-100 p-4">
          {/* Sidebar content remains intact */}
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <form className="pt-5 px-5 sm:pt-12 sm:pl-16">
            <p className="text-xl">Upload thumbnail</p>
            <label htmlFor="image">
              <Image
                className="mt-4 cursor-pointer"
                src={!image ? assets.upload_area : URL.createObjectURL(image)}
                width={140}
                height={70}
                alt="Upload Area"
              />
            </label>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
              required
            />

            <p className="text-xl mt-4">Blog title</p>
            <input
              name="title"
              onChange={onChangeHandler}
              value={data.title}
              className="w-full sm:w-[500px] mt-4 px-4 py-3 border"
              type="text"
              placeholder="Type here"
              required
            />

            <p className="text-xl mt-4">Blog Description</p>
            <div className="mt-4 border p-4 h-64 mb-16">
              <Editor editorState={editorState} onChange={handleEditorChange} />
            </div>

            <p className="text-xl mt-4">Blog category</p>
            <select
              name="category"
              onChange={onChangeHandler}
              value={data.category}
              className="w-40 mt-4 px-4 py-3 border text-gray-500"
            >
              <option value="Startup">Startup</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>

            <div className="mt-8 flex gap-4">
              <button
                onClick={onSubmitHandler}
                className="w-40 h-12 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors duration-200"
              >
                Post Blog
              </button>
              <button
                onClick={onSaveDraftHandler}
                className="w-40 h-12 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
              >
                Save as Draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlogPage;
