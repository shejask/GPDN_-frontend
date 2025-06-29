import Api from "../services/axios";
import userRoute from "../services/endPoints/userEndpoints";




e
export const fetchUserById = async () => {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    throw new Error('User ID not found in local storage');
  }

  try {
    const response = await Api.get(userRoute.userProfile, {
     _id: userId 
    });

    if (!response?.data) {
      throw new Error('Invalid response format');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user data');
    }

    return response.data.data || response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error (${status}):`, data);
      throw new Error(data?.message || `Failed to fetch user data (${status})`);
    }
    
    console.error('Error fetching user:', error);
    throw error;
  }
};







export const userContactDetails = async (formData) => {
  try {
    const response = await Api.post(userRoute.userContactDetails , {formData});
    return response;
  } catch (error) {
    console.log(error)
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await Api.post(userRoute.userRegister, {
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
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
      role: userData.role || "6853d418ffcac850f881d5d3"
    });
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return { error: error.response?.data || 'Registration failed' };
  }
};

export const loginUser = async (loginData) => {
  try {
    const response = await Api.post(userRoute.userLogin, {
      email: loginData.email,
      password: loginData.password
    });
    
    // If login is successful, save user ID to localStorage
    if (response.data.success && response.data.data.data._id) {
      localStorage.setItem("userId", response.data.data.data._id);
      localStorage.setItem("userEmail", response.data.data.data.email);
      localStorage.setItem("userFullName", response.data.data.data.fullName);
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return { error: error.response?.data || 'Login failed' };
  }
};
export const fetchUserProfile = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return { error: "User ID not found in localStorage" };
    }

    const response = await Api.post(userRoute.userProfile, {
      _id: userId
    });
    
    // Debug: Log the actual response structure
    console.log('Full API Response:', response);
    console.log('Response data:', response.data);
    
    return response;
  } catch (error) {
    console.error('Fetch user profile error:', error);
    return { error: error.response?.data || 'Failed to fetch user profile' };
  }
};





export const editUserProfile = async (userData) => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return { error: "User ID not found in localStorage" };
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
    });
    // Update userId in localStorage if present in response
    const updatedId = response?.data?.data?._id || response?.data?.data?.data?._id;
    if (updatedId) {
      localStorage.setItem("userId", updatedId);
    }
    return response;
  } catch (error) {
    console.error('Edit user profile error:', error);
    return { error: error.response?.data || 'Failed to update user profile' };
  }
};

