import React from "react";

export default function Vision() {
  return (
    <div className="mt-6 flex items-center justify-center gap-16 px-64 py-16 ">
      {/* Image */}
      <div className="flex-shrink-0">
        <img
          src="/vision2.jpg"
          alt="Vision Logo"
          className="w-80 h-50 object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center md:items-start max-w-2xl">
        <h4 className="text-themeGreen text-md font-medium ">Our Vision</h4>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2 text-center md:text-left">
          What We Stand For
        </h2>
        <p className="text-md  text-gray-700 text-center md:text-left">
          Our vision is to bridge the gap between lost and found items by
          creating a seamless platform that connects people with their
          belongings. We aim to foster a community where individuals can easily
          report lost items and claim those that have been found, ensuring no
          item goes unclaimed and no person feels the loss of their possessions
          for long.
        </p>
      </div>
    </div>
  );
}
