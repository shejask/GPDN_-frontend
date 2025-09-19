"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import bg from "../../app/assets/HOMEPAGE/new-webps/register-bannner.webp";
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
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // If userId exists in localStorage, navigate to forum page
        router.push("/forum");
      }
    }
  }, [router]);

  const handlePersonalInfo = (data) => {
    console.log("=== STEP 1 DATA ===");
    console.log("Personal info data:", data);
    setRegistrationData((prev) => {
      const newData = { ...prev, ...data };
      console.log("Updated registration data after step 1:", newData);
      return newData;
    });
    setCurrentStep(1);
  };

  const handleProfessionalInfo = (data) => {
    console.log("=== STEP 2 DATA ===");
    console.log("Professional info data:", data);
    setRegistrationData((prev) => {
      const newData = { ...prev, ...data };
      console.log("Updated registration data after step 2:", newData);
      return newData;
    });
    setCurrentStep(2);
  };

  const handlePalliativeCareInfo = async (data) => {
    console.log("=== STEP 3 DATA ===");
    console.log("Palliative care info data:", data);
    console.log("Current registration data:", registrationData);

    const finalData = {
      ...registrationData,
      ...data,
      role: "68629dde1557b3c7e90ce077", // Exact role ID from the screenshot
    };

    console.log("=== FINAL MERGED DATA ===");
    console.log("Final data before FormData creation:", finalData);

    // Create FormData object for file upload
    const formData = new FormData();

    // Add required fields
    formData.append("fullName", finalData.fullName || "");
    formData.append("email", finalData.email || "");
    formData.append("phoneNumber", finalData.phoneNumber || "");
    formData.append("password", finalData.password || "");
    formData.append("role", finalData.role);

    // Add optional fields only if they have values
    if (finalData.bio && finalData.bio.trim()) {
      formData.append("bio", finalData.bio);
    }

    if (finalData.countryOfPractice && finalData.countryOfPractice.trim()) {
      formData.append("countryOfPractice", finalData.countryOfPractice);
    }

    if (
      finalData.medicalQualification &&
      finalData.medicalQualification.trim()
    ) {
      formData.append("medicalQualification", finalData.medicalQualification);
    }

    if (
      finalData.yearOfGraduation &&
      finalData.yearOfGraduation.toString().trim()
    ) {
      formData.append("yearOfGraduation", finalData.yearOfGraduation);
    }

    // Handle boolean field properly
    if (finalData.hasFormalTrainingInPalliativeCare !== undefined) {
      formData.append(
        "hasFormalTrainingInPalliativeCare",
        finalData.hasFormalTrainingInPalliativeCare
      );
    }

    if (
      finalData.medicalRegistrationAuthority &&
      finalData.medicalRegistrationAuthority.trim()
    ) {
      formData.append(
        "medicalRegistrationAuthority",
        finalData.medicalRegistrationAuthority
      );
    }

    if (
      finalData.medicalRegistrationNumber &&
      finalData.medicalRegistrationNumber.trim()
    ) {
      formData.append(
        "medicalRegistrationNumber",
        finalData.medicalRegistrationNumber
      );
    }

    if (
      finalData.affiliatedPalliativeAssociations &&
      finalData.affiliatedPalliativeAssociations.trim()
    ) {
      formData.append(
        "affiliatedPalliativeAssociations",
        finalData.affiliatedPalliativeAssociations
      );
    }

    // Handle special interests as array
    if (
      finalData.specialInterestsInPalliativeCare &&
      Array.isArray(finalData.specialInterestsInPalliativeCare) &&
      finalData.specialInterestsInPalliativeCare.length > 0
    ) {
      formData.append(
        "specialInterestsInPalliativeCare",
        JSON.stringify(finalData.specialInterestsInPalliativeCare)
      );
    } else if (
      finalData.specialInterestsInPalliativeCare &&
      typeof finalData.specialInterestsInPalliativeCare === "string" &&
      finalData.specialInterestsInPalliativeCare.trim()
    ) {
      formData.append(
        "specialInterestsInPalliativeCare",
        finalData.specialInterestsInPalliativeCare
      );
    }

    // Handle file upload - use 'file' as the field name as shown in the screenshot
    if (finalData.photo instanceof File) {
      formData.append("file", finalData.photo);
    }

    // Debug: Log FormData contents
    console.log("=== REGISTRATION DEBUG ===");
    console.log("Final data object:", finalData);
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("=== END DEBUG ===");

    try {
      const response = await registerUser(formData);
      console.log("Registration response:", response);

      if (response.error) {
        console.error("Registration failed:", response.error);
        // You can add error handling UI here
        return;
      }

      if (response.success || response.data) {
        console.log("Registration successful, redirecting...");
        // Redirect to success page
        router.push("/registration/submitted");
      } else {
        console.error("Registration failed - no success flag:", response);
      }
    } catch (error) {
      console.error("Registration error:", error);
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
      <div className="w-1/2 h-screen hidden md:block">
        <Image alt="" src={bg} className="w-full h-full object-cover" />
      </div>
      <div className="md:w-1/2 h-screen flex flex-col items-center justify-between px-5 py-5">
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
