'use client';
import React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { CgArrowRight } from "react-icons/cg";



const BlogsSection = ({ blogs }) => {

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };



  const SkeletonBlogCard = () => {
    return (
      <div className="w-full h-auto flex flex-col justify-between gap-5 animate-pulse">
        {/* Image skeleton */}
        <div className="w-full h-[25vh] md:h-[40vh] bg-gray-200 rounded-3xl"></div>
  
        {/* Text skeleton */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center w-full justify-between">
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
  
            <div className="w-full bg-gray-200 h-6 rounded lg:h-[4rem]"></div>
            <div className="w-full bg-gray-200 h-4 rounded lg:h-[4rem]"></div>
          </div>
  
          {/* Button skeleton */}
          <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  };


  return (
    <section className="w-full h-auto flex justify-center items-center py-10">
      <div className="w-full h-auto flex flex-col gap-20 md:gap-10 md:grid md:grid-cols-2 lg:grid-cols-3 grid-flow-row">
        {
          blogs && blogs.length > 0 ?

            blogs.map((data, index) => (
              <div key={index} className="w-full h-auto flex flex-col justify-between gap-5">
                <div className="w-full h-[25vh] md:h-[40vh] relative rounded-3xl">
                  <Image
                    src={data.imageURL ? data.imageURL : '/placeholder-image.jpg'}
                    alt={`Blog image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-3xl"
                    priority={index < 2}
                  />
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center w-full justify-between">
                      <a className="flex items-center justify-center font-poppins font-medium text-sm text-primary">
                        {data.category}
                      </a>
                      <p className="text-tertiary text-sm font-normal">
                        {formatDate(data.createdAt)}
                      </p>
                    </div>
                    <h2 className="text-xl lg:h-[4rem] font-semibold text-black">
                      {data.title}
                    </h2>
                    <p className="font-normal lg:h-[4rem] text-sm text-tertiary w-full">
                      {data.description && data.description.length > 120
                        ? data.description.slice(0, 120).split(" ").slice(0, -1).join(" ") + " ..."
                        : data.description
                      }
                    </p>
                  </div>
                  <Link href={`/blog/${data._id}`}>
                    <div className="flex justify-start cursor-pointer">
                      <div className="border border-neutral-200 bg-white hover:bg-neutral-200 transition-all duration-300 ease-in cursor-pointer text-[#0C0E12] rounded-full flex gap-1 items-center px-4 py-1.5">
                        <p className="text-xs xl:text-base">Read More</p>
                        <CgArrowRight className="text-base xl:text-xl" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))

            :

            Array.from({ length: 3 }).map((_,index)=>(
              <SkeletonBlogCard key={index}/>
            ))
        }
       
      </div>
    </section>
  );
};

export default BlogsSection;