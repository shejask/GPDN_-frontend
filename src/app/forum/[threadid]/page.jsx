"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Input, message } from "antd";
import Link from "next/link";
import {
  MdClose,
  MdDashboard,
  MdMenu,
  MdOutlineSettings,
} from "react-icons/md";
import { FaRegFolder } from "react-icons/fa";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdChatBubbleOutline } from "react-icons/md";
import { ArrowUpOutlined, ShareAltOutlined } from "@ant-design/icons";
import logo from "../../assets/registation/logo.png";
import azeem from "../../assets/registation/Frame.png";
import {
  fetchThreads,
  addComment,
  upvoteThread,
  downvoteThread,
  shareThread,
  likeComment,
  dislikeComment,
  deleteComment,
  editComment,
  addReply,
} from "../../../api/forum";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
// ...existing imports...

const ThreadDetail = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { threadid } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [threadComments, setThreadComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentActionLoading, setCommentActionLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarMenus = [
    { menu: "Forum", icon: <MdDashboard />, link: `/forum/${threadid}` },
    {
      menu: "Resource Library",
      icon: <FaRegFolder />,
      link: "/resource-library",
    },
    { menu: "Members", icon: <TbUsers />, link: "/members" },
    {
      menu: "Palliative Units",
      icon: <PiBuildings />,
      link: "/palliative-units",
    },
    { menu: "News & Blogs", icon: <IoNewspaperOutline />, link: "/news-blogs" },
    { menu: "Settings", icon: <MdOutlineSettings />, link: "/settings" },
  ];
  // Utility: Get current user ID
  const getCurrentUserId = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("userId") || null;
    } catch {
      return null;
    }
  }, []);

  // Fetch thread by ID
  useEffect(() => {
    const fetchThread = async () => {
      setLoading(true);
      try {
        const response = await fetchThreads();
        let threads = [];
        if (Array.isArray(response.data)) {
          threads = response.data;
        } else if (response.data?.threads) {
          threads = response.data.threads;
        } else if (response.data?.data) {
          threads = response.data.data;
        }
        const thread = threads.find((t) => t._id === threadid);
        if (thread) {
          setPost({
            id: thread._id,
            author: thread.authorId?.fullName || "Anonymous",
            title: thread.title,
            time: new Date(thread.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            content: thread.content,
            tags: Array.isArray(thread.tags)
              ? thread.tags.flatMap((tag) => {
                  if (typeof tag === "string" && tag.startsWith("[")) {
                    try {
                      return JSON.parse(tag);
                    } catch {
                      return [tag];
                    }
                  }
                  return [tag];
                })
              : [],
            upvotes: thread.upVote?.length || 0,
            downvotes: thread.downVote?.length || 0,
            shares: thread.shares || 0,
            comments: thread.comments?.length || 0,
            hasImage: !!thread.thumbnail,
            image: thread.thumbnail || null,
            verified: Boolean(
              thread.authorId?.hasFormalTrainingInPalliativeCare
            ),
            authorId: thread.authorId?._id,
            authorImage: thread.authorId?.imageURL || null,
          });
          setThreadComments(thread.comments || []);
        }
      } catch (err) {
        message.error("Failed to load thread");
      } finally {
        setLoading(false);
      }
    };
    if (threadid) fetchThread();
  }, [threadid]);

  // Sidebar mobile toggle
  const handleMobileMenuToggle = () => setMobileMenuOpen((v) => !v);

  const handleCommentSubmit = async (threadId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      message.error("You must be logged in to comment.");
      return;
    }
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await addComment(threadId, commentText);
      if (res.success) {
        setCommentText("");
        // Fetch the thread again to get updated comments
        const response = await fetchThreads();
        let threads = [];
        if (Array.isArray(response.data)) {
          threads = response.data;
        } else if (response.data?.threads) {
          threads = response.data.threads;
        } else if (response.data?.data) {
          threads = response.data.data;
        }
        const thread = threads.find((t) => t._id === threadId);
        setThreadComments(thread?.comments || []);
        message.success("Comment posted!");
      } else {
        message.error(res.message || "Failed to post comment.");
      }
    } catch (err) {
      message.error("Failed to post comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-400 text-3xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="md:flex md:min-h-screen md:bg-white">
      {/* Mobile Topbar */}
      <div className="flex md:hidden w-full h-16 bg-[#00A99D] fixed top-0 z-30 px-5 items-center justify-between">
        <Image alt="GPDN Logo" src={logo} width={100} className="h-auto" />
        <div
          onClick={handleMobileMenuToggle}
          className="text-2xl text-white cursor-pointer p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-all duration-200 relative"
        >
          <span className="material-icons">
            {mobileMenuOpen ? <MdClose /> : <MdMenu />}
          </span>
        </div>
      </div>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleMobileMenuToggle}
      />
      {/* Sidebar */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
      />
      {/* Main Content */}
      <div className="md:ml-72 mt-10 md:mt-0">
        <div className="md:max-w-2xl mx-auto py-10 px-4">
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
              <h3 className="font-medium text-gray-800">{post.author}</h3>
              <span className="text-xs text-gray-400">{post.time}</span>
            </div>
          </div>
          {/* Title */}
          <p className="text-primary-600 font-semibold text-lg mb-3 leading-relaxed">
            {post.title}
          </p>
          {/* Content */}
          {post.content && (
            <div className="mt-4 mb-4 prose max-w-none bg-gray-50 p-4 rounded-lg font-light">
              <div
                className="text-gray-800 leading-relaxed overflow-auto"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          )}
          {/* Image */}
          {post.hasImage && post.image && (
            <div className="mb-3">
              <img
                src={post.image}
                alt="Thread attachment"
                className="rounded-lg w-full h-32 md:h-72 md:w-72 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
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
                  className="px-3 py-1 bg-[#51b0e071] text-[#2f2d8f] rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Actions */}
          {/* <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
            <button
              // onClick={() => handleUpvote(post.id)}
              className="flex items-center gap-1 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpOutlined />
              Upvote · {post.upvotes || 0}
            </button>
            <button
              // onClick={() => handleDownvote(post.id)}
              className="flex items-center gap-1 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpOutlined className="transform rotate-180" />
              Downvote · {post.downvotes || 0}
            </button>
            <button
              // onClick={() => handleShare(post.id)}
              className="flex items-center gap-1 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShareAltOutlined />
              Share · {post.shares || 0}
            </button>
          </div> */}
          {/* Comments */}
          <div className="border-t border-gray-100 pt-4">
            <h1 className="mb-2">Comments</h1>
            <hr className=" mb-5" />
            <div className="space-y-4">
              {commentsLoading ? (
                <div>Loading comments...</div>
              ) : threadComments.length > 0 ? (
                threadComments.map((comment) => (
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-gray-800">
                          {comment.authorId?.fullName || "Anonymous"}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetail;
