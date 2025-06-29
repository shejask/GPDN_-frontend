"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from 'antd';
import logo from '../../app/assets/registation/logo.png';
import azeem from '../../app/assets/registation/Frame.png';
import { ArrowUpOutlined, SearchOutlined, ShareAltOutlined } from '@ant-design/icons';
import { MdChatBubbleOutline } from 'react-icons/md';
import { fetchThreads, upvoteThread, downvoteThread, shareThread, searchThreads } from '@/api/forum';
import moment from 'moment';
import { MdDashboard } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import Link from 'next/link';

const ForumDiscussion = () => {
    const router = useRouter();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCommentId, setOpenCommentId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({
        upvote: null,
        downvote: null,
        share: null
    });

    const tags = [
        'Pain Management', 'Ethical Issues', 'End-of-Life Care', 'Spiritual Care',
        'Psychosocial Support', 'New Virus', 'Symptom Control', 'Lifestyle',
        'Caregiver Support', 'Pediatric Palliative Care'
    ];

    useEffect(() => {
        loadThreads();
    }, []);

    const loadThreads = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchThreads();
            
            if (response.success && Array.isArray(response.data?.data)) {
                setThreads(response.data.data);
            } else if (response.success && Array.isArray(response.data)) {
                setThreads(response.data);
            } else {
                setThreads([]);
                setError('No threads available');
            }
        } catch (error) {
            setThreads([]);
            setError('Failed to load threads');
            console.error('Error loading threads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (threadId) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Please sign in to upvote');
            router.push('/signin');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, upvote: threadId }));
            const response = await upvoteThread(threadId, userId);
            if (response.success) {
                await loadThreads();
            } else {
                alert(response.error || 'Failed to upvote');
            }
        } catch (error) {
            console.error('Error upvoting thread:', error);
            alert('Failed to upvote. Please try again.');
        } finally {
            setActionLoading(prev => ({ ...prev, upvote: null }));
        }
    };

    const handleDownvote = async (threadId) => {
        const userId = localStorage.getItem('authorId');
        if (!userId) {
            alert('Please sign in to downvote');
            router.push('/signin');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, downvote: threadId }));
            const response = await downvoteThread(threadId, userId);
            if (response.success) {
                await loadThreads();
            } else {
                alert(response.error || 'Failed to downvote');
            }
        } catch (error) {
            console.error('Error downvoting thread:', error);
            alert('Failed to downvote. Please try again.');
        } finally {
            setActionLoading(prev => ({ ...prev, downvote: null }));
        }
    };

    const handleShare = async (threadId) => {
        try {
            setActionLoading(prev => ({ ...prev, share: threadId }));
            const response = await shareThread(threadId);
            
            if (response.success) {
                // Copy thread URL to clipboard as a fallback
                const shareUrl = `${window.location.origin}/forum/${threadId}`;
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
                await loadThreads(); // Refresh to update share count
            } else {
                throw new Error(response.error || 'Failed to share thread');
            }
        } catch (error) {
            console.error('Error sharing thread:', error);
            alert(error.message || 'Failed to share thread. Please try again.');
        } finally {
            setActionLoading(prev => ({ ...prev, share: null }));
        }
    };

    const handleSearch = async (value) => {
        if (!value.trim()) {
            await loadThreads();
            return;
        }

        try {
            setSearchLoading(true);
            setError(null);
            const response = await searchThreads(value.trim());
            
            console.log('Search response:', response); // For debugging
            
            if (response && response.data) {
                if (Array.isArray(response.data.data)) {
                    setThreads(response.data.data);
                    if (response.data.data.length === 0) {
                        setError(`No threads found matching "${value.trim()}"`);
                    }
                } else if (Array.isArray(response.data)) {
                    setThreads(response.data);
                    if (response.data.length === 0) {
                        setError(`No threads found matching "${value.trim()}"`);
                    }
                } else {
                    setThreads([]);
                    setError('Invalid response format from server');
                }
            } else {
                console.error('Unexpected search response:', response);
                setThreads([]);
                setError(response?.error || 'No results found');
            }
        } catch (error) {
            console.error('Error searching threads:', error);
            setError('Failed to search threads. Please try again.');
            setThreads([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Debounce search to avoid too many API calls
    useEffect(() => {
        if (searchText === undefined || searchText === '') {
            loadThreads();
            return;
        }

        const timeoutId = setTimeout(() => {
            handleSearch(searchText);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const formatDate = (dateString) => {
        return moment(dateString).format('MMM DD, YYYY [at] hh:mm A');
    };

    const handleCreateClick = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Please sign in to create a thread');
            router.push('/signin');
            return;
        }
        router.push('/forum/create');
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto">
                <div className="p-5">
                    <Image alt="" src={logo} width={100}/>
                </div>
                <nav className="mt-5">
                    {/* Sidebar menus from MembersDirectory.jsx */}
                    <Link href="/forum" className='block'>
                        <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
                            <h1 className='text-xl'><MdDashboard/></h1>
                            <h1 className=''>Forum</h1>
                        </div>
                    </Link>
                    <Link href="/resource-library" className='block'>
                        <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
                            <h1 className='text-xl'><FaRegFolder/></h1>
                            <h1 className=''>Resource Library</h1>
                        </div>
                    </Link>
                    <Link href="/members" className='block'>
                        <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
                            <h1 className='text-xl'><TbUsers/></h1>
                            <h1 className=''>Members</h1>
                        </div>
                    </Link>
                    <Link href="/palliative-units" className='block'>
                        <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
                            <h1 className='text-xl'><PiBuildings/></h1>
                            <h1 className=''>Palliative Units</h1>
                        </div>
                    </Link>
                    <Link href="/news-blogs" className='block'>
                        <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
                            <h1 className='text-xl'><IoNewspaperOutline/></h1>
                            <h1 className=''>News & Blogs</h1>
                        </div>
                    </Link>
                    <Link href="/settings" className='block'>
                        <div className='cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3'>
                            <h1 className='text-xl'><MdOutlineSettings/></h1>
                            <h1 className=''>Settings</h1>
                        </div>
                    </Link>
                </nav>
            </div>
            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Forum Discussions</h1>
                    <div className="flex gap-3">
                        <Input 
                            placeholder="Search..." 
                            className="w-64"
                            prefix={<SearchOutlined className={`text-gray-400 ${searchLoading ? 'animate-spin' : ''}`} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            disabled={searchLoading}
                        />
                        <button 
                            onClick={handleCreateClick}
                            className="px-4 py-2 bg-[#00A99D] text-white rounded-md hover:bg-[#008F84] transition-colors duration-200 flex items-center gap-2"
                        >
                            <span>Create Thread</span>
                        </button>
                    </div>
                </div>

                <div className="flex pt-6">
                    <div className="w-4/5 p-5 border-r border-gray-200">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <p>Loading threads...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 text-red-500">
                                <p>{error}</p>
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="text-center py-10">
                                <p>No threads found</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {threads.map((thread) => (
                                    <div key={thread._id} className="p-4 border rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={azeem}
                                                    alt="User avatar"
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-medium">{thread.authorId}</h3>
                                                    <p className="text-sm text-gray-500">{formatDate(thread.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-semibold mb-2">{thread.title}</h2>
                                        <div 
                                            className="mb-3 text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: thread.content }}
                                        />
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {Array.isArray(thread.tags) && thread.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-600">
                                            <button 
                                                onClick={() => handleUpvote(thread._id)}
                                                disabled={actionLoading.upvote === thread._id}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${
                                                    actionLoading.upvote === thread._id
                                                        ? 'text-gray-400 opacity-50'
                                                        : 'hover:text-[#00A99D]'
                                                }`}
                                            >
                                                <ArrowUpOutlined className={actionLoading.upvote === thread._id ? 'animate-bounce' : ''} />
                                                <span>{Array.isArray(thread.upVote) ? thread.upVote.length : 0}</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDownvote(thread._id)}
                                                disabled={actionLoading.downvote === thread._id}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${
                                                    actionLoading.downvote === thread._id
                                                        ? 'text-gray-400 opacity-50'
                                                        : 'hover:text-red-500'
                                                }`}
                                            >
                                                <ArrowUpOutlined 
                                                    className={`rotate-180 ${actionLoading.downvote === thread._id ? 'animate-bounce' : ''}`}
                                                />
                                                <span>{Array.isArray(thread.downVote) ? thread.downVote.length : 0}</span>
                                            </button>
                                            <button 
                                                onClick={() => setOpenCommentId(thread._id)}
                                                className="flex items-center gap-1 hover:text-[#00A99D] transition-colors duration-200"
                                            >
                                                <MdChatBubbleOutline />
                                                <span>{Array.isArray(thread.comments) ? thread.comments.length : 0}</span>
                                            </button>
                                            <button 
                                                onClick={() => handleShare(thread._id)}
                                                disabled={actionLoading.share === thread._id}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${
                                                    actionLoading.share === thread._id
                                                        ? 'text-gray-400 opacity-50'
                                                        : 'hover:text-[#00A99D]'
                                                }`}
                                            >
                                                <ShareAltOutlined className={actionLoading.share === thread._id ? 'animate-pulse' : ''} />
                                                <span>{thread.shares || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-1/5 p-5">
                        <h2 className="font-semibold mb-4">Popular Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-[#00A99D] hover:text-white"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumDiscussion;