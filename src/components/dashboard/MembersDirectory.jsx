"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  // State management
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]); // Store original data for client-side filtering
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    specialization: '',
    expertise: ''
  });
  
  // UI states
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  // Debounce hook for search
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // Initial data load
  useEffect(() => {
    loadDoctors();
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm === '') {
      // Reset to original data when search is cleared
      resetToOriginalData();
    }
  }, [debouncedSearchTerm]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchDoctors();
      
      if (response?.data?.data) {
        setMembers(response.data.data);
        setAllMembers(response.data.data); // Store original data
      } else {
        setMembers([]);
        setAllMembers([]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load members. Please try again.');
      setMembers([]);
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      resetToOriginalData();
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const response = await searchDoctors(searchTerm.trim());
      
      if (response?.data?.data) {
        setMembers(response.data.data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
      setError('Search failed. Please try again.');
      setMembers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFilter = async (filterType, value) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    };
    setSelectedFilters(newFilters);
    
    // Close filter menus
    setShowFilter(false);
    setShowLocationMenu(false);
    
    if (!value) {
      // If clearing filter, apply remaining filters or reset to original data
      await applyAllFilters(newFilters);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create filter object based on filter type
      let filterPayload = {};
      switch (filterType) {
        case 'location':
          filterPayload = { countryOfPractice: value };
          break;
        case 'specialization':
          filterPayload = { specialization: value };
          break;
        case 'expertise':
          filterPayload = { expertise: value };
          break;
        default:
          filterPayload = { [filterType]: value };
      }
      
      const response = await filterDoctors(filterPayload);
      
      if (response?.data?.data) {
        setMembers(response.data.data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error filtering doctors:', error);
      setError('Filter failed. Please try again.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyAllFilters = async (filters) => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => value);
    
    if (activeFilters.length === 0) {
      resetToOriginalData();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Build comprehensive filter object
      const filterPayload = {};
      activeFilters.forEach(([key, value]) => {
        switch (key) {
          case 'location':
            filterPayload.countryOfPractice = value;
            break;
          case 'specialization':
            filterPayload.specialization = value;
            break;
          case 'expertise':
            filterPayload.expertise = value;
            break;
          default:
            filterPayload[key] = value;
        }
      });
      
      const response = await filterDoctors(filterPayload);
      
      if (response?.data?.data) {
        setMembers(response.data.data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Filter failed. Please try again.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const resetToOriginalData = () => {
    setMembers(allMembers);
    setSearchInput('');
    setError(null);
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      location: '',
      specialization: '',
      expertise: ''
    });
    setSearchInput('');
    resetToOriginalData();
  };

  // Handle input change (for immediate UI update)
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Memoized values
  const sidebarMenus = useMemo(() => [
    {menu : 'Forum', icon : <MdDashboard/>, link: '/forum'},
    {menu : 'Resource Library', icon : <FaRegFolder/>, link: '/resource-library'}, 
    {menu : 'Members', icon : <TbUsers/>, link: '/members'}, 
    {menu : 'Palliative Units', icon : <PiBuildings/>, link: '/palliative-units'}, 
    {menu : 'News & Blogs', icon : <IoNewspaperOutline/>, link: '/news-blogs'}, 
    {menu : 'Settings', icon : <MdOutlineSettings/>, link: '/settings'}
  ], []);

  const getCountryFlag = useCallback((countryName) => {
    if (!countryName) return '🌐';
    
    const countryToCode = {
      'India': 'IN',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Australia': 'AU'
    };
    
    const code = countryToCode[countryName];
    if (!code) return '🌐';
    
    try {
      return code
        .split('')
        .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
        .join('');
    } catch (error) {
      return '🌐';
    }
  }, []);

  // Filter menu handlers
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

  // Filter options
  const filterOptions = {
    location: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'],
    specialization: ['Pain Management', 'Pediatric Care', 'Geriatric Care', 'Oncology', 'Hospice Care'],
    expertise: ['Advanced Pain Management', 'End-of-Life Care', 'Symptom Management', 'Family Support', 'Psychological Support']
  };

  const hasActiveFilters = Object.values(selectedFilters).some(Boolean);
  const isSearchActive = searchInput.trim().length > 0;
  const isDataLoading = loading || searchLoading;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-5">
          <Image alt='Logo' src={logo} width={100}/>
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
            <div className="relative">
              <Input 
                placeholder="Search Any Members..." 
                className="w-64"
                value={searchInput}
                prefix={<IoSearchOutline className="text-gray-400" />}
                onChange={handleSearchInputChange}
                loading={searchLoading}
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00A99D]"></div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleFilterClick}
              className={`px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                hasActiveFilters ? 'bg-[#00A99D] text-white border-[#00A99D]' : 'bg-white text-gray-700'
              }`}
            >
              <IoFilterOutline /> 
              Filter
              {hasActiveFilters && (
                <span className="ml-1 bg-white text-[#00A99D] text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  {Object.values(selectedFilters).filter(Boolean).length}
                </span>
              )}
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
                  
                  {/* Specialization Filter */}
                  <div className="relative group">
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
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
                    <div className="absolute left-full top-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-30">
                      <div className="p-2">
                        {filterOptions.specialization.map((spec) => (
                          <button
                            key={spec}
                            onClick={() => handleFilter('specialization', spec)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded text-sm"
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expertise Filter */}
                  <div className="relative group">
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
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
                    <div className="absolute left-full top-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-30">
                      <div className="p-2">
                        {filterOptions.expertise.map((exp) => (
                          <button
                            key={exp}
                            onClick={() => handleFilter('expertise', exp)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded text-sm"
                          >
                            {exp}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={clearAllFilters}
                      className="w-full text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
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
        {(hasActiveFilters || isSearchActive) && (
          <div className="px-5 pt-20 pb-2 flex gap-2 flex-wrap items-center">
            {isSearchActive && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Search: "{searchInput}"
                <button 
                  onClick={() => setSearchInput('')}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {Object.entries(selectedFilters).map(([key, value]) => 
              value ? (
                <span 
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                  <button 
                    onClick={() => handleFilter(key, '')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ) : null
            )}
            {(hasActiveFilters || isSearchActive) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="px-5 pt-2">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
              <button 
                onClick={loadDoctors}
                className="ml-2 text-red-800 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className={`p-5 ${hasActiveFilters || isSearchActive ? 'pt-2' : 'pt-20'}`}>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Members {!isDataLoading && Array.isArray(members) && `(${members.length})`}
                </h2>
                {!isDataLoading && Array.isArray(members) && members.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {isSearchActive && `Search results for "${searchInput}"`}
                    {hasActiveFilters && !isSearchActive && 'Filtered results'}
                  </div>
                )}
              </div>
              
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
                    {isDataLoading && (
                      <tr>
                        <td colSpan="5" className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A99D]"></div>
                            <span className="text-gray-500">Loading members...</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {!isDataLoading && Array.isArray(members) && members.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-gray-400 text-4xl">👥</div>
                            <span className="text-gray-500 font-medium">
                              {isSearchActive || hasActiveFilters ? 'No matching members found' : 'No members found'}
                            </span>
                            {isSearchActive || hasActiveFilters ? (
                              <button
                                onClick={clearAllFilters}
                                className="text-[#00A99D] hover:text-[#008F84] font-medium text-sm"
                              >
                                Clear filters and search
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {!isDataLoading && Array.isArray(members) && members.map((member, index) => (
                      <tr key={member._id || index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                              {member.photo ? (
                                <Image 
                                  src={member.photo}
                                  alt={member.fullName || 'Member'}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-[#00A99D] text-white flex items-center justify-center text-lg font-medium">
                                  {member.fullName?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{member.fullName || 'Unknown'}</span>
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
                            <div>{member.medicalQualification || 'Not specified'}</div>
                            {member.yearOfGraduation && (
                              <div className="text-xs text-gray-500">Graduated {member.yearOfGraduation}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getCountryFlag(member.countryOfPractice)}</span>
                            <span className="text-sm text-gray-700">{member.countryOfPractice || 'Not specified'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">{member.email || 'Not provided'}</span>
                        </td>
                        <td className="py-4 px-6">
                          {member.phoneNumber ? (
                            <button 
                              onClick={() => window.open(`https://wa.me/${member.phoneNumber.replace(/\D/g, '')}`, '_blank')}
                              className="px-5 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] transition-colors duration-150 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
                            >
                              <FaWhatsapp className="text-base" />
                              <span>Connect</span>
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">No contact</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {!isDataLoading && !Array.isArray(members) && (
                      <tr>
                        <td colSpan="5" className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-red-400 text-4xl">⚠️</div>
                            <span className="text-red-500 font-medium">Error loading members</span>
                            <button
                              onClick={loadDoctors}
                              className="text-[#00A99D] hover:text-[#008F84] font-medium text-sm"
                            >
                              Try again
                            </button>
                          </div>
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