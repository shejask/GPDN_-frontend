"use client"
import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { createThread } from '@/api/forum';
import { message, Spin, Tooltip, Alert } from 'antd';
import Image from 'next/image';
import { Input, Tag } from 'antd';
import logo from '../../assets/registation/logo.png';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { FaImage, FaUpload } from "react-icons/fa";
import { useRouter } from 'next/navigation';

import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles

// Define the ref for the RichTextEditor component
// RichTextEditorHandle would have a getContent method that returns a string

const RichTextEditor = forwardRef((_, ref) => {
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

  // Expose the getContent function to the parent component
  useImperativeHandle(ref, () => ({
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

// Constants for validation
const MAX_TITLE_LENGTH = 100;
const MAX_FILE_SIZE_MB = 2; // Reduced from 5MB to 2MB to avoid 413 errors
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
const MAX_TAGS = 10;

// Rich text editor toolbar component removed

/**
 * CreatePost Component
 * Allows users to create new forum threads with title, description, tags, and image upload
 */
const CreatePost = () => {
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
  
  // Reference to the rich text editor
  const editorRef = useRef(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  
  // Get userId from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, []);

  // Navigation items for the sidebar
  const sidebarMenus = [
    {menu: 'Forum', icon: <MdDashboard/>, path: '/forum'},
    {menu: 'Resource Library', icon: <FaRegFolder/>, path: '/resources'},
    {menu: 'Members', icon: <TbUsers/>, path: '/members'},
    {menu: 'Palliative Units', icon: <PiBuildings/>, path: '/units'},
    {menu: 'News & Blogs', icon: <IoNewspaperOutline/>, path: '/news'},
    {menu: 'Settings', icon: <MdOutlineSettings/>, path: '/settings'}
  ];

  // No predefined tags
  const availableTags = useMemo(() => [], []);

  /**
   * Validate a specific form field
   * @param {string} field - Field name to validate
   * @param {any} value - Field value to validate
   * @returns {string|null} - Error message or null if valid
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
        if (!value || value === '<p></p>' || value === '<p><br></p>') {
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
   * Effect to validate description when it changes
   */
  useEffect(() => {
    if (description) {
      validateField('description', description);
      setFormTouched(true);
    }
  }, [description, validateField]);

  /**
   * Validate all form fields
   * @returns {boolean} - True if form is valid
   */
  const validateForm = useCallback(() => {
    const titleError = validateField('title', title);
    const descriptionError = validateField('description', description);
    const fileError = validateField('file', file);
    const tagsError = validateField('tags', selectedTags);
    
    return !titleError && !descriptionError && !fileError && !tagsError;
  }, [title, description, file, selectedTags, validateField]);

  /**
   * Handle tag selection from available tags
   * @param {string} tag - Tag to add
   */
  const handleTagSelect = useCallback((tag) => {
    if (!selectedTags.includes(tag) && selectedTags.length < MAX_TAGS) {
      setSelectedTags(prev => [...prev, tag]);
      validateField('tags', [...selectedTags, tag]);
      setFormTouched(true);
    }
  }, [selectedTags, validateField]);

  /**
   * Remove a tag from selected tags
   * @param {string} tagToRemove - Tag to remove
   */
  const removeTag = useCallback((tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
    setFormTouched(true);
  }, []);
  
  /**
   * Handle custom tag input with comma or enter key
   * @param {Event} e - Input event
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
   * @param {KeyboardEvent} e - Keyboard event
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
   * @param {File} selectedFile - Selected file
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
   * @param {File} imageFile - The image file to compress
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
          });
      };
    };
  }, [messageApi]);
  
  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setTitle('');
    setSelectedTags([]);
    setTagInput('');
    setFile(null);
    setFilePreview(null);
    setDescription('');
    setErrors({});
    setFormTouched(false);
  }, []);

  return (
    <>
      {contextHolder}
      <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-5">
          <Image alt="" src={logo} width={100}/>
        </div>
        
        <nav className="mt-5">
          {sidebarMenus.map((item, index) => (
            <div key={index} className="cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3">
              <h1 className="text-xl">{item.icon}</h1>
              <h1>{item.menu}</h1>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Create Post</h1>
        </div>

        <div className="p-5 max-w-4xl">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Title</label>
            <div className="relative">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                suffix={<MdEdit className="text-gray-400" />}
                className="pr-10"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Upload Thumbnail</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && droppedFile.type.startsWith('image/')) {
                  setFile(droppedFile);
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
                    if (selectedFile) setFile(selectedFile);
                  }}
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm text-blue-500">Click here</p>
                  <p className="text-xs text-gray-500">to upload your file or drag.</p>
                  <p className="text-xs text-gray-400 mt-2">Supported Format: SVG, PNG, JPEG (max 800x400px)</p>
                </label>
                {file && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <div className="border rounded-lg overflow-hidden">
              <RichTextEditor ref={editorRef} />
            </div>
          </div>

          
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
              <p className="text-xs text-gray-500">Press Enter or add a comma to add a tag. Maximum {MAX_TAGS} tags allowed.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <IoClose
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </span>
              ))}
            </div>
            {/* Predefined tags section removed */}
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => {
                setTitle('');
                setSelectedTags([]);
                setFile(null);
                // Reset the editor - we'll need to create a new Quill instance
                if (editorRef.current) {
                  const editorElement = editorRef.current;
                  // The editor will be reset on next render
                }
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Clear
            </button>
            <button 
              onClick={async () => {
                try {
                  setIsSubmitting(true);
                  if (!title.trim()) {
                    messageApi.error('Please enter a title');
                    return;
                  }
                  // Get content from rich text editor
                  const editorContent = editorRef.current?.getContent();
                  if (!editorContent) {
                    messageApi.error('Please enter a description');
                    return;
                  }

                  if (!userId) {
                    messageApi.error('User ID not found. Please log in again.');
                    return;
                  }
                  
                  const response = await createThread({
                    title,
                    content: editorRef.current?.getContent() || '',
                    authorId: userId,
                    tags: selectedTags,
                    file
                  });

                  if (response.success) {
                    messageApi.success('Thread created successfully!');
                    // Clear form
                    setTitle('');
                    setSelectedTags([]);
                    setFile(null);
                    // Reset the editor - we'll need to create a new Quill instance
                    if (editorRef.current) {
                      const editorElement = editorRef.current;
                      // The editor will be reset on next render
                    }
                    
                    // Navigate to the forum page after successful post
                    router.push('/forum');
                  } else {
                    messageApi.error(response.error || 'Failed to create thread');
                  }
                } catch (error) {
                  console.error('Error creating thread:', error);
                  messageApi.error('Failed to create thread');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreatePost;