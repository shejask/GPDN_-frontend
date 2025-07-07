import Image from "next/image";
import React from "react";
import logo from "../../app/assets/HOMEPAGE/Footer/logo.png";
import { CgArrowRight } from "react-icons/cg";
import { footerLinksData } from "@/app/assets/assets";
import { RiTwitterXLine } from "react-icons/ri";
import { RiFacebookCircleFill } from "react-icons/ri";
import { RiLinkedinBoxFill } from "react-icons/ri";
import { RiInstagramLine } from "react-icons/ri";

const Footer = () => {
  return (
    <div className="w-full h-auto bg-secondary flex justify-center items-center ">
      <div className="w-full h-full flex flex-col">
        {/* ---Top Part--- */}
        <div className="w-full h-full px-7 md:px-20 grid grid-flow-row md:grid-flow-col  md:grid-cols-[0.4fr_1fr] lg:grid-cols-[0.8fr_1fr] md:gap-x-12 lg:gap-x-28 pt-7 md:pt-20 pb-3 md:pb-10">
          {/* ---Left section-- */}
          <div className="flex flex-col justify-between gap-4 lg:gap-0 w-full">
            <div className="flex flex-col gap-2 lg:gap-3 relative">
            <div className="w-[11.5rem]">
                <Image alt="logo" src={logo} />
              </div>
              <p className="font-normal text-xs lg:text-base text-white opacity-60 w-full md:w-[50%]">
                We believe that by investing in our people, we can create a
                brighter future for everyone.
              </p>
              <div className="md:hidden py-1 text-white gap-3 text-xl flex">
                <a href="">
                  <RiTwitterXLine />
                </a>
                <a href="">
                  <RiFacebookCircleFill />
                </a>
                <a href="">
                  <RiLinkedinBoxFill />
                </a>
                <a href="">
                  <RiInstagramLine />
                </a>
              </div>
            </div>
            <h2 className="text-lg leading-tight pt-5 md:pt-0 border-t md:border-none border-t-white border-opacity-30 lg:text-[2rem] font-semibold text-white">
              Join Our Newsletter to Keep Up to Date with Us!
            </h2>
            {/* <div className="flex items-center justify-between border-b border-b-white border-opacity-30 w-full">
              <input
                type="email"
                placeholder="Enter your email"
                name=""
                id=""
                className="py-1.5  placeholder:text-white placeholder:opacity-60 placeholder:font-normal placeholder:text-sm lg:placeholder:text-xl bg-secondary "
              />
              <CgArrowRight className="text-lg text-white" />
            </div> */}
            <div className="md:hidden">
              <div className="flex flex-col gap-5 py-2">
                <h3 className="text-white font-semibold text-sm lg:text-xl">
                  Information
                </h3>
                <div className="flex flex-col gap-3">
                  <a
                    href={"/"}
                    className="text-white opacity-60 font-normal text-[0.7rem] lg:text-base"
                  >
                    Home
                  </a>
                  <a
                    href={"/"}
                    className="text-white opacity-60 font-normal text-[0.7rem] lg:text-base"
                  >
                    About us
                  </a>
                  <a
                    href={"/"}
                    className="text-white opacity-60 font-normal text-[0.7rem] lg:text-base"
                  >
                    Blog
                  </a>
                  <a
                    href={"/"}
                    className="text-white opacity-60 font-normal text-[0.7rem] lg:text-base"
                  >
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ---Right Section--- */}
          <div className="hidden md:flex flex-col justify-between gap-10 w-full">
            <div className="grid grid-cols-4 gap-x-7">
              {footerLinksData.map((data, index) => (
                <div key={index} className="flex flex-col gap-5">
                  <h3 className="text-white font-semibold text-sm lg:text-xl">
                    {data.heading}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {data.links.map((link, index) => (
                      <a
                        key={index}
                        href={"/"}
                        className="text-white opacity-60 font-normal text-[0.7rem] lg:text-base"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <h2 className="text-white opacity-[0.25] font-semibold text-[3rem] xl:text-[4rem] leading-[1.1]">
              Global Palliative Doctor’s Network
            </h2>
          </div>
        </div>

        {/* ---Bottom Part -- */}
        <div className="w-full border-t  border-t-white border-opacity-30  flex justify-center items-center py-6 pb-12 md:pb-6">
          <div className="flex w-full justify-between px-7 md:px-20">
            <div className="hidden md:flex justify-between gap-4 text-white ">
              <a href="" className=" text-xs lg:text-base hover:opacity-65 transition-all duration-300 ease-in  font-normal">
                Privacy Policy
              </a>
              <a href="" className=" text-xs lg:text-base hover:opacity-65 transition-all duration-300 ease-in font-normal">
                Terms & Condition
              </a>
              <a href="" className=" text-xs lg:text-base hover:opacity-65 transition-all duration-300 ease-in font-normal">
                Cookies
              </a>
            </div>
            <div className="md:w-[55%] flex justify-between ">
              <p className="font-normal text-xs lg:text-base text-white">
                © 2025 GPDN.
              </p>
              <div className=" justify-between gap-4 text-white text-sm lg:text-2xl hidden md:flex">
                <a href="">
                  <RiTwitterXLine />
                </a>
                <a href="">
                  <RiFacebookCircleFill />
                </a>
                <a href="">
                  <RiLinkedinBoxFill />
                </a>
                <a href="">
                  <RiInstagramLine />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
