"use client";
import React, { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
import { fetchPalliativeUnits } from "../../api/PalliativeUnit";

const PalliativeGridComponent = () => {
  const [palliativeUnits, setPalliativeUnits] = useState([]);
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
        
        // Filter out units where public is false - this is specific to this page only
        const publicUnits = units.filter(unit => unit.public === true);
        
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
    fetchUnits();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Palliative Units Grid */}
      <div className="pt-20 p-5 mt-10">
        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            // Skeleton loading UI
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
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
              <div
                key={unit._id || index}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {unit.name}
                    </h2>
                    <div className="flex items-center font-semibold gap-2 text-gray-600">
                      <IoLocationOutline className="text-lg" />
                      <span>
                        {unit.country ||
                          unit.state ||
                          "Location not specified"}
                      </span>
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
                              {typeof service === "object"
                                ? service.service || "Unknown Service"
                                : service}
                            </span>
                          ))
                        ) : typeof unit.services === "object" ? (
                          // Handle case when services is a single object
                          <span className="px-3 py-1 bg-[#009DFF17] text-gray-700 rounded-md text-sm">
                            {unit.services.service || "Unknown Service"}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-[#009DFF17] text-gray-700 rounded-md text-sm">
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
                  <div className="flex items-center font-semibold gap-2 text-gray-600">
                    <FiPhone className="text-lg" />
                    <span className="text-sm">
                      {unit.contactDetails || "No contact information"}
                    </span>
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
  );
};

export default PalliativeGridComponent;
