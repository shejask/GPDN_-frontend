"use client";
import React, { useState, useEffect } from "react";
import bg from "../../app/assets/signin/bg.png";
import Image from "next/image";
import { Input, message as antMessage } from "antd";
import { PiSignInBold } from "react-icons/pi";
import { FaAngleLeft } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { sendOTP, verifyOTP, resetPassword } from "../../api/user";
import { EMAIL_REGEX } from "../../utils/constants";

function ResetPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [userId, setUserId] = useState("");
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });

  // Clear message after 5 seconds if it's a success or error message
  useEffect(() => {
    if (message.text && (message.type === "success" || message.type === "error")) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  /**
   * Updates form data when input fields change
   * @param {string} field - The field name to update
   * @param {string} value - The new value
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error messages when user starts typing
    if (message.type === "error") {
      setMessage({ text: "", type: "" });
    }
  };

  /**
   * Validates the phone number format
   * @returns {boolean} - Whether the phone number is valid
   */
  const validatePhone = () => {
    if (!formData.phone.trim()) {
      setMessage({ text: "Phone number is required", type: "error" });
      return false;
    }

    // Basic validation for phone number with country code (e.g., +917510202251)
    if (!/^\+\d{10,15}$/.test(formData.phone)) {
      setMessage({ text: "Please enter a valid phone number with country code (e.g., +917510202251)", type: "error" });
      return false;
    }

    return true;
  };

  /**
   * Validates the OTP
   * @returns {boolean} - Whether the OTP is valid
   */
  const validateOTP = () => {
    if (!formData.otp.trim()) {
      setMessage({ text: "OTP is required", type: "error" });
      return false;
    }

    // Basic validation - OTP should be numeric and have a reasonable length
    if (!/^\d+$/.test(formData.otp) || formData.otp.length < 4) {
      setMessage({ text: "Please enter a valid OTP", type: "error" });
      return false;
    }

    return true;
  };

  /**
   * Validates the password
   * @returns {boolean} - Whether the password is valid
   */
  const validatePassword = () => {
    if (!formData.password.trim()) {
      setMessage({ text: "Password is required", type: "error" });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return false;
    }

    return true;
  };

  /**
   * Handles the send OTP process (Step 1)
   */
  const handleSendOTP = async () => {
    // Clear previous messages
    setMessage({ text: "", type: "" });
    
    // Validate phone number before submission
    if (!validatePhone()) {
      return;
    }

    setLoading(true);
    try {
      const response = await sendOTP(formData.phone);
      
      if (response.error) {
        setMessage({ 
          text: response.error.message || "Failed to send OTP. Please try again.", 
          type: "error" 
        });
      } else if (response.data?.success) {
        setMessage({ 
          text: "OTP sent to your phone. Please check your messages.", 
          type: "success" 
        });
        // Move to OTP verification step
        setCurrentStep(2);
      } else {
        setMessage({ 
          text: "Failed to send OTP. Please try again later.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Unexpected error sending OTP:", error);
      setMessage({ 
        text: "An unexpected error occurred. Please try again later.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the verify OTP process (Step 2)
   */
  const handleVerifyOTP = async () => {
    // Clear previous messages
    setMessage({ text: "", type: "" });
    
    // Validate OTP before submission
    if (!validateOTP()) {
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(formData.phone, formData.otp);
      
      if (response.error) {
        setMessage({ 
          text: response.error.message || "Invalid or expired OTP. Please try again.", 
          type: "error" 
        });
      } else if (response.data?.success) {
        // Store the user ID for the password reset step
        if (response.data?.data?._id) {
          setUserId(response.data.data._id);
        }
        
        setMessage({ 
          text: "OTP verified successfully. Please set your new password.", 
          type: "success" 
        });
        // Move to password reset step
        setCurrentStep(3);
      } else {
        setMessage({ 
          text: "Failed to verify OTP. Please try again.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Unexpected error verifying OTP:", error);
      setMessage({ 
        text: "An unexpected error occurred. Please try again later.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the reset password process (Step 3)
   */
  const handleResetPassword = async () => {
    // Clear previous messages
    setMessage({ text: "", type: "" });
    
    // Validate password before submission
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(userId, formData.password);
      
      if (response.error) {
        setMessage({ 
          text: response.error.message || "Failed to reset password. Please try again.", 
          type: "error" 
        });
      } else if (response.data?.success) {
        setMessage({ 
          text: "Password reset successful! You can now login with your new password.", 
          type: "success" 
        });
        antMessage.success("Password reset successful!");
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setMessage({ 
          text: "Failed to reset password. Please try again later.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Unexpected error resetting password:", error);
      setMessage({ 
        text: "An unexpected error occurred. Please try again later.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Enter key press in input fields
   * @param {Event} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      if (currentStep === 1) {
        handleSendOTP();
      } else if (currentStep === 2) {
        handleVerifyOTP();
      } else if (currentStep === 3) {
        handleResetPassword();
      }
    }
  };

  /**
   * Navigates back to login page
   */
  const handleBackToLogin = () => {
    router.push("/signin");
  };

  /**
   * Renders the step title and description
   */
  const renderStepHeader = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h1 className="text-xl font-semibold">Reset your password</h1>
            <h1 className="text-gray-400 text-sm">
              Enter your phone number to receive a verification code
            </h1>
          </>
        );
      case 2:
        return (
          <>
            <h1 className="text-xl font-semibold">Enter verification code</h1>
            <h1 className="text-gray-400 text-sm">
              Please enter the OTP sent to your phone number
            </h1>
          </>
        );
      case 3:
        return (
          <>
            <h1 className="text-xl font-semibold">Set new password</h1>
            <h1 className="text-gray-400 text-sm">
              Create a new password for your account
            </h1>
          </>
        );
      default:
        return null;
    }
  };

  /**
   * Renders the form fields based on current step
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Phone number step
        return (
          <>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold">Phone Number</label>
              <Input
                size="large"
                className="w-96 text-sm"
                type="tel"
                placeholder="Enter your phone number with country code (e.g., +917510202251)"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                onKeyPress={handleKeyPress}

                 disabled={loading}
                autoComplete="tel"
                aria-label="Phone Number"
                data-testid="phone-input"
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className={`rounded-md text-white w-full h-10 flex items-center justify-center gap-2 transition-colors ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#00A99D] hover:bg-[#197364] cursor-pointer"
              }`}
            >
              <h1>{loading ? "Sending OTP..." : "Send Verification Code"}</h1>
              {!loading && <PiSignInBold className="text-lg" />}
            </button>
          </>
        );
      case 2: // OTP verification step
        return (
          <>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold">Verification Code</label>
              <Input
                size="large"
                className="w-96 text-sm"
                type="text"
                placeholder="Enter the OTP sent to your email"
                value={formData.otp}
                onChange={(e) => handleInputChange("otp", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoComplete="one-time-code"
                aria-label="Verification Code"
                data-testid="otp-input"
                maxLength={6}
              />
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className={`rounded-md text-white w-full h-10 flex items-center justify-center gap-2 transition-colors ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#00A99D] hover:bg-[#197364] cursor-pointer"
              }`}
            >
              <h1>{loading ? "Verifying..." : "Verify Code"}</h1>
              {!loading && <PiSignInBold className="text-lg" />}
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              disabled={loading}
              className="text-blue-600 text-sm hover:underline"
            >
              Resend verification code
            </button>
          </>
        );
      case 3: // New password step
        return (
          <>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold">New Password</label>
              <Input.Password
                size="large"
                className="w-96 text-sm"
                placeholder="Enter your new password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onKeyPress={handleKeyPress}
                prefix={<FiLock className="text-lg mr-1" />}
                disabled={loading}
                aria-label="New Password"
                data-testid="password-input"
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold">Confirm Password</label>
              <Input.Password
                size="large"
                className="w-96 text-sm"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                onKeyPress={handleKeyPress}
                prefix={<FiLock className="text-lg mr-1" />}
                disabled={loading}
                aria-label="Confirm Password"
                data-testid="confirm-password-input"
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`rounded-md text-white w-full h-10 flex items-center justify-center gap-2 transition-colors ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#00A99D] hover:bg-[#197364] cursor-pointer"
              }`}
            >
              <h1>{loading ? "Resetting Password..." : "Reset Password"}</h1>
              {!loading && <PiSignInBold className="text-lg" />}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-white flex items-center">
      <div className="w-1/2 h-screen bg-gray-100 relative">
        <Image alt="Reset password background" src={bg} className="w-full h-full object-cover" />
      </div>
      <div className="w-1/2 h-screen flex items-center justify-center">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            {renderStepHeader()}
          </div>
          <div className="flex flex-col gap-4">
            {message.text && (
              <div 
                className={`p-3 rounded-md text-sm font-medium ${
                  message.type === "error" 
                    ? "bg-red-100 text-red-700 border border-red-300" 
                    : "bg-green-100 text-green-700 border border-green-300"
                }`}
                role="alert"
                aria-live="assertive"
              >
                {message.text}
              </div>
            )}
            {renderStepContent()}
            <div className="flex justify-center w-full font-medium text-sm">
              <div className="flex flex-col items-center">
                <button 
                  onClick={handleBackToLogin}
                  className="text-blue-600 flex items-center justify-center gap-2 hover:underline"
                >
                  <FaAngleLeft /> Back to login screen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
