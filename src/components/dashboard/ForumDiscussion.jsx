"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from 'antd';
import message from '@/utils/message';
import Link from 'next/link';
import { 
  ArrowUpOutlined, 
  SearchOutlined, 
  ShareAltOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { MdChatBubbleOutline, MdDashboard, MdOutlineSettings } from 'react-icons/md';
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";

// Import your assets
import logo from '../../app/assets/registation/logo.png';
import azeem from '../../app/assets/registation/Frame.png';

// Import API functions
import { 
  fetchThreads, 
  addComment, 
  upvoteThread, 
  downvoteThread,
  shareThread,
  searchThreads,
  filterThreads,
  likeComment,
  dislikeComment,
  deleteComment,
  editComment,
  addReply
} from '../../api/forum';

// ============================================================================
// SKELETON LOADERS
// ============================================================================

const PostSkeleton = () => (
  <div className="mb-6 p-5 border border-gray-100 rounded-lg animate-pulse">
    {/* Author skeleton */}
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-2 mb-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    
    {/* Tags skeleton */}
    <div className="flex gap-2 mb-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-6 bg-gray-200 rounded-full w-20"></div>
      ))}
    </div>
    
    {/* Actions skeleton */}
    <div className="flex items-center gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-8 bg-gray-200 rounded-lg w-24"></div>
      ))}
    </div>
  </div>
);

