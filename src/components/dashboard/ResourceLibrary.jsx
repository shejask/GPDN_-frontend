"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Input } from 'antd';
import logo from '../../app/assets/registation/logo.png'
import { IoSearchOutline } from 'react-icons/io5';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoDownloadOutline } from "react-icons/io5";
import azeem from '../../app/assets/registation/Frame.png'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchResources } from '../../api/resource';

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Add download handler function
  const handleDownload = async (fileURL, title) => {
    try {
      const response = await fetch(fileURL);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title || 'download'; // Use the resource title as filename, or 'download' if no title
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file. Please try again.');
    }
  };

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await fetchResources();
        console.log('API Response:', response); // Debug log
        
        // Handle different response structures
        if (response.data && Array.isArray(response.data.data)) {
          setResources(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          setResources(response.data);
        } else if (response.data && Array.isArray(response.data.resources)) {
          setResources(response.data.resources);
        } else if (Array.isArray(response)) {
          setResources(response);
        } else {
          console.warn('Unexpected response format:', response);
          setResources([]);
        }
      } catch (error) {
        console.error('Error loading resources:', error);
        setResources([]); // Ensure resources is always an array
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const tags = [
    'Pain Management', 'Ethical Issues', 'End-of-Life Care', 'Spiritual Care',
    'Psychosocial Support', 'New Virus', 'Symptom Control', 'Lifestyle',
    'Caregiver Support', 'Pediatric Palliative Care'
  ];

  const sidebarMenus = [
    {menu : 'Forum', icon : <MdDashboard/>, link: '/forum'},
    {menu : 'Resource Library', icon : <FaRegFolder/>, link: '/resource-library'}, 
    {menu : 'Members', icon : <TbUsers/>, link: '/members'}, 
    {menu : 'Palliative Units', icon : <PiBuildings/>, link: '/palliative-units'}, 
    {menu : 'News & Blogs', icon : <IoNewspaperOutline/>, link: '/news-blogs'}, 
    {menu : 'Settings', icon : <MdOutlineSettings/>, link: '/settings'}
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-5">
          <Image alt='' src={logo} width={100}/>
        </div>
        
        <nav className="mt-5">
          {sidebarMenus.map((item, index) => (
              <Link key={index} href={item.link} className='block'>
              <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
                <h1 className='text-xl'>{item.icon}</h1>
                <h1 className=''>{item.menu}</h1>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white fixed w-[calc(100%-256px)] z-10">
          <h1 className="text-xl font-semibold">Resource Library</h1>
          <div className="flex gap-3">
            <Input 
              placeholder="Search Any Resources..." 
              className="w-64"
              prefix={<IoSearchOutline className="text-gray-400" />}
            />
            <button 
              className="px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84]"
              onClick={() => router.push('/resource-library/create')}
            >
              Create
            </button>
          </div>
        </div>

        <div className="flex pt-20">
          {/* Posts Section */}
          <div className="w-4/5 p-5 border-r border-gray-200">
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-10">Loading resources...</div>
              ) : !Array.isArray(resources) || resources.length === 0 ? (
                <div className="text-center py-10">No resources found</div>
              ) : (
                resources.map((resource) => (
                  <div key={resource._id} className="p-5 border border-gray-100 rounded-lg">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        <Image 
                          src={azeem}
                          alt="Author"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{resource.authorId}</h3>

                        <span className="text-sm text-gray-500">
                          {new Date(resource.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-medium">{resource.title}</h3>

                    <p className="text-gray-700 mb-4">{resource.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-[#E3F5FE] text-[#00A99D] rounded-full text-sm">
                        {resource.category}
                      </span>
                    </div>

                    {/* Download Link */}
                    {resource.fileURL && (
                      <button 
                        onClick={() => handleDownload(resource.fileURL, resource.title)}
                        className="flex w-36 items-center justify-center py-1 border border-gray-500 rounded-lg gap-2 text-gray-600 hover:text-[#00A99D] cursor-pointer font-semibold"
                      >
                        <IoDownloadOutline className="text-lg" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Categories Section */}
          <div className="w-64 bg-white p-5 fixed right-0 h-screen overflow-y-auto">
            <h2 className="font-semibold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-50 rounded-full text-sm cursor-pointer hover:bg-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLibrary;