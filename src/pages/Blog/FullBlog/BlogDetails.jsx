"use client";
import { blogsData } from "@/app/assets/assets";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import blogImage from '../../../app/assets/HOMEPAGE/SectionFive/blog-image-4.png'
import { fetchBlogs } from "@/api/blog";

const BlogDetails = ({ blogId }) => {
  const [currentBlog,setCurrentBlog] = useState(false)
  const [allBlogsData,setAllBlogsData] = useState([])

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

   useEffect(() => {
      const fetchAllBlogsData = async () => {
        try {
          const response = await fetchBlogs();
          if (response?.data?.data) {
            setAllBlogsData(Array.isArray(response.data.data) ? response.data.data : []);
            
          }
        } catch (error) {
          console.error("Error fetching Blogs:", error);
          setAllBlogsData([]);
        }
      };
      
      fetchAllBlogsData();
    }, []);

  useEffect(()=>{
    const matchedBlog = allBlogsData?.find(data => data._id == blogId);
    setCurrentBlog(matchedBlog);
  },[allBlogsData, blogId])



  const SkeletonBlogDetail = () => (
    <div className="w-full md:w-[90%] lg:w-[80%] flex flex-col gap-8 md:gap-10 h-auto items-center">
      {/* Top Section: Category + Date + Title */}
      <div className="flex flex-col gap-5 w-full h-auto px-4">
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-5">
            <div className="w-24 h-7 bg-gray-200 rounded-3xl animate-pulse"></div>
            <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-full space-y-3 text-center">
          <div className="w-full h-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
  
      {/* Blog Image */}
      <div className="w-full h-[20rem] md:h-[33rem] bg-gray-200 rounded-2xl animate-pulse relative"></div>
  
      {/* Description Text */}
      <div className="w-full space-y-3 px-4 md:px-0">
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );


  return (

   
      <section className="w-full h-auto  flex justify-center items-center">
        {
           !currentBlog ?

           (
             <SkeletonBlogDetail/>
           )
           
       
           :
       
           (
            <div className="w-full md:w-[90%] lg:w-[80%] flex flex-col gap-8 md:gap-10 h-auto items-center">
            <div className="flex flex-col gap-5 w-full h-auto px-4">
              <div className="w-full flex justify-center">
              <div className="flex items-center gap-5 ">
                <a className="flex items-center justify-center font-poppins font-medium text-sm md:text-base  text-secondary border border-secondary rounded-3xl px-2.5 py-1">
                  {currentBlog.category}
                </a>
                <p className=" text-tertiary text-sm md:text-base font-normal">
                  {formatDate(currentBlog.createdAt)}
                </p>
              </div>
              </div>
              <h2 className="text-[1.8rem] md:text-[2.9rem] leading-tight font-semibold w-full text-center">{currentBlog.title}</h2>
            </div>
    
            <div className="w-full h-[20rem] md:h-[33rem] relative">
                <Image
                fill
                    alt="blog image"
                    src={currentBlog.imageURL ? currentBlog.imageURL : '/placeholder-image.jpg'}
                    className="w-full h-full object-cover object-center rounded-2xl"
                />
            </div>
    
            <div className="w-full">
                <p className="font-normal text-sm md:text-base">{currentBlog.description}</p>
            </div>
          </div>
           )
        }
     
    </section>
    )


    
};

export default BlogDetails;
