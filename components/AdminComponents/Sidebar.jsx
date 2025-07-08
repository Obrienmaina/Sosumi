// app/components/AdminComponents/Sidebar.jsx
'use client'; // Ensure it's a client component if using Link or other interactive elements

import { assets } from '@/Assets/assets';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname for active link styling

const Sidebar = () => {
    const pathname = usePathname(); // Get current path for active link styling

    // Helper function for link styling - MOVED HERE
    const getLinkClasses = (path) => {
        return `flex items-center gap-3 font-medium px-4 py-3 rounded-lg transition-colors duration-200
                ${pathname === path ? 'bg-[#5936BB] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'}`;
    };

    return (
        <div className='flex flex-col bg-gray-50 border-r border-gray-200 min-h-screen'>
            {/* Logo Section */}
            <div className='px-4 sm:pl-8 py-4 border-b border-gray-200'>
                <Image src={assets.logo} width={120} height={40} alt='Sosumi Logo' />
            </div>

            {/* Navigation Links */}
            <div className='flex-grow py-8 px-4'>
                <nav className='space-y-4'>
                    {/* Removed 'Add Blogs' link from admin sidebar */}
                    {/* <Link href='/admin/addBlog' className={getLinkClasses('/admin/addBlog')}>
                        <Image src={assets.add_icon} alt='Add Blog' width={24} height={24} />
                        <p className='hidden sm:inline-block'>Add Blogs</p>
                    </Link> */}
                    <Link href='/admin/blogList' className={getLinkClasses('/admin/blogList')}>
                        <Image src={assets.blog_icon} alt='Blog List' width={24} height={24} />
                        <p className='hidden sm:inline-block'>Blog Lists</p>
                    </Link>
                    <Link href='/admin/subscriptions' className={getLinkClasses('/admin/subscriptions')}>
                        <Image src={assets.email_icon} alt='Subscriptions' width={24} height={24} />
                        <p className='hidden sm:inline-block'>Subscriptions</p>
                    </Link>
                    {/* Assuming you will create a /admin/viewDrafts page */}
                    <Link href='/admin/viewDrafts' className={getLinkClasses('/admin/viewDrafts')}>
                        {/* Ensure assets.draft_icon exists or use a placeholder */}
                        <Image src={assets.draft_icon || '/icons/draft_icon.png'} alt='View Drafts' width={24} height={24} />
                        <p className='hidden sm:inline-block'>View Drafts</p>
                    </Link>
                </nav>

            </div>

        </div>
    );
};

export default Sidebar;
