"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CgArrowRight } from "react-icons/cg";
import { LuSearch } from "react-icons/lu";
import Link from "next/link";

const SearchSection = ({ sendDataToParent, blogs }) => {
  const [search, setSearch] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      sendDataToParent(1, search);
    } catch (error) {
      console.error("Error fetching Blogs:", error);
    }
  };

  const handleFilter = async (topic) => {
    try {
      sendDataToParent(2, topic);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const topics = [
    "All",
    "Diabetes",
    "Cancer",
    "Virus",
    "Healthy Food",
    "Lifestyle",
  ];

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 xl:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              GPDN Blog
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed">
              Read updates on GPDN Blog, corporate initiatives, and partnerships
              to get insight into the world's work marketplace.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LuSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="searchText"
                    placeholder="Search articles, topics, or keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 placeholder-gray-400"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* All Blogs Grid Section */}
        {blogs && blogs.length > 0 ? (
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {blogs.map((data, index) => (
                <article
                  key={data._id || index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden group"
                >
                  {/* Image Container */}
                  <div className="relative h-48 sm:h-56 lg:h-52 xl:h-56 overflow-hidden">
                    <Image
                      src={
                        data.thumbnail
                          ? data.thumbnail
                          : "/placeholder-image.jpg"
                      }
                      alt={data.title || `Blog image ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      priority={index < 4}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 lg:p-4 xl:p-5">
                    {/* Date */}
                    <div className="flex items-center mb-3">
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        {formatDate(data.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg lg:text-base xl:text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {data.title || "Untitled Article"}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {data.description && data.description.length > 120
                        ? data.description
                            .slice(0, 120)
                            .split(" ")
                            .slice(0, -1)
                            .join(" ") + " ..."
                        : data.description || "No description available"}
                    </p>

                    {/* Read More Button */}
                    <Link
                      href={`/blog/${data._id}`}
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group/btn"
                    >
                      <span>Read More</span>
                      <CgArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md">
                  We couldn't find any articles matching your search. Try
                  different keywords or check back later.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
