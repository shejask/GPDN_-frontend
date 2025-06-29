import React from "react";
import teamImage from '../../app/assets/HOMEPAGE/SectionTwo/team.webp'
import Image from "next/image";
import { excellenceData } from "@/app/assets/assets";

const SectionTwo = () => {
  return (
    <section className="w-full h-auto lg:min-h-screen flex justify-center items-center py-5 lg:py-0 ">
      <div className="w-full h-auto lg:h-[75%] xl:h-[80%]  flex flex-col gap-16 lg:grid lg:grid-cols-2  lg:gap-x-28">
        {/* ---Left Side---  */}
        <div className="flex flex-col justify-between gap-3 lg:gap-0 w-full h-full">
          <h1 className="text-secondary font-semibold text-[2rem] md:text-[2.5rem] lg:text-[4vw] leading-[1.15]">
            Why Join GPDN?<br className="lg:hidden"/> A Global Network of Excellence
          </h1>
          <p className="text-[#0C0E12] font-normal text-[1.1rem] lg:text-[1.6vw] leading-tight">Discover the key benefits of being part of the Global Palliative Doctors Network. Collaborate with experts, stay updated on the latest developments, and elevate your practice with global support.</p>
          <div className="w-full h-[40%]  rounded-3xl relative">
            <Image src={teamImage} alt="team" layout="fill"   className="rounded-3xl object-cover"/>
          </div>
        </div>

        {/* --Right Side--  */}
        <div className="h-full w-full grid grid-flow-row  md:grid-cols-2 gap-y-10 md:gap-y-5 md:gap-x-5">
            {excellenceData.map((item,index)=>(
                <div key={index} className="h-full w-full flex flex-col gap-3">
                        <div className="w-14 xl:w-20 h-14 lg:h-20  relative flex justify-center items-center -ml-2">
                            <Image src={item.icon} alt="icon"  className="object-cover"/>
                        </div>
                          <h2 className="text-[#0C0E12] font-semibold text-[1.2rem] lg:text-[1rem] xl:text-[1.2vw] leading-tight ">{item.heading}</h2>
                    <p className="text-tertiary text-[1rem] lg:text-[1vw]  leading-tight font-normal">{item.description}</p>
                    
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default SectionTwo;
