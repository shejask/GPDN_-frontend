import Api from "../services/axios";
import blogRoute from "../services/endPoints/blogEndpoints";

export const fetchBlogs = async () => {
  try {
    const response = await Api.get(blogRoute.FetchNewsAndBlogs);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch blogs",
      data: []
    };
  }
};

export const searchBlogs = async (searchInp) => {
  try {
    const response = await Api.post(blogRoute.SearchNewsAndBlogs, { searchInp });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error searching blogs:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to search blogs",
      data: []
    };
  }
};

export const likeBlog = async (BlogId, userId) => {
  try {
    const response = await Api.patch(blogRoute.likeNewsAndBlogs, { BlogId, userId });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error liking blog:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to like blog"
    };
  }
};

export const dislikeBlog = async (BlogId, userId) => {
  try {
    const response = await Api.patch(blogRoute.dislikeNewsAndBlogs, { BlogId, userId });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error disliking blog:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to dislike blog"
    };
  }
};

// Helper function to get like and comment counts
export const getBlogStats = (blog) => {
  return {
    likeCount: blog.likes?.length || 0,
    dislikeCount: blog.dislikes?.length || 0,
    commentCount: blog.comments?.length || 0,
    isLiked: (userId) => blog.likes?.includes(userId) || false,
    isDisliked: (userId) => blog.dislikes?.includes(userId) || false
  };
};

// Comment-related functions
export const addComment = async (blogId, authorId, content) => {
  try {
    const response = await Api.post(blogRoute.addComment, {
      blogId,
      authorId,
      content
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add comment"
    };
  }
};

export const editComment = async (commentId, blogId, authorId, content) => {
  try {
    const response = await Api.patch(blogRoute.editComment, {
      _id: commentId,
      blogId,
      authorId,
      content
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error editing comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to edit comment"
    };
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await Api.post(blogRoute.deleteComment, {
      commentId
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete comment"
    };
  }
};
 







