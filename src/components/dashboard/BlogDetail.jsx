"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input, Modal, Button } from 'antd';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { FaEdit, FaTrash } from "react-icons/fa";
import logo from '../../app/assets/registation/logo.png';
import azeem from '../../app/assets/registation/Frame.png';
import { addComment, editComment, deleteComment } from '../../api/blogsdashboard';

const BlogDetail = ({ id }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Initialize empty comments array
  useEffect(() => {
    setComments([]);
  }, [id]);

  const handleAddComment = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await addComment(id, userId, newComment);
      if (response.success) {
        const newCommentObj = {
          _id: response.data._id || `temp-${Date.now()}`, // Fallback temporary ID if response doesn't include _id
          authorId: userId,
          content: newComment,
          createdAt: new Date().toISOString(),
          isTemporary: !response.data._id // Flag to identify temporary comments
        };
        setComments(prevComments => [...prevComments, newCommentObj]);
        setNewComment('');
        alert('Comment added successfully');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
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
      alert('Please sign in to edit comments');
      return;
    }

    if (!editedContent.trim()) {
      alert('Comment cannot be empty');
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
        alert('Comment updated successfully');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Failed to edit comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please sign in to delete comments');
      return;
    }

    if (window.confirm('Are you sure you want to delete this comment?')) {
      setLoading(true);
      try {
        const response = await deleteComment(commentId);
        if (response.success) {
          setComments(comments.filter(comment => comment._id !== commentId));
          alert('Comment deleted successfully');
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      } finally {
        setLoading(false);
      }
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
        <div className="max-w-4xl mx-auto">
          {/* Category and Date */}
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-[#E8F8F7] text-[#00A99D] rounded-full text-sm">Cancer</span>
            <span className="text-gray-500">October 23,2023</span>
          </div>

          {/* Blog Title */}
          <h1 className="text-3xl font-bold mb-6">COVID-19 vaccines prevent infection and reduce symptoms.</h1>

          {/* Featured Image */}
          <div className="mb-8 rounded-lg w-full h-80 overflow-hidden">
            <Image 
              src={azeem} 
              alt="COVID-19 Prevention"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Blog Content */}
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              COVID-19, caused by the SARS-CoV-2 virus, emerged in late 2019 in Wuhan, China, rapidly spreading across the globe and leading to an unprecedented pandemic. Characterized by symptoms ranging from mild fever and cough to severe respiratory failure, the virus primarily spreads through respiratory droplets and close contact. Its impact on global health was catastrophic, overwhelming healthcare systems, leading to millions of deaths, and prompting governments to implement lockdowns, travel restrictions, and strict safety measures such as social distancing and mask mandates.
            </p>

            <h2 className="text-xl font-semibold mb-4">1. Prevention of Severe Illness</h2>
            <p className="text-gray-700 mb-6">
              COVID-19 vaccines significantly reduce the risk of severe illness, hospitalization, and death. Even if an individual gets infected, the symptoms are usually milder compared to those who are unvaccinated.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Herd Immunity Contribution</h2>
            <p className="text-gray-700 mb-6">
              When a large percentage of the population is vaccinated, the spread of the virus slows down, protecting those who cannot get vaccinated, such as individuals with medical conditions.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Reduction in Virus Mutation</h2>
            <p className="text-gray-700 mb-6">
              Vaccination helps minimize the chances of the virus mutating into more dangerous variants by reducing the number of infections, making it harder for the virus to evolve.
            </p>

            <p className="text-gray-700 mb-6">
              Despite significant advancements in treatment and preventive measures, the pandemic underscored the importance of global cooperation, scientific innovation, and healthcare preparedness. COVID-19 not only reshaped daily life but also highlighted vulnerabilities in public health systems, reinforcing the need for continued vigilance to prevent future outbreaks. While the world has made progress, the pandemic remains a reminder of how interconnected and fragile global health can be.
            </p>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Comments ({comments.length})</h2>
            <div className="space-y-6">
              {comments.map((comment, index) => (
                <div key={comment._id || `comment-${index}`} className="flex gap-4">
                  <div className='w-10 h-10'>               
                    <Image 
                      src={azeem}
                      alt="User Avatar"
                      className="rounded-full w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 justify-between">
                      <div>
                        <h3 className="font-medium">{comment.authorId}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {comment.authorId === localStorage.getItem('userId') && (
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

