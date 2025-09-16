"use client";
import { fetchBlogs } from "@/api/blog";
import { blogsData } from "@/app/assets/assets";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CgArrowRight } from "react-icons/cg";

const RelatedBlogs = ({ blogId }) => {
  const [relatedBlogs, setRelatedBlogs] = useState(false);
  const [allBlogsData, setAllBlogsData] = useState([]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  useEffect(() => {
    const fetchAllBlogsData = async () => {
      try {
        const response = await fetchBlogs();
        if (response?.data?.data) {
          setAllBlogsData(
            Array.isArray(response.data.data) ? response.data.data : []
          );
        }
      } catch (error) {
        console.error("Error fetching Blogs:", error);
        setAllBlogsData([]);
      }
    };

    fetchAllBlogsData();
  }, []);

  useEffect(() => {
    const idMatchedBlog = allBlogsData?.find((data) => data._id == blogId);
    if (idMatchedBlog) {
      const category =
        typeof idMatchedBlog.category === "object"
          ? idMatchedBlog.category?.name
          : idMatchedBlog.category;
      const categoryMatchedBlogs = allBlogsData.filter((data) => {
        const dataCategory =
          typeof data.category === "object"
            ? data.category?.name
            : data.category;
        return dataCategory === category && data._id !== idMatchedBlog._id;
      });
      setRelatedBlogs(categoryMatchedBlogs);
    }
  }, [allBlogsData, blogId]);

  const SkeletonRelatedBlogs = () => {
    return (
      <div className="w-full h-auto grid grid-cols-1 md:grid-cols-3 gap-10 grid-flow-row">
        {[1, 2, 3].map((_, index) => (
          <div
            key={index}
            className="w-full h-auto flex flex-col justify-between gap-5 animate-pulse"
          >
            {/* Image Skeleton */}
            <div className="w-full h-[25vh] md:h-[40vh] bg-gray-200 rounded-3xl"></div>

            {/* Content Skeleton */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center w-full justify-between">
                <div className="w-20 h-5 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>

              {/* Read More Button Skeleton */}
              <div className="w-24 h-8 bg-gray-200 rounded-full mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 xl:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Related Articles
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Discover more insights and stories you might enjoy
          </p>
        </div>

        {!relatedBlogs ? (
          <SkeletonRelatedBlogs />
        ) : relatedBlogs.length == 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No related articles found
            </h3>
            <p className="text-gray-600">Check back later for more content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {relatedBlogs.slice(0, 3).map((data, index) => (
              <article
                key={data._id || index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden group"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <Image
                    fill
                    alt={data.title || `Related blog ${index + 1}`}
                    src={
                      data.thumbnail ? data.thumbnail : "/placeholder-image.jpg"
                    }
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {typeof data.category === "object"
                        ? data.category?.name ||
                          data.category?.category ||
                          "Uncategorized"
                        : data.category || "Uncategorized"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatDate(data.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {data.title || "Untitled Article"}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
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
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group/btn"
                  >
                    <span>Read More</span>
                    <CgArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedBlogs;
