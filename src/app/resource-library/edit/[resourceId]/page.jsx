"use client"
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import Image from 'next/image';
import { Input, Upload, Button, message, Spin, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { MdDashboard, MdOutlineSettings } from 'react-icons/md';
import { FaRegFolder } from 'react-icons/fa';
import { TbUsers } from 'react-icons/tb';
import { PiBuildings } from 'react-icons/pi';
import { IoNewspaperOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import logo from '../../../assets/registation/logo.png';
import Link from 'next/link';
import { updateResource, fetchResourceById } from '@/api/resource';

import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles

// Rich Text Editor component
const RichTextEditor = forwardRef((props, ref) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
          ],
        },
        placeholder: 'Write something...',
      });
    }

    return () => {
      quillRef.current = null; // Cleanup to avoid memory leaks
    };
  }, []);

  // Expose the getContent and setContent functions to the parent component
  useImperativeHandle(ref, () => ({
    setContent: (html) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = html;
      }
    },
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.root.innerHTML; // Return the HTML content
      }
      return '';
    },
  }));

  return (
    <div ref={editorRef} style={{ height: '300px' }} />
  );
});

const { TextArea } = Input;

function EditResource() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingResource, setFetchingResource] = useState(false);
  const [resourceId, setResourceId] = useState('');
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [approvalStatus, setApprovalStatus] = useState(false);
  const router = useRouter();
  
  // Reference to the rich text editor
  const editorRef = useRef(null);

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

  // Extract resourceId from URL and fetch resource data when component mounts
  useEffect(() => {
    const fetchResourceData = async () => {
      setFetchingResource(true);
      try {
        // Extract resourceId from URL
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1];
        setResourceId(id);
        
        if (!id) {
          message.error('Resource ID not found in URL');
          router.push('/resource-library');
          return;
        }
        
        // Call the fetchResourceById API
        const response = await fetchResourceById(id);
        
        if (response.success && response.data) {
          const resourceData = response.data;
          
          // Autofill form fields with the fetched data
          setTitle(resourceData.title || '');
          setDescription(resourceData.description || '');
          
          // Set approval status
          setApprovalStatus(resourceData.approvalStatus || false);
          
          // Set existing file URL if available
          if (resourceData.files && resourceData.files.length > 0) {
            const fileURL = resourceData.files[0];
            setExistingFileUrl(fileURL);
            
            // Create a mock file list entry for display purposes
            setFileList([{
              uid: '-1',
              name: fileURL.split('/').pop() || 'Current file',
              status: 'done',
              url: fileURL
            }]);
          }
        } else {
          throw new Error(response.error || 'Failed to fetch resource');
        }
      } catch (error) {
        console.error('Error fetching resource:', error);
        message.error(error.message || 'Failed to fetch resource data');
      } finally {
        setFetchingResource(false);
      }
    };
    
    fetchResourceData();
  }, [router]);

  const handleSubmit = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.error('Please sign in to update a resource');
      return;
    }

    if (!title.trim()) {
      message.error('Please enter a title');
      return;
    }

    if (!description.trim()) {
      message.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('_id', resourceId);
      
      if (fileList[0]?.originFileObj) {
        formData.append('file', fileList[0].originFileObj);
      } else if (existingFileUrl) {
        formData.append('fileURL', existingFileUrl);
      }

      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('authorId', userId);
      formData.append('approvalStatus', approvalStatus);
      
      const response = await updateResource(resourceId, formData);
      
      if (response.success) {
        message.success('Resource updated successfully!');
        router.push('/resource-library');
      } else {
        throw new Error(response.error || 'Failed to update resource');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      message.error(error.message || 'Failed to update resource');
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
          <h1 className="text-xl font-semibold">Edit Resource</h1>
        </div>

        <div className="p-5 max-w-4xl">
          {fetchingResource ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" tip="Loading resource data..." />
            </div>
          ) : (
            <>
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
                <label className="block text-sm font-medium mb-2">Description (Brief summary)</label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description or summary"
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Content (Detailed information)</label>
                <div className="border rounded-lg overflow-hidden">
                  <RichTextEditor ref={editorRef} />
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {tags.map((tag) => (
                      <Tag key={tag} closable onClose={() => handleTagClose(tag)}>
                        {tag}
                      </Tag>
                    ))}
                    {inputVisible ? (
                      <Input
                        type="text"
                        size="small"
                        style={{ width: 78 }}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleInputConfirm}
                        onPressEnter={handleInputConfirm}
                        autoFocus
                      />
                    ) : (
                      <Tag onClick={showInput} className="cursor-pointer">
                        <PlusOutlined /> New Tag
                      </Tag>
                    )}
                  </div>
                </div>
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

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="approvalStatus"
                    checked={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.checked)}
                    className="w-4 h-4 text-[#00A99D] border-gray-300 rounded focus:ring-[#00A99D]"
                  />
                  <label htmlFor="approvalStatus" className="ml-2 block text-sm font-medium">
                    Approval Status {!approvalStatus && <span className="text-yellow-600">(Currently Pending Approval)</span>}
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {approvalStatus ? "This resource is approved and visible to all users." : "This resource is pending approval and may have limited visibility."}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  className="bg-[#00A99D] text-white hover:bg-[#008F84]"
                >
                  Update Resource
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditResource;