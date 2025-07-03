"use client"
import React, { useState, useMemo } from 'react'
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { Input } from "antd";
import Select from 'react-select'
import countryList from 'react-select-country-list'


function ProfessionalInfo({ onContinue }) {
    const [country, setCountry] = useState('');
    const [formData, setFormData] = useState({
        photo: "",
        countryOfPractice: "",
        medicalQualification: "",
        yearOfGraduation: "",
        medicalRegistrationAuthority: "",
        medicalRegistrationNumber: ""
    });
    const [errors, setErrors] = useState({});
    const options = useMemo(() => countryList().getData(), []);

    const changeHandler = (value) => {
        setCountry(value);
        setFormData(prev => ({
            ...prev,
            countryOfPractice: value?.label || ""
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        let tempErrors = {};
        if (!formData.photo) tempErrors.photo = "Profile picture is required";
        if (!country) tempErrors.country = "Country is required";
        if (!formData.medicalQualification) tempErrors.medicalQualification = "Medical qualification is required";
        if (!formData.yearOfGraduation) tempErrors.yearOfGraduation = "Year of graduation is required";
        if (!formData.medicalRegistrationAuthority) tempErrors.medicalRegistrationAuthority = "Medical registration authority is required";
        if (!formData.medicalRegistrationNumber) tempErrors.medicalRegistrationNumber = "Medical registration number is required";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onContinue({
                photo: formData.photo, // This will be the File object for upload
                countryOfPractice: formData.countryOfPractice,
                medicalQualification: formData.medicalQualification,
                yearOfGraduation: parseInt(formData.yearOfGraduation),
                medicalRegistrationAuthority: formData.medicalRegistrationAuthority,
                medicalRegistrationNumber: formData.medicalRegistrationNumber
            });
        }
    };

    return (
        <div className="w-full flex flex-col gap-5 justify-center items-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200">
                <UserOutlined className="text-5xl text-[#00A99D]" />
            </div>
            <div className="flex flex-col gap-2 items-center">
                <h1 className="text-3xl font-semibold">Professional Information</h1>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className='flex flex-col'>
                        <label className="text-sm font-semibold">Profile Picture</label>
                        <label className="text-xs font-semibold text-gray-400">This is where people will see your actual face</label>
                    </div>
                    <Input
                        size="large"
                        type="file"
                        name="file"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setFormData(prev => ({
                                    ...prev,
                                    photo: file
                                }));
                            }
                        }}
                        className="w-96 text-sm"
                        accept="image/*"
                    />
                    {errors.photo && <span className="text-red-500 text-xs">{errors.photo}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Country Of Practice</label>
                    <Select
                        options={options}
                        value={country}
                        onChange={changeHandler}
                        className="w-96"
                        classNamePrefix="select"
                        placeholder="Select your country"
                    />
                    {errors.country && <span className="text-red-500 text-xs">{errors.country}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Medical Qualification</label>
                    <Input
                        size="large"
                        type="text"
                        name="medicalQualification"
                        value={formData.medicalQualification}
                        onChange={handleChange}
                        className="w-96 text-sm"
                        placeholder="e.g., MBBS, MD"
                    />
                    {errors.medicalQualification && <span className="text-red-500 text-xs">{errors.medicalQualification}</span>}
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
                    {errors.yearOfGraduation && <span className="text-red-500 text-xs">{errors.yearOfGraduation}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Medical Registration Authority</label>
                    <Input
                        size="large"
                        type="text"
                        name="medicalRegistrationAuthority"
                        value={formData.medicalRegistrationAuthority}
                        onChange={handleChange}
                        className="w-96 text-sm"
                        placeholder="e.g., Medical Council of India"
                    />
                    {errors.medicalRegistrationAuthority && <span className="text-red-500 text-xs">{errors.medicalRegistrationAuthority}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Medical Registration Number</label>
                    <Input
                        size="large"
                        type="text"
                        name="medicalRegistrationNumber"
                        value={formData.medicalRegistrationNumber}
                        onChange={handleChange}
                        className="w-96 text-sm"
                        placeholder="Enter your registration number"
                    />
                    {errors.medicalRegistrationNumber && <span className="text-red-500 text-xs">{errors.medicalRegistrationNumber}</span>}
                </div>

                <div 
                    onClick={handleSubmit}
                    className="w-full h-10 rounded-lg font-semibold bg-[#00A99D] flex items-center justify-center text-white cursor-pointer hover:bg-[#008F84] transition-colors"
                >
                    <h1 className="flex items-center gap-2">Continue <ArrowRightOutlined/></h1>
                </div>
            </div> 
        </div>
    );
}

export default ProfessionalInfo