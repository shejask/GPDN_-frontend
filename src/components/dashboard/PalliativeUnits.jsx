"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "antd";
import logo from "../../app/assets/registation/logo.png";
import { IoSearchOutline } from "react-icons/io5";
import { MdClose, MdDashboard, MdMenu } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { FiPhone } from "react-icons/fi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoFilterOutline, IoLocationOutline } from "react-icons/io5";
import Link from "next/link";
import {
  fetchPalliativeUnits,
  searchPalliativeUnit,
} from "../../api/PalliativeUnit";
import { usePathname } from "next/navigation"; // Add this import
import { LogOut } from "lucide-react";
import Sidebar from "../Sidebar";
const PalliativeUnits = () => {
  const pathname = usePathname(); // Add this line
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [palliativeUnits, setPalliativeUnits] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const response = await fetchPalliativeUnits();
        // Ensure we're getting an array from the API response structure
        let units = [];
        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data)
        ) {
          units = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          units = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          units = response.data;
        } else if (response?.data?.data) {
          // If data.data exists but isn't an array, wrap it in an array
          units = [response.data.data];
        } else if (response?.data) {
          // If data exists but isn't an array, wrap it in an array
          units = [response.data];
        }
        console.log("Fetched palliative units:", units);
        setPalliativeUnits(units);
      } catch (error) {
        console.error("Error fetching palliative units:", error);
        setPalliativeUnits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    if (!searchInput.trim()) {
      // If search input is empty, fetch all units
      const response = await fetchPalliativeUnits();
      if (response?.data) {
        const units = Array.isArray(response.data)
          ? response.data
          : response.data.data && Array.isArray(response.data.data)
          ? response.data.data
          : [response.data];
        setPalliativeUnits(units);
      }
      setLoading(false);
      return;
    }

    try {
      console.log("Searching for:", searchInput);
      const response = await searchPalliativeUnit(searchInput);
      console.log("Search result:", response);

      if (response?.data) {
        // Handle different response structures
        const units = Array.isArray(response.data)
          ? response.data
          : response.data.data && Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data
          ? [response.data.data]
          : [response.data];

        console.log("Processed units:", units);
        setPalliativeUnits(units);
      } else {
        setPalliativeUnits([]);
      }
    } catch (error) {
      console.error("Error searching palliative units:", error);
      setPalliativeUnits([]);
    } finally {
      setLoading(false);
    }
  };

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
    { menu: "Settings", icon: <MdOutlineSettings />, link: "/settings" },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="grid md:flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
      />

      {/* Main Content */}
      <div className="md:flex-1 md:ml-64 mt-16 md:mt-0">
        {/* Header */}
        <div className="p-5 md:flex justify-between items-center border-b border-gray-200 bg-white fixed md:w-[calc(100%-256px)] z-10">
          <h1 className="text-xl font-semibold">Palliative Units Directory</h1>
          <div className="flex gap-3 relative filter-container">
            <Input
              placeholder="Search Palliative Units..."
              className="md:w-64 h-9 md:h-10 "
              prefix={<IoSearchOutline className="text-gray-400" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
            />
            <button
              onClick={handleSearch}
              className="px-2 md:px-4 py-2 mt-1 md:mt-0 h-9 md:h-10 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <IoSearchOutline /> Search
            </button>

            {/* Main Filter Menu */}
            {showFilter && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-medium">Add Filters</h3>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLocationClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                  >
                    Location
                    <span>›</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
                    Specialization
                    <span>›</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
                    Expertise
                    <span>›</span>
                  </button>
                </div>
              </div>
            )}

            {/* Location Submenu */}
            {showLocationMenu && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                  <button
                    onClick={handleBackClick}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ‹
                  </button>
                  <h3 className="font-medium">Location</h3>
                </div>
                <div className="p-2">
                  <Input
                    placeholder="Find Any Location"
                    className="mb-2"
                    prefix={<IoSearchOutline className="text-gray-400" />}
                  />
                  <div className="py-1">
                    <button className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded">
                      <span>🇬🇧</span> United Kingdom
                    </button>
                    <button className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded">
                      <span>🇺🇦</span> Ukraine
                    </button>
                    <button className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded">
                      <span>🇹🇷</span> Turkey
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Palliative Units Grid */}
        <div className="pt-20 p-5 mt-10">
          <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
              // Skeleton loading UI
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse "
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <div className="h-6 bg-gray-200 rounded md:w-3/4 mb-2"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/5"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : palliativeUnits.length > 0 ? (
              palliativeUnits.map((unit, index) => (
                <div className="">
                  <div className="max-w-2xl">
                    <div
                      key={unit._id || index}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-2">
                        {/* Header Section */}
                        <div className="flex flex-col gap-3">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {unit.name}
                          </h2>
                          <div className="flex items-center gap-2 text-gray-600">
                            <IoLocationOutline className="text-xl text-gray-500" />
                            <span className="text-base">
                              {unit.country ||
                                unit.state ||
                                "Location not specified"}
                            </span>
                          </div>
                        </div>

                        {/* Services Section */}
                        <div className="space-y-4">
                          <p className="tex font-medium text-[#00A99D]">
                            Services:
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {unit.services ? (
                              Array.isArray(unit.services) ? (
                                unit.services.map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="px-4 py-1 bg-[#E3F2FD] text-[#1976D2] rounded text-sm font-medium"
                                  >
                                    {typeof service === "object"
                                      ? service.service || "Unknown Service"
                                      : service}
                                  </span>
                                ))
                              ) : typeof unit.services === "object" ? (
                                // Handle case when services is a single object
                                <span className="px-4 py-1 bg-[#E3F2FD] text-[#1976D2] rounded text-sm font-medium">
                                  {unit.services.service || "Unknown Service"}
                                </span>
                              ) : (
                                <span className="px-4 py-1 bg-[#E3F2FD] text-[#1976D2] rounded text-sm font-medium">
                                  {String(unit.services)}
                                </span>
                              )
                            ) : (
                              <span className="text-gray-500">
                                No services available
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Contact Section */}
                        <div className="flex my-2 items-center gap-2 text-gray-600">
                          <FiPhone className="text-xl text-[#1976D2]" />
                          <span className="text-base font-medium">
                            {unit.contactDetails || "No contact information"}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200"></div>

                        {/* Contact Button */}
                        <button className="w-fit px-6 py-3 mt-2 bg-[#00A99D] text-white rounded-xl hover:bg-[#008F84] transition-colors duration-150 text-sm font-medium shadow-sm">
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-10">
                <p className="text-gray-500">No palliative units found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalliativeUnits;
