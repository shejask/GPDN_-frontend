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
    <div className="grid md:flex min-h-screen bg-white">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="md:flex-1  mt-5 md:mt-0">
        {/* Header */}
        <div className=" md:p-7 md:px-16 lg:px-20 2xl:px-40">
          <Navbar />
        </div>
        <div className="p-5 md:flex justify-between w-full items-center border-b border-gray-200 bg-white fixed md:w-[calc(100%-0px)] z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {selectedSpeciality && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#00A99D] text-white text-sm rounded-full">
                    {selectedSpeciality}
                  </span>
                  <button
                    onClick={clearSpecialityFilter}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedSpecialization && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#1976D2] text-white text-sm rounded-full">
                    {selectedSpecialization}
                  </span>
                  <button
                    onClick={clearSpecializationFilter}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedExpertise && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#FF6B35] text-white text-sm rounded-full">
                    {selectedExpertise}
                  </span>
                  <button
                    onClick={clearExpertiseFilter}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 relative filter-container">
            {/* Create Button */}
            {/* <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors duration-150 flex items-center gap-2 font-medium shadow-sm"
            >
              <MdAdd className="text-lg" />
              Create Unit
            </button> */}

            <Input
              placeholder="Search Palliative Units..."
              className="md:w-64 h-9 mt-1 md:mt-0 md:h-10 "
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

            {/* Filter Button */}
            {/* <button
              onClick={() => setShowFilter(!showFilter)}
              className="px-3 py-2 mt-1 md:mt-0 h-9 md:h-10 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <IoFilterOutline />
              Filter
            </button> */}

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
                  <button
                    onClick={handleSpecialityClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                  >
                    Speciality
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

            {/* Speciality Submenu */}
            {showSpecialityMenu && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                  <button
                    onClick={handleSpecialityBackClick}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ‹
                  </button>
                  <h3 className="font-medium">Speciality</h3>
                </div>
                <div className="py-1">
                  {specialityOptions.map((speciality, index) => (
                    <button
                      key={index}
                      onClick={() => handleSpecialitySelect(speciality)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded"
                    >
                      <span className="text-sm">{speciality}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specialization Submenu */}
            {showSpecializationMenu && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                  <button
                    onClick={handleSpecializationBackClick}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ‹
                  </button>
                  <h3 className="font-medium">Specialization</h3>
                </div>
                <div className="py-1">
                  {specializationOptions.map((specialization, index) => (
                    <button
                      key={index}
                      onClick={() => handleSpecializationSelect(specialization)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded"
                    >
                      <span className="text-sm">{specialization}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Expertise Submenu */}
            {showExpertiseMenu && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                  <button
                    onClick={handleExpertiseBackClick}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ‹
                  </button>
                  <h3 className="font-medium">Expertise</h3>
                </div>
                <div className="py-1">
                  {expertiseOptions.map((expertise, index) => (
                    <button
                      key={index}
                      onClick={() => handleExpertiseSelect(expertise)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded"
                    >
                      <span className="text-sm">{expertise}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Palliative Units Grid */}
        <div className="pt-20 p-5 mt-10">
          <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
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

      {/* Create Palliative Unit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00A99D] rounded-lg flex items-center justify-center">
              <PiBuildings className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Create New Palliative Unit
              </h3>
              <p className="text-sm text-gray-500">
                Add a new palliative care unit to the directory
              </p>
            </div>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={closeCreateModal}
        footer={null}
        width={600}
        centered
        className="create-palliative-modal"
      >
        <div className="py-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateUnit();
            }}
          >
            <div className="space-y-6">
              {/* Unit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Name <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="Enter palliative unit name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/City <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="e.g., Bangalore, India"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="e.g., India"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services <span className="text-red-500">*</span>
                </label>

                <Select
                  size="large"
                  placeholder="Select services"
                  value={formData.services}
                  onChange={(value) => handleInputChange("services", value)}
                  style={{ width: "100%" }}
                  options={services.map((service) => ({
                    value: service._id,
                    label: service.service,
                  }))}
                  loading={services.length === 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select the services offered by this palliative unit
                </p>
              </div>

              {/* Contact Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Details <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="e.g., 9876543210"
                  value={formData.contactDetails}
                  onChange={(e) =>
                    handleInputChange("contactDetails", e.target.value)
                  }
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number or contact information
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeCreateModal}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createLoading ||
                  !formData.name ||
                  !formData.state ||
                  !formData.country ||
                  !formData.services ||
                  !formData.contactDetails
                }
                className="px-6 py-2.5 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <MdAdd className="text-lg" />
                    Create Unit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default PalliativeUnits;
