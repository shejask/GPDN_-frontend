"use client";
import { blogsData } from "@/app/assets/assets";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import blogImage from "../../../app/assets/HOMEPAGE/SectionFive/blog-image-4.png";
import { fetchBlogs } from "@/api/blog";

const BlogDetails = ({ blogId }) => {
  const [currentBlog, setCurrentBlog] = useState(false);
  const [allBlogsData, setAllBlogsData] = useState([]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Function to render rich text content safely
  const renderRichText = (content) => {
    if (!content) return null;

    // If content is already HTML string, render it
    if (typeof content === "string") {
      return (
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-l-blue-500 prose-blockquote:bg-gray-50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-6 prose-img:rounded-lg prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // If content is an object (from rich text editor), handle it
    if (typeof content === "object") {
      return (
        <div className="prose prose-lg max-w-none">
          {JSON.stringify(content)}
        </div>
      );
    }

    return <p className="text-gray-700 leading-relaxed">{content}</p>;
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
    const matchedBlog = allBlogsData?.find((data) => data._id == blogId);
    setCurrentBlog(matchedBlog);
  }, [allBlogsData, blogId]);

  const SkeletonBlogDetail = () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
        {/* Header Skeleton */}
        <div className="p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4 mb-8">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-4/5 mx-auto"></div>
          </div>
        </div>

        {/* Image Skeleton */}
        <div className="h-64 sm:h-80 lg:h-96 bg-gray-200"></div>

        {/* Content Skeleton */}
        <div className="p-8 sm:p-12">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full pb-8 sm:py-12 lg:py-16 xl:py-20 bg-gray-50">
      <div className="max-w-full mx-auto ">
        {!currentBlog ? (
          <SkeletonBlogDetail />
        ) : (
          <article className="bg-gray-50  overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80 lg:h-96 w-full">
              <Image
                fill
                alt={currentBlog.title || "Blog image"}
                src={
                  currentBlog.thumbnail
                    ? currentBlog.thumbnail
                    : "/placeholder-image.jpg"
                }
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-12 lg:p-16">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {typeof currentBlog.category === "object"
                    ? currentBlog.category?.name ||
                      currentBlog.category?.category ||
                      "Uncategorized"
                    : currentBlog.category || "Uncategorized"}
                </span>
                <span className="text-gray-500 text-sm font-medium">
                  {formatDate(currentBlog.createdAt)}
                </span>
              </div>

              {/* Tags */}
              {currentBlog.tags && currentBlog.tags.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-2">
 
                    {currentBlog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
                {currentBlog.title}
              </h1>

              {/* Description */}
              {currentBlog.description && (
                <div className="mb-8">
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
                    {currentBlog.description}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="w-24 h-1 bg-blue-600 rounded-full mb-12"></div>

              {/* Rich Text Content */}
              <div className="prose prose-lg max-w-none">
                {currentBlog.content && renderRichText(currentBlog.content)}
              </div>

              {/* Author Section */}
              {/* <div className="mt-16 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-lg">
                      {currentBlog.author?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {currentBlog.author?.name || "Anonymous Author"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Published on {formatDate(currentBlog.createdAt)}
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

export default BlogDetails;
