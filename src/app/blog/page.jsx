'use client';
import React, { useEffect, useState } from "react";
import Navbar from '@/components/Navbar'
import BlogsSection from '@/pages/Blog/BlogsSection'
import SearchSection from '@/pages/Blog/SearchSection'
import Footer from '@/pages/Home/Footer'
import { fetchBlogs, searchBlogs, filterBlogs } from "@/api/blog"; 

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchAllBlogsData = async () => {
      try {
        const response = await fetchBlogs();
        if (response?.data?.data) {
          setBlogs(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error("Error fetching Blogs:", error);
        setBlogs([]);
      }
    };
    
    fetchAllBlogsData();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleData = async (number, data) => {
    if(number ==1){
      const blogs = await searchBlogs(data);
      if (blogs.data.data) {
        setBlogs(Array.isArray(blogs.data.data) ? blogs.data.data : []);
      } 
  }else{
       const blogs = await filterBlogs(data);
      if (blogs.data.data) {
        setBlogs(Array.isArray(blogs.data.data) ? blogs.data.data : []);
      }
  }
};

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex flex-col items-center overflow-hidden">
      <div className="flex w-full flex-col items-center justify-between gap-10 lg:gap-0 px-7 md:px-16 lg:px-20 2xl:px-40 lg:pb-14">
        <div className="h-auto lg:min-h-screen w-full flex flex-col justify-between pt-8">
          <Navbar/>
          <SearchSection sendDataToParent={handleData} blogs={blogs}/>
        </div>
        <BlogsSection blogs={blogs}/>
      </div>
      <Footer/>
    </main>
  );
};

export default Page;