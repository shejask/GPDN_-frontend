"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input, message } from 'antd';
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
import { fetchBlogs, likeBlog, dislikeBlog, getBlogStats } from '../../api/blogsdashboard';

const NewsAndBlogs = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    
    getBlogs();
  }, []);

  const handleLikeDislike = async (post, action) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Please sign in to like or dislike blogs');
      return;
    }

    try {
      const response = action === 'like' 
        ? await likeBlog(post._id, userId)
        : await dislikeBlog(post._id, userId);

      if (response.success) {
        // Update the blogs state with the updated blog
        setBlogs(blogs.map(blog => 
          blog._id === post._id 
            ? {
                ...blog,
                likes: action === 'like' ? [...(blog.likes || []), userId] : blog.likes?.filter(id => id !== userId) || [],
                dislikes: action === 'dislike' ? [...(blog.dislikes || []), userId] : blog.dislikes?.filter(id => id !== userId) || []
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
  };
  
  const handleLocationClick = () => {
    setShowLocationMenu(true);
    setShowFilter(false);
  };
  
  const handleBackClick = () => {
    setShowLocationMenu(false);
    setShowFilter(true);
  };

  // Close dropdowns when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.filter-container')) {
      setShowFilter(false);
      setShowLocationMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLocationClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                  >
                    Category
                    <span>›</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
                    Date
                    <span>›</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
                    Author
                    <span>›</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="pt-20 p-5 mt-10">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {blogs.map((post) => {
                const stats = getBlogStats(post);
                const userId = localStorage.getItem('userId');
                const isLiked = stats.isLiked(userId);
                const isDisliked = stats.isDisliked(userId);

                return (
                  <div key={post._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-center h-10 gap-3 mb-4">
                        <div>
                          <h3 className="font-medium w-96">{post.authorId}</h3>
                          <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {post.imageURL && (
                        <div className='w-full h-60 rounded-xl mb-2'>
                          <Image 
                            src={post.imageURL} 
                            alt={post.title}
                            width={500}
                            height={300}
                            className='w-full h-full object-cover rounded-2xl'
                          />
                        </div>
                      )}
                      <Link href={`/news-blogs/${post._id}`}>
                        <div className="mb-4">
                          <span className="text-sm text-[#00A99D]">{post.category}</span>
                          <h2 className="text-xl font-semibold mt-2">{post.title}</h2>
                          <p className="text-gray-500 mt-2">{post.description}</p>
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