import React from 'react';
import PropTypes from 'prop-types';

const BlogItem = ({ image, title, description, link }) => {
  return (
    <div className="max-w-[330px] sm:max-w-[300px] bg-white border border-black hover:shadow-[-7px_7px_0px_#000000] p-4">
      <img src={image} alt={title} className="w-full h-[200px] object-cover mb-4" />
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-700 mb-4">{description}</p>
      <a
        href={link}
        className="text-[#007BFF] hover:underline"
      >
        Read More
      </a>
    </div>
  );
};

BlogItem.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default BlogItem;