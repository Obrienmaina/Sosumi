// app/components/Breadcrumbs.jsx
import Link from "next/link";
import React from 'react'; // Explicitly import React

const Breadcrumbs = ({ paths }) => {
  return (
    <div className="text-gray-600 text-sm mb-4">
      {paths.map((path, index) => (
        <span key={index}>
          <Link href={path.href} className="hover:underline text-indigo-600 hover:text-indigo-800 transition-colors">
            {path.label}
          </Link>
          {index < paths.length - 1 && <span className="mx-2">/</span>} {/* Add space around slash */}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
