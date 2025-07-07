'use client';
import { fetchBlogs } from "@/api/blog";
import { blogsData } from "@/app/assets/assets";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CgArrowRight } from "react-icons/cg";

const RelatedBlogs = ({ blogId }) => {
  const [relatedBlogs,setRelatedBlogs] = useState(false)
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
    const idMatchedBlog = allBlogsData?.find(data => data._id == blogId);
    if(idMatchedBlog){
      const category = idMatchedBlog.category;
      const categoryMatchedBlogs = allBlogsData.filter(data => data.category == category && data._id !== idMatchedBlog._id);
      setRelatedBlogs(categoryMatchedBlogs)
    }
  },[allBlogsData, blogId])


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

   
      <section className="w-full h-auto  flex justify-center items-center ">
      <div className="flex flex-col items-start gap-4 w-full">
        <h2 className="font-semibold text-[2.5rem]">Related Articles</h2>
        <div className="overflow-x-scroll w-full">
          {
            !relatedBlogs ?
            (
              <SkeletonRelatedBlogs/>
            )
            :
            (
              relatedBlogs.length == 0 ?
              (
                <div>
                <h1 className="text-primary">NO REALTED BLOGS</h1>
              </div>
              )
              :
              (
                <div className="w-full h-auto grid grid-cols-1 md:grid-cols-3 gap-10 grid-flow-row ">
            {relatedBlogs.slice(0, 3).map((data, index) => (
              <div
                key={index}
                className=" w-full h-auto  flex flex-col justify-between gap-5"
              >
                <div className="w-full h-[25vh] md:h-[40vh]  relative rounded-3xl">
                  <Image
                  fill
                    alt="blog image"
                    src={data.imageURL ? data.imageURL : '/placeholder-image.jpg'}
                    className="w-full aspect-square object-cover object-center rounded-3xl"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center w-full justify-between">
                    <a className="flex items-center justify-center font-poppins font-medium text-sm  text-primary">
                      {data.category}
                    </a>
                    <p className=" text-tertiary text-sm font-normal">
                      {formatDate(data.createdAt)}
                    </p>
                  </div>
                  <h2 className="text-xl font-semibold">{data.title}</h2>
                  <p className="font-normal text-sm  text-tertiary w-full">
                    {data.description.length > 120
                      ? data.description
                          .slice(0, 120)
                          .split(" ")
                          .slice(0, -1)
                          .join(" ") + " ..."
                      : data.description}
                  </p>
                  <Link href={`/blog/${data._id}`}>
                    <div className="flex justify-start cursor-pointer">
                      <div className="border border-neutral-200 text-[#0C0E12] rounded-full flex gap-1 items-center px-4 py-1.5">
                        <p className="text-xs xl:text-base">Read More</p>
                        <CgArrowRight className="text-base xl:text-xl" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
              )
            )
          }
          

        </div>
      </div>
    </section>
    )
    
};

export default RelatedBlogs;
