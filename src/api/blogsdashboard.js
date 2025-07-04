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

// Fetch a blog by ID
export const fetchBlogById = async (blogId) => {
  try {
    const response = await Api.post(blogRoute.FetchNewsAndBlogsById, {
      _id: blogId
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch blog",
      data: null
    };
  }
};

// Comment likes
export const likeComment = async (commentId, userId) => {
  try {
    const response = await Api.patch(blogRoute.commentlikes, {
      commentId,
      userId
    });
    console.log('Like comment response:', response);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error liking comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to like comment"
    };
  }
};

// Comment dislikes
export const dislikeComment = async (commentId, userId) => {
  try {
    const response = await Api.patch(blogRoute.commentdislikes, {
      commentId,
      userId
    });
    console.log('Dislike comment response:', response);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error disliking comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to dislike comment"
    };
  }
};

// Add reply to a comment
export const addReply = async (commentId, userId, content) => {
  try {
    const response = await Api.patch(blogRoute.realtimeReplies, {
      commentId,
      userId,
      content
    });
    console.log('Add reply response:', response);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error adding reply:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add reply"
    };
  }
};

// Filter blogs by date
export const filterBlogsByDate = async (date) => {
  try {
    const response = await Api.post(blogRoute.filterNewsAndBlogs, {
      filter: "Date",
      date: date
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error filtering blogs by date:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to filter blogs by date",
      data: []
    };
  }
};

// Filter blogs by category using filterNewsAndBlogs endpoint
export const filterBlogsByCategory = async (category) => {
  try {
    const response = await Api.post(blogRoute.filterNewsAndBlogs, {
      filter: "Category",
      category: category,
      date: ""
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error filtering blogs by category:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to filter blogs by category",
      data: []
    };
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    // This endpoint will return all available categories
    const response = await Api.post(blogRoute.filterNewsAndBlogs, {
      filter: "Category",
      date: ""
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch categories",
      data: []
    };
  }
};

// Get blogs by specific category
export const getBlogsByCategory = async (category) => {
  try {
    const response = await Api.post(blogRoute.filterBlogsbyCategory, {
      category: category
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch blogs by category",
      data: []
    };
  }
};
