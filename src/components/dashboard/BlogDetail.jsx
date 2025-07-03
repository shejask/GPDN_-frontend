"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input, Modal, Button, message, Skeleton } from 'antd';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaRegComment, FaComment } from "react-icons/fa";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { BiDislike, BiSolidDislike } from "react-icons/bi";
import logo from '../../app/assets/registation/logo.png';
import azeem from '../../app/assets/registation/Frame.png';
import { addComment, editComment, deleteComment, fetchBlogById, likeComment, dislikeComment, addReply, likeBlog, dislikeBlog } from '../../api/blogsdashboard';

const BlogDetail = ({ id }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [blog, setBlog] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  // Fetch blog data when component mounts or id changes
  useEffect(() => {
    const getBlogData = async () => {
      try {
        const response = await fetchBlogById(id);
        console.log('Blog response:', response); // Debug log
        
        // Check if the response has data nested under response.data.data
        const blogData = response.data?.data || response.data;
        
        if ((response.success || blogData) && blogData) {
          setBlog(blogData);
          // If the blog has comments, set them
          if (blogData.comments && Array.isArray(blogData.comments)) {
            setComments(blogData.comments);
          } else {
            setComments([]);
          }
        } else {
          message.error(response.error || 'Failed to fetch blog');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        message.error('Failed to fetch blog details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      getBlogData();
    }
  }, [id]);

  const handleAddComment = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await addComment(id, userId, newComment);
      console.log('Add comment response:', response);
      
      if (response.success) {
        // Refresh the blog data to get updated comments with full user information
        const blogResponse = await fetchBlogById(id);
        if (blogResponse.success || blogResponse.data) {
          const blogData = blogResponse.data?.data || blogResponse.data;
          if (blogData) {
            setBlog(blogData);
            if (blogData.comments && Array.isArray(blogData.comments)) {
              setComments(blogData.comments);
            }
          }
        } else {
          // If refresh fails, add a temporary comment with available info
          const newCommentObj = {
            _id: response.data._id || `temp-${Date.now()}`,
            authorId: userId,
            content: newComment,
            createdAt: new Date().toISOString(),
            isTemporary: true
          };
          setComments(prevComments => [...prevComments, newCommentObj]);
        }
        
        setNewComment('');
        message.success('Comment added successfully');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (comment) => {
    setEditingComment(comment);
    setEditedContent(comment.content);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to edit comments');
      return;
    }

    if (!editedContent.trim()) {
      message.warning('Comment cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await editComment(
        editingComment._id,
        id,
        userId,
        editedContent
      );

      if (response.success) {
        setComments(comments.map(comment => 
          comment._id === editingComment._id 
            ? { ...comment, content: editedContent }
            : comment
        ));
        setEditModalVisible(false);
        message.success('Comment updated successfully');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      message.error('Failed to edit comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to delete comments');
      return;
    }

    if (window.confirm('Are you sure you want to delete this comment?')) {
      setLoading(true);
      try {
        const response = await deleteComment(commentId);
        if (response.success) {
          setComments(comments.filter(comment => comment._id !== commentId));
          message.success('Comment deleted successfully');
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        message.error('Failed to delete comment');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle comment likes
  const handleCommentLike = async (comment) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to like comments');
      return;
    }

    try {
      const response = await likeComment(comment._id, userId);
      console.log('Like response:', response);
      
      if (response.success) {
        // Check if the response contains updated comment data
        if (response.data && response.data.data) {
          // If the API returns the updated comment, use that data
          const updatedComment = response.data.data;
          setComments(comments.map(c => 
            c._id === comment._id ? updatedComment : c
          ));
        } else {
          // Otherwise, update the state locally
          setComments(comments.map(c => 
            c._id === comment._id 
              ? {
                  ...c,
                  likes: c.likes?.includes(userId) 
                    ? c.likes.filter(id => id !== userId) 
                    : [...(c.likes || []), userId],
                  dislikes: c.dislikes?.filter(id => id !== userId) || []
                }
              : c
          ));
        }
        message.success('Comment liked successfully');
      } else {
        message.error(response.error || 'Failed to like comment');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      message.error('Failed to like comment');
    }
  };

  // Handle comment dislikes
  const handleCommentDislike = async (comment) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to dislike comments');
      return;
    }

    try {
      const response = await dislikeComment(comment._id, userId);
      console.log('Dislike response:', response);
      
      if (response.success) {
        // Check if the response contains updated comment data
        if (response.data && response.data.data) {
          // If the API returns the updated comment, use that data
          const updatedComment = response.data.data;
          setComments(comments.map(c => 
            c._id === comment._id ? updatedComment : c
          ));
        } else {
          // Otherwise, update the state locally
          setComments(comments.map(c => 
            c._id === comment._id 
              ? {
                  ...c,
                  dislikes: c.dislikes?.includes(userId) 
                    ? c.dislikes.filter(id => id !== userId) 
                    : [...(c.dislikes || []), userId],
                  likes: c.likes?.filter(id => id !== userId) || []
                }
              : c
          ));
        }
        message.success('Comment disliked successfully');
      } else {
        message.error(response.error || 'Failed to dislike comment');
      }
    } catch (error) {
      console.error('Error disliking comment:', error);
      message.error('Failed to dislike comment');
    }
  };

  // Handle reply to comment
  const handleReplyClick = (comment) => {
    setReplyingTo(replyingTo === comment._id ? null : comment._id);
    setReplyContent('');
  };

  const handleAddReply = async (commentId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to reply to comments');
      return;
    }

    if (!replyContent.trim()) {
      message.warning('Please enter a reply');
      return;
    }

    setLoading(true);
    try {
      const response = await addReply(commentId, userId, replyContent);
      console.log('Reply response:', response);
      
      if (response.success) {
        // Check if the response contains updated comment data
        if (response.data && response.data.data) {
          // If the API returns the updated comment with replies, use that data
          const updatedComment = response.data.data;
          setComments(comments.map(c => 
            c._id === commentId ? updatedComment : c
          ));
          
          // Refresh the entire blog to get updated data
          const getBlogData = async () => {
            try {
              const blogResponse = await fetchBlogById(id);
              if (blogResponse.success || blogResponse.data) {
                const blogData = blogResponse.data?.data || blogResponse.data;
                if (blogData) {
                  setBlog(blogData);
                  if (blogData.comments && Array.isArray(blogData.comments)) {
                    setComments(blogData.comments);
                  }
                }
              }
            } catch (err) {
              console.error('Error refreshing blog data:', err);
            }
          };
          
          getBlogData();
        } else {
          // Otherwise, update the state locally
          setComments(comments.map(c => 
            c._id === commentId 
              ? {
                  ...c,
                  reply: [...(c.reply || []), {
                    _id: response.data?._id || `temp-${Date.now()}`,
                    userId: userId,
                    content: replyContent,
                    createdAt: new Date().toISOString()
                  }]
                }
              : c
          ));
        }
        setReplyingTo(null);
        setReplyContent('');
        message.success('Reply added successfully');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      message.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  // Handle blog like
  const handleBlogLike = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to like this blog');
      return;
    }

    setIsLiking(true);
    try {
      const response = await likeBlog(blog._id, userId);
      console.log('Blog like response:', response);
      
      if (response.success) {
        // Check if the response contains updated blog data
        if (response.data && response.data.data) {
          // If the API returns the updated blog, use that data
          const updatedBlog = response.data.data;
          setBlog(updatedBlog);
        } else {
          // Otherwise, update the state locally
          setBlog({
            ...blog,
            likes: Array.isArray(blog.likes) && blog.likes.some(like => {
              return typeof like === 'object' ? like._id === userId : like === userId;
            }) 
              ? blog.likes.filter(like => typeof like === 'object' ? like._id !== userId : like !== userId)
              : [...(blog.likes || []), userId],
            dislikes: Array.isArray(blog.dislikes) 
              ? blog.dislikes.filter(dislike => typeof dislike === 'object' ? dislike._id !== userId : dislike !== userId)
              : blog.dislikes || []
          });
        }
        message.success('Blog liked successfully');
      } else {
        message.error(response.error || 'Failed to like blog');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      message.error('Failed to like blog');
    } finally {
      setIsLiking(false);
    }
  };

  // Handle blog dislike
  const handleBlogDislike = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to dislike this blog');
      return;
    }

    setIsDisliking(true);
    try {
      const response = await dislikeBlog(blog._id, userId);
      console.log('Blog dislike response:', response);
      
      if (response.success) {
        // Check if the response contains updated blog data
        if (response.data && response.data.data) {
          // If the API returns the updated blog, use that data
          const updatedBlog = response.data.data;
          setBlog(updatedBlog);
        } else {
          // Otherwise, update the state locally
          setBlog({
            ...blog,
            dislikes: Array.isArray(blog.dislikes) && blog.dislikes.some(dislike => {
              return typeof dislike === 'object' ? dislike._id === userId : dislike === userId;
            })
              ? blog.dislikes.filter(dislike => typeof dislike === 'object' ? dislike._id !== userId : dislike !== userId)
              : [...(blog.dislikes || []), userId],
            likes: Array.isArray(blog.likes)
              ? blog.likes.filter(like => typeof like === 'object' ? like._id !== userId : like !== userId)
              : blog.likes || []
          });
        }
        message.success('Blog disliked successfully');
      } else {
        message.error(response.error || 'Failed to dislike blog');
      }
    } catch (error) {
      console.error('Error disliking blog:', error);
      message.error('Failed to dislike blog');
    } finally {
      setIsDisliking(false);
    }
  };

  const sidebarMenus = [
    {menu : 'Forum', icon : <MdDashboard/>, link: '/forum'},
    {menu : 'Resource Library', icon : <FaRegFolder/>, link: '/resource-library'}, 
    {menu : 'Members', icon : <TbUsers/>, link: '/members'}, 
    {menu : 'Palliative Units', icon : <PiBuildings/>, link: '/palliative-units'}, 
    {menu : 'News & Blogs', icon : <IoNewspaperOutline/>, link: '/news-blogs'}, 
    {menu : 'Settings', icon : <MdOutlineSettings/>, link: '/settings'}
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-5">
          <Image alt='GPDN Logo' src={logo} width={100}/>
        </div>
        
        <nav className="mt-5">
          {sidebarMenus.map((item, index) => (
            <Link key={index} href={item.link} className='block'>
              <div className={`cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3 ${item.menu === 'News & Blogs' ? 'bg-[#00A99D] text-white' : ''}`}>
                <span className='text-xl'>{item.icon}</span>
                <span>{item.menu}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {loading ? (
          <div className="max-w-4xl mx-auto">
            {/* Skeleton for category and date */}
            <div className="flex items-center gap-4 mb-4">
              <Skeleton.Button active size="small" shape="round" style={{ width: 100 }} />
              <Skeleton.Button active size="small" style={{ width: 150 }} />
            </div>
            
            {/* Skeleton for blog title */}
            <Skeleton.Input active size="large" style={{ width: '70%', height: 40, marginBottom: 24 }} />
            
            {/* Skeleton for author info */}
            <div className="flex items-center gap-3 mb-6">
              <Skeleton.Avatar active size="large" shape="circle" />
              <Skeleton.Input active size="small" style={{ width: 150 }} />
            </div>
            
            {/* Skeleton for blog content */}
            <div className="space-y-4">
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
            
            {/* Skeleton for comments section */}
            <div className="mt-8">
              <Skeleton.Input active size="default" style={{ width: 200, marginBottom: 16 }} />
              <div className="space-y-4">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
                <Skeleton active avatar paragraph={{ rows: 2 }} />
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </div>
            </div>
          </div>
        ) : blog ? (
          <div className="max-w-4xl mx-auto">
            {/* Category and Date */}
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-[#E8F8F7] text-[#00A99D] rounded-full text-sm">{blog.category || 'Uncategorized'}</span>
              <span className="text-gray-500">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'No date available'}</span>
            </div>

            {/* Blog Title */}
            <h1 className="text-3xl font-bold mb-6">{blog.title}</h1>
            
            {/* Blog Like/Dislike */}
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={handleBlogLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${Array.isArray(blog.likes) && blog.likes.some(like => {
                  const userId = localStorage.getItem('userId');
                  return typeof like === 'object' ? like._id === userId : like === userId;
                }) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'} hover:bg-red-100 transition-colors`}
              >
                {Array.isArray(blog.likes) && blog.likes.some(like => {
                  const userId = localStorage.getItem('userId');
                  return typeof like === 'object' ? like._id === userId : like === userId;
                }) ? <FaHeart /> : <FaRegHeart />}
                <span>{Array.isArray(blog.likes) ? blog.likes.length : 0}</span>
              </button>
              
              <button 
                onClick={handleBlogDislike}
                disabled={isDisliking}
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${Array.isArray(blog.dislikes) && blog.dislikes.some(dislike => {
                  const userId = localStorage.getItem('userId');
                  return typeof dislike === 'object' ? dislike._id === userId : dislike === userId;
                }) ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'} hover:bg-blue-100 transition-colors`}
              >
                {Array.isArray(blog.dislikes) && blog.dislikes.some(dislike => {
                  const userId = localStorage.getItem('userId');
                  return typeof dislike === 'object' ? dislike._id === userId : dislike === userId;
                }) ? <BiSolidDislike /> : <BiDislike />}
                <span>{Array.isArray(blog.dislikes) ? blog.dislikes.length : 0}</span>
              </button>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-6">
              <Image
                src={typeof blog.authorId === 'object' ? blog.authorId?.imageURL : '/default-avatar.png'}
                alt={typeof blog.authorId === 'object' ? blog.authorId?.fullName : 'Author'}
                width={20}
                height={20}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium">{typeof blog.authorId === 'object' ? blog.authorId?.fullName : 'Anonymous'}</h3>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>

            {/* Featured Image */}
            {blog.thumbnail && (
              <div className="mb-8 rounded-lg w-full h-80 overflow-hidden">
                <Image 
                  src={blog.thumbnail} 
                  alt={blog.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Blog Content */}
            <div className="prose max-w-none">
              {blog.description && (
                <p className="text-gray-700 mb-6">{blog.description}</p>
              )}
              
              <div className="text-gray-700 mb-6">
                {typeof blog.content === 'string' && blog.content.startsWith('<') ? 
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} /> : 
                  <p>{blog.content}</p>
                }
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Comments ({comments.length})</h2>
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <div key={comment._id || `comment-${index}`} className="flex gap-4">
                    <div className='w-10 h-10'>               
                      <Image 
                        src={typeof comment.authorId === 'object' ? comment.authorId.imageURL : '/default-avatar.png'}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 justify-between">
                        <div>
                          <h3 className="font-medium">
                            {typeof comment.authorId === 'object' ? comment.authorId.fullName : 
                             (comment.isTemporary ? 'Loading...' : 'Anonymous')}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'No date available'}
                          </span>
                        </div>
                        {(typeof comment.authorId === 'object' ? comment.authorId?._id : typeof comment.authorId === 'string' ? comment.authorId : '') === localStorage.getItem('userId') && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditClick(comment)}
                              className="text-gray-500 hover:text-[#00A99D]"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mt-1">{comment.content}</p>
                      
                      {/* Comment Actions */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleCommentLike(comment)}
                            className={`flex items-center gap-1 text-gray-500 ${Array.isArray(comment.likes) && comment.likes.some(like => {
                              const userId = localStorage.getItem('userId');
                              return typeof like === 'object' ? like._id === userId : like === userId;
                            }) ? 'text-red-500' : ''}`}
                          >
                            {Array.isArray(comment.likes) && comment.likes.some(like => {
                              const userId = localStorage.getItem('userId');
                              return typeof like === 'object' ? like._id === userId : like === userId;
                            }) ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
                            <span className="text-xs">{Array.isArray(comment.likes) ? comment.likes.length : 0}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleCommentDislike(comment)}
                            className={`flex items-center gap-1 text-gray-500 ${Array.isArray(comment.dislikes) && comment.dislikes.some(dislike => {
                              const userId = localStorage.getItem('userId');
                              return typeof dislike === 'object' ? dislike._id === userId : dislike === userId;
                            }) ? 'text-blue-500' : ''}`}
                          >
                            {Array.isArray(comment.dislikes) && comment.dislikes.some(dislike => {
                              const userId = localStorage.getItem('userId');
                              return typeof dislike === 'object' ? dislike._id === userId : dislike === userId;
                            }) ? <BiSolidDislike size={12} /> : <BiDislike size={12} />}
                            <span className="text-xs">{Array.isArray(comment.dislikes) ? comment.dislikes.length : 0}</span>
                          </button>
                        </div>
                        {/* Reply Button */}
                        <button 
                          onClick={() => handleReplyClick(comment)}
                          className="flex items-center gap-1 text-gray-500 hover:text-[#00A99D]"
                        >
                          <FaRegComment size={14} />
                          <span className="text-xs">Reply</span>
                        </button>
                      </div>
                      
                      {/* Reply Input */}
                      {replyingTo === comment._id && (
                        <div className="mt-3 relative">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            rows={1}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00A99D] focus:border-transparent pr-10 resize-y min-h-[40px]"
                          />
                          <button 
                            className={`absolute right-2 bottom-2 text-[#00A99D] hover:text-[#008F84] transition-colors ${loading || !replyContent.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleAddReply(comment._id)}
                            disabled={loading || !replyContent.trim()}
                          >
                            <IoSend size={16} />
                          </button>
                        </div>
                      )}
                      
                      {/* Replies */}
                      {comment.reply && comment.reply.length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
                          {comment.reply.map((reply, replyIndex) => {
                            // Check if userId is an object with user details
                            const userInfo = typeof reply.userId === 'object' ? reply.userId : null;
                            
                            return (
                              <div key={reply._id || `reply-${replyIndex}`} className="flex gap-2">
                                <div className='w-6 h-6'>               
                                  <Image 
                                    src={userInfo?.imageURL || '/default-avatar.png'}
                                    alt="User Avatar"
                                    width={24}
                                    height={24}
                                    className="rounded-full w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1">
                                    <h4 className="text-sm font-medium">
                                      {userInfo?.fullName || 'User'}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : 'No date'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{reply.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="mt-6 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A99D] focus:border-transparent pr-12 resize-y min-h-[80px]"
                />
                <button 
                  className={`absolute right-3 bottom-3 text-[#00A99D] hover:text-[#008F84] transition-colors ${loading || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleAddComment}
                  disabled={loading || !newComment.trim()}
                >
                  <IoSend size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-screen">
            <p>Blog not found or failed to load.</p>
          </div>
        )}
      </div>

      {/* Edit Comment Modal */}
      {editModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Comment</h3>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A99D] focus:border-transparent resize-y min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModalVisible(false)}
                className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={loading}
                className={`px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;

