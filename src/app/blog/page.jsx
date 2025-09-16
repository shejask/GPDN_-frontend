"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BlogsSection from "@/pages/Blog/BlogsSection";
import SearchSection from "@/pages/Blog/SearchSection";
import Footer from "@/pages/Home/Footer";
import { fetchBlogs, searchBlogs, filterBlogs } from "@/api/blog";

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllBlogsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchBlogs();
        if (response?.data?.data) {
          setBlogs(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error("Error fetching Blogs:", error);
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBlogsData();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleData = async (number, data) => {
    try {
      setIsLoading(true);
      if (number == 1) {
        const blogs = await searchBlogs(data);
        if (blogs.data.data) {
          setBlogs(Array.isArray(blogs.data.data) ? blogs.data.data : []);
        }
      } else {
        const blogs = await filterBlogs(data);
        if (blogs.data.data) {
          setBlogs(Array.isArray(blogs.data.data) ? blogs.data.data : []);
        }
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="md:p-5 md:px-10 p-5">
        <Navbar />
      </div>

      {/* Search and Featured Section */}
      <SearchSection sendDataToParent={handleData} blogs={blogs} />

      {/* All Blogs Section */}
      {/* <BlogsSection blogs={blogs} isLoading={isLoading} /> */}

      <Footer />
    </main>
  );
};

export default Page;
