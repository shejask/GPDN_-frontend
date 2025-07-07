"use client";
import React, { useState } from 'react'
import videoImage from '../../app/assets/HOMEPAGE/SectionThree/video-image.webp'
import Image from 'next/image'
import { FaPlay } from "react-icons/fa";
import { motion } from 'framer-motion';


const SectionThree = () => {

  const [isHover,setIsHover] = useState(false)

  return (
    <section className="w-full h-auto lg:min-h-screen flex justify-center items-center py-5 lg:py-14">
        <div className=' w-full h-full flex flex-col gap-3 lg:gap-12  lg:items-center'>
            <div className='flex flex-col gap-2 lg:gap-4'>
            <h1 className='font-semibold text-[2rem] md:text-[2.5rem] xl:text-6xl text-secondary lg:text-center'>Bringing Smiles,<br className='hidden md:block lg:hidden'/> Building Connections</h1>
            <p className='text-[#525252] text-sm md:text-lg lg:text-center'>Experience the power of a caring community dedicated to well-being, support, and joy. GPDN fosters friendships, mentorships, and global unity among doctors who care.</p>
            </div>
            <div className={`rounded-3xl h-[70vh] w-full bg-yellow-300 relative`}>
               <Image src={videoImage} alt="Img" className='w-full rounded-3xl h-full object-cover'/>
               <motion.div onHoverStart={()=>setIsHover(true)} onHoverEnd={()=>setIsHover(false)} className={` ${isHover ? "scale-[110%]" : "" }  transition-all duration-300 ease-linear  absolute cursor-pointer top-[40%] left-1/2 transform -translate-x-1/2 bg-blackhalf w-24 h-24 rounded-full flex justify-center items-center`}> 
               <FaPlay className='text-white opacity-100 text-4xl'/>
               </motion.div>
            </div>
        </div>
    </section>
  )
}

export default SectionThree