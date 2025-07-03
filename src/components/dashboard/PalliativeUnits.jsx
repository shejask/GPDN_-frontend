"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from 'antd';
import logo from '../../app/assets/registation/logo.png'
import { IoSearchOutline } from 'react-icons/io5';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { FiPhone } from "react-icons/fi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoFilterOutline,IoLocationOutline } from "react-icons/io5";
import Link from 'next/link';
import { fetchPalliativeUnits, searchPalliativeUnit } from '../../api/PalliativeUnit';

const PalliativeUnits = () => {
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
        if (response?.success && response?.data && Array.isArray(response.data)) {
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
        const units = Array.isArray(response.data) ? response.data : 
                     (response.data.data && Array.isArray(response.data.data)) ? response.data.data : 
                     [response.data];
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
        const units = Array.isArray(response.data) ? response.data : 
                     (response.data.data && Array.isArray(response.data.data)) ? response.data.data : 
                     (response.data.data) ? [response.data.data] :
                     [response.data];
        
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
    {menu : 'Forum', icon : <MdDashboard/>, link: '/forum'},
    {menu : 'Resource Library', icon : <FaRegFolder/>, link: '/resource-library'}, 
    {menu : 'Members', icon : <TbUsers/>, link: '/members'}, 
    {menu : 'Palliative Units', icon : <PiBuildings/>, link: '/palliative-units'}, 
    {menu : 'News & Blogs', icon : <IoNewspaperOutline/>, link: '/news-blogs'}, 
    {menu : 'Settings', icon : <MdOutlineSettings/>, link: '/settings'}
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-5">
          <Image alt='' src={logo} width={100}/>
        </div>
        
        <nav className="mt-5">
          {sidebarMenus.map((item, index) => (
            <Link key={index} href={item.link} className='block'>
              <div className={`cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3 ${item.menu === 'Palliative Units' ? 'bg-[#00A99D] text-white' : ''}`}>
                <h1 className='text-xl'>{item.icon}</h1>
                <h1 className=''>{item.menu}</h1>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white fixed w-[calc(100%-256px)] z-10">
          <h1 className="text-xl font-semibold">Palliative Units Directory</h1>
          <div className="flex gap-3 relative filter-container">


              <Input
        placeholder="Search Palliative Units..."
        className="w-64"
        prefix={<IoSearchOutline className="text-gray-400" />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onPressEnter={handleSearch}
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
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
          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              // Skeleton loading UI
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex flex-col gap-4">
                    <div className='flex flex-col'>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
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
                <div key={unit._id || index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex flex-col gap-4">
                    <div className='flex flex-col'>
                      <h2 className="text-lg font-semibold text-gray-900">{unit.name}</h2>
                      <div className="flex items-center font-semibold gap-2 text-gray-600">
                        <IoLocationOutline className="text-lg" />
                        <span>{unit.country || unit.state || 'Location not specified'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-[#00A99D]">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {unit.services ? (
                          Array.isArray(unit.services) ? (
                            unit.services.map((service, idx) => (
                              <span 
                                key={idx} 
                                className="px-3 py-1 bg-[#009DFF17] text-gray-700 rounded-md text-sm"
                              >
                                {typeof service === 'object' ? (service.service || 'Unknown Service') : service}
                              </span>
                            ))
                          ) : typeof unit.services === 'object' ? (
                            // Handle case when services is a single object
                            <span className="px-3 py-1 bg-[#009DFF17] text-gray-700 rounded-md text-sm">
                              {unit.services.service || 'Unknown Service'}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-[#009DFF17] text-gray-700 rounded-md text-sm">
                              {String(unit.services)}
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500">No services available</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center font-semibold gap-2 text-gray-600">
                      <FiPhone className="text-lg" />
                      <span className="text-sm">{unit.contactDetails || 'No contact information'}</span>
                    </div>
                    <button className="w-fit px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] transition-colors duration-150 text-sm font-medium">
                      Contact
                    </button>
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