"use client";
import React, { useState, useEffect } from "react";
import bg from "../../app/assets/signin/bg.png";
import Image from "next/image";
import { Input, message as antMessage } from "antd";
import { PiSignInBold } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { MdOutlineEmail } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { loginUser } from "../../api/user";
import { EMAIL_REGEX } from "../../utils/constants";

function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
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
   * Validates the form data
   * @returns {boolean} - Whether the form is valid
   */
  const validateForm = () => {
    // Check for empty fields
    if (!formData.email.trim()) {
      setMessage({ text: "Email is required", type: "error" });
      return false;
    }
    
    if (!formData.password.trim()) {
      setMessage({ text: "Password is required", type: "error" });
      return false;
    }

    // Email format validation
    if (!EMAIL_REGEX.test(formData.email)) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return false;
    }

    // Password length validation
    if (formData.password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return false;
    }

    return true;
  };

  /**
   * Handles the sign-in process
   */
  const handleSignIn = async () => {
    // Clear previous messages
    setMessage({ text: "", type: "" }); 
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(formData);
      
      // Handle different response scenarios
      if (response.error) {
        setMessage({ 
          text: response.error.message || "Login failed. Please check your credentials.", 
          type: "error" 
        });
      } 
      // Handle pending admin approval (status 409)
      else if (response.status === 409) {
        if (response.data?.message === "Admin didn't accept request yet.") {
          setMessage({ 
            text: "Waiting for Approval", 
            type: "pending" 
          });
        } else {
          setMessage({ 
            text: response.data?.message || "Your request is pending approval.", 
            type: "pending" 
          });
        }
      } 
      // Handle successful login
      else if (response.data?.success) {
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        antMessage.success("Login successful!");
        
        // Redirect to forum page after a short delay
        setTimeout(() => {
          router.push("/forum");
        }, 1500);
      } 
      // Handle any other unexpected response format
      else {
        setMessage({ 
          text: "Login failed. Please check your credentials or try again later.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      
      // Handle network errors separately
      if (error.message?.includes("Network Error")) {
        setMessage({ 
          text: "Unable to connect to the server. Please check your internet connection.", 
          type: "error" 
        });
      } else {
        setMessage({ 
          text: "An unexpected error occurred. Please try again later.", 
          type: "error" 
        });
      }
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
      handleSignIn();
    }
  };

  /**
   * Navigates to registration page
   */
  const handleRegisterClick = () => {
    router.push("/registration");
  };

  /**
   * Navigates to password reset page
   */
  const handleForgotPasswordClick = () => {
    router.push("/resetPassword");
  };

  return (
    <div className="w-full h-screen bg-white flex items-center">
      <div className="w-1/2 h-screen bg-gray-100 relative">
        <Image alt="Sign in background" src={bg} className="w-full h-full object-cover" />
      </div>
      <div className="w-1/2 h-screen flex items-center justify-center">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Sign In To Your Account</h1>
            <h1 className="text-gray-400 text-sm">
              Let&apos;s sign in to your account and get started.
            </h1>
          </div>
          <div className="flex flex-col gap-4">
            {message.text && (
              <div 
                className={`p-3 rounded-md text-sm font-medium ${
                  message.type === "error" 
                    ? "bg-red-100 text-red-700 border border-red-300" 
                    : message.type === "pending"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-green-100 text-green-700 border border-green-300"
                }`}
                role="alert"
                aria-live="assertive"
              >
                {message.text}
              </div>
            )}
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold">Email Address</label>
              <Input
                size="large"
                className="w-96 text-sm"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onKeyPress={handleKeyPress}
                prefix={<MdOutlineEmail className="text-lg mr-1" />}
                disabled={loading}
                autoComplete="email"
                aria-label="Email Address"
                data-testid="email-input"
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold">Password</label>
              <Input
                size="large"
                type="password"
                className="w-96 text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onKeyPress={handleKeyPress}
                prefix={<FiLock className="text-lg mr-1" />}
                disabled={loading}
                autoComplete="current-password"
                aria-label="Password"
                data-testid="password-input"
              />
            </div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className={`rounded-md text-white w-full h-10 flex items-center justify-center gap-2 transition-colors ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#00A99D] hover:bg-[#197364] cursor-pointer"
              }`}
            >
              <h1>{loading ? "Signing In..." : "Sign In"}</h1>
              {!loading && <PiSignInBold className="text-lg" />}
            </button>
            <div className="flex justify-center w-full font-medium text-sm">
              <div className="flex flex-col items-center">
                <h1>
                  Don't have an account?
                  <span 
                    className="text-blue-600 cursor-pointer hover:underline" 
                    onClick={handleRegisterClick}
                  > Register Now</span>
                </h1>
                <h1 
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={handleForgotPasswordClick}
                >
                  Forgot Password
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;