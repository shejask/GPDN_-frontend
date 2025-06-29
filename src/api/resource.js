import Api from "../services/axios";
import resourceRoutes from "../services/endPoints/resourceEndpoints";

export const fetchResources = async () => {
  try {
    const response = await Api.get(resourceRoutes.fetchResources);
    return response;
  } catch (error) {
    console.error("Error fetching resources:", error);
    return { data: [] };
  }
};

export const createResource = async (resourceData) => {
  try {
    const response = await Api.post(resourceRoutes.createResource, resourceData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error creating resource:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create resource"
    };
  }
};


