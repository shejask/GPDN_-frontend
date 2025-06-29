"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input, Button, message, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import logo from '../../assets/registation/logo.png';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import Link from 'next/link';
import { fetchUserProfile, editUserProfile } from '@/api/user';

function Settings() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    countryOfPractice: '',
    medicalQualification: '',
    yearOfGraduation: '',
    hasFormalTrainingInPalliativeCare: false,
    medicalRegistrationAuthority: '',
    medicalRegistrationNumber: '',
    affiliatedPalliativeAssociations: '',
    specialInterestsInPalliativeCare: '',
  });
  const router = useRouter();

  const sidebarMenus = [
    {
      menu: 'Dashboard',
      icon: <MdDashboard/>,
      path: '/dashboard'
    },
    {
      menu: 'Resource Library',
      icon: <FaRegFolder/>,
      path: '/resource-library'
    },
    {
      menu: 'Members',
      icon: <TbUsers/>,
      path: '/members'
    },
    {
      menu: 'Palliative Units',
      icon: <PiBuildings/>,
      path: '/palliative-units'
    },
    {
      menu: 'News & Blogs',
      icon: <IoNewspaperOutline/>,
      path: '/news-blogs'
    },
    {
      menu: 'Settings',
      icon: <MdOutlineSettings/>,
      path: '/settings'
    }
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
  try {
    setLoading(true);
    const response = await fetchUserProfile();
    
    if (response.error) {
      message.error(response.error);
      if (response.error.includes('User ID not found')) {
        router.push('/signin');
      }
      return;
    }

    // Debug the response structure
    console.log('Profile Response:', response);
    
    // Try different possible data locations
    let userData = null;
    
    // Common response structures to check
    if (response?.data?.data?.data) {
      userData = response.data.data.data;
    } else if (response?.data?.data) {
      userData = response.data.data;
    } else if (response?.data) {
      userData = response.data;
    }
    
    console.log('Extracted userData:', userData);
    
    if (userData) {
      setUserProfile(userData);
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        bio: userData.bio || '',
        countryOfPractice: userData.countryOfPractice || '',
        medicalQualification: userData.medicalQualification || '',
        yearOfGraduation: userData.yearOfGraduation?.toString() || '',
        hasFormalTrainingInPalliativeCare: userData.hasFormalTrainingInPalliativeCare || false,
        medicalRegistrationAuthority: userData.medicalRegistrationAuthority || '',
        medicalRegistrationNumber: userData.medicalRegistrationNumber || '',
        affiliatedPalliativeAssociations: userData.affiliatedPalliativeAssociations || '',
        specialInterestsInPalliativeCare: userData.specialInterestsInPalliativeCare || '',
      });
    } else {
      console.error('No user data found in response');
      message.error('No user data found');
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    message.error('Failed to load user profile');
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await editUserProfile(formData);
      
      if (response.error) {
        message.error(response.error);
        return;
      }

      message.success('Profile updated successfully');
      // Reload profile to get updated data
      await loadUserProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
          <div className="p-5">
            <Image alt="GPDN Logo" src={logo} width={100}/>
          </div>
          
          <nav className="mt-5">
            {sidebarMenus.map((item, index) => (
              <Link href={item.path} key={index}>
                <div className="cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3">
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.menu}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Loading Content */}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-5">
          <Image alt="GPDN Logo" src={logo} width={100}/>
        </div>
        
        <nav className="mt-5">
          {sidebarMenus.map((item, index) => (
            <Link href={item.path} key={index}>
              <div className={`cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3 ${
                item.path === '/settings' ? 'bg-[#00A99D] text-white' : ''
              }`}>
                <span className="text-xl">{item.icon}</span>
                <span>{item.menu}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        <div className="p-5 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country of Practice</label>
                <Input
                  value={formData.countryOfPractice}
                  onChange={(e) => handleInputChange('countryOfPractice', e.target.value)}
                  placeholder="Enter country of practice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Medical Qualification</label>
                <Input
                  value={formData.medicalQualification}
                  onChange={(e) => handleInputChange('medicalQualification', e.target.value)}
                  placeholder="Enter medical qualification"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Year of Graduation</label>
                <Input
                  value={formData.yearOfGraduation}
                  onChange={(e) => handleInputChange('yearOfGraduation', e.target.value)}
                  placeholder="Enter year of graduation"
                  type="number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Medical Registration Authority</label>
                <Input
                  value={formData.medicalRegistrationAuthority}
                  onChange={(e) => handleInputChange('medicalRegistrationAuthority', e.target.value)}
                  placeholder="Enter medical registration authority"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Medical Registration Number</label>
                <Input
                  value={formData.medicalRegistrationNumber}
                  onChange={(e) => handleInputChange('medicalRegistrationNumber', e.target.value)}
                  placeholder="Enter medical registration number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Formal Training in Palliative Care</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasFormalTraining"
                      checked={formData.hasFormalTrainingInPalliativeCare === true}
                      onChange={() => handleInputChange('hasFormalTrainingInPalliativeCare', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasFormalTraining"
                      checked={formData.hasFormalTrainingInPalliativeCare === false}
                      onChange={() => handleInputChange('hasFormalTrainingInPalliativeCare', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <Input.TextArea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter bio"
                rows={4}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Affiliated Palliative Associations</label>
              <Input.TextArea
                value={formData.affiliatedPalliativeAssociations}
                onChange={(e) => handleInputChange('affiliatedPalliativeAssociations', e.target.value)}
                placeholder="Enter affiliated palliative associations"
                rows={3}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Special Interests in Palliative Care</label>
              <Input.TextArea
                value={formData.specialInterestsInPalliativeCare}
                onChange={(e) => handleInputChange('specialInterestsInPalliativeCare', e.target.value)}
                placeholder="Enter special interests in palliative care"
                rows={3}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="primary"
                onClick={handleSaveProfile}
                loading={saving}
                className="bg-[#00A99D] hover:bg-[#008F84]"
                size="large"
              >
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;