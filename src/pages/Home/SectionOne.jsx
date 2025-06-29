"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import slideImage1 from "../../app/assets/HOMEPAGE/SectionOne/slide-image-1.png";
import slideImage2 from "../../app/assets/HOMEPAGE/SectionOne/slide-image-2.png";
import slideImage3 from "../../app/assets/HOMEPAGE/SectionOne/slide-image-3.png";
import doctorImage1 from "../../app/assets/HOMEPAGE/SectionOne/doctor-image-1.png";
import doctorImage2 from "../../app/assets/HOMEPAGE/SectionOne/doctor-image-2.png";
import doctorImage3 from "../../app/assets/HOMEPAGE/SectionOne/doctor-image-3.png";
import connectionsImage from "../../app/assets/HOMEPAGE/SectionOne/connection.webp";
import { PiArrowUpRightLight } from "react-icons/pi";
import { GoChevronRight } from "react-icons/go";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";


const SectionOne = () => {

  const sliderImages = [slideImage1,slideImage2,slideImage3];

  const [currentImage,setCurrentImage] = useState(0) 

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sliderImages.length);
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <section className="w-full h-auto lg:h-full  flex justify-center items-center py-5 lg:py-0">
      <div className="w-full h-auto  lg:h-[75%] xl:h-[80%] flex flex-col lg:grid lg:grid-cols-[75%_25%]">
        {/* -----Left Side----- */}
        <div className=" w-full h-auto lg:h-full flex flex-col-reverse justify-between gap-8 lg:gap-0 lg:grid lg:grid-cols-[50%_50%]">
          <div className="relative w-full h-full">
            <div className="lg:absolute flex lg:items-center top-[8.5vh] xl:top-[8vh] left-0 w-full h-auto">
              <div className="flex flex-col gap-4 lg:gap-0 lg:justify-between">
                <h1 className="text-4xl  md:text-7xl lg:text-[6.5vw] xl:text-[6.5vw] font-light lg:leading-none  w-full lg:w-[150%]  text-[#1E1E1E]">
                  Global Care<br className="hidden lg:block"/>for a{" "}
                  <span className="font-medium">Brighter Tomorrow</span>
                </h1>
                <div className="flex flex-col w-full gap-3 xl:gap-5">
                  <p className="font-normal text-[2vh]  flex-nowrap">Join a global network of dedicated palliative care doctors committed to transforming patient lives through compassion, innovation, and shared knowledge.
                  </p>
                  <div>
                   <div className="flex ">
                   <Link href={`/about`} className="bg-primary  hover:bg-[#039187] cursor-pointer transition-all duration-300 ease-in text-white text-base 2xl:text-xl font-poppins py-4 px-6 rounded-xl flex items-center justify-around gap-2">
                      Join the Network
                      <GoChevronRight className="text-xl"/>
                   </Link>
                   </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ---Desktop Slider---- */}
          <div className="hidden lg:flex w-full h-full justify-center relative ">
            <div className="absolute bottom-8 right-20 flex justify-center items-center z-10">
              <AnimatePresence>
              <motion.h4
               key={currentImage}
               initial={{
                 opacity:0
               }}
               animate={{
                 opacity:1
               }}
               
               transition={{
                delay:0.2,
                 duration:0.6,
                 ease:'easeIn'
               }}
               className="font-poppins font-normal text-3xl text-white">0{currentImage+1}<span className="text-xs">/0{sliderImages.length}</span></motion.h4>
              </AnimatePresence>
            </div>
            <svg
              preserveAspectRatio="none"
              viewBox="0 0 505 680"
              className="absolute w-full h-full object-cover"
            >
              <defs>
                <clipPath id="custom-shape">
                  <path d="M0 30C0 13.4315 13.4315 0 30 0H475C491.569 0 505 13.4315 505 30V650C505 666.569 491.569 680 475 680H30C13.4314 680 0 666.569 0 650V358.247C0 341.389 13.8853 327.841 30.7375 328.256L91.2625 329.744C108.115 330.159 122 316.611 122 299.753V111.5C122 94.9315 108.569 81.5 92 81.5H30C13.4315 81.5 0 68.0685 0 51.5V30Z" />
                </clipPath>
              </defs>
              <foreignObject
                clipPath="url(#custom-shape)"
                className="w-full h-full"
              >
                <AnimatePresence mode="wait">
                <motion.div
                key={currentImage}
                initial={{
                  opacity:0
                }}
                animate={{
                  opacity:1
                }}
                exit={{
                  opacity:0.7
                }}
                transition={{
                  duration:0.6,
                  ease:'easeIn'
                }}
                 className="w-full h-full ">
                  <Image
                    src={sliderImages[currentImage]}
                    alt="Caring"
                    layout="fill"
                    objectFit="cover"
                  />
                </motion.div>
                </AnimatePresence>
                
              </foreignObject>
            </svg>
          </div>

          {/* ---Mobile Slider---  */}
          <div className=" lg:hidden w-full h-[50vh] justify-center relative ">
          <div className="absolute bottom-8 right-20 flex justify-center items-center z-10">
            <h4 className="font-poppins font-normal text-3xl text-white">0{currentImage+1}<span className="text-xs">/0{sliderImages.length}</span></h4>
            </div>
            <div className="w-full h-full rounded-2xl">
              <Image
                src={sliderImages[currentImage]}
                alt="Caring"
                layout="fill"
                objectFit="cover"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* -----Right Side----- */}
        <div className="w-full lg:h-full flex flex-col lg:pl-4 py-10 lg:py-0 ">
          <div className="w-full h-[40%]  flex justify-center items-center">
            <div className="w-full flex flex-col justify-center gap-2 lg:gap-1 xl:gap-3 2xl:gap-8 h-full">
              <div className="w-full flex flex-col text-sm md:text-[2vh]">
                <h2 className="text-secondary  font-bold ">
                  468{" "}
                  <span className="text-[#252525] font-medium uppercase">
                    Expert Doctors
                  </span>
                </h2>
                <h2 className="text-secondary font-bold ">
                  83+{" "}
                  <span className="text-[#252525] font-medium uppercase">
                    Countries
                  </span>
                </h2>
              </div>
              
              <div className="w-full  flex  items-center ">
              <div className="flex justify-between w-full gap-2 xl:w-[90%] items-center ">
                <div className="xl:h-14 xl:w-14 flex justify-center items-center ">
                  <Image
                  
                    alt="Doctor profile image"
                    className="rounded-full w-full h-full"
                    src={doctorImage1}
                  />
                </div>
                <div className=" xl:h-14  xl:w-14   flex justify-center items-center ">
                  <Image
                    alt="Doctor profile image"
                    className="rounded-full w-full h-full"
                    src={doctorImage2}
                  />
                </div>
                <div className="xl:h-14 xl:w-14  flex justify-center items-center ">
                  <Image
                    alt="Doctor profile image"
                    className="rounded-full w-full h-full"
                    src={doctorImage3}
                  />
                </div>
               <Link className="rounded-full hover:bg-[#CACACA] p-3.5 lg:p-1 xl:p-2 text-[#CACACA] transition-all duration-300 ease-in cursor-pointer hover:text-gray-500 border border-[#CACACA] xl:h-15  xl:w-15  flex justify-center  items-center" href={`/about`}>
                  <PiArrowUpRightLight className="text-5xl lg:text-4xl" />
                </Link>
              </div>
              
              </div>

              <p className="font-normal text-[1.5vh] overflow-hidden w-full">
              A united community of palliative care doctors working across borders to elevate patient care, exchange clinical expertise, and stand by each other in life’s most challenging moments.
              </p>
            </div>
          </div>

          <div className="hidden lg:block h-[60%] w-full relative rounded-[2rem]">
            <Image
              layout="fill"
              objectFit="cover"
              className="w-full rounded-[2rem]"
              src={connectionsImage}
              alt="connections"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionOne;
