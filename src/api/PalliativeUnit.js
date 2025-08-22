import Api from "../services/axios";
import palliativeRoutes from "../services/endPoints/PalliativeEndpoints";

export const fetchPalliativeUnits = async () => {
  try {
    const response = await Api.get(palliativeRoutes.fetchPalliativeUnits);
    return response.data;
  } catch (error) {
    console.error("Error fetching palliative units:", error);
    return { data: [] };
  }
};

export const fetchServices = async () => {
  try {
    const response = await Api.get(palliativeRoutes.fetchServices);
    console.log("Raw API response:", response);
    // Return the actual data from the response
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    return { data: [] };
  }
};

export const createPalliativeUnit = async (unitData) => {
  try {
    const response = await Api.post(
      palliativeRoutes.createPalliativeUnit,
      unitData
    );
    return response;
  } catch (error) {
    console.error("Error creating palliative unit:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to create palliative unit",
    };
  }
};

export const searchPalliativeUnit = async (searchInp) => {
  try {
    console.log("Search payload:", { searchInp });
    const response = await Api.post(palliativeRoutes.searchPalliativeUnit, {
      searchInp,
    });
    console.log("Search API response:", response);
    return response.data;
  } catch (error) {
    console.error("Error searching palliative unit:", error);
    return { data: [] };
  }
};
