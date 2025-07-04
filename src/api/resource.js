import Api from "../services/axios";
import axios from 'axios';
import resourceRoutes from "../services/endPoints/resourceEndpoints";

// Fetch all resources with improved error handling
export const fetchResources = async (params = {}) => {
  try {
    const response = await Api.get(resourceRoutes.fetchResources, {
      params: {
        page: 1,
        limit: 50,
        ...params
      }
    });
    
    // Log response for debugging
    console.log('fetchResources response:', response);
    
    return {
      success: true,
      data: response.data,
      message: 'Resources fetched successfully'
    };
  } catch (error) {
    console.error("Error fetching resources:", error);
    
    // Return structured error response
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || error.message || "Failed to fetch resources",
      status: error.response?.status || 500
    };
  }
};

// Fetch a single resource by ID
export const fetchResourceById = async (resourceId) => {
  try {
    if (!resourceId) {
      throw new Error('Resource ID is required');
    }

    console.log(`Fetching resource with ID: ${resourceId}`);
    
    // Log the token to check if authentication is working
    const token = localStorage.getItem('token');
    console.log('Authentication token available:', !!token);
    
    // Use POST request with resourceId in the request body as expected by the API
    // Format exactly like the fetchResourceByAuthorId example
    const response = await Api.post(resourceRoutes.fetchResourceById, {
      resourceId: resourceId
    });
    
    console.log('API response data:', response.data);
    
    // Check if we have a valid response with data
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Resource not found');
    }
    
    // Extract the resource from the response data array if needed
    const resourceData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
    
    if (!resourceData) {
      throw new Error('Resource not found');
    }
    
    return {
      success: true,
      data: resourceData,
      message: 'Resource fetched successfully'
    };
  } catch (error) {
    console.error("Error fetching resource:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || "Failed to fetch resource",
      status: error.response?.status || 500
    };
  }
};

// Fetch resources by author ID
export const fetchResourcesByAuthor = async (authorId) => {
  try {
    if (!authorId) {
      throw new Error('Author ID is required');
    }

    // Using POST method with authorId in the request body
    const response = await Api.post(resourceRoutes.fetchResourceByAuthor, {
      authorId: authorId
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Author resources fetched successfully'
    };
  } catch (error) {
    console.error("Error fetching author resources:", error);
    
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || error.message || "Failed to fetch author resources",
      status: error.response?.status || 500
    };
  }
};

// Create a new resource with file upload support
export const createResource = async (resourceData) => {
  try {
    // Validate required fields - check if FormData or regular object
    if (resourceData instanceof FormData) {
      if (!resourceData.get('title') || !resourceData.get('description')) {
        throw new Error('Title and description are required');
      }
    } else if (!resourceData.title || !resourceData.description) {
      throw new Error('Title and description are required');
    }

    const response = await Api.post(resourceRoutes.createResource, resourceData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Resource created successfully'
    };
  } catch (error) {
    console.error("Error creating resource:", error);
    
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || "Failed to create resource",
      status: error.response?.status || 500
    };
  }
};

// Update an existing resource
export const updateResource = async (resourceId, resourceData) => {
  try {
    if (!resourceId) {
      throw new Error('Resource ID is required');
    }

    console.log('Updating resource with ID:', resourceId);
    console.log('Resource data type:', resourceData instanceof FormData ? 'FormData' : typeof resourceData);
    
    let requestData;
    
    // Handle FormData vs regular object
    if (resourceData instanceof FormData) {
      // If FormData, append the ID to it
      requestData = resourceData;
      requestData.append('_id', resourceId);
      
      // Log FormData entries for debugging
      console.log('FormData entries:');
      for (let pair of requestData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'file' ? 'File object' : pair[1]));
      }
    } else {
      // If regular object, spread it and add the ID
      requestData = {
        _id: resourceId,
        ...resourceData
      };
      console.log('Request data:', requestData);
    }

    // Using PATCH method with the correct endpoint format
    const response = await Api.patch(resourceRoutes.editResource, requestData, {
      headers: {
        'Content-Type': resourceData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    
    console.log('Update resource response:', response);
    
    return {
      success: true,
      data: response.data,
      message: 'Resource updated successfully'
    };
  } catch (error) {
    console.error("Error updating resource:", error);
    
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || "Failed to update resource",
      status: error.response?.status || 500
    };
  }
};

