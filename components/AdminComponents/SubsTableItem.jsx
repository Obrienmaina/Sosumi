// app/components/AdminComponents/SubsTableItem.jsx
'use client'; // Ensure it's a client component

import React from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2 for confirmation dialogs

const SubsTableItem = ({ email, mongoId, deleteEmail, date }) => {
    const emailDate = new Date(date);

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
                // Call the deleteEmail function passed from the parent component
                deleteEmail(mongoId);
            }
        });
    };

    return (
        <tr className='bg-white border-b hover:bg-gray-50 transition-colors duration-150 text-left'>
            <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                {email || "No Email"}
            </th>
            <td className='px-6 py-4 hidden sm:block text-gray-600'>
                {emailDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </td>
            <td onClick={handleDeleteClick} className='px-6 py-4 cursor-pointer text-red-500 hover:text-red-700 font-bold transition-colors duration-150'>
                <i className="fa-solid fa-trash-can"></i> {/* Font Awesome trash icon */}
            </td>
        </tr>
    );
};

export default SubsTableItem;
