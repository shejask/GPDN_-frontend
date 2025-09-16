"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import MobileMenu from "./MobileMenu";
import { CgClose } from "react-icons/cg";
import { GoChevronRight } from "react-icons/go";
import logoGpdn from "../../public/logo-gpdn.png";

const Navbar = () => {
  const [isShowMenu, setIsShowMenu] = useState(false);

  useEffect(() => {
    if (isShowMenu) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isShowMenu]);

  return (
    <div className="w-full relative">
      <div className="w-full flex justify-between items-center">
        {/* ----- Logo and Navlinks------- */}
        <div className="flex justify-between items-center gap-16">
          <Link href={"/"}>
            <div className="w-32">
              <Image className="w-full" alt="Img" src={logoGpdn} />
            </div>
          </Link>

          <div className="font-normal text-[#0C0E12] text-lg  justify-between gap-8  hidden md:flex">
            <Link href={"/"}>
              <button className="">Home</button>
            </Link>
            <Link href={"/about"}>
              <button className="">About</button>
            </Link>
            <Link href={"/blog"}>
              <button className="">Blog</button>
            </Link>
            <Link href={"/Palliative-home"}>
              <button className="">Palliative</button>
            </Link>
            <Link href={"/contact"}>
              <button className="">Contact</button>
            </Link>
          </div>
        </div>

        {/* ---Get Started button--- */}
        <div className=" flex items-center gap-5">
          {/* <Link
            href="/registration"
            className="bg-primary hover:bg-[#039187] cursor-pointer transition-all duration-300 ease-in text-white text-sm font-poppins py-3 px-5 rounded-xl hidden items-center justify-around md:flex gap-2"
          >
            Sign up
            <GoChevronRight className="text-xl" />
          </Link> */}
          <Link
            href="/signin"
            className="bg-teal-500 hover:bg-[#039187] cursor-pointer transition-all duration-300 ease-in text-white text-sm font-poppins py-3 px-5 rounded-xl hidden items-center justify-around md:flex gap-2"
          >
            Sign In
            <GoChevronRight className="text-xl" />
          </Link>
        </div>

        {/* ----Mobile Menu Icon and close icon--- */}
        <div className="md:hidden">
          {isShowMenu ? (
            <CgClose
              onClick={() => setIsShowMenu(!isShowMenu)}
              className="text-4xl"
            />
          ) : (
            <HiOutlineMenuAlt2
              onClick={() => setIsShowMenu(!isShowMenu)}
              className="text-4xl "
            />
          )}
        </div>
      </div>

      {/* -----Mobile Menu------- */}
      <MobileMenu isShowMenu={isShowMenu} setIsShowMenu={setIsShowMenu} />
    </div>
  );
};

export default Navbar;
