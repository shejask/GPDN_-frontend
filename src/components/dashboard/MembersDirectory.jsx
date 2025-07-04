"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from 'antd';
import ReactCountryFlag from 'react-country-flag';

// Icons
import { IoSearchOutline, IoFilterOutline, IoNewspaperOutline } from 'react-icons/io5';
import { MdDashboard, MdOutlineSettings } from "react-icons/md";
import { FaRegFolder, FaWhatsapp } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";

// API imports
import { fetchDoctors, searchDoctors, filterDoctors } from '../../api/Members';

// Logo import
import logo from '../../app/assets/registation/logo.png';

// Constants
const SIDEBAR_MENUS = [
  { menu: 'Forum', icon: <MdDashboard />, link: '/forum' },
  { menu: 'Resource Library', icon: <FaRegFolder />, link: '/resource-library' },
  { menu: 'Members', icon: <TbUsers />, link: '/members' },
  { menu: 'Palliative Units', icon: <PiBuildings />, link: '/palliative-units' },
  { menu: 'News & Blogs', icon: <IoNewspaperOutline />, link: '/news-blogs' },
  { menu: 'Settings', icon: <MdOutlineSettings />, link: '/settings' }
];

const COUNTRY_DATA = {
  'India': 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Japan': 'JP',
  'China': 'CN',
  'Brazil': 'BR',
  'South Africa': 'ZA',
  'Mexico': 'MX',
  'Spain': 'ES',
  'Italy': 'IT',
  'Russia': 'RU',
  'Singapore': 'SG',
  'New Zealand': 'NZ',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'South Korea': 'KR'
};

const FILTER_OPTIONS = {
  specialization: [
    'Pain Management',
    'Pediatric Care',
    'Geriatric Care',
    'Oncology',
    'Hospice Care'
  ],
  expertise: [
    'Advanced Pain Management',
    'End-of-Life Care',
    'Symptom Management',
    'Family Support',
    'Psychological Support'
  ]
};

const DEBOUNCE_DELAY = 300;

// Custom hooks
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Utility functions
const filterApprovedMembers = (members) => {
  return Array.isArray(members) 
    ? members.filter(member => member.registrationStatus === "approved")
    : [];
};

const getCountryCode = (countryName) => {
  if (!countryName) return null;
  return COUNTRY_DATA[countryName] || null;
};

const buildFilterPayload = (filters) => {
  const payload = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      switch (key) {
        case 'country':
          payload.countryOfPractice = value;
          break;
        case 'specialization':
          payload.specialization = value;
          break;
        case 'expertise':
          payload.expertise = value;
          break;
        default:
          payload[key] = value;
      }
    }
  });
  return payload;
};

// Main component
const MembersDirectory = () => {
  // State management
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    country: '',
    specialization: '',
    expertise: ''
  });
  
  // UI states
  const [showFilter, setShowFilter] = useState(false);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [countrySearchInput, setCountrySearchInput] = useState('');

  const debouncedSearchTerm = useDebounce(searchInput, DEBOUNCE_DELAY);

  // Load initial data
  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchDoctors();
      const doctors = response?.data?.data || [];
      const approvedMembers = filterApprovedMembers(doctors);
      
      setMembers(approvedMembers);
      setAllMembers(approvedMembers);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load members. Please try again.');
      setMembers([]);
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setMembers(allMembers);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      
      const response = await searchDoctors(searchTerm.trim());
      const searchResults = response?.data?.data || [];
      const approvedMembers = filterApprovedMembers(searchResults);
      
      setMembers(approvedMembers);
    } catch (err) {
      console.error('Error searching doctors:', err);
      setError('Search failed. Please try again.');
      setMembers([]);
    } finally {
      setSearchLoading(false);
    }
  }, [allMembers]);

  // Handle filters
  const handleFilter = useCallback(async (filterType, value) => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);
    
    // Close filter menus
    setShowFilter(false);
    setShowCountryMenu(false);
    setCountrySearchInput('');
    
    try {
      setLoading(true);
      setError(null);
      
      const activeFilters = Object.entries(newFilters).filter(([, val]) => val);
      
      if (activeFilters.length === 0) {
        setMembers(allMembers);
        return;
      }
      
      const filterPayload = buildFilterPayload(newFilters);
      const response = await filterDoctors(filterPayload);
      const filteredResults = response?.data?.data || [];
      
      setMembers(filteredResults);
    } catch (err) {
      console.error('Error filtering doctors:', err);
      setError('Filter failed. Please try again.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilters, allMembers]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedFilters({
      country: '',
      specialization: '',
      expertise: ''
    });
    setSearchInput('');
    setCountrySearchInput('');
    setError(null);
    setMembers(allMembers);
  }, [allMembers]);

  // Handle WhatsApp connection
  const handleWhatsAppConnect = useCallback((phoneNumber) => {
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  }, []);

  // Filter UI handlers
  const handleFilterClick = useCallback(() => {
    setShowFilter(!showFilter);
    setShowCountryMenu(false);
    setCountrySearchInput('');
  }, [showFilter]);

  const handleCountryClick = useCallback(() => {
    setShowCountryMenu(true);
    setShowFilter(false);
  }, []);

  const handleBackClick = useCallback(() => {
    setShowCountryMenu(false);
    setShowFilter(true);
    setCountrySearchInput('');
  }, []);

  // Effects
  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm === '') {
      setMembers(allMembers);
    }
  }, [debouncedSearchTerm, handleSearch, allMembers]);

  // Memoized values
  const filteredCountries = useMemo(() => {
    const countries = Object.keys(COUNTRY_DATA);
    if (!countrySearchInput) return countries;
    
    return countries.filter(country => 
      country.toLowerCase().includes(countrySearchInput.toLowerCase())
    );
  }, [countrySearchInput]);

  const hasActiveFilters = useMemo(() => 
    Object.values(selectedFilters).some(Boolean), 
    [selectedFilters]
  );

  const isSearchActive = useMemo(() => 
    searchInput.trim().length > 0, 
    [searchInput]
  );

  const isDataLoading = loading || searchLoading;

  // Render helpers
  const renderSidebar = () => (
    <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
      <div className="p-5">
        <Image alt="Logo" src={logo} width={100} priority />
      </div>
      
      <nav className="mt-5">
        {SIDEBAR_MENUS.map((item, index) => (
          <Link key={index} href={item.link} className="block">
            <div className="cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3">
              <span className="text-xl">{item.icon}</span>
              <span>{item.menu}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );

  const renderFilterMenu = () => (
    <>
      {/* Main Filter Menu */}
      {showFilter && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-medium">Add Filters</h3>
          </div>
          
          <div className="py-1">
            {/* Country Filter */}
            <button
              onClick={handleCountryClick}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span>Country</span>
                {selectedFilters.country && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {selectedFilters.country}
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
                  {FILTER_OPTIONS.specialization.map((spec) => (
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
                  {FILTER_OPTIONS.expertise.map((exp) => (
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

      {/* Country Submenu */}
      {showCountryMenu && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <button
              onClick={handleBackClick}
              className="text-gray-600 hover:text-gray-800"
            >
              ‹
            </button>
            <h3 className="font-medium">Country</h3>
          </div>
          
          <div className="p-2">
            <Input
              placeholder="Search countries"
              className="mb-2"
              value={countrySearchInput}
              onChange={(e) => setCountrySearchInput(e.target.value)}
              prefix={<IoSearchOutline className="text-gray-400" />}
            />
            
            <div className="py-1 max-h-64 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleFilter('country', country)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded"
                  >
                    {getCountryCode(country) ? (
                      <ReactCountryFlag
                        countryCode={getCountryCode(country)}
                        svg
                        style={{ width: '1.2em', height: '1.2em' }}
                      />
                    ) : (
                      <span>🌐</span>
                    )}
                    <span className="ml-1">{country}</span>
                  </button>
                ))
              ) : (
                <div className="text-center py-2 text-gray-500">No countries found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderActiveFilters = () => (
    (hasActiveFilters || isSearchActive) && (
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
    )
  );

  const renderError = () => (
    error && (
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
    )
  );

  const renderTableContent = () => {
    if (isDataLoading) {
      return (
        <tr>
          <td colSpan="5" className="py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A99D]"></div>
              <span className="text-gray-500">Loading members...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!Array.isArray(members) || members.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-gray-400 text-4xl">👥</div>
              <span className="text-gray-500 font-medium">
                {isSearchActive || hasActiveFilters ? 'No matching members found' : 'No members found'}
              </span>
              {(isSearchActive || hasActiveFilters) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[#00A99D] hover:text-[#008F84] font-medium text-sm"
                >
                  Clear filters and search
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    }

    return members.map((member, index) => (
      <tr key={member._id || index} className="hover:bg-gray-50 transition-colors duration-150">
        <td className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {member.imageURL ? (
                <Image 
                  src={member.imageURL}
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
            {getCountryCode(member.countryOfPractice) ? (
              <ReactCountryFlag
                countryCode={getCountryCode(member.countryOfPractice)}
                svg
                style={{ width: '1.5em', height: '1.5em' }}
              />
            ) : (
              <span>🌐</span>
            )}
            <span className="text-sm text-gray-700">{member.countryOfPractice || 'Not specified'}</span>
          </div>
        </td>
        <td className="py-4 px-6">
          <span className="text-sm text-gray-600">{member.email || 'Not provided'}</span>
        </td>
        <td className="py-4 px-6">
          {member.phoneNumber ? (
            <button 
              onClick={() => handleWhatsAppConnect(member.phoneNumber)}
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
    ));
  };

  return (
    <div className="flex min-h-screen bg-white">
      {renderSidebar()}

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
                onChange={(e) => setSearchInput(e.target.value)}
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

            {renderFilterMenu()}
          </div>
        </div>

        {renderActiveFilters()}
        {renderError()}

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
                    {renderTableContent()}
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