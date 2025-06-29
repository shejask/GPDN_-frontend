"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CgArrowRight } from "react-icons/cg";
import { LuSearch } from "react-icons/lu";
import { blogsData } from "@/app/assets/assets";
import BlogsSection from './BlogsSection'
import {  } from "../../api/blog";
import Link from "next/link";

const SearchSection = ({  sendDataToParent,blogs }) => {

  const [search, setSearch] = useState("");
  const [latestBlogData,setLatestBlogData] = useState([])
 
 

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      sendDataToParent(1,search);

    } catch (error) {
      console.error("Error fetching Blogs:", error);
    }
  }

  const handleFilter = async(topic) =>{
    try{
      sendDataToParent(2,topic);

    }catch(error){
      console.log(error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
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

  useEffect(()=>{
    setLatestBlogData(blogs[blogs.length-1])  
    console.log(latestBlogData,"latestblog");
      
  },[blogs])



  const SkeletonLatestBlog = () => (
    <div className="w-full h-full flex flex-col gap-6 md:gap-0 justify-around lg:grid lg:grid-flow-col lg:gap-x-6 lg:grid-cols-[0.8fr_1fr]">
      {/* Image Skeleton */}
      <div className="h-[60vh] lg:h-full w-full flex justify-center items-center rounded-2xl relative bg-gray-200 animate-pulse">
        {/* Optional: you can add a gray block inside to simulate loading effect */}
      </div>
  
      {/* Content Skeleton */}
      <div className="flex flex-col gap-0 md:gap-3 lg:gap-0 lg:w-[80%] w-full h-full px-0 md:px-2 lg:px-4 justify-around md:justify-center lg:justify-between">
        {/* Top Section: Category, Date, Title, Description */}
        <div className="flex flex-col gap-0 md:gap-3 lg:gap-3">
          {/* Category and Date */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
  
          {/* Title */}
          <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
  
          {/* Description - 2-3 lines */}
          <div className="space-y-2 mt-1">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-11/12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
  
        {/* Read More Button */}
        <div className="mt-4">
          <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );



  return (
    <section className="w-full h-full  flex justify-center items-center">
      <div className="w-full h-full flex flex-col items-center justify-around">
        {/* ---SEARCH SECT---- */}
        <div className="w-full flex items-center justify-center h-[35vh] md:h-[40vh]">
          <div className="flex flex-col items-center gap-3 lg:gap-4 xl:gap-14 w-full md:w-[80%] lg:w-[40%]">
           <div className="flex flex-col items-center gap-1 lg:gap-2">
           <h2 className="text-secondary font-semibold text-[2rem] md:text-[2.5rem] lg:text-5xl leading-none">
              GPDN Blog
            </h2>
            <p className="font-medium text-sm lg:text-base leading-normal text-[#525252] text-center">
              Read updates on GPDN Blog , corporate initiatives, and
              partnerships to get insight into the world’s work marketplace.
            </p>
           </div>
            <div className="flex items-center w-full border-2 border-secondary rounded-3xl py-2.5  cursor-text">
              <label
                className="flex justify-center items-center px-7 cursor-text"
                htmlFor="searchText"
              >
                <LuSearch className="text-tertiary text-xl" />
              </label>
              <form onSubmit={handleSubmit}>
      <input
        className="outline-none rounded-3xl w-full text-base placeholder:text-base placeholder:text-tertiary text-tertiary placeholder:font-poppins font-poppins placeholder:font-normal font-normal"
        type="text"
        id="searchText"
        placeholder="search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </form>
            </div>
            <div className="flex w-full items-center justify-between">
              {/* {topics.map((topic, index) => (
                <a
                  key={index}
                  onClick={() => handleFilter(topic)}
                  className="flex items-center justify-center font-poppins font-medium text-xs lg:text-sm text-nowrap text-[#797979]"
                >
                  {topic}
                </a>
              ))} */}
            </div>
          </div>
        </div>

        {/* ---FIRST BLOG SECT---- */}
       

            <div className="w-full flex justify-center items-center h-[50vh]  lg:h-[40vh]">
          <div className="w-full h-full flex justify-center items-center ">
          {
           !latestBlogData ?

           (
            <SkeletonLatestBlog/>
           )
           
     
           :
           (
            <div className=" w-full h-full flex flex-col gap-6 md:gap-0 justify-around  lg:grid  lg:grid-flow-col  lg:gap-x-6  lg:grid-cols-[0.8fr_1fr]">
              <div className="h-[60vh] lg:h-full w-full flex justify-center items-center  rounded-2xl relative">
                <Image
                  alt="blog image"
                  fill
                  src={latestBlogData?.imageURL ? latestBlogData.imageURL : '/placeholder-image.jpg'}
                  layout="fill"
                  className="h-full w-full object-cover object-center rounded-2xl"
                />
              </div>
              <div className="flex flex-col gap-0 md:gap-3 lg:gap-0 lg:w-[80%] w-full  h-full px-0 md:px-2 lg:px-4  justify-around md:justify-center lg:justify-between">
               <div className="flex flex-col gap-0 md:gap-3 lg:gap-3 ">
               <div className="flex items-center gap-3">
                  <a className="flex items-center justify-center font-poppins font-medium text-sm  text-primary">
                  {latestBlogData?.category}
                  </a>
                  <p className=" text-tertiary text-base font-normal">
                    {formatDate(latestBlogData.createdAt)}
                  </p>
                </div>
                <h2 className="text-lg xl:text-3xl 2xl:text-4xl font-semibold">
                {latestBlogData?.title}
                </h2>
                <p className="font-normal text-xs xl:text-base 2xl:text-lg text-tertiary w-full">
                {latestBlogData?.description && latestBlogData.description.length > 120 
               ? latestBlogData.description.slice(0, 120).split(" ").slice(0, -1).join(" ") + " ..."
               : latestBlogData?.description
               }
                </p>
               </div>
               <Link href={`/blog/${latestBlogData._id}`} className="flex justify-start" >
                  <div className="border border-neutral-200 bg-white hover:bg-neutral-200 transition-all duration-300 ease-in cursor-pointer text-[#0C0E12] rounded-full flex gap-1 items-center px-4 py-1.5">
                    <p className="text-xs xl:text-base">Read More</p>
                    <CgArrowRight className="text-base xl:text-xl" />
                  </div>
               </Link>
               
              </div>
            </div>
           )
          }
          </div>
        </div>

           
        
      </div>
      
     
    </section>
    
  );
};

export default SearchSection;
