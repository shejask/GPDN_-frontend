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
            hasImage: !!thread.thumbnail && thread.thumbnail.length > 0,
            image:
              thread.thumbnail && thread.thumbnail.length > 0
                ? thread.thumbnail[0]
                : null,
            files: thread.thumbnail || [],
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
          {/* Files/Attachments */}
          {post.files && post.files.length > 0 && (
            <div className="mb-3">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {post.files.map((fileUrl, index) => {
                  // Determine file type from URL extension
                  const getFileType = (url) => {
                    const extension = url.split(".").pop()?.toLowerCase();
                    if (
                      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                        extension
                      )
                    ) {
                      return "image";
                    } else if (extension === "pdf") {
                      return "pdf";
                    } else if (["doc", "docx"].includes(extension)) {
                      return "document";
                    } else if (["xls", "xlsx"].includes(extension)) {
                      return "spreadsheet";
                    } else if (["ppt", "pptx"].includes(extension)) {
                      return "presentation";
                    } else if (["txt"].includes(extension)) {
                      return "text";
                    }
                    return "file";
                  };

                  const fileType = getFileType(fileUrl);
                  const fileName =
                    fileUrl.split("/").pop() || `File ${index + 1}`;

                  return (
                    <div key={index} className="relative group">
                      {fileType === "image" ? (
                        <div className="relative">
                          <img
                            src={fileUrl}
                            alt={fileName}
                            className="rounded-lg w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(fileUrl, "_blank")}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="bg-gray-100 rounded-lg p-4 h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => window.open(fileUrl, "_blank")}
                        >
                          <div className="w-8 h-8 mb-2">
                            {fileType === "pdf" && (
                              <svg
                                className="w-8 h-8 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {fileType === "document" && (
                              <svg
                                className="w-8 h-8 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {fileType === "spreadsheet" && (
                              <svg
                                className="w-8 h-8 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {fileType === "text" && (
                              <svg
                                className="w-8 h-8 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {fileType === "file" && (
                              <svg
                                className="w-8 h-8 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <p
                            className="text-xs text-gray-600 text-center truncate w-full"
                            title={fileName}
                          >
                            {fileName}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
