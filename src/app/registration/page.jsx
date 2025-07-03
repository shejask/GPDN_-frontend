"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import bg from "../assets/signin/registrationBg.png";
import Image from "next/image";
import Step from "@/components/registration/steps/page";
import Personalnfo from "@/components/registration/tabs/personalnfo";
import ProfessionalInfo from "@/components/registration/tabs/ProfessionalInfo";
import PalliativeCareInfo from "@/components/registration/tabs/PalliativeCareInfo";
import { registerUser } from "@/api/user";

function Registration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationData, setRegistrationData] = useState({});

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (userId) {
        // If userId exists in localStorage, navigate to forum page
        router.push('/forum');
      }
    }
  }, [router]);

  const handlePersonalInfo = (data) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    setCurrentStep(1);
  };

  const handleProfessionalInfo = (data) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handlePalliativeCareInfo = async (data) => {
    const finalData = {
      ...registrationData,
      ...data,
      role: "68629dde1557b3c7e90ce077" // Exact role ID from the screenshot
    };

    // Create FormData object for file upload
    const formData = new FormData();
    
    // Add all fields to FormData exactly as shown in the API screenshot
    formData.append('fullName', finalData.fullName);
    formData.append('email', finalData.email);
    formData.append('phoneNumber', finalData.phoneNumber);
    formData.append('bio', finalData.bio);
    formData.append('countryOfPractice', finalData.countryOfPractice);
    formData.append('medicalQualification', finalData.medicalQualification);
    formData.append('yearOfGraduation', finalData.yearOfGraduation);
    formData.append('hasFormalTrainingInPalliativeCare', finalData.hasFormalTrainingInPalliativeCare);
    formData.append('medicalRegistrationAuthority', finalData.medicalRegistrationAuthority);
    formData.append('medicalRegistrationNumber', finalData.medicalRegistrationNumber);
    formData.append('affiliatedPalliativeAssociations', finalData.affiliatedPalliativeAssociations);
    formData.append('specialInterestsInPalliativeCare', finalData.specialInterestsInPalliativeCare);
    formData.append('password', finalData.password);
    formData.append('role', finalData.role);
    
    // Handle file upload - use 'file' as the field name as shown in the screenshot
    if (finalData.photo instanceof File) {
      formData.append('file', finalData.photo);
    }

    try {
      const response = await registerUser(formData);
      if (response.error) {
        console.error('Registration failed:', response.error);
        // You can add error handling UI here
        return;
      }
      // Redirect to success page
      router.push('/registration/submitted');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Personalnfo onContinue={handlePersonalInfo} />;
      case 1:
        return <ProfessionalInfo onContinue={handleProfessionalInfo} />;
      case 2:
        return <PalliativeCareInfo onContinue={handlePalliativeCareInfo} />;
      default:
        return <Personalnfo onContinue={handlePersonalInfo} />;
    }
  };

  return (
    <div className="w-full flex h-screen">
      <div className="w-1/2 h-screen">
        <Image alt="" src={bg} className="w-full h-full" />
      </div>
      <div className="w-1/2 h-screen flex flex-col items-center justify-between px-5 py-5">
        <div className="w-full">
          <Step current={currentStep} />
        </div>
        {renderStepContent()}
        <div></div>
      </div>
    </div>
  );
}

export default Registration;
