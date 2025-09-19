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
    // Get the current user ID from localStorage
    const userId = localStorage.getItem("userId");

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Validate required fields
    if (
      !unitData.name ||
      !unitData.state ||
      !unitData.country ||
      !unitData.contactDetails
    ) {
      throw new Error("Missing required fields");
    }

    if (
      !unitData.services ||
      !Array.isArray(unitData.services) ||
      unitData.services.length === 0
    ) {
      throw new Error("At least one service must be selected");
    }

    // Prepare the request body to match the API format
    const requestBody = {
      name: unitData.name.trim(),
      state: unitData.state.trim(),
      country: unitData.country.trim(),
      services: unitData.services, // Keep as array of IDs
      contactDetails: unitData.contactDetails.trim(),
      authorId: userId,
      actionStatus: unitData.actionStatus,
    };

    console.log("Creating palliative unit with data:", requestBody);
    console.log(
      "Services type:",
      typeof requestBody.services,
      "Array:",
      Array.isArray(requestBody.services)
    );
    console.log("Services content:", requestBody.services);

    const response = await Api.post(
      palliativeRoutes.createPalliativeUnit,
      requestBody
    );

    console.log("Palliative unit creation response:", response);
    return response.data;
  } catch (error) {
    console.error("Error creating palliative unit:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
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

export const fetchPalliativeUnitByUser = async (authorId) => {
  try {
    console.log("Fetching palliative units for user:", authorId);
    const response = await Api.post(
      palliativeRoutes.fetchPalliativeUnitByUser,
      {
        authorId,
      }
    );
    console.log("User palliative units API response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching user palliative units:", error);
    return { data: [] };
  }
};

export const updatePalliativeUnit = async (unitId, unitData) => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const requestBody = {
      _id: unitId,
      name: unitData.name,
      state: unitData.state,
      country: unitData.country,
      services: unitData.services,
      contactDetails: unitData.contactDetails,
      authorId: userId,
      actionStatus: unitData.actionStatus,
    };

    console.log("Updating palliative unit with data:", requestBody);

    const response = await Api.put(
      palliativeRoutes.updatePalliativeUnit,
      requestBody
    );

    console.log("Palliative unit update response:", response);
    return response.data;
  } catch (error) {
    console.error("Error updating palliative unit:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to update palliative unit",
    };
  }
};

export const deletePalliativeUnit = async (unitId) => {
  try {
    console.log("Deleting palliative unit:", unitId);

    const requestBody = {
      UnitId: unitId,
    };

    const response = await Api.post(
      palliativeRoutes.deletePalliativeUnit,
      requestBody
    );

    console.log("Palliative unit delete response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting palliative unit:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete palliative unit",
    };
  }
};

export const editPalliativeUnit = async (unitData) => {
  try {
    // Validate services
    if (
      !unitData.services ||
      !Array.isArray(unitData.services) ||
      unitData.services.length === 0
    ) {
      throw new Error("At least one service must be selected");
    }

    // Prepare the request body with services as array of IDs
    const requestBody = {
      ...unitData,
      services: unitData.services, // Keep as array of IDs
    };

    console.log("Editing palliative unit with data:", requestBody);

    const response = await Api.patch(
      palliativeRoutes.editPalliativeUnit,
      requestBody
    );

    console.log("Palliative unit edit response:", response);
    return response.data;
  } catch (error) {
    console.error("Error editing palliative unit:", error);
    console.error("Edit error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to edit palliative unit",
    };
  }
};

export const approveUnitForPublic = async (unitId, actionStatus) => {
  try {
    const requestBody = {
      _id: unitId,
      actionStatus: actionStatus,
    };

    console.log("Updating unit public status:", requestBody);

    const response = await Api.patch(
      palliativeRoutes.approveUnitForPublic,
      requestBody
    );

    console.log("Unit approval response:", response);
    return response.data;
  } catch (error) {
    console.error("Error updating unit public status:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to update unit public status",
    };
  }
};
