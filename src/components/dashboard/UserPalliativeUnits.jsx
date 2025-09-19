"use client";

import React, { useState, useEffect } from "react";
import { Modal, message, Input, Select, Checkbox } from "antd";
import { FiPhone, FiEdit, FiTrash2 } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { PiBuildings } from "react-icons/pi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  fetchPalliativeUnitByUser,
  fetchServices,
  createPalliativeUnit,
  editPalliativeUnit,
  approveUnitForPublic,
  deletePalliativeUnit,
} from "../../api/PalliativeUnit";

const UserPalliativeUnits = () => {
  const [palliativeUnits, setPalliativeUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Form data for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    state: "",
    country: "",
    services: [],
    contactDetails: "",
    actionStatus: false,
  });

  useEffect(() => {
    fetchUserPalliativeUnits();
    fetchServicesData();
  }, []);

  const fetchUserPalliativeUnits = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.error("User not authenticated");
        return;
      }

      const response = await fetchPalliativeUnitByUser(userId);
      console.log("User palliative units response:", response);

      // Handle different response structures
      let units = [];
      if (response?.success && response?.data && Array.isArray(response.data)) {
        units = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        units = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        units = response.data;
      } else if (response?.data?.data) {
        units = [response.data.data];
      } else if (response?.data) {
        units = [response.data];
      }

      setPalliativeUnits(units);
    } catch (error) {
      console.error("Error fetching user palliative units:", error);
      message.error("Failed to fetch palliative units");
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

  const handleEdit = (unit) => {
    setUnitToEdit(unit);

    // Handle services - convert to array of IDs if needed
    let servicesArray = [];
    if (Array.isArray(unit.services)) {
      // If services is array of objects, extract IDs
      servicesArray = unit.services.map((service) =>
        typeof service === "object" ? service._id : service
      );
    } else if (unit.services) {
      // If single service, wrap in array
      servicesArray = [
        typeof unit.services === "object" ? unit.services._id : unit.services,
      ];
    }

    setEditFormData({
      name: unit.name || "",
      state: unit.state || "",
      country: unit.country || "",
      services: servicesArray,
      contactDetails: unit.contactDetails || "",
      actionStatus: unit.actionStatus || false,
    });
    setEditModalVisible(true);
  };

  const handleDelete = (unit) => {
    setUnitToDelete(unit);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await deletePalliativeUnit(unitToDelete._id);

      if (response && response.success !== false) {
        message.success("Palliative unit deleted successfully!");
        setDeleteModalVisible(false);
        setUnitToDelete(null);
        // Refresh the list
        await fetchUserPalliativeUnits();
      } else {
        const errorMessage =
          response?.error || "Failed to delete palliative unit.";
        message.error(errorMessage);
        console.error("Delete unit failed:", response);
      }
    } catch (error) {
      console.error("Error deleting palliative unit:", error);
      const errorMessage = error.message || "Failed to delete palliative unit.";
      message.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!unitToEdit) return;

    // Validate form data
    if (
      !editFormData.name ||
      !editFormData.state ||
      !editFormData.country ||
      !editFormData.services ||
      editFormData.services.length === 0 ||
      !editFormData.contactDetails
    ) {
      message.error("Please fill in all required fields.");
      return;
    }

    setEditLoading(true);
    try {
      // Prepare data for the edit API (excluding actionStatus)
      const editData = {
        _id: unitToEdit._id,
        name: editFormData.name,
        state: editFormData.state,
        country: editFormData.country,
        services: editFormData.services,
        contactDetails: editFormData.contactDetails,
      };

      // First, update the basic unit information
      const editResponse = await editPalliativeUnit(editData);

      if (editResponse && editResponse.success !== false) {
        // If actionStatus has changed, update it separately
        if (editFormData.actionStatus !== unitToEdit.actionStatus) {
          const approvalResponse = await approveUnitForPublic(
            unitToEdit._id,
            editFormData.actionStatus
          );

          if (approvalResponse && approvalResponse.success !== false) {
            message.success("Palliative unit updated successfully!");
          } else {
            message.warning(
              "Unit details updated, but failed to update public status."
            );
          }
        } else {
          message.success("Palliative unit updated successfully!");
        }

        setEditModalVisible(false);
        setUnitToEdit(null);
        setEditFormData({
          name: "",
          state: "",
          country: "",
          services: [],
          contactDetails: "",
          actionStatus: false,
        });
        // Refresh the list
        await fetchUserPalliativeUnits();
      } else {
        const errorMessage =
          editResponse?.error || "Failed to update palliative unit.";
        message.error(errorMessage);
        console.error("Update unit failed:", editResponse);
      }
    } catch (error) {
      console.error("Error updating palliative unit:", error);
      const errorMessage = error.message || "Failed to update palliative unit.";
      message.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setUnitToEdit(null);
    setEditFormData({
      name: "",
      state: "",
      country: "",
      services: [],
      contactDetails: "",
      actionStatus: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setUnitToDelete(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">My Palliative Units</h2>
        <p className="text-gray-500 text-sm">
          Manage your palliative care units
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
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
                <div className="flex gap-2">
                  <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : palliativeUnits.length > 0 ? (
        <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {palliativeUnits.map((unit, index) => (
            <div
              key={unit._id || index}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col gap-2">
                {/* Header Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900 flex-1 mr-2">
                      {unit.name}
                    </h2>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        title="Edit"
                      >
                        <FiEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        title="Delete"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <IoLocationOutline className="text-xl text-gray-500" />
                    <span className="text-base">
                      {unit.country || unit.state || "Location not specified"}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      unit.actionStatus
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {unit.public ? "Public" : "Private"}
                  </span>
                </div>

                {/* Services Section */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-[#00A99D]">
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
                        <span className="px-4 py-1 bg-[#E3F2FD] text-[#1976D2] rounded text-sm font-medium">
                          {unit.services.service || "Unknown Service"}
                        </span>
                      ) : (
                        <span className="px-4 py-1 bg-[#E3F2FD] text-[#1976D2] rounded text-sm font-medium">
                          {String(unit.services)}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500 text-sm">
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

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(unit)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150 text-sm font-medium shadow-sm flex items-center justify-center gap-2"
                  >
                    <FiEdit className="text-sm" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(unit)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-150 text-sm font-medium shadow-sm flex items-center justify-center gap-2"
                  >
                    <FiTrash2 className="text-sm" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiBuildings className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No palliative units found
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            You haven't created any palliative units yet.
          </p>
          <button
            onClick={() => (window.location.href = "/palliative-units")}
            className="px-6 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors duration-150 font-medium"
          >
            Create Your First Unit
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiEdit className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Palliative Unit
              </h3>
              <p className="text-sm text-gray-500">
                Update your palliative care unit information
              </p>
            </div>
          </div>
        }
        open={editModalVisible}
        onCancel={closeEditModal}
        footer={null}
        width={600}
        centered
        className="edit-palliative-modal"
      >
        <div className="py-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSubmit();
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
                  value={editFormData.name}
                  onChange={(e) =>
                    handleEditInputChange("name", e.target.value)
                  }
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
                  value={editFormData.state}
                  onChange={(e) =>
                    handleEditInputChange("state", e.target.value)
                  }
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
                  value={editFormData.country}
                  onChange={(e) =>
                    handleEditInputChange("country", e.target.value)
                  }
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
                  mode="multiple"
                  size="large"
                  placeholder="Select services"
                  value={editFormData.services}
                  onChange={(value) => handleEditInputChange("services", value)}
                  style={{ width: "100%" }}
                  options={services.map((service) => ({
                    value: service._id,
                    label: service.service,
                  }))}
                  loading={services.length === 0}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </div>

              {/* Contact Details */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  inputStyle={{ width: "100%", height: "40px" }}
                  country={"us"}
                  value={editFormData.contactDetails}
                  onChange={(value) =>
                    handleEditInputChange("contactDetails", value)
                  }
                />
              </div>

              {/* Public Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you want to make this palliative unit public?
                </label>
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={editFormData.actionStatus === true}
                    onChange={(e) =>
                      handleEditInputChange("actionStatus", e.target.checked)
                    }
                  >
                    <span className="text-sm text-gray-700">
                      Yes, make this unit publicly visible
                    </span>
                  </Checkbox>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {editFormData.actionStatus
                    ? "This unit will be visible to all users in the directory."
                    : "This unit will be private and only visible to authorized users."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  editLoading ||
                  !editFormData.name ||
                  !editFormData.state ||
                  !editFormData.country ||
                  !editFormData.services ||
                  editFormData.services.length === 0 ||
                  !editFormData.contactDetails
                }
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiEdit className="text-lg" />
                    Update Unit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <FiTrash2 className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Delete Palliative Unit
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>
        }
        open={deleteModalVisible}
        onCancel={closeDeleteModal}
        footer={null}
        width={500}
        centered
      >
        <div className="py-4">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete "{unitToDelete?.name}"? This action
            cannot be undone and will permanently remove the palliative unit
            from the directory.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeDeleteModal}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="text-lg" />
                  Delete Unit
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserPalliativeUnits;
