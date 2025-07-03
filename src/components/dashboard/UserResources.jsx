"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Empty, Spin, Card, Tag, Button, message, Modal, Tooltip, Pagination, ConfigProvider } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  EditOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import { IoDownloadOutline } from 'react-icons/io5';
import { FaImage, FaUser } from 'react-icons/fa';
import { fetchResourcesByAuthor, deleteResource, downloadResourceFile, getFileExtension, isImageFile } from '../../api/resource';
// Using default avatar image path
const defaultAvatarPath = '/assets/default-avatar.png';

const { Meta } = Card;

const UserResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Suppress console errors for development only
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('antd:')) {
        return;
      }
      originalConsoleError(...args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalResources, setTotalResources] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  useEffect(() => {
    loadUserResources();
  }, [currentPage]);

  const loadUserResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Using the updated API call with POST method
      const response = await fetchResourcesByAuthor(userId);
      
      if (response.success && response.data) {
        // Process the response data
        let resourceData = [];
        
        if (Array.isArray(response.data)) {
          resourceData = response.data;
        } else if (response.data.resources && Array.isArray(response.data.resources)) {
          resourceData = response.data.resources;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          resourceData = response.data.data;
        }
        
        console.log('Loaded user resources:', resourceData);
        setResources(resourceData);
        setTotalResources(resourceData.length);
      } else {
        throw new Error(response.error || 'Failed to load resources');
      }
    } catch (err) {
      console.error('Error loading resources:', err);
      setError(err.message || 'Failed to load resources');
      message.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      const response = await deleteResource(resourceToDelete._id);
      
      if (response.success) {
        message.success('Resource deleted successfully');
        setDeleteModalVisible(false);
        loadUserResources(); // Reload resources after deletion
      } else {
        throw new Error(response.error || 'Failed to delete resource');
      }
    } catch (err) {
      console.error('Error deleting resource:', err);
      message.error(err.message || 'Failed to delete resource');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setResourceToDelete(null);
  };

  const handleDownload = async (resource) => {
    try {
      message.loading({ content: 'Starting download...', key: 'download' });
      
      // Get file path from files array if available, otherwise use filePath or file
      const filePath = resource.files && resource.files.length 
        ? resource.files[0] 
        : (resource.filePath || resource.file);
      
      const response = await downloadResourceFile(
        filePath, 
        resource.fileName || resource.title
      );
      
      if (response.success) {
        message.success({ content: 'Download started', key: 'download' });
      } else {
        throw new Error(response.error || 'Failed to download file');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      message.error({ content: err.message || 'Failed to download file', key: 'download' });
    }
  };

  const handlePreview = (resource) => {
    setPreviewResource(resource);
    setPreviewModalVisible(true);
  };

  const handleEdit = (resource) => {
    if (!resource || !resource._id) {
      message.error('Cannot edit this resource: Missing resource ID');
      return;
    }
    
    // Navigate to the edit resource page with the resource ID
    const resourceId = resource._id;
    router.push(`/resource-library/edit/${resourceId}`);
  };

  const getFileIcon = (resource) => {
    // Check for files array, filePath, or file property
    if (!resource.filePath && !resource.file && (!resource.files || !resource.files.length)) {
      return <FileUnknownOutlined style={{ fontSize: '32px', color: '#00A99D' }} />;
    }
    
    // Get file path from files array if available, otherwise use filePath or file
    const filePath = resource.files && resource.files.length ? resource.files[0] : (resource.filePath || resource.file);
    const extension = getFileExtension(filePath);
    
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: '32px', color: '#00A99D' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ fontSize: '32px', color: '#52c41a' }} />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImageOutlined style={{ fontSize: '32px', color: '#00A99D' }} />;
      default:
        return <FileOutlined style={{ fontSize: '32px', color: '#00A99D' }} />;
    }
  };

  const renderFilePreview = (resource) => {
    // Get file path from files array if available, otherwise use filePath or file
    const filePath = resource.files && resource.files.length 
      ? resource.files[0] 
      : (resource.filePath || resource.file);
    
    if (!filePath) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No file attached to this resource</p>
        </div>
      );
    }
    
    const isImage = isImageFile(filePath);
    const fileURL = filePath.startsWith('http') ? filePath : `${process.env.NEXT_PUBLIC_API_URL || ''}/${filePath}`;
    
    if (isImage) {
      return (
        <div className="mt-4">
          <div className="relative overflow-hidden rounded-lg border border-gray-200">
            <img 
              src={fileURL} 
              alt={resource.title} 
              className="w-full h-48 object-cover" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => handleDownload(resource)}
              className="flex items-center justify-center px-4 py-2 border-2 border-[#00A99D] rounded-lg gap-2 text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all font-medium"
            >
              <IoDownloadOutline className="text-lg" />
              <span>Download</span>
            </button>
            <button 
              onClick={() => handlePreview(resource)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg gap-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaImage className="text-sm" />
              <span>View Full Size</span>
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mt-4 border border-gray-200">
        <div className="text-2xl">
          {getFileIcon(resource)}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800 break-all">
            {filePath.split('/').pop() || filePath.split('\\').pop() || 'Unknown file'}
          </div>
          <div className="text-sm text-gray-500">
            {getFileExtension(filePath).toUpperCase()} File
          </div>
        </div>
        <button 
          onClick={() => handleDownload(resource)}
          className="flex items-center justify-center px-3 py-1 border-2 border-[#00A99D] rounded-lg gap-1 text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all font-medium text-sm"
        >
          <IoDownloadOutline />
          <span>Download</span>
        </button>
      </div>
    );
  };
  
  const renderPreviewContent = () => {
    if (!previewResource) return null;
    
    // Get file path from files array if available, otherwise use filePath or file
    const filePath = previewResource.files && previewResource.files.length 
      ? previewResource.files[0] 
      : (previewResource.filePath || previewResource.file);
    
    if (!filePath) {
      return (
        <div className="text-center p-8">
          <p>No preview available for this resource</p>
        </div>
      );
    }
    
    if (isImageFile(filePath)) {
      return (
        <div className="flex justify-center">
          <img 
            src={filePath.startsWith('http') ? filePath : `${process.env.NEXT_PUBLIC_API_URL || ''}/${filePath}`} 
            alt={previewResource.title} 
            className="max-w-full max-h-[70vh]" 
          />
        </div>
      );
    }
    
    const extension = getFileExtension(filePath);
    
    if (extension === 'pdf') {
      return (
        <div className="h-[70vh]">
          <iframe 
            src={`${filePath.startsWith('http') ? filePath : `${process.env.NEXT_PUBLIC_API_URL || ''}/${filePath}`}#toolbar=0`} 
            className="w-full h-full" 
            title={previewResource.title}
          />
        </div>
      );
    }
    
    return (
      <div className="text-center p-8">
        <div className="mb-4">
          {getFileIcon(previewResource)}
        </div>
        <p>Preview not available for this file type</p>
        <p className="text-gray-500 mt-2">You can download the file to view it</p>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          className="mt-4 bg-[#00A99D] hover:bg-[#008F84] border-none"
          onClick={() => handleDownload(previewResource)}
        >
          Download File
        </Button>
      </div>
    );
  };

  // Calculate pagination
  const paginatedResources = resources.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="user-resources">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Resources</h2>
        <Button 
          type="primary" 
          onClick={() => message.info('Create resource functionality will be implemented soon')}
          className="bg-[#00A99D] hover:bg-[#008F84] border-none shadow-sm"
        >
          Create New Resource
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
          <span className="ml-3 text-lg text-gray-600">Loading resources...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources yet</h3>
          <p className="text-gray-500 mb-4">Start sharing your knowledge with the community!</p>
          <Button 
            type="primary"
            className="bg-[#00A99D] hover:bg-[#008F84] border-none shadow-sm px-6 py-2 h-auto"
            onClick={() => message.info('Create resource functionality will be implemented soon')}
          >
            Create Your First Resource
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResources.map((resource) => (
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
                          e.target.src = defaultAvatarPath; // Fallback to default image
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-white">
                        <FaUser size={24} />
                      </div>
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
                  
                  {/* Action buttons */}
                  <div className="ml-auto flex gap-1">
                    <Tooltip title="Edit">
                      <Button 
                        type="text" 
                        icon={<EditOutlined className="text-[#00A99D]" />} 
                        onClick={() => handleEdit(resource)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteClick(resource)}
                      />
                    </Tooltip>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">{resource.description}</p>
                
                {/* Category Tag */}
                {resource.category && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-[#E3F5FE] to-[#F0FFFE] text-[#00A99D] rounded-full text-sm font-medium border border-[#00A99D]/20">
                      {resource.category}
                    </span>
                    {resource.tags && Array.isArray(resource.tags) && resource.tags.map((tag, index) => (
                      <span key={index} className="px-4 py-2 bg-gradient-to-r from-[#E3F5FE] to-[#F0FFFE] text-[#00A99D] rounded-full text-sm font-medium border border-[#00A99D]/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* File Preview/Download Section */}
                {renderFilePreview(resource)}
              </div>
            ))}
          </div>

          {resources.length > pageSize && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalResources}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Resource"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okButtonProps={{ 
          danger: true, 
          loading: deleteLoading 
        }}
        className="delete-modal"
      >
        <p>Are you sure you want to delete this resource?</p>
        {resourceToDelete && (
          <p className="font-bold mt-2 text-gray-800">{resourceToDelete.title}</p>
        )}
        <p className="text-red-500 mt-2">This action cannot be undone.</p>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={previewResource?.title || 'Resource Preview'}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            className="bg-[#00A99D] hover:bg-[#008F84] border-none"
            icon={<DownloadOutlined />}
            onClick={() => previewResource && handleDownload(previewResource)}
          >
            Download
          </Button>
        ]}
        width={800}
        className="resource-preview-modal"
      >
        {renderPreviewContent()}
      </Modal>
    </div>
  );
};

export default UserResources;
