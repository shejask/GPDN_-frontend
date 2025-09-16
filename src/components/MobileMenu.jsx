"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { GoChevronRight } from "react-icons/go";

const MobileMenu = ({ isShowMenu, setIsShowMenu }) => {
  const pathname = usePathname();

  return (
    <section
      className={`z-20 fixed lg:hidden top-0 bg-white w-[75%] h-screen border-r-4 border-primary shadow-2xl ${
        isShowMenu ? "left-0" : "-left-[80vw]"
      } transition-all duration-500 ease-in-out`}
    >
      <div className="h-full w-full flex flex-col justify-between p-8 pt-20">
        {/* Navigation Links */}
        <div className="flex flex-col gap-8">
          <Link onClick={() => setIsShowMenu(!isShowMenu)} href={"/"}>
            <button
              className={`${
                pathname === "/"
                  ? "text-primary text-xl font-semibold"
                  : "text-gray-800 text-xl"
              } font-medium hover:text-primary transition-colors duration-200`}
            >
              Home
            </button>
          </Link>
          <Link onClick={() => setIsShowMenu(!isShowMenu)} href={"/about"}>
            <button
              className={`${
                pathname === "/about"
                  ? "text-primary text-xl font-semibold"
                  : "text-gray-800 text-xl"
              } font-medium hover:text-primary transition-colors duration-200`}
            >
              About
            </button>
          </Link>
          <Link onClick={() => setIsShowMenu(!isShowMenu)} href={"/blog"}>
            <button
              className={`${
                pathname.startsWith("/blog")
                  ? "text-primary text-xl font-semibold"
                  : "text-gray-800 text-xl"
              } font-medium hover:text-primary transition-colors duration-200`}
            >
              Blog
            </button>
          </Link>
          <Link
            onClick={() => setIsShowMenu(!isShowMenu)}
            href={"/Palliative-home"}
          >
            <button
              className={`${
                pathname === "/Palliative-home"
                  ? "text-primary text-xl font-semibold"
                  : "text-gray-800 text-xl"
              } font-medium hover:text-primary transition-colors duration-200`}
            >
              Palliative
            </button>
          </Link>
          <Link onClick={() => setIsShowMenu(!isShowMenu)} href={"/contact"}>
            <button
              className={`${
                pathname === "/contact"
                  ? "text-primary text-xl font-semibold"
                  : "text-gray-800 text-xl"
              } font-medium hover:text-primary transition-colors duration-200`}
            >
              Contact
            </button>
          </Link>
        </div>

        {/* Sign In Button */}
        <div className="pt-8 border-t border-gray-200">
          <Link onClick={() => setIsShowMenu(!isShowMenu)} href="/signin">
            <button className="w-full bg-teal-500 hover:bg-[#039187] cursor-pointer transition-all duration-300 ease-in text-white text-base font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
              Sign In
              <GoChevronRight className="text-xl" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MobileMenu;
