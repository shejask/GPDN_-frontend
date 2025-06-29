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
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoFilterOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import azeem from '../../app/assets/registation/Frame.png'
import Link from 'next/link';
import { fetchDoctors, searchDoctors, filterDoctors } from '../../api/Members';

const MembersDirectory = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    specialization: '',
    expertise: ''
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetchDoctors();
      // Initialize empty array if no data
      setMembers(response?.data?.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setSearchInput(value);
    if (!value) {
      loadDoctors();
      return;
    }
    try {
      setLoading(true);
      const response = await filterDoctors(value);
      setMembers(response?.data?.data || []);
    } catch (error) {
      console.error('Error searching doctors:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (filterType, value) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    };
    setSelectedFilters(newFilters);
    
    try {
      setLoading(true);
      const response = await filterDoctors(value);
      setMembers(response?.data?.data || []);
    } catch (error) {
      console.error('Error filtering doctors:', error);
      setMembers([]);
    } finally {
      setLoading(false);
      setShowFilter(false);
      setShowLocationMenu(false);
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

  const getCountryFlag = (countryName) => {
    // Convert country name to emoji flag - using regional indicator symbols
    try {
      // This will work for most common country names
      return countryName
        ? countryName
            .toUpperCase()
            .replace(/./g, char => 
              String.fromCodePoint(char.charCodeAt(0) + 127397))
        : '🌐';
    } catch (error) {
      return '🌐';
    }
  };

  const [showFilter, setShowFilter] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const handleFilterClick = () => {
    setShowFilter(!showFilter);
    setShowLocationMenu(false);
  };
  
  const handleLocationClick = () => {
    setShowLocationMenu(true);
    setShowFilter(false);
  };
  
  const handleBackClick = () => {
    setShowLocationMenu(false);
    setShowFilter(true);
  };

  // Define filter options
  const filterOptions = {
    location: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'],
    specialization: ['Pain Management', 'Pediatric Care', 'Geriatric Care', 'Oncology', 'Hospice Care'],
    expertise: ['Advanced Pain Management', 'End-of-Life Care', 'Symptom Management', 'Family Support', 'Psychological Support']
  };

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
              <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
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
          <h1 className="text-xl font-semibold">Members Directory</h1>
          <div className="flex gap-3 relative">
            <Input 
              placeholder="Search Any Members..." 
              className="w-64"
              prefix={<IoSearchOutline className="text-gray-400" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button 
              onClick={handleFilterClick}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <IoFilterOutline /> Filter
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
                    <div className="flex items-center gap-2">
                      <span>Location</span>
                      {selectedFilters.location && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {selectedFilters.location}
                        </span>
                      )}
                    </div>
                    <span>›</span>
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => setShowFilter(prev => ({ ...prev, specialization: true }))}
                  >
                    <div className="flex items-center gap-2">
                      <span>Specialization</span>
                      {selectedFilters.specialization && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {selectedFilters.specialization}
                        </span>
                      )}
                    </div>
                    <span>›</span>
                  </button>
                  <button 
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => setShowFilter(prev => ({ ...prev, expertise: true }))}
                  >
                    <div className="flex items-center gap-2">
                      <span>Expertise</span>
                      {selectedFilters.expertise && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {selectedFilters.expertise}
                        </span>
                      )}
                    </div>
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
                    {filterOptions.location.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleFilter('location', location)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded"
                      >
                        <span>{getCountryFlag(location)}</span> {location}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedFilters.location || selectedFilters.specialization || selectedFilters.expertise) && (
          <div className="px-5 pt-2 flex gap-2 flex-wrap">
            {Object.entries(selectedFilters).map(([key, value]) => 
              value ? (
                <span 
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {value}
                  <button 
                    onClick={() => handleFilter(key, '')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ) : null
            )}
            {Object.values(selectedFilters).some(Boolean) && (
              <button
                onClick={() => {
                  setSelectedFilters({
                    location: '',
                    specialization: '',
                    expertise: ''
                  });
                  loadDoctors();
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Members Table */}
        <div className="pt-20 p-5 mt-10">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">Members</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 tracking-wider">Full Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 tracking-wider">Qualification</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 tracking-wider">Location</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 tracking-wider">Email Address</th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 tracking-wider">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(members) && members.map((member, index) => (
                      <tr key={member._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                              {member.photo ? (
                                <Image 
                                  src={member.photo}
                                  alt={member.fullName}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-[#00A99D] text-white flex items-center justify-center text-lg font-medium">
                                  {member.fullName?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{member.fullName}</span>
                              {member.role === 'moderator' && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Moderator
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <div>
                            <div>{member.medicalQualification}</div>
                            <div className="text-xs text-gray-500">Graduated {member.yearOfGraduation}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getCountryFlag(member.countryOfPractice)}</span>
                            <span className="text-sm text-gray-700">{member.countryOfPractice}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">{member.email}</span>
                        </td>
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => window.open(`https://wa.me/${member.phoneNumber}`, '_blank')}
                            className="px-5 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] transition-colors duration-150 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
                          >
                            <FaWhatsapp className="text-base" />
                            <span>Connect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {loading && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          Loading members...
                        </td>
                      </tr>
                    )}
                    {!loading && Array.isArray(members) && members.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          No members found
                        </td>
                      </tr>
                    )}
                    {!loading && !Array.isArray(members) && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-red-500">
                          Error loading members. Please try again.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default MembersDirectory;