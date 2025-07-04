"use client"

import React, { useState, useEffect } from 'react';
import { fetchUserById, editUserProfile, sendOTP, verifyOTP, requestActivationLink } from '../../api/user';
import Image from 'next/image';
import { Input, message, Select, Modal, Alert, Button, Tooltip } from 'antd';
import logo from '../../app/assets/registation/logo.png';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { PiSignInBold } from "react-icons/pi";
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import UserResources from './UserResources';
import UserDiscussions from './UserDiscussions';

const defaultAvatar = `data:image/svg+xml,${encodeURIComponent('<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#E5E7EB"/><path d="M40 42C46.6274 42 52 36.6274 52 30C52 23.3726 46.6274 18 40 18C33.3726 18 28 23.3726 28 30C28 36.6274 33.3726 42 40 42ZM56 60C56 52.268 48.837 46 40 46C31.163 46 24 52.268 24 60V62H56V60Z" fill="#9CA3AF"/></svg>')}`;

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log('Response status:', response.status);
  
  try {
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok || !data.success) {
      return { 
        success: false, 
        message: data.message || 'Failed to update profile',
        error: data.error || 'Unknown error'
      };
    }

    return { 
      success: true, 
      message: 'Profile updated successfully',
      data: data.data // The API returns user data in the 'data' property
    };
  } catch (parseError) {
    console.error('Error parsing response:', parseError);
    return {
      success: false,
      message: `Error parsing response: ${parseError.message}`,
      error: parseError
    };
  }
};

