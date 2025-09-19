"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CgArrowRight } from "react-icons/cg";
import Link from "next/link";
import blogRoutes from "@/services/endPoints/blogEndpoints";
import Api from "@/services/axios";
import noBlogs from "../../app/assets/HOMEPAGE/SectionFive/no-blogs.png";

const SectionFive = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await Api.get(blogRoutes.FetchNewsAndBlogs);
        console.log("API Response:", response);

        const blogsData =
          response.data.blogs || response.data.data || response.data;
        setBlogs(Array.isArray(blogsData) ? blogsData.slice(-3) : []);
      } catch (error) {
        console.error("Error fetching blogs:", {
          message: error.message,
          endpoint: blogRoutes.FetchNewsAndBlogs,
          timestamp: new Date().toISOString(),
          response: error.response?.data,
        });
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  const SkeletonBlogCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image Placeholder */}
      <div className="h-48 sm:h-56 lg:h-52 xl:h-56 w-full bg-gray-200"></div>

      {/* Content Placeholder */}
      <div className="p-4 sm:p-5 lg:p-4 xl:p-5">
        <div className="space-y-3">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-5 bg-gray-200 rounded w-4/5"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded-full mt-4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 xl:py-20">
      <div className="max-w mx-auto sm:px-6 md:px-0 ">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            Latest News & Blogs
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest insights, news, and updates from our
            community
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <SkeletonBlogCard />
            <SkeletonBlogCard />
            <SkeletonBlogCard />
            <SkeletonBlogCard />
          </div>
        ) : blogs && blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {blogs.map((data, index) => (
              <article
                key={data._id || index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden group"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-56 lg:h-52 xl:h-56 overflow-hidden">
                  {data.thumbnail ? (
                    <Image
                      alt={data.title || "Blog image"}
                      src={data.thumbnail}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      priority={index < 4}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}

                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 lg:p-4 xl:p-5">
                  {/* Date */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      {formatDate(data.createdAt)}
                    </span>
                    <span className="text-xs sm:text-sm p-1 bg-blue-300 rounded-full px-2  text-black font-medium">
                      {data.category.category}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${data._id}`}>
                    <h3 className="text-base sm:text-lg lg:text-base xl:text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {data.title || "Untitled Blog"}
                    </h3>
                  </Link>

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
        ) : (
          // <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
          //   <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6">
          //     <Image
          //       src={noBlogs}
          //       alt="No blogs available"
          //       className="w-full h-full object-cover"
          //       fill
          //     />
          //   </div>
          //   <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
          //     No blogs available
          //   </h3>
          //   <p className="text-sm sm:text-base text-gray-600 text-center max-w-md">
          //     We're working on bringing you fresh content. Check back soon!
          //   </p>
          // </div>
          ""
        )}

        {/* View All Button */}
        {blogs && blogs.length > 0 && (
          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-[#039187] text-white font-medium px-6 py-3 sm:px-8 sm:py-4 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg"
            >
              <span>View All Blogs</span>
              <CgArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default SectionFive;
