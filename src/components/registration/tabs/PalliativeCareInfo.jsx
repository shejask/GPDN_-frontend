"use client"
import React, { useState } from 'react'
import { ArrowRightOutlined } from "@ant-design/icons";
import { Input, Radio, Checkbox } from "antd";

function PalliativeCareInfo({ onContinue }) {
    const [formData, setFormData] = useState({
        bio: "",
        hasFormalTrainingInPalliativeCare: null,
        affiliatedPalliativeAssociations: "",
        specialInterestsInPalliativeCare: "",
        confirmedMedicalGraduate: false,
        agreedToGuidelines: false
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRadioChange = (e) => {
        setFormData(prev => ({
            ...prev,
            hasFormalTrainingInPalliativeCare: e.target.value
        }));
    };

    const handleCheckboxChange = (name) => (e) => {
        setFormData(prev => ({
            ...prev,
            [name]: e.target.checked
        }));
    };

    const validateForm = () => {
        let tempErrors = {};
        if (formData.hasFormalTrainingInPalliativeCare === null) {
            tempErrors.hasFormalTrainingInPalliativeCare = "Please select whether you have formal training";
        }
        if (!formData.affiliatedPalliativeAssociations.trim()) {
            tempErrors.affiliatedPalliativeAssociations = "Affiliated associations are required";
        }
        if (!formData.specialInterestsInPalliativeCare.trim()) {
            tempErrors.specialInterestsInPalliativeCare = "Special interests are required";
        }
        if (!formData.bio.trim()) {
            tempErrors.bio = "Bio is required";
        }
        if (!formData.confirmedMedicalGraduate) {
            tempErrors.confirmedMedicalGraduate = "You must confirm that you are a medical graduate";
        }
        if (!formData.agreedToGuidelines) {
            tempErrors.agreedToGuidelines = "You must agree to GPDN guidelines";
        }
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onContinue({
                bio: formData.bio,
                hasFormalTrainingInPalliativeCare: formData.hasFormalTrainingInPalliativeCare,
                affiliatedPalliativeAssociations: formData.affiliatedPalliativeAssociations,
                specialInterestsInPalliativeCare: formData.specialInterestsInPalliativeCare
            });
        }
    };

    return (
        <div className="w-full flex flex-col gap-5 justify-center items-center">
            <div className="flex flex-col gap-2 items-center">
                <h1 className="text-3xl font-semibold">Palliative Care Information</h1>
                <p className="text-gray-500">Tell us about your experience in palliative care</p>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Do you have formal training in palliative care?</label>
                    <Radio.Group 
                        onChange={handleRadioChange}
                        value={formData.hasFormalTrainingInPalliativeCare}
                        className="flex flex-col gap-2"
                    >
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                    </Radio.Group>
                    {errors.hasFormalTrainingInPalliativeCare && 
                        <span className="text-red-500 text-xs">{errors.hasFormalTrainingInPalliativeCare}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Affiliated Palliative Associations</label>
                    <Input
                        size="large"
                        name="affiliatedPalliativeAssociations"
                        value={formData.affiliatedPalliativeAssociations}
                        onChange={handleChange}
                        className="w-96 text-sm"
                        placeholder="e.g., Indian Association of Palliative Care"
                    />
                    {errors.affiliatedPalliativeAssociations && 
                        <span className="text-red-500 text-xs">{errors.affiliatedPalliativeAssociations}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Special Interests in Palliative Care</label>
                    <Input.TextArea
                        size="large"
                        name="specialInterestsInPalliativeCare"
                        value={formData.specialInterestsInPalliativeCare}
                        onChange={handleChange}
                        className="w-96"
                        placeholder="e.g., Pain management, pediatric palliative care"
                        rows={3}
                    />
                    {errors.specialInterestsInPalliativeCare && 
                        <span className="text-red-500 text-xs">{errors.specialInterestsInPalliativeCare}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Bio</label>
                    <Input.TextArea
                        size="large"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-96"
                        placeholder="Share your passion and experience in palliative care"
                        rows={4}
                    />
                    {errors.bio && <span className="text-red-500 text-xs">{errors.bio}</span>}
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <Checkbox 
                        checked={formData.confirmedMedicalGraduate}
                        onChange={handleCheckboxChange('confirmedMedicalGraduate')}
                    >
                        <span className="text-sm">I confirm that I am a medical graduate and all information provided is accurate.</span>
                    </Checkbox>
                    {errors.confirmedMedicalGraduate && 
                        <span className="text-red-500 text-xs">{errors.confirmedMedicalGraduate}</span>}
                    
                    <Checkbox 
                        checked={formData.agreedToGuidelines}
                        onChange={handleCheckboxChange('agreedToGuidelines')}
                    >
                        <span className="text-sm">I agree to abide by the guidelines of the Global Palliative Doctors Network (GPDN).</span>
                    </Checkbox>
                    {errors.agreedToGuidelines && 
                        <span className="text-red-500 text-xs">{errors.agreedToGuidelines}</span>}
                </div>

                <div 
                    onClick={handleSubmit}
                    className="w-full h-10 rounded-lg font-semibold bg-[#00A99D] flex items-center justify-center text-white cursor-pointer hover:bg-[#008F84] transition-colors mt-4"
                >
                    <h1 className="flex items-center gap-2">Continue <ArrowRightOutlined/></h1>
                </div>
            </div>
        </div>
    );
}

export default PalliativeCareInfo