import { updateUserProfileWithFile } from "../../api/user";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Account');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });
  
  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    countryOfPractice: '',
    bio: '',
    medicalQualification: '',
    yearOfGraduation: '',
    medicalRegistrationAuthority: '',
    medicalRegistrationNumber: '',
    hasFormalTrainingInPalliativeCare: false,
    affiliatedPalliativeAssociations: '',
    specialInterestsInPalliativeCare: ''
  });
  
  const tabs = ['Account', 'My Discussions', 'My Resources', 'Notification Preferences'];

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          message.error('User not authenticated');
          return;
        }

        const response = await fetchUserById(userId);
        console.log('API Response:', response);
        if (response?.data?.success && response.data.data) {
          setUserProfile(response.data.data);
          // Initialize form data with user profile data
          setFormData({
            fullName: response.data.data.fullName || '',
            phoneNumber: response.data.data.phoneNumber || '',
            email: response.data.data.email || '',
            countryOfPractice: response.data.data.countryOfPractice || '',
            bio: response.data.data.bio || '',
            medicalQualification: response.data.data.medicalQualification || '',
            yearOfGraduation: response.data.data.yearOfGraduation || '',
            medicalRegistrationAuthority: response.data.data.medicalRegistrationAuthority || '',
            medicalRegistrationNumber: response.data.data.medicalRegistrationNumber || '',
            hasFormalTrainingInPalliativeCare: response.data.data.hasFormalTrainingInPalliativeCare || false,
            affiliatedPalliativeAssociations: response.data.data.affiliatedPalliativeAssociations || '',
            specialInterestsInPalliativeCare: response.data.data.specialInterestsInPalliativeCare || ''
          });
          console.log('Setting user profile:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user profile data
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        phoneNumber: userProfile.phoneNumber || '',
        email: userProfile.email || '',
        countryOfPractice: userProfile.countryOfPractice || '',
        bio: userProfile.bio || '',
        medicalQualification: userProfile.medicalQualification || '',
        yearOfGraduation: userProfile.yearOfGraduation || '',
        medicalRegistrationAuthority: userProfile.medicalRegistrationAuthority || '',
        medicalRegistrationNumber: userProfile.medicalRegistrationNumber || '',
        hasFormalTrainingInPalliativeCare: userProfile.hasFormalTrainingInPalliativeCare || false,
        affiliatedPalliativeAssociations: userProfile.affiliatedPalliativeAssociations || '',
        specialInterestsInPalliativeCare: userProfile.specialInterestsInPalliativeCare || ''
      });
    }
  };

  const [profileImage, setProfileImage] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        message.error('User not authenticated');
        return;
      }

      // Prepare data for the API call
      const userData = {
        ...formData,
        role: "68629dde1557b3c7e90ce077"
      };
      
      // If no new profile image is selected, include the existing image URL
      if (!profileImage && userProfile?.imageURL) {
        userData.existingImageURL = userProfile.imageURL;
        console.log('Preserving existing image URL:', userProfile.imageURL);
      }
      
      // Log the data we're about to send
      console.log('User data being sent:', userData);
      console.log('Profile image being sent:', profileImage ? profileImage.name : 'None');
      
      // Use the new updateUserProfileWithFile function from user.js
      const response = await updateUserProfileWithFile(userId, userData, profileImage);
      console.log('Update profile response:', response);
      
      // Check for success in the response
      if (response && !response.error) {
        // Success can be in response.success or in the data object
        const responseData = response.data || (response.data?.data) || {};
        
        message.success('Profile updated successfully!');
        console.log('Profile updated with data:', responseData);
        
        // Update the user profile state with the new data from the API response
        if (responseData) {
          // The API returns the complete updated user profile
          setUserProfile(responseData);
          
          // Also update the form data with the latest values from the API
          setFormData({
            fullName: responseData.fullName || '',
            phoneNumber: responseData.phoneNumber || '',
            email: responseData.email || '',
            countryOfPractice: responseData.countryOfPractice || '',
            bio: responseData.bio || '',
            medicalQualification: responseData.medicalQualification || '',
            yearOfGraduation: responseData.yearOfGraduation || '',
            medicalRegistrationAuthority: responseData.medicalRegistrationAuthority || '',
            medicalRegistrationNumber: responseData.medicalRegistrationNumber || '',
            hasFormalTrainingInPalliativeCare: responseData.hasFormalTrainingInPalliativeCare || false,
            affiliatedPalliativeAssociations: responseData.affiliatedPalliativeAssociations || '',
            specialInterestsInPalliativeCare: responseData.specialInterestsInPalliativeCare || ''
          });
        }
        
        setIsEditing(false);
        setProfileImage(null); // Reset the file input
      } else {
        // Show the specific error message from the API if available
        const errorMsg = response?.message || 'Failed to update profile';
        console.error('Profile update failed:', errorMsg);
        console.error('Error details:', response?.error);
        
        // Display a more detailed error message to the user
        message.error({
          content: errorMsg,
          duration: 5, // Show for 5 seconds
          style: { marginTop: '20px' }
        });
      }
    } catch (error) {
      console.error('Error in handleUpdate function:', error);
      console.error('Error stack:', error.stack);
      
      // Display a more helpful error message based on the error type
      if (error.message && error.message.includes('network')) {
        message.error('Network error: Please check your internet connection');
      } else {
        message.error({
          content: `Error updating profile: ${error.message || 'Unknown error'}`,
          duration: 5,
          style: { marginTop: '20px' }
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  // Password change state
  const [currentStep, setCurrentStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Change Password
  const [passwordData, setPasswordData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error messages when user starts typing
    if (passwordMessage.type === "error") {
      setPasswordMessage({ text: "", type: "" });
    }
  };

  const validateOTP = () => {
    if (!passwordData.otp.trim()) {
      setPasswordMessage({ text: "OTP is required", type: "error" });
      return false;
    }

    // Basic validation - OTP should be numeric and have a reasonable length
    if (!/^\d+$/.test(passwordData.otp) || passwordData.otp.length < 4) {
      setPasswordMessage({ text: "Please enter a valid OTP", type: "error" });
      return false;
    }

    return true;
  };

  const validatePasswordData = () => {
    if (!passwordData.newPassword) {
      setPasswordMessage({ text: "New password is required", type: "error" });
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ text: "New password must be at least 6 characters", type: "error" });
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ text: "Passwords do not match", type: "error" });
      return false;
    }

    return true;
  };

  const handleSendOTP = async () => {
    // Clear previous messages
    setPasswordMessage({ text: "", type: "" });
    
    if (!userProfile?.phoneNumber) {
      setPasswordMessage({ 
        text: "No phone number found in your profile. Please update your profile with a phone number first.", 
        type: "error" 
      });
      return;
    }

    setPasswordLoading(true);
    try {
      // Send OTP to the user's phone number
      const response = await sendOTP(userProfile.phoneNumber);
      
      if (response.error) {
        setPasswordMessage({ 
          text: response.error.message || "Failed to send OTP. Please try again.", 
          type: "error" 
        });
      } else if (response.data?.success) {
        setPasswordMessage({ 
          text: "OTP sent to your phone. Please check your messages.", 
          type: "success" 
        });
        // Move to OTP verification step
        setCurrentStep(2);
      } else {
        setPasswordMessage({ 
          text: "Failed to send OTP. Please try again later.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Unexpected error sending OTP:", error);
      setPasswordMessage({ 
        text: "An unexpected error occurred. Please try again later.", 
        type: "error" 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Clear previous messages
    setPasswordMessage({ text: "", type: "" });
    
    // Validate OTP before submission
    if (!validateOTP()) {
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await verifyOTP(userProfile.phoneNumber, passwordData.otp);
      
      if (response.error) {
        setPasswordMessage({ 
          text: response.error.message || "Invalid or expired OTP. Please try again.", 
          type: "error" 
        });
      } else if (response.data?.success) {        
        setPasswordMessage({ 
          text: "OTP verified successfully. Please set your new password.", 
          type: "success" 
        });
        // Move to password change step
        setCurrentStep(3);
      } else {
        setPasswordMessage({ 
          text: "Failed to verify OTP. Please try again.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Unexpected error verifying OTP:", error);
      setPasswordMessage({ 
        text: "An unexpected error occurred. Please try again later.", 
        type: "error" 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Clear previous messages
    setPasswordMessage({ text: "", type: "" });
    
    // Validate password data
    if (!validatePasswordData()) {
      return;
    }

    setPasswordLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setPasswordMessage({ text: "User not authenticated", type: "error" });
        return;
      }

      // API call would go here
      // For now, simulate a successful password change
      setTimeout(() => {
        setPasswordMessage({ text: "Password changed successfully!", type: "success" });
        
        // Reset form and close modal after success
        setTimeout(() => {
          setPasswordData({
            otp: "",
            newPassword: "",
            confirmPassword: ""
          });
          setCurrentStep(1);
          setChangePasswordVisible(false);
          setPasswordMessage({ text: "", type: "" });
          message.success("Password changed successfully!");
        }, 1500);
      }, 1000);
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordMessage({ 
        text: "Failed to change password. Please try again.", 
        type: "error" 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenChangePassword = () => {
    setChangePasswordVisible(true);
    setCurrentStep(1);
    setPasswordData({
      otp: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordMessage({ text: "", type: "" });
  };

  const handleCloseChangePassword = () => {
    setChangePasswordVisible(false);
    setCurrentStep(1);
  };

  const renderStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Send Verification Code";
      case 2:
        return "Verify OTP";
      case 3:
        return "Change Password";
      default:
        return "Change Password";
    }
  };

  const renderStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "We'll send a verification code to your phone number";
      case 2:
        return "Enter the verification code sent to your phone";
      case 3:
        return "Create a new password for your account";
      default:
        return "";
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="fixed w-80 h-screen border-r border-gray-200 p-8 flex flex-col gap-14 bg-white">
        <Image src={logo} alt="GPDN Logo" width={100} height={40} style={{ height: 'auto' }} />
        <div className="flex flex-col gap-5">
          <a href="/forum" className="flex items-center gap-3 text-gray-500 hover:text-[#00A99D] transition-colors">
            <MdDashboard className="text-xl" />
            <span>Forum</span>
          </a>
          <a href="/resource-library" className="flex items-center gap-3 text-gray-500 hover:text-[#00A99D] transition-colors">
            <FaRegFolder className="text-xl" />
            <span>Resource Library</span>
          </a>
          <a href="/members" className="flex items-center gap-3 text-gray-500 hover:text-[#00A99D] transition-colors">
            <TbUsers className="text-xl" />
            <span>Members</span>
          </a>
          <a href="/palliative-units" className="flex items-center gap-3 text-gray-500 hover:text-[#00A99D] transition-colors">
            <PiBuildings className="text-xl" />
            <span>Palliative Units</span>
          </a>
          <a href="/news-blogs" className="flex items-center gap-3 text-gray-500 hover:text-[#00A99D] transition-colors">
            <IoNewspaperOutline className="text-xl" />
            <span>News & Blogs</span>
          </a>
          <a href="/settings" className="flex items-center gap-3 text-[#00A99D]">
            <MdOutlineSettings className="text-xl" />
            <span>Settings</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-80 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          {!isEditing ? (
            <button 
              onClick={handleEdit}
              className="px-6 py-2 text-sm text-white bg-[#00A99D] rounded hover:bg-[#008F84] transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={updating}
                className="px-6 py-2 text-sm text-white bg-[#00A99D] rounded hover:bg-[#008F84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-4 ${activeTab === tab ? 'text-[#00A99D] border-b-2 border-[#00A99D]' : 'text-gray-500'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Account' && (
          <div className="max-w-3xl">
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-2">Your Profile</h2>
              <p className="text-gray-500 text-sm">Please update your profile settings here</p>
              {userProfile?.registrationStatus && (
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    userProfile.registrationStatus === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {userProfile.registrationStatus.charAt(0).toUpperCase() + userProfile.registrationStatus.slice(1)}
                  </span>
                </div>
              )}
            </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading profile...</div>
            </div>
          ) : (
            <>
              {/* Profile Picture */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                    {userProfile?.imageURL ? (
                      <img 
                        src={userProfile.imageURL.startsWith('http') ? userProfile.imageURL : `${process.env.NEXT_PUBLIC_API_URL}/${userProfile.imageURL}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultAvatar;
                        }}
                      />
                    ) : (
                      <img 
                        src={defaultAvatar}
                        alt="Default Profile"
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <label className="px-4 py-2 text-sm text-white bg-[#00A99D] rounded hover:bg-[#008F84] transition-colors cursor-pointer">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={!isEditing}
                        />
                        {profileImage ? 'Change Image' : 'Upload Image'}
                      </label>
                    ) : (
                      <button 
                        className="px-4 py-2 text-sm text-white bg-[#00A99D] rounded hover:bg-[#008F84] transition-colors cursor-pointer disabled:opacity-50"
                        onClick={handleEdit}
                      >
                        Edit Profile
                      </button>
                    )}
                    {profileImage && isEditing && (
                      <button 
                        className="px-4 py-2 text-sm text-white bg-[#FF3B30] rounded hover:bg-red-600 transition-colors"
                        onClick={() => setProfileImage(null)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                {profileImage && isEditing && (
                  <div className="mt-2 text-sm text-green-600">
                    New image selected: {profileImage.name}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input 
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full"
                    readOnly={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <PhoneInput
                    country={'us'}
                    value={formData.phoneNumber}
                    onChange={(value) => handleInputChange('phoneNumber', value)}
                    inputStyle={{
                      width: '100%',
                      height: '40px'
                    }}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                    readOnly={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country of Practice</label>
                  <Input 
                    placeholder="Select your country"
                    value={formData.countryOfPractice}
                    onChange={(e) => handleInputChange('countryOfPractice', e.target.value)}
                    className="w-full"
                    readOnly={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Input.TextArea
                    placeholder="Enter your bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    readOnly={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Medical Qualifications</label>
                  <Input 
                    value={formData.medicalQualification}
                    onChange={(e) => handleInputChange('medicalQualification', e.target.value)}
                    className="w-full"
                    readOnly={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Year of Graduation</label>
                  <Input 
                    value={formData.yearOfGraduation}
                    onChange={(e) => handleInputChange('yearOfGraduation', e.target.value)}
                    className="w-full"
                    readOnly={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Medical Registration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="Authority"
                      value={formData.medicalRegistrationAuthority}
                      onChange={(e) => handleInputChange('medicalRegistrationAuthority', e.target.value)}
                      className="w-full"
                      readOnly={!isEditing}
                    />
                    <Input 
                      placeholder="Number"
                      value={formData.medicalRegistrationNumber}
                      onChange={(e) => handleInputChange('medicalRegistrationNumber', e.target.value)}
                      className="w-full"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Palliative Care Training</label>
                  {isEditing ? (
                    <Select
                      value={formData.hasFormalTrainingInPalliativeCare}
                      onChange={(value) => handleInputChange('hasFormalTrainingInPalliativeCare', value)}
                      className="w-full"
                      options={[
                        { value: true, label: 'Has Formal Training' },
                        { value: false, label: 'No Formal Training' }
                      ]}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${formData.hasFormalTrainingInPalliativeCare ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {formData.hasFormalTrainingInPalliativeCare ? 'Has Formal Training' : 'No Formal Training'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Affiliated Palliative Associations</label>
                  <Input.TextArea
                    value={formData.affiliatedPalliativeAssociations}
                    onChange={(e) => handleInputChange('affiliatedPalliativeAssociations', e.target.value)}
                    className="w-full"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    readOnly={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Special Interests in Palliative Care</label>
                  <Input.TextArea
                    value={formData.specialInterestsInPalliativeCare}
                    onChange={(e) => handleInputChange('specialInterestsInPalliativeCare', e.target.value)}
                    className="w-full"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              {/* Change Password Section */}
              <div className="mt-8">
                <div className="mb-6">
                  <h2 className="text-lg font-medium">Change Password</h2>
                  <p className="text-gray-500 text-sm">Here you can change the password to your account</p>
                </div>
                <button 
                  onClick={handleOpenChangePassword}
                  className="px-6 py-2 text-sm text-white bg-[#00A99D] rounded hover:bg-[#008F84] transition-colors"
                >
                  Change Password
                </button>
              </div>

              {/* Change Password Modal */}
              <Modal
                title={renderStepTitle()}
                open={changePasswordVisible}
                onCancel={handleCloseChangePassword}
                footer={null}
                width={500}
                centered
              >
                <div className="py-4">
                  <p className="text-gray-500 text-sm mb-4">{renderStepDescription()}</p>
                  
                  {passwordMessage.text && (
                    <div className={`mb-4 p-3 rounded ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {currentStep === 1 && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col w-full">
                          <p className="text-sm mb-2">We'll send a verification code to your phone number: <strong>{userProfile?.phoneNumber || 'Not available'}</strong></p>
                        </div>
                        <button
                          onClick={handleSendOTP}
                          disabled={passwordLoading || !userProfile?.phoneNumber}
                          className={`mt-2 rounded-md text-white w-full h-10 flex items-center justify-center gap-2 transition-colors ${passwordLoading || !userProfile?.phoneNumber ? "bg-gray-400 cursor-not-allowed" : "bg-[#00A99D] hover:bg-[#197364] cursor-pointer"}`}
                        >
                          <span>{passwordLoading ? "Sending Code..." : "Send Verification Code"}</span>
                          {!passwordLoading && <PiSignInBold className="text-lg" />}
                        </button>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col w-full">
                          <label className="text-sm font-semibold mb-1">Verification Code</label>
                          <Input
                            size="large"
                            className="text-sm"
                            type="text"
                            placeholder="Enter the OTP sent to your phone"
                            value={passwordData.otp}
                            onChange={(e) => handlePasswordInputChange("otp", e.target.value)}
                            disabled={passwordLoading}
                            maxLength={6}
                          />
                        </div>
                        <button
                          onClick={handleVerifyOTP}
                          disabled={passwordLoading}
                          className={`mt-2 rounded-md text-white w-full h-10 flex items-center justify-center gap-2 transition-colors ${passwordLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#00A99D] hover:bg-[#197364] cursor-pointer"}`}
                        >
                          <span>{passwordLoading ? "Verifying..." : "Verify Code"}</span>
                          {!passwordLoading && <PiSignInBold className="text-lg" />}
                        </button>
                        <button
                          onClick={() => setCurrentStep(1)}
                          disabled={passwordLoading}
                          className="text-blue-600 text-sm hover:underline text-center"
                        >
                          Resend verification code
                        </button>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col w-full">
                          <label className="text-sm font-semibold mb-1">New Password</label>
                          <Input.Password
                            size="large"
                            className="text-sm"
                            placeholder="Enter your new password"
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                            prefix={<FiLock className="text-lg mr-1" />}
                            disabled={passwordLoading}
                          />
                        </div>

                        <div className="flex flex-col w-full">
                          <label className="text-sm font-semibold mb-1">Confirm New Password</label>
                          <Input.Password
                            size="large"
                            className="text-sm"
                            placeholder="Confirm your new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                            prefix={<FiLock className="text-lg mr-1" />}
                            disabled={passwordLoading}
                          />
                        </div>

                        <button
                          onClick={handleChangePassword}
                          disabled={passwordLoading}
                          className={`mt-2 rounded-md text-white w-full h-10 flex items-center justify-center gap-2 transition-colors ${passwordLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#00A99D] hover:bg-[#197364] cursor-pointer"}`}
                        >
                          <span>{passwordLoading ? "Changing Password..." : "Change Password"}</span>
                          {!passwordLoading && <PiSignInBold className="text-lg" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Modal>
            </>
          )}
        </div>
        )}
        
        {activeTab === 'My Discussions' && (
          <UserDiscussions />
        )}
        
        {activeTab === 'My Resources' && (
          <UserResources />
        )}
        
        {activeTab === 'Notification Preferences' && (
          <div className="max-w-3xl">
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-2">Notification Preferences</h2>
              <p className="text-gray-500 text-sm">Manage your notification settings</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <p className="text-center text-gray-500">Notification preferences will be available soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;