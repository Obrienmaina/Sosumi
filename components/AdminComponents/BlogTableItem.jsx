// app/components/AdminComponents/BlogTableItem.jsx
'use client'; // Ensure it's a client component if using interactive elements

import { assets } from '@/Assets/assets';
import Image from 'next/image';
import React from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2 for confirmation dialogs

const BlogTableItem = ({ authorImg, title, author, date, deleteBlog, mongoId }) => {
    const BlogDate = new Date(date);

    // Function to handle delete click with confirmation
    const handleDeleteClick = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Red color for delete
            cancelButtonColor: '#3085d6', // Blue color for cancel
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Call the deleteBlog function passed from the parent component
                deleteBlog(mongoId);
            }
        });
    };

    return (
        <tr className='bg-white border-b hover:bg-gray-50 transition-colors duration-150'>
            <th scope='row' className='items-center gap-3 hidden sm:flex px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                <Image
                    width={40}
                    height={40}
                    src={authorImg || assets.profile_icon} // Use fallback if authorImg is null/undefined
                    alt={author || "Author"}
                    className="rounded-full object-cover"
                />
                <p>{author || "No author"}</p>
            </th>
            <td className='px-6 py-4 text-gray-800'>
                {title || "No title"}
            </td>
            <td className='px-6 py-4 text-gray-600'>
                {BlogDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </td>
            <td onClick={handleDeleteClick} className='px-6 py-4 cursor-pointer text-red-500 hover:text-red-700 font-bold transition-colors duration-150'>
                <i className="fa-solid fa-trash-can"></i> {/* Font Awesome trash icon */}
            </td>
        </tr>
    );
};

export default BlogTableItem;
