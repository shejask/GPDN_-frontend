"use client"
import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { createThread, editThread, fetchThreadById } from '@/api/forum';
import { message, Spin, Tooltip, Alert } from 'antd';
import Image from 'next/image';
import { Input, Tag } from 'antd';
import logo from '../../../assets/registation/logo.png';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { FaImage, FaUpload } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { useRouter } from 'next/navigation';

import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles

// Define the RichTextEditor component with proper content initialization
const RichTextEditor = forwardRef(({ initialContent = '' }, ref) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
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

      // Set initial content if provided
      if (initialContent && initialContent !== '<p></p>') {
        quillRef.current.root.innerHTML = initialContent;
      }
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [initialContent]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.root.innerHTML;
      }
      return '';
    },
    setContent: (content) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = content;
      }
    },
    clear: () => {
      if (quillRef.current) {
        quillRef.current.setText('');
      }
    }
  }));

  return (
    <div ref={editorRef} style={{ height: '300px' }} />
  );
});

RichTextEditor.displayName = 'RichTextEditor';

// Constants for validation
const MAX_TITLE_LENGTH = 100;
const MAX_FILE_SIZE_MB = 2;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
const MAX_TAGS = 10;

/**
 * EditPost Component
 * Allows users to edit existing forum threads
 */
