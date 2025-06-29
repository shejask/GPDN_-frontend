import Api from "../services/axios";
import blogRoute from "../services/endPoints/blogEndpoints";





export const fetchBlogs = async () => {
  try {
    const response = await Api.get(blogRoute.FetchNewsAndBlogs);
    return response;
  } catch (error) {
    console.log(error)
  }
};

export const searchBlogs = async (searchInp) => {
  try {
    const response = await Api.post(blogRoute.SearchNewsAndBlogs,{searchInp});
    return response;
  } catch (error) {
    console.log(error)
  }
};



export const filterBlogs = async (topic) => {
  try {
    const response = await Api.post(blogRoute.filterNewsAndBlogs , {topic});
    return response;
  } catch (error) {
    console.log(error)
  }
};


