"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, Button as AntButton } from "antd";
import {
  MdDashboard,
  MdOutlineSettings,
  MdMenu,
  MdClose,
  MdLogout,
} from "react-icons/md";
import { FaRegFolder } from "react-icons/fa";
import { TbUser, TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import logo from "../app/assets/registation/logo.png"; // Adjust path as needed

const sidebarMenus = [
  { menu: "Forum", icon: <MdDashboard />, link: "/forum" },
  {
    menu: "Resource Library",
    icon: <FaRegFolder />,
    link: "/resource-library",
  },
  { menu: "Members", icon: <TbUsers />, link: "/members" },
  {
    menu: "Palliative Units",
    icon: <PiBuildings />,
    link: "/palliative-units",
  },
  { menu: "News & Blogs", icon: <IoNewspaperOutline />, link: "/news-blogs" },
  { menu: "Profile", icon: <TbUser />, link: "/settings" },
];

export default function Sidebar({
  mobileMenuOpen,
  handleMobileMenuToggle,
  children,
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Logout handler
  const handleLogout = () => {
    // Remove user info from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userFullName");
    // Optionally clear all: localStorage.clear();
    setLogoutModalOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* Mobile Header/Topbar */}
      <div className="flex md:hidden w-full h-16 bg-[#00A99D] fixed top-0 z-30 px-5 items-center justify-between">
        <Image alt="GPDN Logo" src={logo} width={100} className="h-auto" />
        <div
          onClick={handleMobileMenuToggle}
          className="text-2xl text-white cursor-pointer p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-all duration-200 relative"
        >
          <MdMenu
            className={`absolute inset-0 transition-all duration-300 ${
              mobileMenuOpen
                ? "rotate-180 opacity-0 scale-75"
                : "rotate-0 opacity-100 scale-100"
            }`}
          />
          <MdClose
            className={`absolute inset-0 transition-all duration-300 ${
              mobileMenuOpen
                ? "rotate-0 opacity-100 scale-100"
                : "rotate-180 opacity-0 scale-75"
            }`}
          />
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleMobileMenuToggle}
      />

      {/* Sidebar */}
      <div
        className={`w-64 border-r border-gray-200 fixed h-screen overflow-y-auto bg-white z-30 flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:block`}
      >
        <div className=" flex flex-col h-screen justify-between">
          <div>
            <Link href="/">
              <div className="p-5">
                <Image
                  onClick={handleLogout}
                  alt="GPDN Logo"
                  src={logo}
                  width={100}
                  className="h-auto hidden md:block"
                />
              </div>
            </Link>
            <nav className="mt-5">
              {sidebarMenus.map((item, index) => {
                // Active logic: highlights for /forum and /forum/[threadid]
                const isForum =
                  item.link === "/forum" &&
                  (pathname === "/forum" ||
                    pathname.startsWith("/forum/") ||
                    pathname === `/forum/${params.threadid || ""}`);
                const isActive =
                  isForum ||
                  (item.link !== "/forum" && pathname.startsWith(item.link));
                return (
                  <Link key={index} href={item.link} className="block">
                    <div
                      className={`cursor-pointer flex items-center gap-5 px-5 py-3 transition-colors duration-300 
                      ${
                        isActive
                          ? "bg-[#00A99D] text-white"
                          : "hover:bg-[#00A99D] hover:text-white text-gray-700"
                      }
                    `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.menu}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
          {/* Logout Button */}

          <div className="">
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3   text-black border-t  text-base shadow-md hover:from-[#008F84] hover:to-[#00A99D] transition-all duration-200 "
              style={{
                letterSpacing: "0.03em",
                boxShadow: "0 2px 12px 0 rgba(0,169,157,0.08)",
              }}
            >
              <MdLogout size={22} />
              Logout
            </button>
          </div>
          {/* Logout Modal */}
          <Modal
            open={logoutModalOpen}
            onCancel={() => setLogoutModalOpen(false)}
            footer={null}
            centered
            closable={false}
            className="logout-modal"
          >
            <div className="text-center p-6">
              <MdLogout size={48} className="mx-auto text-[#00A99D] mb-3" />
              <h2 className="text-xl font-bold mb-2">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex justify-center gap-4">
                <AntButton
                  onClick={() => setLogoutModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </AntButton>
                <AntButton
                  type="primary"
                  danger
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-lg bg-[#00A99D] hover:bg-[#008F84] border-none text-white font-semibold"
                >
                  Logout
                </AntButton>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      {/* Main content wrapper for layout usage */}
      {children && (
        <div className="flex-1 md:ml-64 mt-16 md:mt-0">{children}</div>
      )}
    </>
  );
}
