"use client"
import React, { useState } from "react";
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
      role: "6853d418ffcac850f881d5d3" // Default role as specified
    };

    try {
      const response = await registerUser(finalData);
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
