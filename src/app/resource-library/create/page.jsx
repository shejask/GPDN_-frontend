"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { Input, Upload, Button, Select } from 'antd';
import { useRouter } from 'next/navigation';
import logo from '../../assets/registation/logo.png';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { UploadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { createResource } from '@/api/resource';

const { Option } = Select;
const { TextArea } = Input;

function UploadResource() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [category, setCategory] = useState('Palliative Care');
  const [loading, setLoading] = useState(false);
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

  const categories = [
    'Palliative Care',
    'Pain Management',
    'End-of-Life Care',
    'Spiritual Care',
    'Psychosocial Support',
    'Case Studies',
    'Guidelines',
    'Educational Materials',
    'Clinical Tools',
    'Patient Resources'
  ];

  const handleFileChange = (info) => {
    setFileList(info.fileList);
  };

  const uploadProps = {
    onChange: handleFileChange,
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      return false; // Prevent automatic upload
    },
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please sign in to upload a resource');
      router.push('/signin');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (fileList.length === 0) {
      alert('Please upload a file');
      return;
    }

    setLoading(true);
    try {
      // In a real application, you would first upload the file to a storage service
      // and get back a URL. For now, we'll use a placeholder URL
      const fileURL = fileList[0]?.originFileObj ? URL.createObjectURL(fileList[0].originFileObj) : '';

      const resourceData = {
        title: title.trim(),
        description: description.trim(),
        fileURL,
        authorId: userId,
        category
      };

      const response = await createResource(resourceData);
      
      if (response.success) {
        alert('Resource uploaded successfully!');
        router.push('/resource-library');
      } else {
        throw new Error(response.error || 'Failed to upload resource');
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert(error.message || 'Failed to upload resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Upload Resource</h1>
        </div>

        <div className="p-5 max-w-4xl">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter resource description"
              rows={4}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select
              value={category}
              onChange={setCategory}
              className="w-full"
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Resource File</label>
            <Upload {...uploadProps} className="upload-list-inline">
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            {fileList.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Selected file: {fileList[0].name}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              className="bg-[#00A99D] text-white hover:bg-[#008F84]"
            >
              Upload Resource
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadResource;