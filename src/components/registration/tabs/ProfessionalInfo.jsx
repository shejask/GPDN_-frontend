"use client";
import React, { useState, useMemo, useRef } from "react";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { Input, message } from "antd";
import Select from "react-select";
import countryList from "react-select-country-list";

function ProfessionalInfo({ onContinue }) {
  const [country, setCountry] = useState("");
  const [formData, setFormData] = useState({
    photo: "",
    countryOfPractice: "",
    medicalQualification: "",
    yearOfGraduation: "",
    medicalRegistrationAuthority: "",
    medicalRegistrationNumber: "",
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const options = useMemo(() => countryList().getData(), []);

  const changeHandler = (value) => {
    setCountry(value);
    setFormData((prev) => ({
      ...prev,
      countryOfPractice: value?.label || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (1MB = 1024 * 1024 bytes)
      const maxSize = 1 * 1024 * 1024; // 1MB

      if (file.size > maxSize) {
        message.error("Image is too large. Try to upload an image under 1MB.");
        // Reset the file input by setting its value to null
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        return;
      }

      // Check if it's an image file
      if (!file.type.startsWith("image/")) {
        message.error("Please select a valid image file.");
        // Reset the file input by setting its value to null
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        return;
      }

      // If validation passes, set the file
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      // Clear any existing photo error
      if (errors.photo) {
        setErrors((prev) => ({
          ...prev,
          photo: "",
        }));
      }
    }
  };

  const validateForm = () => {
    let tempErrors = {};

    // Validate photo
    if (!formData.photo) {
      tempErrors.photo = "Profile picture is required";
    } else if (formData.photo instanceof File) {
      // Check file size again during validation
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (formData.photo.size > maxSize) {
        tempErrors.photo = "Image must be under 1MB";
      }
      // Check file type
      if (!formData.photo.type.startsWith("image/")) {
        tempErrors.photo = "Please select a valid image file";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const dataToSend = {
        photo: formData.photo, // This will be the File object for upload
      };

      // Only add optional fields if they have values
      if (formData.countryOfPractice && formData.countryOfPractice.trim()) {
        dataToSend.countryOfPractice = formData.countryOfPractice;
      }

      if (
        formData.medicalQualification &&
        formData.medicalQualification.trim()
      ) {
        dataToSend.medicalQualification = formData.medicalQualification;
      }

      if (formData.yearOfGraduation && formData.yearOfGraduation.trim()) {
        dataToSend.yearOfGraduation = parseInt(formData.yearOfGraduation);
      }

      if (
        formData.medicalRegistrationAuthority &&
        formData.medicalRegistrationAuthority.trim()
      ) {
        dataToSend.medicalRegistrationAuthority =
          formData.medicalRegistrationAuthority;
      }

      if (
        formData.medicalRegistrationNumber &&
        formData.medicalRegistrationNumber.trim()
      ) {
        dataToSend.medicalRegistrationNumber =
          formData.medicalRegistrationNumber;
      }

      console.log("=== PROFESSIONAL INFO SUBMIT ===");
      console.log("Data being sent from ProfessionalInfo:", dataToSend);

      onContinue(dataToSend);
    } else {
      message.error({
        content: "Please Upload an image under 1MB",
        duration: 3,
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 justify-center items-center">
      {/* <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200">
                <UserOutlined className="text-5xl text-[#00A99D]" />
            </div> */}
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-semibold">Tell Us More About You</h1>
      </div>
      <div className="flex flex-col gap-4 mt-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <label className="text-sm font-semibold">
              Profile Picture <span className="text-red-500">*</span>
            </label>
            <label className="text-xs font-semibold text-gray-400">
              This is where people will see your actual face
            </label>
          </div>

          <Input
            ref={fileInputRef}
            size="large"
            type="file"
            name="file"
            onChange={handleFileChange}
            className="w-96 text-sm"
            accept="image/*"
          />
          <div className="text-xs text-gray-500 mt-1">
            Maximum file size: 1MB. Supported formats: JPG, PNG, GIF, WebP
          </div>
          {formData.photo && formData.photo instanceof File && (
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <span>✓</span>
              <span>
                {formData.photo.name} ({(formData.photo.size / 1024).toFixed(1)}{" "}
                KB)
              </span>
            </div>
          )}
          {errors.photo && (
            <span className="text-red-500 text-xs">{errors.photo}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">
            Country Of Practice <span className="text-red-500">*</span>
          </label>
          <Select
            options={options}
            value={country}
            onChange={changeHandler}
            className="w-96"
            classNamePrefix="select"
            placeholder="Select your country"
          />
          {errors.country && (
            <span className="text-red-500 text-xs">{errors.country}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">
            Medical Qualification<span className="text-red-500">*</span>
          </label>
          <Input
            size="large"
            type="text"
            name="medicalQualification"
            value={formData.medicalQualification}
            onChange={handleChange}
            className="w-96 text-sm"
            placeholder="e.g., MBBS, MD"
          />
          {errors.medicalQualification && (
            <span className="text-red-500 text-xs">
              {errors.medicalQualification}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Year of Graduation</label>
          <Input
            size="large"
            type="number"
            name="yearOfGraduation"
            value={formData.yearOfGraduation}
            onChange={handleChange}
            className="w-96 text-sm"
            placeholder="e.g., 2015"
          />
          {/* {errors.yearOfGraduation && (
            <span className="text-red-500 text-xs">
              {errors.yearOfGraduation}
            </span>
          )} */}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">
            Medical Registration Authority
          </label>
          <Input
            size="large"
            type="text"
            name="medicalRegistrationAuthority"
            value={formData.medicalRegistrationAuthority}
            onChange={handleChange}
            className="w-96 text-sm"
            placeholder="e.g., Medical Council of India"
          />
          {/* {errors.medicalRegistrationAuthority && (
            <span className="text-red-500 text-xs">
              {errors.medicalRegistrationAuthority}
            </span>
          )} */}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">
            Medical Registration Number
          </label>
          <Input
            size="large"
            type="text"
            name="medicalRegistrationNumber"
            value={formData.medicalRegistrationNumber}
            onChange={handleChange}
            className="w-96 text-sm"
            placeholder="Enter your registration number"
          />
          {/* {errors.medicalRegistrationNumber && (
            <span className="text-red-500 text-xs">
              {errors.medicalRegistrationNumber}
            </span>
          )} */}
        </div>

        <div
          onClick={handleSubmit}
          className="w-full h-10 rounded-lg font-semibold bg-[#00A99D] flex items-center justify-center text-white cursor-pointer hover:bg-[#008F84] transition-colors"
        >
          <h1 className="flex items-center gap-2">
            Continue <ArrowRightOutlined />
          </h1>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalInfo;
