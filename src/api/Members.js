import Api from "../services/axios";
import membersRoutes from "../services/endPoints/MembersEndpoints";

// Enhanced error handling and response normalization
const handleApiResponse = (response) => {
  if (response?.data) {
    return response;
  }
  return { data: { data: [] } };
};

const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  // Return structured error response
  return {
    data: { data: [] },
    error: {
      message: error?.response?.data?.message || error?.message || `Failed to ${operation}`,
      status: error?.response?.status || 500,
      code: error?.code || 'UNKNOWN_ERROR'
    }
  };
};

export const fetchDoctors = async () => {
  try {
    const response = await Api.get(membersRoutes.fetchDoctors);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, 'fetch doctors');
  }
};

export const searchDoctors = async (searchInp) => {
  try {
    // Validate input
    if (!searchInp || typeof searchInp !== 'string') {
      throw new Error('Search input is required and must be a string');
    }

    const trimmedInput = searchInp.trim();
    if (trimmedInput.length === 0) {
      throw new Error('Search input cannot be empty');
    }

    const response = await Api.post(membersRoutes.searchDoctors, { 
      searchInp: trimmedInput 
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, 'search doctors');
  }
};

export const filterDoctors = async (filter) => {
  try {
    // Validate filter input
    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be an object');
    }

    // Clean up filter object - remove empty values
    const cleanFilter = Object.entries(filter)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? value.trim() : value;
        return acc;
      }, {});

    // If no valid filters, return empty result
    if (Object.keys(cleanFilter).length === 0) {
      return { data: { data: [] } };
    }

    const response = await Api.post(membersRoutes.filterDoctors, { 
      filter: cleanFilter 
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, 'filter doctors');
  }
};

// Additional utility functions for better API management
export const getDoctorById = async (doctorId) => {
  try {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const response = await Api.get(`${membersRoutes.fetchDoctors}/${doctorId}`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, 'fetch doctor details');
  }
};

// Advanced search with multiple parameters
export const advancedSearchDoctors = async (searchParams) => {
  try {
    const { 
      searchTerm = '', 
      location = '', 
      specialization = '', 
      expertise = '',
      page = 1,
      limit = 50
    } = searchParams;

    const searchPayload = {
      searchInp: searchTerm.trim(),
      filters: {
        ...(location && { countryOfPractice: location }),
        ...(specialization && { specialization }),
        ...(expertise && { expertise })
      },
      pagination: {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(100, Math.max(1, parseInt(limit)))
      }
    };

    const response = await Api.post(membersRoutes.advancedSearch || membersRoutes.searchDoctors, searchPayload);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, 'perform advanced search');
  }
};

// Get available filter options (for dynamic filter menus)
export const getFilterOptions = async () => {
  try {
    const response = await Api.get(membersRoutes.filterOptions || `${membersRoutes.fetchDoctors}/options`);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, 'fetch filter options');
  }
};

// Batch operations
export const batchSearchDoctors = async (searchTerms) => {
  try {
    if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
      throw new Error('Search terms must be a non-empty array');
    }

    const validTerms = searchTerms
      .filter(term => typeof term === 'string' && term.trim().length > 0)
      .map(term => term.trim());

    if (validTerms.length === 0) {
      return { data: { data: [] } };
    }

    const response = await Api.post(membersRoutes.batchSearch || membersRoutes.searchDoctors, {
      searchTerms: validTerms
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error, 'perform batch search');
  }
};

// Export all functions as default object for easier importing
export default {
  fetchDoctors,
  searchDoctors,
  filterDoctors,
  getDoctorById,
  advancedSearchDoctors,
  getFilterOptions,
  batchSearchDoctors
};