const EditPost = () => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  
  // Form state
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null);
  const [threadId, setThreadId] = useState('');
  const [approvalStatus, setApprovalStatus] = useState(false);
  
  // Reference to the rich text editor
  const editorRef = useRef(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  
  // Navigation items for the sidebar
  const sidebarMenus = [
    { menu: 'Forum', icon: <MdDashboard />, path: '/forum' },
    { menu: 'Resource Library', icon: <FaRegFolder />, path: '/resources' },
    { menu: 'Members', icon: <TbUsers />, path: '/members' },
    { menu: 'Palliative Units', icon: <PiBuildings />, path: '/units' },
    { menu: 'News & Blogs', icon: <IoNewspaperOutline />, path: '/news' },
    { menu: 'Settings', icon: <MdOutlineSettings />, path: '/settings' }
  ];

  // Get userId from localStorage and fetch thread data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (typeof window !== 'undefined') {
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            setUserId(storedUserId);
          }
          
          // Get thread ID from URL
          const pathParts = window.location.pathname.split('/');
          const id = pathParts[pathParts.length - 1];
          setThreadId(id);
          
          // Fetch thread data
          const response = await fetchThreadById(id);
          if (response.success && response.data) {
            const threadData = response.data;
            setTitle(threadData.title || '');
            setSelectedTags(threadData.tags || []);
            setDescription(threadData.content || '');
            setApprovalStatus(threadData.approvalStatus || false);
            
            // If there's an image, set the file preview
            if (threadData.imageUrl) {
              setFilePreview(threadData.imageUrl);
            }
          } else {
            messageApi.error('Failed to fetch thread data');
          }
        }
      } catch (error) {
        console.error('Error fetching thread data:', error);
        messageApi.error('Error loading thread data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [messageApi]);

  /**
   * Validate a specific form field
   */
  const validateField = useCallback((field, value) => {
    let errorMessage = null;
    
    switch (field) {
      case 'title':
        if (!value?.trim()) {
          errorMessage = 'Title is required';
        } else if (value.length > MAX_TITLE_LENGTH) {
          errorMessage = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
        }
        break;
        
      case 'description':
        if (!value || value === '<p></p>' || value === '<p><br></p>' || value.trim() === '') {
          errorMessage = 'Content is required';
        }
        break;
        
      case 'file':
        if (value) {
          if (!ALLOWED_FILE_TYPES.includes(value.type)) {
            errorMessage = 'File must be JPEG, PNG, SVG, or WebP';
          } else if (value.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            errorMessage = `File size must be less than ${MAX_FILE_SIZE_MB}MB`;
          }
        }
        break;
        
      case 'tags':
        if (value.length > MAX_TAGS) {
          errorMessage = `Maximum ${MAX_TAGS} tags allowed`;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
    
    return errorMessage;
  }, []);

  /**
   * Validate all form fields
   */
  const validateForm = useCallback(() => {
    const titleError = validateField('title', title);
    const descriptionError = validateField('description', description);
    const fileError = validateField('file', file);
    const tagsError = validateField('tags', selectedTags);
    
    return !titleError && !descriptionError && !fileError && !tagsError;
  }, [title, description, file, selectedTags, validateField]);

  /**
   * Remove a tag from selected tags
   */
  const removeTag = useCallback((tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
    setFormTouched(true);
  }, []);
  
  /**
   * Handle custom tag input with comma or enter key
   */
  const handleTagInputChange = useCallback((e) => {
    const value = e.target.value;
    setTagInput(value);
    
    // Check for comma
    if (value.includes(',') && value.trim() !== '' && value.trim() !== ',') {
      const newTag = value.replace(/,/g, '').trim();
      
      if (newTag && !selectedTags.includes(newTag) && selectedTags.length < MAX_TAGS) {
        setSelectedTags(prev => [...prev, newTag]);
        setTagInput('');
        validateField('tags', [...selectedTags, newTag]);
      } else {
        setTagInput('');
      }
    }
  }, [selectedTags, validateField]);
  
  /**
   * Handle tag input key down events
   */
  const handleTagKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const newTag = tagInput.trim();
      if (newTag && !selectedTags.includes(newTag) && selectedTags.length < MAX_TAGS) {
        setSelectedTags(prev => [...prev, newTag]);
        setTagInput('');
        validateField('tags', [...selectedTags, newTag]);
      }
    }
  }, [tagInput, selectedTags, validateField]);
  
  /**
   * Handle file selection and validation
   */
  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;
    
    const error = validateField('file', selectedFile);
    if (!error) {
      // Check if file needs compression
      if (selectedFile.size > 1 * 1024 * 1024) { // If larger than 1MB
        messageApi.info('Compressing image to reduce size...');
        compressImage(selectedFile);
      } else {
        setFile(selectedFile);
        
        // Create preview URL for the image
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    } else {
      messageApi.error(error);
    }
    
    setFormTouched(true);
  }, [validateField, messageApi]);
  
  /**
   * Compress image to reduce file size
   */
  const compressImage = useCallback((imageFile) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed image as data URL
        const quality = 0.7; // Adjust quality (0.7 = 70% quality)
        const dataUrl = canvas.toDataURL(imageFile.type, quality);
        
        // Convert data URL to Blob
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            // Create a File from the Blob
            const compressedFile = new File([blob], imageFile.name, {
              type: imageFile.type,
              lastModified: Date.now()
            });
            
            setFile(compressedFile);
            setFilePreview(dataUrl);
            
            const compressionRatio = ((imageFile.size - compressedFile.size) / imageFile.size * 100).toFixed(1);
            messageApi.success(`Image compressed by ${compressionRatio}%`);
          })
          .catch(error => {
            console.error('Error compressing image:', error);
            messageApi.error('Failed to compress image');
          });
      };
    };
  }, [messageApi]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!title.trim()) {
        messageApi.error('Please enter a title');
        return;
      }
      
      // Get content from rich text editor
      const editorContent = editorRef.current?.getContent();
      if (!editorContent || editorContent === '<p></p>' || editorContent === '<p><br></p>') {
        messageApi.error('Please enter a description');
        return;
      }

      if (!userId) {
        messageApi.error('User ID not found. Please log in again.');
        return;
      }
      
      if (!threadId) {
        messageApi.error('Thread ID not found. Please try again.');
        return;
      }
      
      // Prepare form data
      const formData = {
        _id: threadId,
        title: title.trim(),
        content: editorContent,
        authorId: userId,
        tags: selectedTags,
        approvalStatus,
        file
      };
      
      const response = await editThread(formData);

      if (response.success) {
        messageApi.success('Thread updated successfully!');
        
        // Navigate to the forum page after successful update
        setTimeout(() => {
          router.push('/forum');
        }, 1000);
      } else {
        messageApi.error(response.error || 'Failed to update thread');
      }
    } catch (error) {
      console.error('Error updating thread:', error);
      messageApi.error('Failed to update thread');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, userId, threadId, selectedTags, approvalStatus, file, messageApi, router]);

  /**
   * Handle form clear
   */
  const handleClear = useCallback(() => {
    setTitle('');
    setSelectedTags([]);
    setTagInput('');
    setFile(null);
    setFilePreview(null);
    setApprovalStatus(false);
    setErrors({});
    setFormTouched(false);
    
    // Clear the rich text editor
    if (editorRef.current) {
      editorRef.current.clear();
    }
  }, []);

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spin size="large" />
        <span className="ml-2">Loading post data...</span>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
          <div className="p-5">
            <Image alt="Logo" src={logo} width={100} />
          </div>
          
          <nav className="mt-5">
            {sidebarMenus.map((item, index) => (
              <div 
                key={index} 
                className="cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3"
                onClick={() => router.push(item.path)}
              >
                <h1 className="text-xl">{item.icon}</h1>
                <h1>{item.menu}</h1>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-xl font-semibold">Edit Post</h1>
          </div>

          <div className="p-5 max-w-4xl">
            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    validateField('title', e.target.value);
                    setFormTouched(true);
                  }}
                  placeholder="Enter title"
                  suffix={<MdEdit className="text-gray-400" />}
                  className="pr-10"
                  status={errors.title ? 'error' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Upload Thumbnail</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile && droppedFile.type.startsWith('image/')) {
                    handleFileSelect(droppedFile);
                  } else {
                    messageApi.error('Please upload an image file');
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="thumbnail-upload"
                    onChange={(e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) {
                        handleFileSelect(selectedFile);
                      }
                    }}
                  />
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-sm text-blue-500">Click here</p>
                    <p className="text-xs text-gray-500">to upload your file or drag.</p>
                    <p className="text-xs text-gray-400 mt-2">Supported Format: SVG, PNG, JPEG (max 2MB)</p>
                  </label>
                  {filePreview && (
                    <div className="mt-4">
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="max-w-xs max-h-48 object-contain rounded"
                      />
                      <button
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                        }}
                        className="mt-2 text-red-500 text-sm hover:text-red-700"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                  {file && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {file.name}
                    </div>
                  )}
                </div>
              </div>
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
              )}
            </div>

            {/* Rich Text Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="border rounded-lg overflow-hidden">
                <RichTextEditor ref={editorRef} initialContent={description} />
              </div>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Approval Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Approval Status</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.checked)}
                  className="mr-2 h-4 w-4 text-[#00A99D] focus:ring-[#00A99D] border-gray-300 rounded"
                />
                <span>Approved</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When checked, the post will be marked as approved and visible to all users.
                When unchecked, the post will be marked as pending approval.
              </p>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Tags</label>
                <button 
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
              <div className="mb-4">
                <Input
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Enter tags separated by commas (e.g. tag1, tag2, tag3)"
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Press Enter or add a comma to add a tag. Maximum {MAX_TAGS} tags allowed.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <IoClose
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    />
                  </span>
                ))}
              </div>
              {errors.tags && (
                <p className="text-red-500 text-xs mt-1">{errors.tags}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button 
                onClick={handleClear}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Clear
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] flex items-center gap-2 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spin size="small" /> : <FiSend />}
                {isSubmitting ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditPost;