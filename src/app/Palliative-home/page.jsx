"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input, Modal, message, Select } from "antd";
import logo from "../../app/assets/registation/logo.png";
import { IoSearchOutline } from "react-icons/io5";
import { MdClose, MdDashboard, MdMenu, MdAdd } from "react-icons/md";
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
  createPalliativeUnit,
  fetchServices,
} from "../../api/PalliativeUnit";
import { usePathname } from "next/navigation"; // Add this import
import { LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Home/Footer";

const PalliativeUnits = () => {
  const pathname = usePathname(); // Add this line
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showSpecialityMenu, setShowSpecialityMenu] = useState(false);
  const [showSpecializationMenu, setShowSpecializationMenu] = useState(false);
  const [showExpertiseMenu, setShowExpertiseMenu] = useState(false);
  const [palliativeUnits, setPalliativeUnits] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");

  // Create modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    services: "",
    contactDetails: "",
  });

  // Speciality options
  const specialityOptions = [
    "Adult Palliative Care",
    "Paediatric Palliative Care",
    "Neuro-palliative care",
    "Pulmonary palliative care",
    "Ethics / Legal in Palliative Care",
    "Research in Palliative Care",
  ];

  // Specialization options
  const specializationOptions = [
    "Oncology",
    "Cardiology",
    "Neurology",
    "Respiratory",
    "Geriatrics",
    "Pediatrics",
    "Pain Management",
    "Symptom Control",
  ];

  // Expertise options
  const expertiseOptions = [
    "Pain Assessment",
    "Symptom Management",
    "End-of-Life Care",
    "Family Support",
    "Bereavement Counseling",
    "Spiritual Care",
    "Social Work",
    "Nursing Care",
  ];

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

    const fetchServicesData = async () => {
      try {
        const response = await fetchServices();
        if (response?.success && response?.data) {
          setServices(response.data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchUnits();
    fetchServicesData();
  }, []);

  // Reference to fetchUnits for use in other functions
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

      // Filter out units where public is false - this is specific to this page only
      const publicUnits = units.filter((unit) => unit.public === true);

      console.log("Fetched palliative units:", units);
      console.log("Public units only:", publicUnits);
      setPalliativeUnits(publicUnits);
    } catch (error) {
      console.error("Error fetching palliative units:", error);
      setPalliativeUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    // Clear speciality filter when searching
    setSelectedSpeciality("");

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

  const handleCreateUnit = async () => {
    setCreateLoading(true);
    try {
      const response = await createPalliativeUnit(formData);
      if (response) {
        message.success("Palliative unit created successfully!");
        setIsCreateModalOpen(false);
        setFormData({
          name: "",
          state: "",
          country: "",
          services: "",
          contactDetails: "",
        });
        // Refresh the list after creation
        const refreshResponse = await fetchPalliativeUnits();
        if (refreshResponse?.data) {
          const units = Array.isArray(refreshResponse.data)
            ? refreshResponse.data
            : refreshResponse.data.data &&
              Array.isArray(refreshResponse.data.data)
            ? refreshResponse.data.data
            : [refreshResponse.data];
          setPalliativeUnits(units);
        }
      } else {
        message.error("Failed to create palliative unit.");
      }
    } catch (error) {
      console.error("Error creating palliative unit:", error);
      message.error("Failed to create palliative unit.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLocationClick = () => {
    setShowLocationMenu(true);
    setShowFilter(false);
  };

  const handleBackClick = () => {
    setShowLocationMenu(false);
    setShowFilter(true);
  };

  const handleSpecialityClick = () => {
    setShowSpecialityMenu(true);
    setShowFilter(false);
  };

  const handleSpecialityBackClick = () => {
    setShowSpecialityMenu(false);
    setShowFilter(true);
  };

  const handleSpecializationClick = () => {
    setShowSpecializationMenu(true);
    setShowFilter(false);
  };

  const handleSpecializationBackClick = () => {
    setShowSpecializationMenu(false);
    setShowFilter(true);
  };

  const handleExpertiseClick = () => {
    setShowExpertiseMenu(true);
    setShowFilter(false);
  };

  const handleExpertiseBackClick = () => {
    setShowExpertiseMenu(false);
    setShowFilter(true);
  };

  const handleSpecialitySelect = (speciality) => {
    setSelectedSpeciality(speciality);
    setShowSpecialityMenu(false);
    setShowFilter(false);
    // Apply speciality filter
    applySpecialityFilter(speciality);
  };

  const handleSpecializationSelect = (specialization) => {
    setSelectedSpecialization(specialization);
    setShowSpecializationMenu(false);
    setShowFilter(false);
    // Apply specialization filter
    applySpecializationFilter(specialization);
  };

  const handleExpertiseSelect = (expertise) => {
    setSelectedExpertise(expertise);
    setShowExpertiseMenu(false);
    setShowFilter(false);
    // Apply expertise filter
    applyExpertiseFilter(expertise);
  };

  const applySpecialityFilter = (speciality) => {
    if (!speciality) return;

    setLoading(true);
    // Filter palliative units by speciality
    // This is a client-side filter - you can implement server-side filtering if needed
    const filteredUnits = palliativeUnits.filter((unit) => {
      // Check if the unit has speciality information
      // You might need to adjust this based on your actual data structure
      return (
        unit.speciality === speciality ||
        unit.specialities?.includes(speciality) ||
        unit.services?.some((service) =>
          typeof service === "object"
            ? service.speciality === speciality
            : service === speciality
        )
      );
    });

    setPalliativeUnits(filteredUnits);
    setLoading(false);
  };

  const applySpecializationFilter = (specialization) => {
    if (!specialization) return;

    setLoading(true);
    // Filter palliative units by specialization
    const filteredUnits = palliativeUnits.filter((unit) => {
      return (
        unit.specialization === specialization ||
        unit.specializations?.includes(specialization)
      );
    });
    setPalliativeUnits(filteredUnits);
    setLoading(false);
  };

  const applyExpertiseFilter = (expertise) => {
    if (!expertise) return;

    setLoading(true);
    // Filter palliative units by expertise
    const filteredUnits = palliativeUnits.filter((unit) => {
      return (
        unit.expertise === expertise || unit.expertises?.includes(expertise)
      );
    });
    setPalliativeUnits(filteredUnits);
    setLoading(false);
  };

  const clearSpecialityFilter = () => {
    setSelectedSpeciality("");
    // Refresh the original list
    fetchUnits();
  };

  const clearSpecializationFilter = () => {
    setSelectedSpecialization("");
    // Refresh the original list
    fetchUnits();
  };

  const clearExpertiseFilter = () => {
    setSelectedExpertise("");
    // Refresh the original list
    fetchUnits();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      state: "",
      country: "",
      services: "",
      contactDetails: "",
    });
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    resetForm();
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="md:p-5 md:px-10 p-5">
          <Navbar />
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Active Filters */}
            {/* <div className="flex flex-wrap items-center gap-2">
              {selectedSpeciality && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#00A99D] text-white text-sm rounded-full font-medium">
                    {selectedSpeciality}
                  </span>
                  <button
                    onClick={clearSpecialityFilter}
                    className="text-gray-400 hover:text-gray-600 text-sm p-1 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedSpecialization && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#1976D2] text-white text-sm rounded-full font-medium">
                    {selectedSpecialization}
                  </span>
                  <button
                    onClick={clearSpecializationFilter}
                    className="text-gray-400 hover:text-gray-600 text-sm p-1 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedExpertise && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#FF6B35] text-white text-sm rounded-full font-medium">
                    {selectedExpertise}
                  </span>
                  <button
                    onClick={clearExpertiseFilter}
                    className="text-gray-400 hover:text-gray-600 text-sm p-1 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div> */}
            <div></div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Search Palliative Units..."
                  className="w-full sm:w-80 h-10"
                  prefix={<IoSearchOutline className="text-gray-400" />}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onPressEnter={handleSearch}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 h-10 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors duration-150 flex items-center gap-2 font-medium shadow-sm"
                >
                  <IoSearchOutline className="text-lg" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Filter Button */}
              {/* <button
                onClick={() => setShowFilter(!showFilter)}
                className="px-4 py-2 h-10 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium"
              >
                <IoFilterOutline className="text-lg" />
                <span className="hidden sm:inline">Filter</span>
              </button> */}

              {/* Main Filter Menu */}
              {/* {showFilter && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-30">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Filter by</h3>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleLocationClick}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center text-gray-700"
                    >
                      <span className="flex items-center gap-2">
                        <IoLocationOutline className="text-lg" />
                        Location
                      </span>
                      <span className="text-gray-400">›</span>
                    </button>
                    <button
                      onClick={handleSpecialityClick}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center text-gray-700"
                    >
                      <span className="flex items-center gap-2">
                        <MdDashboard className="text-lg" />
                        Speciality
                      </span>
                      <span className="text-gray-400">›</span>
                    </button>
                    <button
                      onClick={handleSpecializationClick}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center text-gray-700"
                    >
                      <span className="flex items-center gap-2">
                        <TbUsers className="text-lg" />
                        Specialization
                      </span>
                      <span className="text-gray-400">›</span>
                    </button>
                    <button
                      onClick={handleExpertiseClick}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center text-gray-700"
                    >
                      <span className="flex items-center gap-2">
                        <PiBuildings className="text-lg" />
                        Expertise
                      </span>
                      <span className="text-gray-400">›</span>
                    </button>
                  </div>
                </div>
              )} */}

              {/* Location Submenu */}
              {/* {showLocationMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-30">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button
                      onClick={handleBackClick}
                      className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
                    >
                      ‹
                    </button>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                  </div>
                  <div className="p-4">
                    <Input
                      placeholder="Find Any Location"
                      className="mb-4"
                      prefix={<IoSearchOutline className="text-gray-400" />}
                    />
                    <div className="space-y-1">
                      <button className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 rounded-lg text-gray-700">
                        <span className="text-xl">🇬🇧</span>
                        <span>United Kingdom</span>
                      </button>
                      <button className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 rounded-lg text-gray-700">
                        <span className="text-xl">🇺🇦</span>
                        <span>Ukraine</span>
                      </button>
                      <button className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 rounded-lg text-gray-700">
                        <span className="text-xl">🇹🇷</span>
                        <span>Turkey</span>
                      </button>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Speciality Submenu */}
              {/* {showSpecialityMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-30">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button
                      onClick={handleSpecialityBackClick}
                      className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
                    >
                      ‹
                    </button>
                    <h3 className="font-semibold text-gray-900">Speciality</h3>
                  </div>
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {specialityOptions.map((speciality, index) => (
                      <button
                        key={index}
                        onClick={() => handleSpecialitySelect(speciality)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700"
                      >
                        <span className="text-sm">{speciality}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Specialization Submenu */}
              {/* {showSpecializationMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-30">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button
                      onClick={handleSpecializationBackClick}
                      className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
                    >
                      ‹
                    </button>
                    <h3 className="font-semibold text-gray-900">
                      Specialization
                    </h3>
                  </div>
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {specializationOptions.map((specialization, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleSpecializationSelect(specialization)
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700"
                      >
                        <span className="text-sm">{specialization}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Expertise Submenu */}
              {/* {showExpertiseMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-30">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button
                      onClick={handleExpertiseBackClick}
                      className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
                    >
                      ‹
                    </button>
                    <h3 className="font-semibold text-gray-900">Expertise</h3>
                  </div>
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {expertiseOptions.map((expertise, index) => (
                      <button
                        key={index}
                        onClick={() => handleExpertiseSelect(expertise)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700"
                      >
                        <span className="text-sm">{expertise}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Palliative Care Units
          </h1>
          {/* <p className="text-lg text-gray-600">
            Find specialized palliative care units near you
          </p> */}
        </div>

        {/* Palliative Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton loading UI
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
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
                  <div className="w-1/3 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : palliativeUnits.length > 0 ? (
            palliativeUnits.map((unit, index) => (
              <div
                key={unit._id || index}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Header Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#00A99D] transition-colors duration-200">
                      {unit.name}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      <IoLocationOutline className="text-lg text-gray-500" />
                      <span className="text-sm font-medium">
                        {unit.country || unit.state || "Location not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[#00A99D] uppercase tracking-wide">
                      Services
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {unit.services ? (
                        Array.isArray(unit.services) ? (
                          unit.services.map((service, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-[#E3F2FD] text-[#1976D2] rounded-full text-xs font-medium"
                            >
                              {typeof service === "object"
                                ? service.service || "Unknown Service"
                                : service}
                            </span>
                          ))
                        ) : typeof unit.services === "object" ? (
                          <span className="px-3 py-1 bg-[#E3F2FD] text-[#1976D2] rounded-full text-xs font-medium">
                            {unit.services.service || "Unknown Service"}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-[#E3F2FD] text-[#1976D2] rounded-full text-xs font-medium">
                            {String(unit.services)}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500 text-sm italic">
                          No services available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="text-lg text-[#1976D2]" />
                    <span className="text-sm font-medium">
                      {unit.contactDetails || "No contact information"}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Contact Button */}
                  <button className="w-full px-4 py-3 bg-[#00A99D] text-white rounded-xl hover:bg-[#008F84] transition-colors duration-200 text-sm font-semibold shadow-sm hover:shadow-md">
                    Contact Unit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiBuildings className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No palliative units found
                </h3>
                <p className="text-gray-600 max-w-md">
                  We couldn't find any palliative care units matching your
                  search criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Palliative Unit Modal */}
      <Footer />
    </div>
  );
};

export default PalliativeUnits;
