"use client"
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Input, Spin, message } from 'antd';
import logo from '../../app/assets/registation/logo.png'
import { IoSearchOutline } from 'react-icons/io5';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoDownloadOutline } from "react-icons/io5";
import { FaFileAlt, FaImage } from "react-icons/fa";
import azeem from '../../app/assets/registation/Frame.png'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchResources } from '../../api/resource';

// Constants
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
const TAGS = [
  'Pain Management', 'Ethical Issues', 'End-of-Life Care', 'Spiritual Care',
  'Psychosocial Support', 'New Virus', 'Symptom Control', 'Lifestyle',
  'Caregiver Support', 'Pediatric Palliative Care'
];

const SIDEBAR_MENUS = [
  {menu : 'Forum', icon : <MdDashboard/>, link: '/forum'},
  {menu : 'Resource Library', icon : <FaRegFolder/>, link: '/resource-library'}, 
  {menu : 'Members', icon : <TbUsers/>, link: '/members'}, 
  {menu : 'Palliative Units', icon : <PiBuildings/>, link: '/palliative-units'}, 
  {menu : 'News & Blogs', icon : <IoNewspaperOutline/>, link: '/news-blogs'}, 
  {menu : 'Settings', icon : <MdOutlineSettings/>, link: '/settings'}
];

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const router = useRouter();

  // Utility functions
  const isImageFile = useCallback((filename) => {
    if (!filename || typeof filename !== 'string') return false;
    const extension = filename.split('.').pop()?.toLowerCase();
    return IMAGE_EXTENSIONS.includes(extension);
  }, []);

  const getImageUrl = useCallback((filePath) => {
    if (!filePath) return '';
    
    // Handle different possible URL formats
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath; // Already a full URL
    }
    
    // Get base URL for API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                   process.env.NEXT_PUBLIC_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : '') ||
                   'http://localhost:3001';
    
    // Handle different file path formats
    let cleanPath = filePath;
    
    // Remove leading slash if present
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Handle uploads folder structure
    if (cleanPath.includes('uploads/') && !cleanPath.startsWith('uploads/')) {
      const uploadsIndex = cleanPath.indexOf('uploads/');
      cleanPath = cleanPath.substring(uploadsIndex);
    }
    
    // If path doesn't start with uploads, assume it's in uploads folder
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }
    
    // Construct final URL
    const finalUrl = `${baseUrl}/api/resource/file/${cleanPath}`;
    console.log('Generated URL:', finalUrl, 'from path:', filePath);
    
    return finalUrl;
  }, []);

  const getFileExtension = useCallback((filename) => {
    if (!filename) return '';
    return filename.split('.').pop()?.toLowerCase() || '';
  }, []);

  const getFileIcon = useCallback((filename) => {
    const extension = getFileExtension(filename);
    
    switch (extension) {
      case 'pdf':
        return <FaFileAlt className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileAlt className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FaFileAlt className="text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FaFileAlt className="text-orange-500" />;
      default:
        return isImageFile(filename) ? <FaImage className="text-purple-500" /> : <FaFileAlt className="text-gray-500" />;
    }
  }, [isImageFile, getFileExtension]);

  // Event handlers
  const handleImageError = useCallback((resourceId) => {
    setImageErrors(prev => ({
      ...prev,
      [resourceId]: true
    }));
    setImageLoadingStates(prev => ({
      ...prev,
      [resourceId]: false
    }));
  }, []);

  const handleImageLoad = useCallback((resourceId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [resourceId]: false
    }));
  }, []);

  const handleImageLoadStart = useCallback((resourceId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [resourceId]: true
    }));
  }, []);

  const handleDownload = useCallback(async (files, title) => {
    if (!files || !files.length) {
      message.error('No file available for download');
      return;
    }
    
    try {
      const filePath = files[0];
      // Determine if the file path is already a full URL
      const isFullUrl = filePath.startsWith('http') || filePath.startsWith('https');
      // Get the file URL - either use directly or construct it
      const fileURL = isFullUrl ? filePath : getImageUrl(filePath);
      
      if (!fileURL) {
        throw new Error('Invalid file URL');
      }

      console.log('Attempting to download from:', fileURL);
      
      // Extract filename from the file path for better naming
      const originalFilename = filePath.split('/').pop() || filePath.split('\\').pop() || 'download';
      const fileExtension = getFileExtension(filePath) || 'file';
      const filename = originalFilename.includes('.') ? originalFilename : `${title || originalFilename}.${fileExtension}`;
      
      // Method 1: Direct download using Blob
      try {
        // Use 'cors' mode for same-origin requests, but don't specify mode for cross-origin
        // This lets the browser handle CORS properly
        const fetchOptions = {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Cache-Control': 'no-cache'
          }
        };
        
        const response = await fetch(fileURL, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        
        message.success('File downloaded successfully');
        return; // Exit if successful
        
      } catch (fetchError) {
        console.log('Blob download failed, trying alternative method:', fetchError);
      }
      
      // Method 2: Direct link with download attribute
      try {
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = filename;
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        
        message.success('Download initiated');
        return; // Exit if successful
      } catch (linkError) {
        console.error('Link download failed:', linkError);
      }
      
      // Method 3: Open in new tab as last resort
      window.open(fileURL, '_blank');
      message.success('Opening file in new tab');
      
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download the file. Please try again later.');
      
      // Show more detailed error to help with debugging
      console.log('Download error details:', {
        error: error.message,
        files,
        title
      });
    }
  }, [getImageUrl, getFileExtension]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(prev => prev === category ? '' : category);
  }, []);

  // Data loading
  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchResources();
      console.log('API Response:', response);
      
      // Extract resources array from various possible response structures
      let resourcesArray = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        resourcesArray = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        resourcesArray = response.data;
      } else if (response?.data?.resources && Array.isArray(response.data.resources)) {
        resourcesArray = response.data.resources;
      } else if (Array.isArray(response)) {
        resourcesArray = response;
      } else if (response?.resources && Array.isArray(response.resources)) {
        resourcesArray = response.resources;
      }

      // Filter approved resources
      const approvedResources = resourcesArray.filter(resource => 
        resource && (
          resource.approvalStatus === true || 
          resource.registrationStatus === 'approved' ||
          resource.status === 'approved'
        )
      );
      
      console.log('Filtered approved resources:', approvedResources.length);
      setResources(approvedResources || []);
      
    } catch (error) {
      console.error('Error loading resources:', error);
      message.error('Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Filtered resources based on search and category
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = !searchTerm || 
        resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.authorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        resource.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [resources, searchTerm, selectedCategory]);

  // Render functions
  const renderSidebar = () => (
    <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto bg-white shadow-sm">
      <div className="p-5">
        <Image alt='Logo' src={logo} width={100} height={40} priority />
      </div>
      
      <nav className="mt-5">
        {SIDEBAR_MENUS.map((item, index) => (
          <Link key={index} href={item.link} className='block'>
            <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3 transition-all'>
              <span className='text-xl'>{item.icon}</span>
              <span className='font-medium'>{item.menu}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );

  const renderHeader = () => (
    <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white fixed w-[calc(100%-256px)] z-10 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">Resource Library</h1>
      <div className="flex gap-3 items-center">
        <Input 
          placeholder="Search resources, authors..." 
          className="w-80"
          size="large"
          prefix={<IoSearchOutline className="text-gray-400" />}
          onChange={(e) => handleSearch(e.target.value)}
          value={searchTerm}
        />
        <button 
          className="px-6 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors font-medium shadow-sm"
          onClick={() => router.push('/resource-library/create')}
        >
          Create Resource
        </button>
      </div>
    </div>
  );

  const renderFilePreview = (resource) => {
    if (!resource.files || !resource.files.length) return null;

    const file = resource.files[0];
    const isImage = isImageFile(file);
    const imageUrl = getImageUrl(file);
    const hasImageError = imageErrors[resource._id];
    const isImageLoading = imageLoadingStates[resource._id];

    console.log('Rendering file preview:', { file, imageUrl, isImage, hasImageError });

    return (
      <div className="mt-4 border-t pt-4">
        {isImage && !hasImageError ? (
          <div className="mb-4 relative">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                <Spin size="large" />
              </div>
            )}
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img 
                src={imageUrl}
                alt={resource.title}
                className="max-w-full rounded-lg shadow-sm"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl, e);
                  handleImageError(resource._id);
                }}
                onLoad={(e) => {
                  console.log('Image loaded successfully:', imageUrl);
                  handleImageLoad(resource._id);
                }}
                onLoadStart={() => handleImageLoadStart(resource._id)}
                style={{ 
                  maxHeight: '300px', // Reduced from 400px to 300px
                  objectFit: 'contain',
                  width: '100%',
                  display: isImageLoading ? 'none' : 'block'
                }}
              />
            </div>
            {hasImageError && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <FaImage />
                  <span className="text-sm">Image preview not available</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4 border">
            <div className="text-2xl">
              {getFileIcon(file)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 break-all">
                {file.split('/').pop() || file.split('\\').pop() || 'Unknown file'}
              </div>
              <div className="text-sm text-gray-500">
                {getFileExtension(file).toUpperCase()} File
                {hasImageError && isImage && (
                  <span className="text-red-500 ml-2">(Image preview failed)</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1 break-all">
                Path: {file}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleDownload(resource.files, resource.title)}
            className="flex items-center justify-center px-4 py-2 border-2 border-[#00A99D] rounded-lg gap-2 text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all font-medium"
          >
            <IoDownloadOutline className="text-lg" />
            <span>Download</span>
          </button>
          
          {isImage && (
            <button 
              onClick={() => window.open(imageUrl, '_blank')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg gap-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaImage className="text-sm" />
              <span>View Full Size</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResourceCard = (resource) => (
    <div key={resource._id} className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#00A99D] to-[#008F84] rounded-full overflow-hidden flex items-center justify-center">
          {resource.authorId?.imageURL ? (
            <img 
              src={resource.authorId.imageURL}
              alt={resource.authorId?.fullName || 'Author'}
              width={48}
              height={48}
              className="rounded-full w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = azeem.src; // Fallback to default image
              }}
            />
          ) : (
            <Image 
              src={azeem}
              alt="Author"
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            {resource.authorId?.fullName || 'Anonymous'}
          </h3>
          <span className="text-sm text-gray-500">
            {new Date(resource.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{resource.title}</h3>
      <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>
      
      {/* HTML Content */}
      {resource.content && (
        <div className="mt-4 mb-4 prose max-w-none">
          <div 
            className="text-gray-800 leading-relaxed overflow-auto" 
            dangerouslySetInnerHTML={{ __html: resource.content }}
          />
        </div>
      )}  
      
      {/* Category Tag */}
      {resource.category && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-4 py-2 bg-gradient-to-r from-[#E3F5FE] to-[#F0FFFE] text-[#00A99D] rounded-full text-sm font-medium border border-[#00A99D]/20">
            {resource.category}
          </span>
        </div>
      )}

      {/* File Preview/Download Section */}
      {renderFilePreview(resource)}
    </div>
  );

  const renderCategories = () => (
    <div className="w-80 bg-white p-6 fixed right-0 h-screen overflow-y-auto border-l border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Filter by Category</h2>
      <div className="space-y-2">
        <button
          onClick={() => handleCategoryFilter('')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            !selectedCategory 
              ? 'bg-[#00A99D] text-white' 
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          All Categories
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleCategoryFilter(tag)}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === tag
                ? 'bg-[#00A99D] text-white'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {renderHeader()}

        <div className="flex pt-24">
          {/* Posts Section */}
          <div className="flex-1 p-6 mr-80">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
                <span className="ml-3 text-lg">Loading resources...</span>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm || selectedCategory ? 'No matching resources found' : 'No resources available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Be the first to share a resource with the community!'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  {(searchTerm || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      className="text-[#00A99D] hover:text-[#008F84] font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                {filteredResources.map(renderResourceCard)}
              </div>
            )}
          </div>

          {renderCategories()}
        </div>
      </div>
    </div>
  );
};

export default ResourceLibrary;