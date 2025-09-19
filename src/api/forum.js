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
  timestamp: new Date().toISOString(),
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
    details: error.response?.data || {},
  };
};

/**
 * Validate required fields in request data
 * @param {Object} data - Request data
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {Object} Validation result with isValid flag and error message
 */
const validateFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
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
      throw new Error("Thread ID is required");
    }

    const response = await Api.get(`${forumRoutes.fetchThread}/${threadId}`);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "fetch thread");
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
    return formatError(error, "fetch threads");
  }
};

/**
 * Compress an image file to reduce size
 * @param {File} imageFile - The image file to compress
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>} Compressed image file
 */
const compressImage = (
  imageFile,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        imageFile.type,
        quality
      );
    };

    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Process files for upload - compress images if needed
 * @param {File[]} files - Array of files to process
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<File[]>} Processed files
 */
const processFilesForUpload = async (files, onProgress) => {
  const processedFiles = [];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit per file

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let processedFile = file;

    try {
      // Compress images if they're too large
      if (file.type.startsWith("image/") && file.size > MAX_FILE_SIZE) {
        console.log(
          `Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB)`
        );
        processedFile = await compressImage(file, 1920, 1080, 0.7);
        console.log(
          `Compressed to: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`
        );
      }

      // For non-image files, check if they exceed reasonable limits
      if (!file.type.startsWith("image/") && file.size > 25 * 1024 * 1024) {
        // 25MB for documents
        console.warn(
          `File ${file.name} is very large (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB) and may cause upload issues`
        );
      }

      processedFiles.push(processedFile);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          fileName: file.name,
          processed: processedFile !== file,
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Use original file if processing fails
      processedFiles.push(file);
    }
  }

  return processedFiles;
};

/**
 * Create a new thread with enhanced error handling and file processing
 * @param {Object} threadData - Thread data including title, content, authorId, tags, and optional file
 * @param {Function} onProgress - Progress callback for file processing
 * @returns {Promise<Object>} Response with created thread data or error
 */
export const createThread = async (threadData, onProgress) => {
  // Validate required fields
  const validation = validateFields(threadData, [
    "title",
    "content",
    "authorId",
  ]);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    let requestData;
    let config = {};

    // Handle file upload if present
    if (
      (threadData.file &&
        Array.isArray(threadData.file) &&
        threadData.file.length > 0) ||
      (threadData.file && !Array.isArray(threadData.file))
    ) {
      // Pre-upload size check to prevent 413 errors
      const uploadFiles = Array.isArray(threadData.file)
        ? threadData.file
        : [threadData.file];

      const totalSize = uploadFiles.reduce((sum, file) => sum + file.size, 0);
      const totalSizeMB = totalSize / (1024 * 1024);

      // If total size is very large, return early with helpful message
      if (totalSize > 100 * 1024 * 1024) {
        // 100MB limit
        return {
          success: false,
          error: `Upload too large (${totalSizeMB.toFixed(
            1
          )}MB). Please upload smaller files or fewer files at once.`,
          status: 413,
          timestamp: new Date().toISOString(),
          details: {
            totalSizeMB: totalSizeMB.toFixed(1),
            fileCount: uploadFiles.length,
            suggestions: [
              "Upload files one by one instead of all together",
              "Compress large images before uploading",
              "Use files smaller than 10MB each",
              "Try uploading only 2-3 files at a time",
            ],
          },
        };
      }

      // Process files (compress images, validate sizes)
      const processedFiles = await processFilesForUpload(
        uploadFiles,
        onProgress
      );

      // Create FormData
      const formData = new FormData();

      // Add basic fields
      formData.append("title", threadData.title);
      formData.append("content", threadData.content);
      formData.append("authorId", threadData.authorId);

      // Add tags as JSON string
      const tagsArray = Array.isArray(threadData.tags)
        ? threadData.tags
        : threadData.tags
        ? [threadData.tags]
        : [];
      formData.append("tags", JSON.stringify(tagsArray));

      // Add processed files
      processedFiles.forEach((file) => {
        formData.append("file", file);
      });

      requestData = formData;

      // Don't set Content-Type header - let the browser set it with boundary
      config = {
        timeout: 120000, // 2 minutes timeout for large files
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      };
    } else {
      // No files - send as JSON
      requestData = {
        ...threadData,
        tags: Array.isArray(threadData.tags)
          ? threadData.tags
          : threadData.tags
          ? [threadData.tags]
          : [],
      };
    }

    const response = await Api.post(forumRoutes.addThread, requestData, config);
    return formatResponse(response);
  } catch (error) {
    console.log("Upload error details:", {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    // Enhanced error handling for different scenarios
    if (error.code === "ECONNABORTED") {
      return {
        success: false,
        error:
          "Upload timeout. Please try with smaller files or check your internet connection.",
        status: 408,
        timestamp: new Date().toISOString(),
      };
    }

    // Check for 413 error in multiple ways as different servers/proxies handle it differently
    if (
      error.response?.status === 413 ||
      error.message?.includes("413") ||
      error.message?.toLowerCase().includes("request entity too large") ||
      error.message?.toLowerCase().includes("payload too large") ||
      (error.code === "ERR_BAD_REQUEST" && error.message?.includes("413"))
    ) {
      return {
        success: false,
        error: "Uploaded files are too large. Try uploading smaller ones.",
        status: 413,
        timestamp: new Date().toISOString(),
      };
    }

    if (error.response?.status === 507) {
      return {
        success: false,
        error:
          "Server storage is full. Please try again later or contact support.",
        status: 507,
        timestamp: new Date().toISOString(),
      };
    }

    if (error.response?.status === 415) {
      return {
        success: false,
        error:
          "One or more files have an unsupported format. Please check file types.",
        status: 415,
        timestamp: new Date().toISOString(),
      };
    }

    // Network errors - but check if it might be a 413 error first
    if (!error.response) {
      // Sometimes 413 errors come through as network errors without a proper response
      // Check the error message for clues
      if (
        error.message?.includes("413") ||
        error.message?.toLowerCase().includes("request entity too large") ||
        error.message?.toLowerCase().includes("payload too large") ||
        error.message?.toLowerCase().includes("too large")
      ) {
        return {
          success: false,
          error: "Uploaded files are too large. Try uploading smaller ones.",
          status: 413,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error:
          "Network error. Please check your internet connection and try again.",
        status: 0,
        timestamp: new Date().toISOString(),
      };
    }

    return formatError(error, "create thread");
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
      error: "Thread ID is required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.post(forumRoutes.deleteThread, { threadId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "delete thread");
  }
};

/**
 * Search for threads
 * @param {string} searchInput - Search query
 * @returns {Promise<Object>} Response with search results or error
 */
export const searchThreads = async (searchInput) => {
  if (!searchInput || searchInput.trim() === "") {
    return {
      success: false,
      error: "Search input is required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.post(forumRoutes.threadSearch, {
      searchInp: searchInput,
    });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "search threads");
  }
};

