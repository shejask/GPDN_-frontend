"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input, message, DatePicker, Skeleton } from 'antd';
import moment from 'moment';
import logo from '../../app/assets/registation/logo.png'
import { IoSearchOutline } from 'react-icons/io5';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoFilterOutline } from "react-icons/io5";
import { FaRegComment } from "react-icons/fa6";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { BiDislike, BiSolidDislike } from "react-icons/bi";
import azeem from '../../app/assets/registation/Frame.png'
import Link from 'next/link';
import { fetchBlogs, likeBlog, dislikeBlog, getBlogStats, searchBlogs, filterBlogsByDate, filterBlogsByCategory, getCategories, getBlogsByCategory } from '../../api/blogsdashboard';

const NewsAndBlogs = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const getBlogs = async () => {
      try {
        const response = await fetchBlogs();
        if (response.success && response.data.data) {
          setBlogs(response.data.data);
        } else {
          message.error(response.error || 'Failed to fetch blogs');
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        message.error('Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success && response.data.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    getBlogs();
    fetchCategories();
  }, []);

  const handleLikeDislike = async (post, action) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to like or dislike blogs');
      return;
    }

    const stats = getBlogStats(post);
    const isLiked = stats.isLiked(userId);
    const isDisliked = stats.isDisliked(userId);

    if ((action === 'like' && isLiked) || (action === 'dislike' && isDisliked)) {
      try {
        const response = action === 'like' 
          ? await likeBlog(post._id, userId)
          : await dislikeBlog(post._id, userId);

        if (response.success) {
          setBlogs(blogs.map(blog => 
            blog._id === post._id 
              ? {
                  ...blog,
                  likes: action === 'like' ? blog.likes?.filter(id => id !== userId) || [] : blog.likes || [],
                  dislikes: action === 'dislike' ? blog.dislikes?.filter(id => id !== userId) || [] : blog.dislikes || []
                }
              : blog
          ));
          message.success(`Removed ${action} from blog`);
        } else {
          message.error(response.error || `Failed to update blog`);
        }
      } catch (error) {
        console.error(`Error updating blog:`, error);
        message.error(`Failed to update blog`);
      }
      return;
    }

    try {
      if (action === 'like' && isDisliked) {
        await dislikeBlog(post._id, userId);
      } else if (action === 'dislike' && isLiked) {
        await likeBlog(post._id, userId);
      }

      const response = action === 'like' 
        ? await likeBlog(post._id, userId)
        : await dislikeBlog(post._id, userId);

      if (response.success) {
        setBlogs(blogs.map(blog => 
          blog._id === post._id 
            ? {
                ...blog,
                likes: action === 'like' 
                  ? [...(blog.likes || []), userId] 
                  : blog.likes?.filter(id => id !== userId) || [],
                dislikes: action === 'dislike' 
                  ? [...(blog.dislikes || []), userId] 
                  : blog.dislikes?.filter(id => id !== userId) || []
              }
            : blog
        ));
        message.success(`Blog ${action === 'like' ? 'liked' : 'disliked'} successfully`);
      } else {
        message.error(response.error || `Failed to ${action} blog`);
      }
    } catch (error) {
      console.error(`Error ${action}ing blog:`, error);
      message.error(`Failed to ${action} blog`);
    }
  };

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
    setShowLocationMenu(false);
    setShowDateMenu(false);
  };
  
  const handleLocationClick = () => {
    setShowLocationMenu(true);
    setShowFilter(false);
    setShowDateMenu(false);
  };
  
  const handleDateClick = () => {
    setShowDateMenu(true);
    setShowFilter(false);
    setShowLocationMenu(false);
  };
  
  const handleBackClick = () => {
    setShowLocationMenu(false);
    setShowDateMenu(false);
    setShowFilter(true);
  };
  
  const handleSearch = async (value) => {
    setLoading(true);
    try {
      if (!value.trim()) {
        const response = await fetchBlogs();
        if (response.success && response.data.data) {
          setBlogs(response.data.data);
        } else {
          message.error(response.error || 'Failed to fetch blogs');
        }
      } else {
        const response = await searchBlogs(value);
        if (response.success && response.data.data) {
          setBlogs(response.data.data);
        } else {
          message.error(response.error || 'Failed to search blogs');
        }
      }
    } catch (error) {
      console.error('Error searching blogs:', error);
      message.error('Failed to search blogs');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const handleDateFilter = async (date) => {
    setLoading(true);
    
    try {
      if (!date) {
        // Clear date filter
        setSelectedDate(null);
        const response = await fetchBlogs();
        if (response.success && response.data.data) {
          setBlogs(response.data.data);
          message.success('Date filter cleared');
        }
      } else {
        // Apply date filter
        const formattedDate = date.format('DD/MM/YYYY'); // API now expects DD/MM/YYYY format
        
        console.log('Filtering by date:', formattedDate);
        
        const response = await filterBlogsByDate(formattedDate);
        if (response.success && response.data.data) {
          setBlogs(response.data.data);
          setSelectedDate(date); // Store moment object
          message.success(`Filtered blogs for date: ${formattedDate}`);
        } else {
          message.error(response.error || 'Failed to filter blogs by date');
        }
      }
    } catch (error) {
      console.error('Error filtering blogs by date:', error);
      message.error('Failed to filter blogs by date');
    } finally {
      setLoading(false);
      setShowDateMenu(false);
      setShowFilter(false);
    }
  };
  
  const handleCategoryFilter = async (category) => {
    setLoading(true);
    try {
      setSelectedCategory(category);
      
      const response = await getBlogsByCategory(category);
      if (response.success && response.data.data) {
        setBlogs(response.data.data);
        message.success(`Filtered blogs by category: ${category}`);
      } else {
        message.error(response.error || 'Failed to filter blogs by category');
      }
    } catch (error) {
      console.error('Error filtering blogs by category:', error);
      message.error('Failed to filter blogs by category');
    } finally {
      setLoading(false);
      setShowLocationMenu(false);
      setShowFilter(false);
    }
  };

  const clearAllFilters = async () => {
    setLoading(true);
    setSearchQuery('');
    setSelectedDate(null);
    setSelectedCategory('');
    
    try {
      const response = await fetchBlogs();
      if (response.success && response.data.data) {
        setBlogs(response.data.data);
        message.success('All filters cleared');
      } else {
        message.error(response.error || 'Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      message.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClickOutside = (event) => {
    if (!event.target.closest('.filter-container')) {
      setShowFilter(false);
      setShowLocationMenu(false);
      setShowDateMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Improved skeleton component that matches the actual layout
  const BlogSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3">
        {/* Header section with spacing */}
        <div className="flex items-center h-10 gap-3 mb-4">
          <div className="w-full">
            <Skeleton.Input active size="small" className="w-32" />
          </div>
        </div>
        
        {/* Image skeleton */}
        <div className="w-full h-60 rounded-xl mb-2 bg-gray-200 animate-pulse"></div>
        
        {/* Content section */}
        <div className="mb-4">
          {/* Category and date line */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton.Input active size="small" className="w-20" />
            <Skeleton.Input active size="small" className="w-24" />
          </div>
          
          {/* Title */}
          <div className="mb-2">
            <Skeleton.Input active size="large" className="w-full mb-1" />
            <Skeleton.Input active size="large" className="w-3/4" />
          </div>
          
          {/* Description */}
          <div className="mb-2">
            <Skeleton.Input active size="small" className="w-full mb-1" />
            <Skeleton.Input active size="small" className="w-5/6 mb-1" />
            <Skeleton.Input active size="small" className="w-2/3" />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <Skeleton.Input active size="small" className="w-12" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <Skeleton.Input active size="small" className="w-16" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <Skeleton.Input active size="small" className="w-20" />
          </div>
        </div>
      </div>
    </div>
  );

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
                <h1 className='text-xl'>{item.icon}</h1>
                <h1 className=''>{item.menu}</h1>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white fixed w-[calc(100%-256px)] z-10">
          <h1 className="text-xl font-semibold">Blogs</h1>
          <div className="flex gap-3 relative filter-container">
            <Input 
              placeholder="Search..." 
              className="w-64"
              prefix={<IoSearchOutline className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
            <button 
              onClick={handleFilterClick}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <IoFilterOutline /> Filter
            </button>

            {/* Filter Dropdown */}
            {showFilter && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-medium">Add Filters</h3>
                  {/* Show active filters */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategory && (
                      <span className="text-xs bg-[#00A99D] text-white px-2 py-1 rounded">
                        Category: {selectedCategory}
                      </span>
                    )}
                    {selectedDate && (
                      <span className="text-xs bg-[#00A99D] text-white px-2 py-1 rounded">
                        Date: {selectedDate.format('DD/MM/YYYY')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLocationClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                  >
                    Category
                    <span>›</span>
                  </button>
                  <button 
                    onClick={handleDateClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                  >
                    Date
                    <span>›</span>
                  </button>
                  {(selectedCategory || selectedDate) && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 border-t border-gray-100"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Category Menu */}
            {showLocationMenu && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100 flex items-center">
                  <button onClick={handleBackClick} className="mr-2">‹</button>
                  <h3 className="font-medium">Select Category</h3>
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryFilter(category)}
                      className={`w-full px-4 py-2 text-left hover:bg-[#00A99D] hover:text-white transition-colors ${
                        selectedCategory === category ? 'bg-[#00A99D] text-white' : ''
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Date Menu */}
            {showDateMenu && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100 flex items-center">
                  <button onClick={handleBackClick} className="mr-2">‹</button>
                  <h3 className="font-medium">Select Date</h3>
                </div>
                <div className="p-4">
                  <DatePicker 
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                    onChange={(date) => handleDateFilter(date)}
                    allowClear={true}
                    value={selectedDate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="pt-20 p-5 mt-10">
          {loading ? (
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <BlogSkeleton key={item} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="text-5xl text-gray-300 mb-4">
                <IoNewspaperOutline />
              </div>
              <h3 className="text-xl font-medium text-gray-500 mb-2">No blogs found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || selectedDate || selectedCategory 
                  ? "No results match your current filters" 
                  : "No blogs available at the moment"
                }
              </p>
              {(searchQuery || selectedDate || selectedCategory) && (
                <button 
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#00A99D] transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {blogs.map((post) => {
                const stats = getBlogStats(post);
                const userId = localStorage.getItem('userId');
                const isLiked = stats.isLiked(userId);
                const isDisliked = stats.isDisliked(userId);

                return (
                  <div key={post._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-3">
                      <div className="flex items-center h-10 gap-3 mb-4">
                        <div className="flex items-center gap-2 w-full">
                          <div>
                            {/* Placeholder for future author info */}
                          </div>
                        </div>
                      </div>
                      <Link href={`/news-blogs/${post._id}`}>
                        {post.thumbnail && (
                          <div className='w-full h-60 rounded-xl mb-2'>
                            <Image 
                              src={post.thumbnail} 
                              alt={post.title}
                              width={500}
                              height={300}
                              className='w-full h-full object-cover rounded-2xl'
                            />
                          </div>
                        )}
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#00A99D] hover:text-[#00A99D] font-medium">{post.category}</span>
                            <span className="text-sm text-gray-500">{moment(post.createdAt).format('DD/MM/YYYY')}</span>
                          </div>
                          <h2 className="text-xl font-semibold mt-2 hover:text-[#00A99D] transition-colors">{post.title}</h2>
                          <p className="text-gray-500 mt-2 line-clamp-3">{post.description}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-4 text-gray-500">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleLikeDislike(post, 'like');
                          }}
                          className={`flex items-center gap-2 hover:text-[#00A99D] transition-colors ${isLiked ? 'text-[#00A99D]' : ''}`}
                        >
                          {isLiked ? <FaHeart /> : <FaRegHeart />}
                          <span>{stats.likeCount} Likes</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleLikeDislike(post, 'dislike');
                          }}
                          className={`flex items-center gap-2 hover:text-red-500 transition-colors ${isDisliked ? 'text-red-500' : ''}`}
                        >
                          {isDisliked ? <BiSolidDislike /> : <BiDislike />}
                          <span>{stats.dislikeCount} Dislikes</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <FaRegComment />
                          <span>{stats.commentCount} Comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsAndBlogs;