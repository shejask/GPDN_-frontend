import Api from "../services/axios";
import forumRoutes from "../services/endPoints/forumEndpoints";

// Thread Fetching
export const fetchThreads = async (page = 1, limit = 10) => {
  try {
    const response = await Api.get(forumRoutes.Threadfetch, {
      params: {
        page,
        limit
      }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching threads:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch threads",
      data: []
    };
  }
};

// Thread Creation and Modification
export const createThread = async (threadData) => {
  try {
    const response = await Api.post(forumRoutes.AddThread, threadData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create thread"
    };
  }
};

export const editThread = async (threadId, updatedData) => {
  try {
    const response = await Api.put(forumRoutes.EditThread, {
      threadId,
      ...updatedData
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error editing thread:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to edit thread"
    };
  }
};

export const deleteThread = async (threadId) => {
  try {
    const response = await Api.delete(forumRoutes.DeleteThread, {
      data: { threadId }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error deleting thread:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete thread"
    };
  }
};

// Thread Interactions
export const upvoteThread = async (threadId, userId) => {
  try {
    const response = await Api.patch(forumRoutes.ThreadUpvote, {
      threadId,
      userId
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error upvoting thread:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to upvote thread"
    };
  }
};

export const downvoteThread = async (threadId, userId) => {
  try {
    const response = await Api.patch(forumRoutes.ThreadDownvote, {
      threadId,
      userId
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error downvoting thread:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to downvote thread"
    };
  }
};

export const shareThread = async (threadId) => {
  try {
    const response = await Api.patch(forumRoutes.ThreadShares, {
      threadId: threadId
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error sharing thread:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to share thread"
    };
  }
};

// Thread Discovery
export const filterThreads = async (filterCriteria) => {
  try {
    const response = await Api.post(forumRoutes.ThreadFilter, filterCriteria);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error filtering threads:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to filter threads",
      data: []
    };
  }
};



// Thread Search
export const searchThreads = async (searchInp) => {
  try {
    const response = await Api.post('/thread/ThreadSearch', {
      searchInp: searchInp
    });

    // Check if response exists and has data
    if (response && response.data) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: "No results found",
      data: []
    };
  } catch (error) {
    console.error("Error searching threads:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to search threads",
      data: []
    };
  }
};





// Comment Operations
export const addComment = async (threadId, commentData) => {
  try {
    const response = await Api.post(forumRoutes.AddComment, {
      threadId,
      ...commentData
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

export const editComment = async (commentId, updatedContent) => {
  try {
    const response = await Api.put(forumRoutes.EditComment, {
      commentId,
      content: updatedContent
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
    const response = await Api.delete(forumRoutes.DeleteComment, {
      data: { commentId }
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

export const likeComment = async (commentId) => {
  try {
    const response = await Api.post(forumRoutes.CommentLikes, { commentId });
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

export const dislikeComment = async (commentId) => {
  try {
    const response = await Api.post(forumRoutes.CommentDislikes, { commentId });
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

export const getRealTimeReplies = async (commentId, page = 1, limit = 10) => {
  try {
    const response = await Api.get(`${forumRoutes.RealTimeReplies}/${commentId}`, {
      params: {
        page,
        limit
      }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching real-time replies:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch replies",
      data: []
    };
  }
};