/**
 * Filter threads by criteria
 * @param {string} filter - Filter criteria ('MostShared' or 'MostLiked')
 * @returns {Promise<Object>} Response with filtered threads or error
 */
export const filterThreads = async (filter) => {
  const validFilters = ["MostShared", "MostLiked"];

  if (!filter || !validFilters.includes(filter)) {
    return {
      success: false,
      error: `Invalid filter. Must be one of: ${validFilters.join(", ")}`,
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.post(forumRoutes.threadFilter, { filter });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "filter threads");
  }
};

/**
 * Edit an existing thread
 * @param {Object} threadData - Updated thread data including _id, title, content, authorId, and tags
 * @returns {Promise<Object>} Response with updated thread data or error
 */
export const editThread = async (threadData) => {
  const validation = validateFields(threadData, [
    "_id",
    "title",
    "content",
    "authorId",
  ]);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Ensure tags are properly formatted in the request body
    const requestData = {
      ...threadData,
      tags: threadData.tags
        ? Array.isArray(threadData.tags)
          ? threadData.tags
          : [threadData.tags]
        : [],
    };

    const response = await Api.patch(forumRoutes.editThread, requestData);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "edit thread");
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
      error: "Thread ID and User ID are required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.patch(forumRoutes.threadUpvote, {
      threadId,
      userId,
    });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "upvote thread");
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
      error: "Thread ID and User ID are required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.patch(forumRoutes.threadDownvote, {
      threadId,
      userId,
    });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "downvote thread");
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
      error: "Thread ID is required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.patch(forumRoutes.threadShares, { threadId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "share thread");
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
  const validation = validateFields(commentData, [
    "threadId",
    "authorId",
    "content",
  ]);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.post(forumRoutes.addComment, commentData);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "add comment");
  }
};

/**
 * Edit an existing comment
 * @param {Object} commentData - Updated comment data including _id, threadId, authorId, and content
 * @returns {Promise<Object>} Response with updated comment data or error
 */
export const editComment = async (commentData) => {
  const validation = validateFields(commentData, [
    "_id",
    "threadId",
    "authorId",
    "content",
  ]);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.patch(forumRoutes.editComment, commentData);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "edit comment");
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
      error: "Comment ID is required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.post(forumRoutes.deleteComment, { commentId });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "delete comment");
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
      error: "Comment ID and User ID are required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.patch(forumRoutes.commentLikes, {
      commentId,
      userId,
    });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "like comment");
  }
};

/**
 * Dislike a comment
 * @param {string} commentId - ID of the comment to dislike
 * @param {string} userId - ID of the user performing the dislike
 * @returns {Promise<Object>} Response with updated comment data or error
 */
/**
 * Fetch all available thread tags
 * @returns {Promise<Object>} Response with tags data or error
 */
export const fetchTags = async () => {
  try {
    const response = await Api.get(forumRoutes.fetchtags);
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "fetch tags");
  }
};

export const dislikeComment = async (commentId, userId) => {
  if (!commentId || !userId) {
    return {
      success: false,
      error: "Comment ID and User ID are required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.patch(forumRoutes.commentDislikes, {
      commentId,
      userId,
    });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "dislike comment");
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
      error: "Comment ID, User ID, and content are required",
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await Api.patch(forumRoutes.realTimeReplies, {
      commentId,
      userId,
      content,
    });
    return formatResponse(response);
  } catch (error) {
    return formatError(error, "add reply");
  }
};
