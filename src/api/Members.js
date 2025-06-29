import Api from "../services/axios";
import membersRoutes from "../services/endPoints/MembersEndpoints";

export const fetchDoctors = async () => {
  try {
    const response = await Api.get(membersRoutes.fetchDoctors);
    return response;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { data: [] };
  }
};

export const searchDoctors = async (searchInp) => {
  try {
    const response = await Api.post(membersRoutes.searchDoctors, { searchInp });
    return response;
  } catch (error) {
    console.error("Error searching doctors:", error);
    return { data: [] };
  }
};

export const filterDoctors = async (filter) => {
  try {
    const response = await Api.post(membersRoutes.filterDoctors, { filter });
    return response;
  } catch (error) {
    console.error("Error filtering doctors:", error);
    return { data: [] };
  }
};