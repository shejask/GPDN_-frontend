import Api from "../services/axios";
import palliativeRoutes from "../services/endPoints/PalliativeEndpoints";

export const fetchPalliativeUnits = async () => {
  try {
    const response = await Api.get(palliativeRoutes.fetchPalliativeUnits);
    return response;
  } catch (error) {
    console.error("Error fetching palliative units:", error);
    return { data: [] };
  }
};
 


export const searchPalliativeUnit = async (searchInp) => {
    try {
      const response = await Api.get(palliativeRoutes.searchPalliativeUnit, {
        searchInp,
      });
      return response;
    } catch (error) {
      console.error("Error searching palliative unit:", error);
      return { data: [] };
    }
  };
  