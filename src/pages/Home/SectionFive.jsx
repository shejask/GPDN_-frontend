"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CgArrowRight } from "react-icons/cg";
import Link from "next/link";
import blogRoutes from "@/services/endPoints/blogEndpoints";
import Api from "@/services/axios"; // Add this import
import noBlogs from "../../app/assets/HOMEPAGE/SectionFive/no-blogs.png";

const SectionFive = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await Api.get(blogRoutes.FetchNewsAndBlogs);
        // Add debugging log to see the response structure
        console.log("API Response:", response);

        // Check if data is in response.data.blogs or similar structure
        const blogsData =
          response.data.blogs || response.data.data || response.data;
        setBlogs(Array.isArray(blogsData) ? blogsData.slice(-3) : []);
      } catch (error) {
        console.error("Error fetching blogs:", {
          message: error.message,
          endpoint: blogRoutes.FetchNewsAndBlogs,
          timestamp: new Date().toISOString(),
          response: error.response?.data, // Log the error response data
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
      if (isNaN(date.getTime())) return ""; // Return empty string for invalid dates

      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };
  const SkeletonBlogRow = () => (
    <div className="min-w-[85vw] min-h-60 md:min-h-60 grid grid-flow-row md:grid-flow-col gap-y-2 md:gap-y-0 md:grid-cols-[0.5fr_1fr_1fr] animate-pulse">
      {/* Image Placeholder */}
      <div className="h-48 md:h-60 w-full rounded-2xl overflow-hidden relative bg-gray-200"></div>

      {/* Title + Date Placeholder */}
      <div className="flex flex-col justify-between p-0 md:p-2 lg:p-4 gap-2.5 md:gap-0 md:border-t border-neutral-200">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="hidden lg:block h-4 w-24 bg-gray-200 rounded mt-2"></div>
      </div>

      {/* Description + CTA Placeholder */}
      <div className="flex flex-col justify-between p-0 md:p-2 lg:p-4 gap-2.5 md:gap-0 md:border-t border-neutral-200">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="lg:hidden h-4 w-24 bg-gray-200 rounded my-2"></div>
        <div className="h-8 w-28 bg-gray-200 rounded-full mt-2"></div>
      </div>
    </div>
  );

  return (
    <section className="w-full h-auto  flex justify-center items-center py-5 lg:py-14">
      {isLoading ? (
        <div className="w-full h-full grid grid-rows-[auto_auto_auto] justify-between  gap-5">
          <SkeletonBlogRow />
          <SkeletonBlogRow />
          <SkeletonBlogRow />
        </div>
      ) : blogs && blogs.length > 0 ? (
        <div className="w-full h-full grid grid-rows-[auto_auto_auto] justify-between  gap-5">
          {blogs.map((data, index) => (
            <div
              key={data._id || index}
              className="w-full h-full grid grid-flow-row md:grid-flow-col gap-y-2 md:gap-y-0 md:grid-cols-[0.5fr_1fr_1fr]"
            >
              <div className="h-48 md:h-60 w-full rounded-2xl overflow-hidden relative">
                {data.imageURL && (
                  <Image
                    alt={data.title || "Blog image"}
                    src={data.imageURL}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-full object-cover object-center rounded-2xl"
                    priority={index === 0}
                  />
                )}
              </div>
              <div className="flex flex-col justify-between p-0 md:p-2 lg:p-4 gap-2.5 md:gap-0 md:border-t border-neutral-200">
                <h2 className="text-lg xl:text-3xl 2xl:text-4xl font-semibold leading-snug">
                  {data.title || "Untitled Blog"}
                </h2>
                <p className="hidden lg:block text-tertiary text-base font-normal">
                  {formatDate(data.createdAt)}
                </p>
              </div>
              <div className="flex flex-col justify-between p-0 md:p-2 lg:p-4 gap-2.5 md:gap-0 md:border-t border-neutral-200">
                <p className="font-normal text-xs xl:text-base 2xl:text-lg text-tertiary w-full leading-relaxed">
                  {data.description && data.description.length > 300
                    ? data.description
                        .slice(0, 300)
                        .split(" ")
                        .slice(0, -1)
                        .join(" ") + " ..."
                    : data.description || "No description available"}
                </p>
                <p className="lg:hidden text-tertiary text-xs font-normal">
                  {formatDate(data.createdAt)}
                </p>
                <Link href={`/blog/${data._id}`} className="flex justify-start">
                  <div className="border border-neutral-200 bg-white hover:bg-neutral-200 transition-all duration-300 ease-in cursor-pointer text-[#0C0E12] rounded-full flex gap-1 items-center px-4 py-1.5">
                    <p className="text-xs xl:text-base">Read More</p>
                    <CgArrowRight className="text-base xl:text-xl" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-3 items-center text-center ">
          <div className="relative w-[7rem] h-[7rem]">
            <Image
              src={noBlogs}
              alt="No blogs available"
              className="w-full h-full object-cover"
              layout="fill"
            />
          </div>
          <p className="uppercase text-primary font-semibold">No blogs available at the moment.</p>
        </div>
      )}
    </section>
  );
};

export default SectionFive;