// Delete a resource
export const deleteResource = async (resourceId) => {
  try {
    if (!resourceId) {
      throw new Error('Resource ID is required');
    }

    // Using POST method with resourceId in the request body
    const response = await Api.post('https://api.thegpdn.org/api/resource/DeleteResource', {
      resourceId: resourceId
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Resource deleted successfully'
    };
  } catch (error) {
    console.error("Error deleting resource:", error);
    
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || "Failed to delete resource",
      status: error.response?.status || 500
    };
  }
};

// Search resources
export const searchResources = async (searchTerm, category = null) => {
  try {
    const params = {
      search: searchTerm,
      ...(category && { category })
    };

    const response = await Api.get(resourceRoutes.fetchResources, { params });
    
    return {
      success: true,
      data: response.data,
      message: 'Search completed successfully'
    };
  } catch (error) {
    console.error("Error searching resources:", error);
    
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || error.message || "Failed to search resources",
      status: error.response?.status || 500
    };
  }
};

// Download resource file with multiple fallback methods
export const downloadResourceFile = async (filePath, filename) => {
  try {
    if (!filePath) {
      throw new Error('File path is required');
    }

    // Method 1: Try direct API download endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                   process.env.NEXT_PUBLIC_BASE_URL || 
                   window.location.origin;
    
    let downloadUrl;
    
    // Construct proper download URL based on file path format
    if (filePath.startsWith('http')) {
      downloadUrl = filePath;
    } else {
      // Clean file path
      let cleanPath = filePath;
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }
      
      // Handle uploads folder structure
      if (cleanPath.includes('uploads/') && !cleanPath.startsWith('uploads/')) {
        const uploadsIndex = cleanPath.indexOf('uploads/');
        cleanPath = cleanPath.substring(uploadsIndex);
      }
      
      if (!cleanPath.startsWith('uploads/')) {
        cleanPath = `uploads/${cleanPath}`;
      }
      
      downloadUrl = `${baseUrl}/api/resource/file/${cleanPath}`;
    }

    try {
      // Method 1: Fetch as blob and download
      const response = await Api.get(downloadUrl, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*',
        }
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || filePath.split('/').pop() || 'download';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      return {
        success: true,
        message: 'File downloaded successfully'
      };

    } catch (blobError) {
      console.log('Blob download failed, trying direct link method:', blobError);
      
      // Method 2: Direct link download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = filename || filePath.split('/').pop() || 'download';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        message: 'Download initiated in new tab'
      };
    }

  } catch (error) {
    console.error("Error downloading file:", error);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to download file",
      status: error.response?.status || 500
    };
  }
};

// Get resource categories
export const getResourceCategories = async () => {
  try {
    const response = await Api.get(`${resourceRoutes.fetchResources}/categories`);
    
    return {
      success: true,
      data: response.data,
      message: 'Categories fetched successfully'
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    
    // Return default categories if API fails
    const defaultCategories = [
      'Pain Management', 'Ethical Issues', 'End-of-Life Care', 'Spiritual Care',
      'Psychosocial Support', 'New Virus', 'Symptom Control', 'Lifestyle',
      'Caregiver Support', 'Pediatric Palliative Care'
    ];
    
    return {
      success: false,
      data: defaultCategories,
      error: error.response?.data?.message || error.message || "Failed to fetch categories",
      status: error.response?.status || 500
    };
  }
};

// Utility function to get file URL for display/preview
export const getFileUrl = (filePath) => {
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
  return `${baseUrl}/api/resource/file/${cleanPath}`;
};

// Utility function to check if file is an image
export const isImageFile = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension);
};

// Utility function to get file extension
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Utility function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};