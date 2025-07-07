import Api from "../services/axios";
import userRoute from "../services/endPoints/userEndpoints";
import { HTTP_STATUS } from "../utils/constants";

/**
 * Fetch user profile by ID
 * @param {string} userId - The user ID to fetch
 * @returns {Promise<Object>} - API response or error object
 */
export const fetchUserById = async (userId) => {
  try {
    if (!userId) {
      return { error: { message: "User ID is required" } };
    }
    
    const response = await Api.post(userRoute.userProfile, {
      _id: userId
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { 
      error: error.response?.data || { message: 'Failed to fetch user profile' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};



/**
 * Submit user contact details
 * @param {Object} formData - The contact form data
 * @returns {Promise<Object>} - API response or error object
 */
export const userContactDetails = async (formData) => {
  try {
    if (!formData) {
      return { error: { message: "Form data is required" } };
    }
    
    const response = await Api.post(userRoute.userContactDetails, { formData });
    return response;
  } catch (error) {
    console.error('Error submitting contact details:', error);
    return { 
      error: error.response?.data || { message: 'Failed to submit contact details' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

/**
 * Register a new user
 * @param {Object|FormData} userData - The user registration data as FormData for file uploads
 * @returns {Promise<Object>} - API response or error object
 */
export const registerUser = async (userData) => {
  try {
    // Check if userData is FormData
    const isFormData = userData instanceof FormData;
    
    // If not FormData, validate required fields and create FormData
    if (!isFormData) {
      if (!userData.email || !userData.password || !userData.fullName) {
        return { 
          error: { message: "Email, password, and full name are required" },
          status: HTTP_STATUS.BAD_REQUEST
        };
      }
      
      // Convert regular object to FormData with exact field names from screenshot
      const formData = new FormData();
      formData.append('fullName', userData.fullName);
      formData.append('email', userData.email);
      formData.append('phoneNumber', userData.phoneNumber);
      formData.append('bio', userData.bio || '');
      formData.append('countryOfPractice', userData.countryOfPractice || '');
      formData.append('medicalQualification', userData.medicalQualification || '');
      formData.append('yearOfGraduation', userData.yearOfGraduation || '');
      formData.append('hasFormalTrainingInPalliativeCare', userData.hasFormalTrainingInPalliativeCare || false);
      formData.append('medicalRegistrationAuthority', userData.medicalRegistrationAuthority || '');
      formData.append('medicalRegistrationNumber', userData.medicalRegistrationNumber || '');
      formData.append('affiliatedPalliativeAssociations', userData.affiliatedPalliativeAssociations || '');
      formData.append('specialInterestsInPalliativeCare', userData.specialInterestsInPalliativeCare || '');
      formData.append('password', userData.password);
      formData.append('role', userData.role || "68629dde1557b3c7e90ce077"); // Exact role ID from screenshot
      
      // Replace userData with formData
      userData = formData;
    }
    
    // Set proper headers for FormData/multipart
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await Api.post(userRoute.userRegister, userData, config);
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error.response?.status === HTTP_STATUS.CONFLICT) {
      return { 
        error: { message: error.response?.data?.message || "Email already exists" },
        status: HTTP_STATUS.CONFLICT
      };
    }
    
    return { 
      error: error.response?.data || { message: 'Registration failed' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

/**
 * Login a user
 * @param {Object} loginData - The login credentials
 * @returns {Promise<Object>} - API response or error object
 */
export const loginUser = async (loginData) => {
  try {
    // Validate required fields
    if (!loginData.email || !loginData.password) {
      return { 
        error: { message: "Email and password are required" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    const response = await Api.post(userRoute.userLogin, {
      email: loginData.email,
      password: loginData.password
    });
    
    // If login is successful, save user data to localStorage
    if (response.data?.success && response.data?.data?.data?._id) {
      try {
        localStorage.setItem("userId", response.data.data.data._id);
        localStorage.setItem("userEmail", response.data.data.data.email);
        localStorage.setItem("userFullName", response.data.data.data.fullName);
        
        // Store login timestamp
        localStorage.setItem("loginTimestamp", Date.now().toString());
      } catch (storageError) {
        console.error('Error storing user data in localStorage:', storageError);
        // Continue with login even if localStorage fails
      }
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.response?.status === HTTP_STATUS.CONFLICT) {
      // Check if the message is about admin approval
      if (error.response?.data?.message === "Admin didn't accept request yet.") {
        return { 
          status: HTTP_STATUS.CONFLICT,
          data: {
            message: "Admin didn't accept request yet."
          }
        };
      } else {
        return { 
          error: error.response?.data || { message: "Account pending approval" },
          status: HTTP_STATUS.CONFLICT,
          data: error.response?.data
        };
      }
    }
    
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      return { 
        error: { message: "Invalid email or password" },
        status: HTTP_STATUS.UNAUTHORIZED
      };
    }
    
    // Handle network errors
    if (error.message?.includes("Network Error")) {
      return { 
        error: { message: "Unable to connect to server. Please check your internet connection." },
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
    
    return { 
      error: error.response?.data || { message: 'Login failed' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};
/**
 * Fetch the current user's profile
 * @returns {Promise<Object>} - API response or error object
 */
export const fetchUserProfile = async () => {
  try {
    // Get user ID from localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return { 
        error: { message: "User ID not found. Please login again." },
        status: HTTP_STATUS.UNAUTHORIZED
      };
    }

    const response = await Api.post(userRoute.userProfile, {
      _id: userId
    });
    
    return response;
  } catch (error) {
    console.error('Fetch user profile error:', error);
    
    // Handle unauthorized errors (e.g., expired session)
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Clear invalid session data
      try {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userFullName");
      } catch (storageError) {
        console.error('Error clearing localStorage:', storageError);
      }
      
      return { 
        error: { message: "Session expired. Please login again." },
        status: HTTP_STATUS.UNAUTHORIZED
      };
    }
    
    return { 
      error: error.response?.data || { message: 'Failed to fetch user profile' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};





/**
 * Update user profile
 * @param {Object} userData - The updated user data
 * @returns {Promise<Object>} - API response or error object
 */
export const editUserProfile = async (userData) => {
  try {
    // Get user ID from localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return { 
        error: { message: "User ID not found. Please login again." },
        status: HTTP_STATUS.UNAUTHORIZED
      };
    }

    // Validate required fields
    if (!userData.email || !userData.fullName) {
      return { 
        error: { message: "Email and full name are required" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }

    const response = await Api.patch(userRoute.editProfile, {
      _id: userId,
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      photo: userData.photo,
      bio: userData.bio,
      countryOfPractice: userData.countryOfPractice,
      medicalQualification: userData.medicalQualification,
      yearOfGraduation: userData.yearOfGraduation,
      hasFormalTrainingInPalliativeCare: userData.hasFormalTrainingInPalliativeCare,
      medicalRegistrationAuthority: userData.medicalRegistrationAuthority,
      medicalRegistrationNumber: userData.medicalRegistrationNumber,
      affiliatedPalliativeAssociations: userData.affiliatedPalliativeAssociations,
      specialInterestsInPalliativeCare: userData.specialInterestsInPalliativeCare,
      password: userData.password,
      role: userData.role || "68629dde1557b3c7e90ce077"
    });
    
    // Update user data in localStorage if present in response
    try {
      const updatedId = response?.data?.data?._id || response?.data?.data?.data?._id;
      const updatedEmail = response?.data?.data?.email || response?.data?.data?.data?.email;
      const updatedName = response?.data?.data?.fullName || response?.data?.data?.data?.fullName;
      
      if (updatedId) {
        localStorage.setItem('userId', updatedId);
      }
      if (updatedEmail) {
        localStorage.setItem('userEmail', updatedEmail);
      }
      if (updatedName) {
        localStorage.setItem('userName', updatedName);
      }
    } catch (storageError) {
      console.error('Error updating localStorage:', storageError);
    }
    
    return response;
  } catch (error) {
    console.error('Error in editUserProfile:', error);
    return {
      error: { 
        message: error.response?.data?.message || error.message || 'Failed to update profile',
        details: error.response?.data || error
      },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

/**
 * Helper function to handle user profile API responses
 * @param {Object} response - API response
 * @returns {Object} - Formatted response
 */
const handleUserProfileResponse = (response) => {
  // Check if the response has the expected structure
  if (!response || !response.data) {
    console.error('Invalid API response structure:', response);
    return {
      error: { message: 'Invalid API response structure' },
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }

  console.log('Raw API response:', response);
  
  // Extract the actual user data from the response
  // The API might return data in different formats:
  // 1. response.data.data (most common)
  // 2. response.data.data.data (nested structure)
  // 3. response.data directly
  const userData = response.data.data?.data || response.data.data || response.data;
  
  console.log('Extracted user data:', userData);
  
  // Update user data in localStorage if present in response
  try {
    if (userData && userData._id) {
      localStorage.setItem('userId', userData._id);
      
      if (userData.email) {
        localStorage.setItem('userEmail', userData.email);
      }
      
      if (userData.fullName) {
        localStorage.setItem('userFullName', userData.fullName); // Fixed key from userName to userFullName
      }
      
      console.log('Updated localStorage with user data');
    }
  } catch (storageError) {
    console.error('Error updating localStorage:', storageError);
  }
  
  // Return a standardized response format
  return {
    success: true,
    data: userData,
    message: response.data.message || 'Profile updated successfully'
  };
};

/**
 * Update user profile with file upload support
 * @param {string} userId - User ID
 * @param {Object} userData - User data fields
 * @param {File} [fileData] - Optional file to upload as profile image
 * @returns {Promise<Object>} - API response or error object
 */
export const updateUserProfileWithFile = async (userId, userData, fileData) => {
  try {
    console.log('Using FormData for profile update');
    const formData = new FormData();
    
    // Add all user data fields to FormData
    formData.append('_id', userId);
    formData.append('fullName', userData.fullName || '');
    formData.append('email', userData.email || '');
    formData.append('phoneNumber', userData.phoneNumber || '');
    formData.append('bio', userData.bio || '');
    formData.append('countryOfPractice', userData.countryOfPractice || '');
    formData.append('medicalQualification', userData.medicalQualification || '');
    formData.append('yearOfGraduation', userData.yearOfGraduation || '');
    formData.append('hasFormalTrainingInPalliativeCare', userData.hasFormalTrainingInPalliativeCare || false);
    formData.append('medicalRegistrationAuthority', userData.medicalRegistrationAuthority || '');
    formData.append('medicalRegistrationNumber', userData.medicalRegistrationNumber || '');
    formData.append('affiliatedPalliativeAssociations', userData.affiliatedPalliativeAssociations || '');
    formData.append('specialInterestsInPalliativeCare', userData.specialInterestsInPalliativeCare || '');
    formData.append('role', userData.role || "68629dde1557b3c7e90ce077");
    
    // Handle file upload
    if (fileData) {
      // If a new file is provided, add it to the form data
      formData.append('file', fileData);
      console.log('Adding file to request:', fileData.name);
    } else if (userData.existingImageURL) {
      // If no new file but we have an existing image URL, include it in the form data
      // Note: The backend expects 'imageURL' field when no file is uploaded
      formData.append('imageURL', userData.existingImageURL);
      
      // IMPORTANT: Add an empty file field to satisfy the backend requirement
      // This is a workaround for the 'No file uploaded' error
      const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
      formData.append('file', emptyBlob, 'empty.txt');
      
      console.log('Preserving existing image URL and adding empty file:', userData.existingImageURL);
    } else {
      // If no file and no existing image, still add an empty file to avoid the error
      const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
      formData.append('file', emptyBlob, 'empty.txt');
      console.log('No image provided, adding empty file');
    }
    
    // Log form data entries for debugging
    console.log('Form data entries:');
    Array.from(formData.entries()).forEach(pair => {
      console.log(pair[0] + ': ' + (pair[0] === 'file' ? 'File object' : pair[1]));
    });

    // Make PATCH request with FormData
    const response = await Api.patch(userRoute.editProfile, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return handleUserProfileResponse(response);
  } catch (error) {
    console.error('Error in updateUserProfileWithFile:', error);
    return {
      error: { 
        message: error.response?.data?.message || error.message || 'Failed to update profile',
        details: error.response?.data || error
      },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

/**
 * Log out the current user
 * @returns {Object} - Success status
 */
export const logoutUser = () => {
  try {
    // Clear all user-related data from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("loginTimestamp");
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { 
      error: { message: 'Failed to logout properly' },
      success: false
    };
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Whether the user is authenticated
 */
export const isAuthenticated = () => {
  try {
    const userId = localStorage.getItem("userId");
    return !!userId; // Convert to boolean
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

/**
 * Send OTP to user's phone number for password reset
 * @param {string} phone - User's phone number with country code (e.g., +917510202251)
 * @returns {Promise<Object>} - API response or error object
 */
export const sendOTP = async (phone) => {
  try {
    if (!phone) {
      return { 
        error: { message: "Phone number is required" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    const response = await Api.post(userRoute.sendOTP, { phone });
    return response;
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Handle specific error cases
    if (error.response?.status === HTTP_STATUS.NOT_FOUND) {
      return { 
        error: { message: "Phone number not found. Please check your phone number." },
        status: HTTP_STATUS.NOT_FOUND
      };
    }
    
    return { 
      error: error.response?.data || { message: 'Failed to send OTP. Please try again later.' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

/**
 * Verify OTP sent to user's phone number
 * @param {string} phone - User's phone number with country code
 * @param {string} otp - OTP received by user
 * @returns {Promise<Object>} - API response or error object
 */
/**
 * Activate user account
 * @param {string} userId - User ID to activate
 * @param {string} activationToken - Activation token received via email
 * @returns {Promise<Object>} - API response or error object
 */
export const activateAccount = async (userId, activationToken) => {
  try {
    if (!userId || !activationToken) {
      return { 
        error: { message: "User ID and activation token are required" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    const response = await Api.post(userRoute.activateAccount, { 
      userId, 
      activationToken 
    });
    
    return response;
  } catch (error) {
    console.error('Error activating account:', error);
    
    // Handle specific error cases
    if (error.response?.status === HTTP_STATUS.NOT_FOUND) {
      return { 
        error: { message: "Invalid activation link. Please request a new one." },
        status: HTTP_STATUS.NOT_FOUND
      };
    }
    
    if (error.response?.status === HTTP_STATUS.GONE) {
      return { 
        error: { message: "Activation link has expired. Please request a new one." },
        status: HTTP_STATUS.GONE
      };
    }
    
    return { 
      error: error.response?.data || { message: 'Failed to activate account. Please try again later.' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

/**
 * Request a new activation link
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - API response or error object
 */
export const requestActivationLink = async (email) => {
  try {
    if (!email) {
      return { 
        error: { message: "Email is required" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    const response = await Api.post(userRoute.requestActivation, { email });
    return response;
  } catch (error) {
    console.error('Error requesting activation link:', error);
    
    // Handle specific error cases
    if (error.response?.status === HTTP_STATUS.NOT_FOUND) {
      return { 
        error: { message: "Email not found. Please check your email address." },
        status: HTTP_STATUS.NOT_FOUND
      };
    }
    
    return { 
      error: error.response?.data || { message: 'Failed to request activation link. Please try again later.' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

export const verifyOTP = async (phone, otp) => {
  try {
    if (!phone || !otp) {
      return { 
        error: { message: "Phone number and OTP are required" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    const response = await Api.post(userRoute.verifyOTP, { phone, otp });
    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    // Handle specific error cases
    if (error.response?.status === HTTP_STATUS.BAD_REQUEST) {
      return { 
        error: { message: error.response?.data?.message || "Invalid or expired OTP" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    return { 
      error: error.response?.data || { message: 'Failed to verify OTP. Please try again.' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

/**
 * Reset user password using user ID
 * @param {string} userId - User ID
 * @param {string} password - New password
 * @returns {Promise<Object>} - API response or error object
 */
export const resetPassword = async (userId, password) => {
  try {
    if (!userId || !password) {
      return { 
        error: { message: "User ID and new password are required" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    // Password validation
    if (password.length < 6) {
      return { 
        error: { message: "Password must be at least 6 characters long" },
        status: HTTP_STATUS.BAD_REQUEST
      };
    }
    
    const response = await Api.post(userRoute.resetPassword, {
      _id: userId,
      password
    });
    
    return response;
  } catch (error) {
    console.error('Error resetting password:', error);
    
    return { 
      error: error.response?.data || { message: 'Failed to reset password. Please try again later.' },
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
};

