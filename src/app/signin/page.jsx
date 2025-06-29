"use client";
import React, { useState } from "react";
import bg from "../../app/assets/signin/bg.png";
import Image from "next/image";
import { Input } from "antd";
import { PiSignInBold } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { MdOutlineEmail } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { loginUser } from "../../api/user";

function page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setMessage({ text: "Email is required", type: "error" });
      return false;
    }
    
    if (!formData.password.trim()) {
      setMessage({ text: "Password is required", type: "error" });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    setMessage({ text: "", type: "" }); // Clear previous messages
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(formData);
      
      if (response.error) {
        setMessage({ text: response.error.message || "Login failed", type: "error" });
      } else if (response.status === 409 && response.data?.message?.toLowerCase().includes("admin")) {
        setMessage({ text: "Approval status pending. Please wait for admin approval.", type: "pending" });
      } else if (response.data?.success) {
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        // Redirect to forum page after a short delay
        setTimeout(() => {
          router.push("/forum");
        }, 1500);
      } else {
        setMessage({ text: "Login failed. Please check your credentials.", type: "error" });
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      setMessage({ text: "An unexpected error occurred during login", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  const handleRegisterClick = () => {
    router.push("/registration");
  };

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
              <div className={`p-3 rounded-md text-sm font-medium ${
                message.type === "error" 
                  ? "bg-red-100 text-red-700 border border-red-300" 
                  : message.type === "pending"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : "bg-green-100 text-green-700 border border-green-300"
              }`}>
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

export default page;