const TagsSkeleton = () => (
  <div className="w-64 bg-white p-5 fixed right-0 h-screen overflow-y-auto">
    <div className="h-6 bg-gray-200 rounded w-16 mb-4"></div>
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="h-7 bg-gray-200 rounded-full w-20 animate-pulse"></div>
      ))}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ForumDiscussion = () => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Comment state
  const [openCommentId, setOpenCommentId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [title, setTitle] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [threadComments, setThreadComments] = useState({}); // Store comments by threadId
  const [commentsLoading, setCommentsLoading] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [commentActionLoading, setCommentActionLoading] = useState({});
  
  // Action states
  const [actionLoading, setActionLoading] = useState({});

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  
  /**
   * Get current user ID from localStorage
   */
  const getCurrentUserId = useCallback(() => {
    try {
      const userId = localStorage.getItem('userId');
      return userId || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }, []);

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.push('http://localhost:3000/signin');
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        router.push('http://localhost:3000/signin');
      }
    };
    
    checkAuth();
  }, [router]);

  // ========================================================================
  // CONSTANTS
  // ========================================================================
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000;

  const tags = [
    'Pain Management', 'Ethical Issues', 'End-of-Life Care', 'Spiritual Care',
    'Psychosocial Support', 'New Virus', 'Symptom Control', 'Lifestyle',
    'Caregiver Support', 'Pediatric Palliative Care'
  ];

  const sidebarMenus = [
    { menu: 'Forum', icon: <MdDashboard />, link: '/forum' },
    { menu: 'Resource Library', icon: <FaRegFolder />, link: '/resource-library' },
    { menu: 'Members', icon: <TbUsers />, link: '/members' },
    { menu: 'Palliative Units', icon: <PiBuildings />, link: '/palliative-units' },
    { menu: 'News & Blogs', icon: <IoNewspaperOutline />, link: '/news-blogs' },
    { menu: 'Settings', icon: <MdOutlineSettings />, link: '/settings' }
  ];

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  /**
   * Transform API thread data to component-friendly format
   */
  const transformThreadToPost = useCallback((thread) => {
    if (!thread) return null;

    try {
      // Parse tags safely
      let parsedTags = [];
      if (thread.tags?.length > 0) {
        // Try to parse the first element if it's a JSON string
        try {
          const tagItem = thread.tags[0];
          if (typeof tagItem === 'string') {
            // Handle case where tag is a JSON string array
            if (tagItem.startsWith('["') && tagItem.endsWith('"]')) {
              parsedTags = JSON.parse(tagItem);
            } 
            // Handle case where tag is a plain JSON array
            else if (tagItem.startsWith('[') && tagItem.endsWith(']')) {
              parsedTags = JSON.parse(tagItem);
            }
            // Handle plain string tags
            else {
              parsedTags = [tagItem];
            }
          } else {
            // If not a string, use as is
            parsedTags = Array.isArray(thread.tags) ? thread.tags : [];
          }
        } catch (parseError) {
          console.error('Error parsing tags:', parseError);
          parsedTags = Array.isArray(thread.tags) ? thread.tags : [];
        }
      }

      // Format time safely
      const formatTime = (dateString) => {
        try {
          const date = new Date(dateString);
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        } catch {
          return 'Unknown time';
        }
      };

      // Strip HTML tags safely
      const stripHtml = (html) => {
        if (!html) return '';
        try {
          const tmp = document.createElement('div');
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || '';
        } catch {
          return html;
        }
      };

      return {
        id: thread._id,
        author: thread.authorId?.fullName || 'Anonymous',
        title: thread.title,
        time: formatTime(thread.createdAt),
        content: stripHtml(thread.content),
        tags: parsedTags,
        upvotes: thread.upVote?.length || 0,
        downvotes: thread.downVote?.length || 0,
        shares: thread.shares || 0,
        comments: thread.comments?.length || 0,
        hasImage: !!thread.thumbnail,
        image: thread.thumbnail || null,
        verified: Boolean(thread.authorId?.hasFormalTrainingInPalliativeCare),
        authorId: thread.authorId?._id,
        authorImage: thread.authorId?.imageURL || null
      };
    } catch (error) {
      console.error('Error transforming thread:', error);
      return null;
    }
  }, []);

  /**
   * Utility function for delays
   */
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // ========================================================================
  // API FUNCTIONS
  // ========================================================================

  /**
   * Load threads with retry logic
   */
  const loadThreads = useCallback(async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchThreads();
      
      // Debug: Log the actual response structure
      console.log('API Response Structure:', {
        success: response.success,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        data: response.data
      });

      if (response.success) {
        // Handle different response structures
        let threadsArray;
        
        if (Array.isArray(response.data)) {
          // Direct array response
          threadsArray = response.data;
        } else if (response.data && response.data.threads && Array.isArray(response.data.threads)) {
          // Nested threads array
          threadsArray = response.data.threads;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Double nested data
          threadsArray = response.data.data;
        } else if (response.data) {
          // Single thread object or other structure - wrap in array
          threadsArray = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          // Fallback to empty array if no valid data
          threadsArray = [];
        }
        
        console.log('Threads array:', threadsArray);
        
        const transformedPosts = threadsArray
          .map(transformThreadToPost)
          .filter(Boolean); // Remove null entries

        setPosts(transformedPosts);
        setRetryCount(0);
      } else {
        throw new Error(response.error || 'Failed to fetch threads');
      }
    } catch (err) {
      console.error('Error loading threads:', err);

      if (retryAttempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying... Attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS}`);
        await delay(RETRY_DELAY * Math.pow(2, retryAttempt)); // Exponential backoff
        return loadThreads(retryAttempt + 1);
      }

      setError(err.message || 'Failed to load threads');
      setRetryCount(retryAttempt + 1);
    } finally {
      setLoading(false);
    }
  }, [transformThreadToPost]);

  /**
   * Handle search functionality
   */
  const handleSearch = useCallback(async (searchValue) => {
    if (!searchValue.trim()) {
      loadThreads();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const response = await searchThreads(searchValue.trim());

      if (response.success && response.data) {
        // Handle different response structures (same as loadThreads)
        let threadsArray;
        
        if (Array.isArray(response.data)) {
          threadsArray = response.data;
        } else if (response.data.threads && Array.isArray(response.data.threads)) {
          threadsArray = response.data.threads;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          threadsArray = response.data.data;
        } else {
          threadsArray = [response.data];
        }
        
        const transformedPosts = threadsArray
          .map(transformThreadToPost)
          .filter(Boolean);

        setPosts(transformedPosts);
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      message.error(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [transformThreadToPost, loadThreads]);

  /**
   * Handle thread filtering
   */
  const handleFilter = useCallback(async (filterType) => {
    try {
      setLoading(true);
      setError(null);

      const response = await filterThreads(filterType);

      if (response.success && response.data) {
        // Handle different response structures (same as loadThreads)
        let threadsArray;
        
        if (Array.isArray(response.data)) {
          threadsArray = response.data;
        } else if (response.data.threads && Array.isArray(response.data.threads)) {
          threadsArray = response.data.threads;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          threadsArray = response.data.data;
        } else {
          threadsArray = [response.data];
        }
        
        const transformedPosts = threadsArray
          .map(transformThreadToPost)
          .filter(Boolean);

        setPosts(transformedPosts);
        message.success(`Filtered by ${filterType}`);
      } else {
        throw new Error(response.error || 'Filter failed');
      }
    } catch (err) {
      console.error('Filter error:', err);
      message.error(err.message || 'Filter failed');
    } finally {
      setLoading(false);
    }
  }, [transformThreadToPost]);

  /**
   * Handle thread upvote
   */
  const handleUpvote = useCallback(async (threadId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to vote');
      return;
    }

    const actionKey = `upvote-${threadId}`;
    
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));

      const response = await upvoteThread(threadId, currentUserId);

      if (response.success) {
        // Refresh thread data for real-time updates
        await loadThreads();
        message.success('Thread upvoted successfully');
      } else {
        throw new Error(response.error || 'Failed to upvote');
      }
    } catch (err) {
      console.error('Upvote error:', err);
      message.error(err.message || 'Failed to upvote thread');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getCurrentUserId, loadThreads]);

  /**
   * Handle thread downvote
   */
  const handleDownvote = useCallback(async (threadId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to vote');
      return;
    }

    const actionKey = `downvote-${threadId}`;
    
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));

      const response = await downvoteThread(threadId, currentUserId);

      if (response.success) {
        // Refresh thread data for real-time updates
        await loadThreads();
        message.success('Thread downvoted successfully');
      } else {
        throw new Error(response.error || 'Failed to downvote');
      }
    } catch (err) {
      console.error('Downvote error:', err);
      message.error(err.message || 'Failed to downvote thread');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getCurrentUserId, loadThreads]);

  /**
   * Handle thread sharing
   */
  const handleShare = useCallback(async (threadId) => {
    const actionKey = `share-${threadId}`;
    
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));

      const response = await shareThread(threadId);

      if (response.success) {
        // Refresh thread data for real-time updates
        await loadThreads();
        
        message.success('Thread shared successfully');
        
        // Copy link to clipboard if supported
        if (navigator.clipboard) {
          const shareUrl = `${window.location.origin}/forum/thread/${threadId}`;
          await navigator.clipboard.writeText(shareUrl);
          message.info('Link copied to clipboard');
        }
      } else {
        throw new Error(response.error || 'Failed to share');
      }
    } catch (err) {
      console.error('Share error:', err);
      message.error(err.message || 'Failed to share thread');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [loadThreads]);

  /**
   * Fetch comments for a specific thread
   */
  const fetchCommentsForThread = useCallback(async (threadId) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [threadId]: true }));
      
      // Since there's no specific endpoint for fetching comments,
      // we'll fetch the thread data and extract comments from it
      const response = await fetchThreads();
      
      if (response.success) {
        let threadsArray;
        
        if (Array.isArray(response.data)) {
          threadsArray = response.data;
        } else if (response.data && response.data.threads && Array.isArray(response.data.threads)) {
          threadsArray = response.data.threads;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          threadsArray = response.data.data;
        } else if (response.data) {
          threadsArray = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          threadsArray = [];
        }
        
        // Debug the thread structure
        console.log('Threads array for comments:', threadsArray);
        
        const thread = threadsArray.find(t => t._id === threadId);
        if (thread && thread.comments) {
          const comments = Array.isArray(thread.comments) ? thread.comments : [];
          
          // Debug the comment structure
          console.log('Comments for thread:', threadId, comments);
          
          // Process each comment to ensure replies are properly formatted
          const processedComments = comments.map(comment => {
            // Debug individual comment structure
            console.log('Comment structure:', comment);
            
            // Ensure reply field exists and is properly formatted
            const reply = comment.reply || [];
            console.log('Reply structure:', reply);
            
            return {
              ...comment,
              reply: Array.isArray(reply) ? reply : [],
              likes: Array.isArray(comment.likes) ? comment.likes : [],
              dislikes: Array.isArray(comment.dislikes) ? comment.dislikes : []
            };
          });
          
          setThreadComments(prev => ({
            ...prev,
            [threadId]: processedComments
          }));
        } else {
          setThreadComments(prev => ({ ...prev, [threadId]: [] }));
        }
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      message.error('Failed to load comments');
      setThreadComments(prev => ({ ...prev, [threadId]: [] }));
    } finally {
      setCommentsLoading(prev => ({ ...prev, [threadId]: false }));
    }
  }, []);

  /**
   * Handle comment submission
   */
  const handleCommentSubmit = useCallback(async (threadId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to comment');
      return;
    }

    if (!commentText.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    try {
      setCommentLoading(true);

      const response = await addComment({
        threadId,
        authorId: currentUserId,
        content: commentText.trim()
      });

      if (response.success) {
        message.success('Comment added successfully');
        setCommentText('');
        
        // Refresh comments for this thread
        await fetchCommentsForThread(threadId);
        
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === threadId 
            ? { ...post, comments: (post.comments || 0) + 1 }
            : post
        ));
      } else {
        throw new Error(response.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Comment error:', err);
      message.error(err.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  }, [commentText, getCurrentUserId, fetchCommentsForThread]);

  /**
   * Handle comment editing
   */
  const handleEditComment = useCallback(async (commentId, threadId, newContent) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to edit comments');
      return;
    }

    if (!newContent.trim()) {
      message.warning('Comment cannot be empty');
      return;
    }

    const actionKey = `edit-${commentId}`;
    
    try {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: true }));

      const response = await editComment({
        _id: commentId,
        threadId,
        authorId: currentUserId,
        content: newContent.trim()
      });

      if (response.success) {
        message.success('Comment updated successfully');
        setEditingComment(null);
        setEditCommentText('');
        
        // Refresh comments for this thread
        await fetchCommentsForThread(threadId);
      } else {
        throw new Error(response.error || 'Failed to edit comment');
      }
    } catch (err) {
      console.error('Edit comment error:', err);
      message.error(err.message || 'Failed to edit comment');
    } finally {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getCurrentUserId, fetchCommentsForThread]);

  /**
   * Handle comment deletion
   */
  const handleDeleteComment = useCallback(async (commentId, threadId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to delete comments');
      return;
    }

    const actionKey = `delete-${commentId}`;
    
    try {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: true }));
      
      const response = await deleteComment(commentId);

      if (response.success) {
        message.success('Comment deleted successfully');
        
        // Refresh comments for this thread
        await fetchCommentsForThread(threadId);
        
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === threadId 
            ? { ...post, comments: Math.max(0, post.comments - 1) }
            : post
        ));
      } else {
        throw new Error(response.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Delete comment error:', err);
      message.error(err.message || 'Failed to delete comment');
    } finally {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getCurrentUserId, fetchCommentsForThread]);

  /**
   * Handle comment like
   */
  const handleLikeComment = useCallback(async (commentId, threadId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to like comments');
      return;
    }

    const actionKey = `like-${commentId}`;
    
    try {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: true }));
      
      const response = await likeComment(commentId, currentUserId);

      if (response.success) {
        // Update thread comments without full page refresh
        await fetchCommentsForThread(threadId);
        message.success('Comment liked successfully');
      } else {
        throw new Error(response.error || 'Failed to like comment');
      }
    } catch (err) {
      console.error('Like comment error:', err);
      message.error(err.message || 'Failed to like comment');
    } finally {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getCurrentUserId, fetchCommentsForThread]);

  /**
   * Handle comment dislike
   */
  const handleDislikeComment = useCallback(async (commentId, threadId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to dislike comments');
      return;
    }

    const actionKey = `dislike-${commentId}`;
    
    try {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: true }));
      
      const response = await dislikeComment(commentId, currentUserId);

      if (response.success) {
        // Update thread comments without full page refresh
        await fetchCommentsForThread(threadId);
        message.success('Comment disliked successfully');
      } else {
        throw new Error(response.error || 'Failed to dislike comment');
      }
    } catch (err) {
      console.error('Dislike comment error:', err);
      message.error(err.message || 'Failed to dislike comment');
    } finally {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getCurrentUserId, fetchCommentsForThread]);

  const handleAddReply = useCallback(async (commentId, threadId, replyContent) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.warning('Please log in to reply');
      return;
    }

    if (!replyContent.trim()) {
      message.warning('Please enter a reply');
      return;
    }

    const actionKey = `reply-${commentId}`;
    
    try {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: true }));
      
      const response = await addReply(commentId, currentUserId, replyContent.trim());

      if (response.success) {
        message.success('Reply added successfully');
        // Reset reply state
        setReplyingTo(null);
        setReplyText('');
        
        // Refresh comments for this thread
        await fetchCommentsForThread(threadId);
      } else {
        throw new Error(response.error || 'Failed to add reply');
      }
    } catch (err) {
      console.error('Add reply error:', err);
      message.error(err.message || 'Failed to add reply');
    } finally {
      setCommentActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  }, [getCurrentUserId, fetchCommentsForThread]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Load threads on component mount
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        handleSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  // ========================================================================
  // MEMOIZED VALUES
  // ========================================================================

  const emptyStateContent = useMemo(() => {
    if (error) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-3">
              <button
                onClick={() => loadThreads()}
                className="px-6 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] transition-colors inline-flex items-center gap-2"
                disabled={loading}
              >
                <ReloadOutlined spin={loading} />
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
              {retryCount >= MAX_RETRY_ATTEMPTS && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (!loading && posts.length === 0) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center max-w-md">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? 'No threads found' : 'No threads yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No results found for "${searchTerm}"`
                : 'Be the first to start a discussion!'
              }
            </p>
            {!searchTerm && (
              <Link href="/forum/create">
                <button className="px-6 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] transition-colors">
                  Create First Thread
                </button>
              </Link>
            )}
          </div>
        </div>
      );
    }

    return null;
  }, [error, loading, posts.length, searchTerm, retryCount, loadThreads]);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar - Fixed */}
      <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto bg-white z-20">
        <div className="p-5">
          <Image alt="GPDN Logo" src={logo} width={100} className="h-auto" />
        </div>
        
        <nav className="mt-5">
          {sidebarMenus.map((item, index) => (
            <Link key={index} href={item.link} className="block">
              <div className="cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.menu}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content - Adjusted margin for fixed sidebar */}
      <div className="flex-1 ml-64">
        {/* Header - Fixed */}
        <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white fixed w-[calc(100%-256px)] z-10 top-0">
          <h1 className="text-xl font-semibold text-gray-800">Forum Discussion</h1>
          <div className="flex gap-3">
            <Input
              placeholder="Search threads..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              loading={isSearching ? "true" : "false"}
              allowClear
              onClear={() => setSearchTerm('')}
            />
            <Link href="/forum/create">
              <button className="px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] transition-colors">
                Create Thread
              </button>
            </Link>
          </div>
        </div>

        <div className="flex pt-20">
          {/* Posts Section - Scrollable */}
          <div className="w-4/5 p-5 border-r border-gray-200 min-h-screen">
            {loading ? (
              // Skeleton loading state
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {emptyStateContent}
                {posts.map((post) => (
                  <div key={post.id} className="mb-6 p-5 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      {post.authorImage ? (
                        <img
                          alt="User avatar"
                          src={post.authorImage}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Image
                          alt="User avatar"
                          src={azeem}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-800">{post.author}</h3>
                        </div>
                        <span className="text-sm text-gray-500">{post.time}</span>
                      </div>
                    </div>

                    {/* title */}
                    <p className="text-primary-600 font-semibold text-lg mb-3 leading-relaxed">{post.title}</p>
                    
                    {/* Content */}
                    <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                    
                    {/* Image */}
                    {post.hasImage && post.image && (
                      <div className="mb-3">
                        <img
                          src={post.image}
                          alt="Thread attachment"
                          className="rounded-lg w-full max-h-96 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {post.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-[#E3F5FE] text-[#00A99D] rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                      <button
                        onClick={() => handleUpvote(post.id)}
                        disabled={actionLoading[`upvote-${post.id}`]}
                        className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <ArrowUpOutlined className={actionLoading[`upvote-${post.id}`] ? 'animate-spin' : ''} />
                        Upvote · {post.upvotes || 0}
                      </button>
                      
                      <button
                        onClick={() => handleDownvote(post.id)}
                        disabled={actionLoading[`downvote-${post.id}`]}
                        className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <ArrowUpOutlined className={`transform rotate-180 ${actionLoading[`downvote-${post.id}`] ? 'animate-spin' : ''}`} />
                        Downvote · {post.downvotes || 0}
                      </button>
                      
                      <button
                        onClick={() => {
                          const newOpenId = openCommentId === post.id ? null : post.id;
                          setOpenCommentId(newOpenId);
                          if (newOpenId) {
                            fetchCommentsForThread(post.id);
                          }
                        }}
                        className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MdChatBubbleOutline />
                        Comments · {post.comments || 0}
                      </button>
                      
                      <button
                        onClick={() => handleShare(post.id)}
                        disabled={actionLoading[`share-${post.id}`]}
                        className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <ShareAltOutlined className={actionLoading[`share-${post.id}`] ? 'animate-spin' : ''} />
                        Share · {post.shares || 0}
                      </button>
                    </div>

                    {/* Comment Section */}
                    {openCommentId === post.id && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        {/* Comment Input */}
                        <div className="flex gap-3 items-start mb-4">
                         
                          <div className="flex-1">
                            <Input.TextArea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a thoughtful comment..."
                              autoSize={{ minRows: 2, maxRows: 6 }}
                              className="w-full rounded-lg border border-gray-200"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={commentLoading || !commentText.trim()}
                                className="px-4 py-1.5 bg-[#00A99D] text-white rounded-lg text-sm hover:bg-[#008F84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {commentLoading ? 'Posting...' : 'Post Comment'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Comments Display */}
                        <div className="space-y-4">
                          {commentsLoading[post.id] ? (
                            <div className="space-y-4">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                                      <div className="h-2 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="flex gap-2">
                                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : threadComments[post.id]?.length > 0 ? (
                            threadComments[post.id].map((comment) => (
                              <div key={comment._id} className="flex gap-3">
                                {comment.authorId?.imageURL ? (
                                  <img
                                    alt="Commenter"
                                    src={comment.authorId.imageURL}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <Image
                                    alt="Commenter"
                                    src={azeem}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm text-gray-800">
                                        {comment.authorId?.fullName || 'Anonymous'}
                                      </h4>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </span>
                                    </div>
                                    
                                    {/* Comment Actions Menu */}
                                    {comment.authorId?._id === getCurrentUserId() && (
                                      <div className="relative inline-block text-left">
                                        <div className="flex space-x-2">
                                          <button 
                                            onClick={() => {
                                              setEditingComment(comment._id);
                                              setEditCommentText(comment.content);
                                            }}
                                            disabled={commentActionLoading[`edit-${comment._id}`]}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                          >
                                            Edit
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteComment(comment._id, post.id)}
                                            disabled={commentActionLoading[`delete-${comment._id}`]}
                                            className="text-xs text-red-600 hover:text-red-800"
                                          >
                                            {commentActionLoading[`delete-${comment._id}`] ? 'Deleting...' : 'Delete'}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Comment Content or Edit Form */}
                                  {editingComment === comment._id ? (
                                    <div className="mt-2">
                                      <Input.TextArea
                                        value={editCommentText}
                                        onChange={(e) => setEditCommentText(e.target.value)}
                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                        className="w-full rounded-lg border border-gray-200"
                                      />
                                      <div className="flex justify-end mt-2 space-x-2">
                                        <button
                                          onClick={() => {
                                            setEditingComment(null);
                                            setEditCommentText('');
                                          }}
                                          className="px-3 py-1 text-xs border border-gray-300 rounded-lg"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleEditComment(comment._id, post.id, editCommentText)}
                                          disabled={commentActionLoading[`edit-${comment._id}`] || !editCommentText.trim()}
                                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg disabled:opacity-50"
                                        >
                                          {commentActionLoading[`edit-${comment._id}`] ? 'Saving...' : 'Save'}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700 mt-1">
                                      {comment.content}
                                    </p>
                                  )}
                                  
                                  {/* Comment Actions */}
                                  <div className="flex items-center gap-4 mt-2">
                                    <button 
                                      onClick={() => handleLikeComment(comment._id, post.id)}
                                      disabled={commentActionLoading[`like-${comment._id}`]}
                                      className="flex items-center gap-1 text-sm border border-gray-300 px-2 py-1 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                      <ArrowUpOutlined className={commentActionLoading[`like-${comment._id}`] ? 'animate-spin' : ''} />
                                      {Array.isArray(comment.likes) ? comment.likes.length : 0}
                                    </button>
                                    <button 
                                      onClick={() => handleDislikeComment(comment._id, post.id)}
                                      disabled={commentActionLoading[`dislike-${comment._id}`]}
                                      className="flex items-center gap-1 text-sm border border-gray-300 px-2 py-1 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                      <ArrowUpOutlined className={`transform rotate-180 ${commentActionLoading[`dislike-${comment._id}`] ? 'animate-spin' : ''}`} />
                                      {Array.isArray(comment.dislikes) ? comment.dislikes.length : 0}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (replyingTo === comment._id) {
                                          setReplyingTo(null);
                                        } else {
                                          setReplyingTo(comment._id);
                                          setReplyText('');
                                        }
                                      }}
                                      className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                  
                                  {/* Reply Form */}
                                  {replyingTo === comment._id && (
                                    <div className="mt-3 pl-4 border-l-2 border-gray-100">
                                      <Input.TextArea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                        className="w-full rounded-lg border border-gray-200 text-sm"
                                      />
                                      <div className="flex justify-end mt-2 space-x-2">
                                        <button
                                          onClick={() => setReplyingTo(null)}
                                          className="px-3 py-1 text-xs border border-gray-300 rounded-lg"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleAddReply(comment._id, post.id, replyText)}
                                          disabled={commentActionLoading[`reply-${comment._id}`] || !replyText.trim()}
                                          className="px-3 py-1 text-xs bg-[#00A99D] text-white rounded-lg disabled:opacity-50"
                                        >
                                          {commentActionLoading[`reply-${comment._id}`] ? 'Posting...' : 'Post Reply'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Comment Replies */}
                                  {comment.reply && comment.reply.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                                      {comment.reply.map((reply, index) => (
                                        <div key={index} className="flex gap-2">
                                          {reply.userId?.imageURL ? (
                                            <img
                                              alt="Replier"
                                              src={reply.userId.imageURL}
                                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                            />
                                          ) : (
                                            <Image
                                              alt="Replier"
                                              src={azeem}
                                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                            />
                                          )}
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <h5 className="font-medium text-xs text-gray-800">
                                                {reply.userId?.fullName || 'Anonymous'}
                                              </h5>
                                              <span className="text-xs text-gray-500">
                                                {new Date(reply.createdAt).toLocaleTimeString('en-US', {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: true
                                                })}
                                              </span>
                                            </div>
                                            <p className="text-xs text-gray-700">{reply.content}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-400">
                              <p className="text-sm">No comments yet. Be the first to comment!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Tags Section - Fixed */}
          {loading ? (
            <TagsSkeleton />
          ) : (
            <div className="w-64 bg-white p-5 fixed right-0 h-screen overflow-y-auto">
              <h2 className="font-semibold mb-4 text-gray-800">Popular Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 bg-gray-50 rounded-full text-sm cursor-pointer hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumDiscussion;