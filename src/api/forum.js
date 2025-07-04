/**
 * Forum API Client
 * Production-grade implementation for thread management
 * 
 * @module forum
 * @author GPDN Team
 * @version 1.0.0
 */

import Api from "../services/axios";
import forumRoutes from "../services/endPoints/forumEndpoints";

/**
 * Standard response formatter
 * @param {Object} response - API response object
 * @returns {Object} Formatted response with success flag and data
 */
const formatResponse = (response) => ({
  success: true,
  data: response.data,
  status: response.status,
  timestamp: new Date().toISOString()
});

/**
 * Standard error formatter
 * @param {Error} error - Error object from API call
 * @param {string} operation - Description of the operation that failed
 * @returns {Object} Formatted error with success flag and error details
 */
const formatError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  return {
    success: false,
    error: error.response?.data?.message || `Failed to ${operation}`,
    status: error.response?.status || 500,
    timestamp: new Date().toISOString(),
    details: error.response?.data || {}
  };
};

/**
 * Validate required fields in request data
 * @param {Object} data - Request data
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {Object} Validation result with isValid flag and error message
 */
const validateFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { isValid: true };
};

// ============================================================================
// THREAD OPERATIONS
// ============================================================================

/**
 * Fetch a thread by ID
 * @param {string} threadId - ID of the thread to fetch
 * @returns {Promise<Object>} Response with thread data or error
 */
export const fetchThreadById = async (threadId) => {
  try {
    if (!threadId) {
      throw new Error('Thread ID is required');
    }
    
    const response = await Api.get(`${forumRoutes.fetchThread}/${threadId}`);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'fetch thread');
  }
};

/**
 * Fetch threads from the server
 * @returns {Promise<Object>} Response with threads data or error
 */
export const fetchThreads = async () => {
  try {
    const response = await Api.get(forumRoutes.fetchThread);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'fetch threads');
  }
};

/**
 * Create a new thread
 * @param {Object} threadData - Thread data including title, content, authorId, tags, and optional file
 * @returns {Promise<Object>} Response with created thread data or error
 */
export const createThread = async (threadData) => {
  // Validate required fields
  const validation = validateFields(threadData, ['title', 'content', 'authorId']);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    // Handle file upload if present
    let formData;
    if (threadData.file) {
      formData = new FormData();
      Object.entries(threadData).forEach(([key, value]) => {
        if (key === 'file') {
          formData.append('file', value);
        } else if (key === 'tags') {
          // Ensure tags are always sent as a clean JSON array
          const tagsArray = Array.isArray(value) ? value : [value];
          formData.append('tags', JSON.stringify(tagsArray));
        } else {
          formData.append(key, value);
        }
      });
    }
    
    // Ensure tags are properly formatted in the request body when not using FormData
    let requestData = formData;
    if (!formData) {
      // If not using FormData, ensure tags are properly formatted in the request body
      requestData = {
        ...threadData,
        tags: Array.isArray(threadData.tags) ? threadData.tags : [threadData.tags]
      };
    }
    
    const response = await Api.post(
      forumRoutes.addThread, 
      requestData,
      formData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {}
    );
    
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'create thread');
  }
};

/**
 * Delete a thread
 * @param {string} threadId - ID of the thread to delete
 * @returns {Promise<Object>} Response with deletion status or error
 */
export const deleteThread = async (threadId) => {
  if (!threadId) {
    return {
      success: false,
      error: 'Thread ID is required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.post(forumRoutes.deleteThread, { threadId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'delete thread');
  }
};

/**
 * Search for threads
 * @param {string} searchInput - Search query
 * @returns {Promise<Object>} Response with search results or error
 */
export const searchThreads = async (searchInput) => {
  if (!searchInput || searchInput.trim() === '') {
    return {
      success: false,
      error: 'Search input is required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.post(forumRoutes.threadSearch, { searchInp: searchInput });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'search threads');
  }
};

/**
 * Filter threads by criteria
 * @param {string} filter - Filter criteria ('MostShared' or 'MostLiked')
 * @returns {Promise<Object>} Response with filtered threads or error
 */
export const filterThreads = async (filter) => {
  const validFilters = ['MostShared', 'MostLiked'];
  
  if (!filter || !validFilters.includes(filter)) {
    return {
      success: false,
      error: `Invalid filter. Must be one of: ${validFilters.join(', ')}`,
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.post(forumRoutes.threadFilter, { filter });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'filter threads');
  }
};

/**
 * Edit an existing thread
 * @param {Object} threadData - Updated thread data including _id, title, content, authorId, and tags
 * @returns {Promise<Object>} Response with updated thread data or error
 */
export const editThread = async (threadData) => {
  const validation = validateFields(threadData, ['_id', 'title', 'content', 'authorId']);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    // Ensure tags are properly formatted in the request body
    const requestData = {
      ...threadData,
      tags: threadData.tags ? (Array.isArray(threadData.tags) ? threadData.tags : [threadData.tags]) : []
    };
    
    const response = await Api.patch(forumRoutes.editThread, requestData);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'edit thread');
  }
};

/**
 * Upvote a thread
 * @param {string} threadId - ID of the thread to upvote
 * @param {string} userId - ID of the user performing the upvote
 * @returns {Promise<Object>} Response with updated thread data or error
 */
export const upvoteThread = async (threadId, userId) => {
  if (!threadId || !userId) {
    return {
      success: false,
      error: 'Thread ID and User ID are required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.patch(forumRoutes.threadUpvote, { threadId, userId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'upvote thread');
  }
};

/**
 * Downvote a thread
 * @param {string} threadId - ID of the thread to downvote
 * @param {string} userId - ID of the user performing the downvote
 * @returns {Promise<Object>} Response with updated thread data or error
 */
export const downvoteThread = async (threadId, userId) => {
  if (!threadId || !userId) {
    return {
      success: false,
      error: 'Thread ID and User ID are required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.patch(forumRoutes.threadDownvote, { threadId, userId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'downvote thread');
  }
};

/**
 * Increment share count for a thread
 * @param {string} threadId - ID of the thread being shared
 * @returns {Promise<Object>} Response with updated thread data or error
 */
export const shareThread = async (threadId) => {
  if (!threadId) {
    return {
      success: false,
      error: 'Thread ID is required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.patch(forumRoutes.threadShares, { threadId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'share thread');
  }
};

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

/**
 * Add a comment to a thread
 * @param {Object} commentData - Comment data including threadId, authorId, and content
 * @returns {Promise<Object>} Response with created comment data or error
 */
export const addComment = async (commentData) => {
  const validation = validateFields(commentData, ['threadId', 'authorId', 'content']);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.post(forumRoutes.addComment, commentData);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'add comment');
  }
};

/**
 * Edit an existing comment
 * @param {Object} commentData - Updated comment data including _id, threadId, authorId, and content
 * @returns {Promise<Object>} Response with updated comment data or error
 */
export const editComment = async (commentData) => {
  const validation = validateFields(commentData, ['_id', 'threadId', 'authorId', 'content']);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.patch(forumRoutes.editComment, commentData);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'edit comment');
  }
};

/**
 * Delete a comment
 * @param {string} commentId - ID of the comment to delete
 * @returns {Promise<Object>} Response with deletion status or error
 */
export const deleteComment = async (commentId) => {
  if (!commentId) {
    return {
      success: false,
      error: 'Comment ID is required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.post(forumRoutes.deleteComment, { commentId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'delete comment');
  }
};

/**
 * Like a comment
 * @param {string} commentId - ID of the comment to like
 * @param {string} userId - ID of the user performing the like
 * @returns {Promise<Object>} Response with updated comment data or error
 */
export const likeComment = async (commentId, userId) => {
  if (!commentId || !userId) {
    return {
      success: false,
      error: 'Comment ID and User ID are required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.patch(forumRoutes.commentLikes, { commentId, userId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'like comment');
  }
};

/**
 * Dislike a comment
 * @param {string} commentId - ID of the comment to dislike
 * @param {string} userId - ID of the user performing the dislike
 * @returns {Promise<Object>} Response with updated comment data or error
 */
export const dislikeComment = async (commentId, userId) => {
  if (!commentId || !userId) {
    return {
      success: false,
      error: 'Comment ID and User ID are required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.patch(forumRoutes.commentDislikes, { commentId, userId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'dislike comment');
  }
};

/**
 * Add a real-time reply to a comment
 * @param {string} commentId - ID of the comment to reply to
 * @param {string} userId - ID of the user creating the reply
 * @param {string} content - Content of the reply
 * @returns {Promise<Object>} Response with updated comment data or error
 */
export const addReply = async (commentId, userId, content) => {
  if (!commentId || !userId || !content) {
    return {
      success: false,
      error: 'Comment ID, User ID, and content are required',
      status: 400,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await Api.patch(forumRoutes.realTimeReplies, { commentId, userId, content });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, 'add reply');
  }
};
  