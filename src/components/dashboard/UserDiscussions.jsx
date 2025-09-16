"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  FaHeart,
  FaHeartBroken,
  FaComment,
  FaEdit,
  FaTrash,
  FaEye,
  FaShare,
  FaRegEdit,
  FaTimes,
  FaPlus,
  FaDownload,
  FaFile,
} from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { Modal, Spin, Input, message, Button, Tag } from "antd";
import Link from "next/link";
import azeem from "../../app/assets/registation/Frame.png";
import logo from "../../app/assets/registation/logo.png";
import { fetchThreads, deleteThread } from "../../api/forum";
import dynamic from "next/dynamic";

import RichTextEditor from "./RichTextEditor";
import { FaDeleteLeft, FaTrashCan } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";

// Sample data for tags and sidebar
const TAGS = [
  "Palliative Care",
  "Rural Healthcare",
  "Resource Limitations",
  "Education",
  "Research",
  "Policy",
  "AI/ML",
  "Finance",
  "Healthcare",
  "Technology",
  "Innovation",
  "Community",
];

const SIDEBAR_MENUS = [
  { menu: "Dashboard", icon: "📊", link: "/dashboard" },
  { menu: "My Discussions", icon: "💬", link: "/dashboard/discussions" },
  { menu: "My Resources", icon: "📚", link: "/dashboard/resources" },
  { menu: "Settings", icon: "⚙️", link: "/dashboard/settings" },
  { menu: "Logout", icon: "🚪", link: "/logout" },
];

const UserDiscussions = () => {
  const router = useRouter();
  const pathname = usePathname();

  // State management
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [discussionToDelete, setDiscussionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [discussionToEdit, setDiscussionToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    tags: [],
    files: [], // New files to upload
    existingFiles: [], // Existing files from API
    filesToRemove: [], // Files marked for removal
  });
  const [editLoading, setEditLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [discussionToView, setDiscussionToView] = useState(null);

  // Tag management state
  const [tagInput, setTagInput] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);

  // For edit modal rich text
  const richTextRef = React.useRef();

  // Helper function to determine file type
  const getFileType = useCallback((url) => {
    if (!url) return "unknown";
    const extension = url.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf"];

    if (imageExtensions.includes(extension)) return "image";
    if (documentExtensions.includes(extension)) return "document";
    return "file";
  }, []);

  // Helper function to get file name from URL
  const getFileName = useCallback((url) => {
    if (!url) return "Unknown file";
    try {
      const parts = url.split("/");
      const filename = parts[parts.length - 1];
      // Remove the timestamp prefix if it exists (e.g., "1758031204542-37715483-")
      const cleanName = filename.replace(/^\d+-\d+-/, "");
      return decodeURIComponent(cleanName);
    } catch (error) {
      return "Unknown file";
    }
  }, []);

  // Helper function to parse thread tags
  const parseThreadTags = useCallback((tags) => {
    if (!tags || tags.length === 0) return [];

    // If tags is already an array of strings, return as is
    if (Array.isArray(tags) && tags.every((tag) => typeof tag === "string")) {
      return tags;
    }

    // If tags is a single stringified array, parse it
    if (
      typeof tags[0] === "string" &&
      tags[0].startsWith("[") &&
      tags[0].endsWith("]")
    ) {
      try {
        const parsed = JSON.parse(tags[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }

    // Otherwise, fallback to previous logic
    if (typeof tags[0] === "string") {
      return [tags[0]];
    }
    return [];
  }, []);

  // Helper function to strip HTML tags
  const stripHtml = useCallback((html) => {
    if (!html) return "";
    try {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    } catch {
      return html;
    }
  }, []);

  // Tag management functions
  const handleTagInputChange = (value) => {
    setTagInput(value);
    if (value.trim()) {
      const filtered = TAGS.filter(
        (tag) =>
          tag.toLowerCase().includes(value.toLowerCase()) &&
          !editForm.tags.includes(tag)
      );
      setSuggestedTags(filtered);
    } else {
      setSuggestedTags([]);
    }
  };

  const addTag = (tag) => {
    if (!editForm.tags.includes(tag) && tag.trim()) {
      setEditForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
      setTagInput("");
      setSuggestedTags([]);
    }
  };

  const removeTag = (tagToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  // File management functions
  const handleFileSelection = (files) => {
    const fileArray = Array.from(files);
    setEditForm((prev) => ({
      ...prev,
      files: [...prev.files, ...fileArray],
    }));
  };

  const removeNewFile = (indexToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const markFileForRemoval = (fileUrl) => {
    setEditForm((prev) => ({
      ...prev,
      filesToRemove: [...prev.filesToRemove, fileUrl],
      existingFiles: prev.existingFiles.filter((file) => file !== fileUrl),
    }));
  };

  const restoreRemovedFile = (fileUrl) => {
    setEditForm((prev) => ({
      ...prev,
      filesToRemove: prev.filesToRemove.filter((file) => file !== fileUrl),
      existingFiles: [...prev.existingFiles, fileUrl],
    }));
  };

  // Data loading
  const loadUserDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await fetchThreads();

      if (response.success && response.data) {
        let threadsData = [];

        if (Array.isArray(response.data)) {
          threadsData = response.data;
        } else if (
          response.data.threads &&
          Array.isArray(response.data.threads)
        ) {
          threadsData = response.data.threads;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          threadsData = response.data.data;
        }

        // Filter threads by current user
        const userThreads = threadsData.filter(
          (thread) =>
            thread.authorId?._id === userId || thread.authorId === userId
        );

        // Transform thread data
        const transformedThreads = userThreads.map((thread) => ({
          id: thread._id,
          title: thread.title,
          content: stripHtml(thread.content),
          rawContent: thread.content, // Keep raw HTML for editing
          createdAt: thread.createdAt,
          upvotes: thread.upVote?.length || 0,
          downvotes: thread.downVote?.length || 0,
          comments: thread.comments?.length || 0,
          shares: thread.shares || 0,
          tags: parseThreadTags(thread.tags),
          thumbnail: Array.isArray(thread.thumbnail) ? thread.thumbnail : [],
          authorId: thread.authorId,
          category: thread.category || "",
        }));

        setDiscussions(transformedThreads);
      } else {
        throw new Error(response.error || "Failed to load discussions");
      }
    } catch (err) {
      console.error("Error loading discussions:", err);
      setError(err.message || "Failed to load discussions");
      message.error("Failed to load discussions");
    } finally {
      setLoading(false);
    }
  }, [stripHtml, parseThreadTags]);

  useEffect(() => {
    loadUserDiscussions();
  }, [loadUserDiscussions]);

  // Event handlers
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
  }, []);

  const handleDeleteClick = useCallback((discussion) => {
    setDiscussionToDelete(discussion);
    setDeleteModalVisible(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!discussionToDelete) return;

    try {
      setDeleteLoading(true);

      const response = await deleteThread(discussionToDelete.id);

      if (response.success) {
        message.success("Discussion deleted successfully");
        setDeleteModalVisible(false);
        loadUserDiscussions();
      } else {
        throw new Error(response.error || "Failed to delete discussion");
      }
    } catch (err) {
      console.error("Error deleting discussion:", err);
      message.error(err.message || "Failed to delete discussion");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalVisible(false);
    setDiscussionToDelete(null);
  }, []);

  // Add this handler for edit form fields
  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Open edit modal and populate form
  const handleEdit = useCallback((discussion) => {
    setDiscussionToEdit(discussion);
    setEditForm({
      title: discussion.title,
      content: discussion.content,
      tags: discussion.tags || [],
      files: [], // New files to upload
      existingFiles: [...(discussion.thumbnail || [])], // Copy existing files
      filesToRemove: [], // Files marked for removal
    });
    setTagInput(""); // Reset tag input
    setSuggestedTags([]); // Reset suggestions
    setEditModalVisible(true);
    setTimeout(() => {
      if (richTextRef.current && discussion.rawContent) {
        richTextRef.current.setContent
          ? richTextRef.current.setContent(discussion.rawContent)
          : null;
      }
    }, 200);
  }, []);

  // Submit edit
  const handleEditSubmit = async () => {
    if (!discussionToEdit) return;
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("_id", discussionToEdit.id);
      formData.append("title", editForm.title);
      formData.append(
        "content",
        richTextRef.current?.getContent() || editForm.content
      );

      // Send tags as JSON string array
      formData.append("tags", JSON.stringify(editForm.tags));

      // Add new files
      for (let i = 0; i < editForm.files.length; i++) {
        formData.append("file", editForm.files[i]);
      }

      // Add files to remove
      for (let i = 0; i < editForm.filesToRemove.length; i++) {
        formData.append("removeFiles", editForm.filesToRemove[i]);
      }

      const response = await fetch(
        "https://api.thegpdn.org/api/thread/EditThread",
        {
          method: "PATCH",
          body: formData,
        }
      );
      const data = await response.json();

      if (data.success) {
        message.success("Discussion updated successfully!");
        setEditModalVisible(false);
        setDiscussionToEdit(null);
        setTagInput("");
        setSuggestedTags([]);
        loadUserDiscussions();
      } else {
        throw new Error(data.message || "Failed to update discussion");
      }
    } catch (err) {
      message.error(err.message || "Failed to update discussion");
    } finally {
      setEditLoading(false);
    }
  };

  // View modal logic
  const handleView = (discussion) => {
    setDiscussionToView(discussion);
    setViewModalVisible(true);
  };

  // Filtered discussions based on search and category
  const filteredDiscussions = useMemo(() => {
    return discussions.filter((discussion) => {
      const matchesSearch =
        !searchTerm ||
        discussion.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discussion.content?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        discussion.tags?.some(
          (tag) => tag.toLowerCase() === selectedCategory.toLowerCase()
        ) ||
        discussion.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [discussions, searchTerm, selectedCategory]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Unknown date";
    }
  }, []);

  // Render functions
  const renderSidebar = () => (
    <div className="w-64 border-r border-gray-200 fixed h-screen overflow-y-auto bg-white shadow-sm">
      <div className="p-5">
        <Image alt="Logo" src={logo} width={100} height={40} priority />
      </div>

      <nav className="mt-5">
        {SIDEBAR_MENUS.map((item, index) => (
          <Link key={index} href={item.link} className="block">
            <div className="cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3 transition-all">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.menu}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );

  const renderHeader = () => (
    <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white fixed w-[calc(100%-256px)] z-10 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">My Discussions</h1>
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search discussions..."
          className="w-80"
          size="large"
          prefix={<IoSearchOutline className="text-gray-400" />}
          onChange={(e) => handleSearch(e.target.value)}
          value={searchTerm}
        />
        <button
          className="px-6 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors font-medium shadow-sm"
          onClick={() => router.push("/forum/create")}
        >
          Create Discussion
        </button>
      </div>
    </div>
  );

  const renderFilePreview = (fileUrl, isRemovable = false, onRemove = null) => {
    const fileType = getFileType(fileUrl);
    const fileName = getFileName(fileUrl);

    if (fileType === "image") {
      return (
        <div className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          <div className="aspect-square relative">
            <img
              src={fileUrl}
              alt={fileName}
              className="w-full h-full object-cover"
            />
            {/* Overlay with view button */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50"
              >
                <FaEye className="text-sm" />
              </a>
            </div>
            {/* Remove button */}
            {isRemovable && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(fileUrl)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
          {/* File name */}
          <div className="p-2">
            <p
              className="text-xs text-gray-600 truncate font-medium"
              title={fileName}
            >
              {fileName}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start gap-3">
            {/* File icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                {fileType === "document" ? (
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : fileType === "pdf" ? (
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <FaFile className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-gray-900 truncate"
                title={fileName}
              >
                {fileName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <FaDownload className="text-xs" />
                  Download
                </a>
              </div>
            </div>

            {/* Remove button */}
            {isRemovable && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(fileUrl)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
        </div>
      );
    }
  };

  const renderDiscussionCard = (discussion) => (
    <div
      key={discussion.id}
      className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#00A99D] to-[#008F84] rounded-full overflow-hidden flex items-center justify-center">
          {discussion.authorId?.imageURL ? (
            <img
              src={discussion.authorId.imageURL}
              alt={discussion.authorId?.fullName || "Author"}
              width={48}
              height={48}
              className="rounded-full w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = azeem.src;
              }}
            />
          ) : (
            <Image
              src={azeem}
              alt="Author"
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg">
            {discussion.authorId?.fullName || "You"}
          </h3>
          <span className="text-sm text-gray-500">
            {formatDate(discussion.createdAt)}
          </span>
        </div>
        <div className="text-gray-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {discussion.title}
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4 md:w-4/5">
          {discussion.content}
        </p>
      </div>

      {/* Tags */}
      {discussion.tags && discussion.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {discussion.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Files and Images */}
      {discussion.thumbnail && discussion.thumbnail.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00A99D] rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700">Attachments</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {discussion.thumbnail.length} file
              {discussion.thumbnail.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {discussion.thumbnail.map((fileUrl, index) => (
              <div key={index} className="w-full">
                {renderFilePreview(fileUrl)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex w-full items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
              <FaHeart className="text-lg" />
              <span className="text-sm font-medium">{discussion.upvotes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <FaComment className="text-lg" />
              <span className="text-sm font-medium">{discussion.comments}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
              <FaShare className="text-lg" />
              <span className="text-sm font-medium">{discussion.shares}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleView(discussion)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#00A99D] transition-colors"
          >
            <FaEye className="text-lg" />
          </button>

          <button
            onClick={() => handleEdit(discussion)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MdEdit className="text-lg" />
          </button>
          <button
            onClick={() => handleDeleteClick(discussion)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <FaTrashCan className="text-lg text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="w-80 bg-white p-6 fixed right-0 h-screen overflow-y-auto border-l border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Filter by Category
      </h2>
      <div className="space-y-2">
        <button
          onClick={() => handleCategoryFilter("")}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            !selectedCategory
              ? "bg-[#00A99D] text-white"
              : "bg-gray-50 hover:bg-gray-100 text-gray-700"
          }`}
        >
          All Categories
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleCategoryFilter(tag)}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === tag
                ? "bg-[#00A99D] text-white"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  // Tag input component for edit modal
  const renderTagInput = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tags</label>

      {/* Selected Tags Display */}
      {editForm.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {editForm.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#00A99D] text-white rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-200 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Input Field */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => handleTagInputChange(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => addTag(tagInput)}
            disabled={
              !tagInput.trim() || editForm.tags.includes(tagInput.trim())
            }
            className="bg-[#00A99D] border-[#00A99D] hover:bg-[#008F84]"
          >
            Add
          </Button>
        </div>

        {/* Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
            {suggestedTags.map((tag, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                onClick={() => addTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags */}
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">Popular tags:</p>
        <div className="flex flex-wrap gap-1">
          {TAGS.filter((tag) => !editForm.tags.includes(tag))
            .slice(0, 8)
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                + {tag}
              </button>
            ))}
        </div>
      </div>
    </div>
  );

  // File management component for edit modal
  const renderFileManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-[#00A99D] rounded-full"></div>
        <label className="text-sm font-semibold text-gray-700">
          Files & Images
        </label>
      </div>

      {/* Existing Files */}
      {editForm.existingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-600">Current Files</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {editForm.existingFiles.length} file
              {editForm.existingFiles.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {editForm.existingFiles.map((fileUrl, index) => (
              <div key={index} className="w-full">
                {renderFilePreview(fileUrl, true, markFileForRemoval)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files marked for removal */}
      {editForm.filesToRemove.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-red-600">
              Files to be removed
            </h4>
            <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">
              {editForm.filesToRemove.length} file
              {editForm.filesToRemove.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {editForm.filesToRemove.map((fileUrl, index) => (
              <div key={index} className="relative w-full">
                <div className="opacity-60">{renderFilePreview(fileUrl)}</div>
                <div className="absolute inset-0 bg-red-500 bg-opacity-10 rounded-xl flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => restoreRemovedFile(fileUrl)}
                    className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 shadow-sm border border-red-200"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Files */}
      {editForm.files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-green-600">
              New Files to Upload
            </h4>
            <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded-full">
              {editForm.files.length} file
              {editForm.files.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {editForm.files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaFile className="text-green-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-sm text-green-700 font-medium">
                      {file.name}
                    </span>
                    <span className="text-xs text-green-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Input */}
      <div className="space-y-2">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00A99D] transition-colors">
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt,.rtf"
            onChange={(e) => handleFileSelection(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#00A99D] bg-opacity-10 rounded-lg flex items-center justify-center mb-3">
                <FaPlus className="text-[#00A99D] text-xl" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Add Files
              </p>
              <p className="text-xs text-gray-500">
                Click to browse or drag and drop
              </p>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Supported formats: Images (JPG, PNG, GIF, WebP), Documents (PDF, DOC,
          DOCX, TXT, RTF)
        </p>
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="user-discussions">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
          <span className="ml-3 text-lg">Loading discussions...</span>
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No discussions yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start sharing your thoughts with the community!
          </p>
          <button
            className="px-6 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors font-medium"
            onClick={() => router.push("/forum/create")}
          >
            Create Your First Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDiscussions.map(renderDiscussionCard)}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Discussion"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
        }}
        className="delete-modal"
      >
        <p>Are you sure you want to delete this discussion?</p>
        {discussionToDelete && (
          <p className="font-bold mt-2 text-gray-800">
            {discussionToDelete.title}
          </p>
        )}
        <p className="text-red-500 mt-2">This action cannot be undone.</p>
      </Modal>

      {/* Edit Discussion Modal */}
      <Modal
        title="Edit Discussion"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          setTagInput("");
          setSuggestedTags([]);
        }}
        okText="Save Changes"
        confirmLoading={editLoading}
        width={900}
        className="edit-modal"
      >
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              placeholder="Discussion title..."
              value={editForm.title}
              onChange={(e) => handleEditFormChange("title", e.target.value)}
              size="large"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Content
            </label>
            <RichTextEditor
              ref={richTextRef}
              initialContent={editForm.content}
              onChange={(value) => handleEditFormChange("content", value)}
            />
          </div>

          {/* Updated Tag Input */}
          {renderTagInput()}

          {/* File Management */}
          {renderFileManagement()}
        </div>
      </Modal>

      {/* View Discussion Modal */}
      <Modal
        title={discussionToView?.title}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={900}
      >
        {discussionToView && (
          <div className="max-h-[70vh] overflow-y-auto">
            <div
              className="prose max-w-none mb-4"
              dangerouslySetInnerHTML={{
                __html: discussionToView.rawContent || discussionToView.content,
              }}
            />

            {/* Files and Images in View Modal */}
            {discussionToView.thumbnail &&
              discussionToView.thumbnail.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-[#00A99D] rounded-full"></div>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Attachments
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {discussionToView.thumbnail.length} file
                      {discussionToView.thumbnail.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {discussionToView.thumbnail.map((fileUrl, index) => (
                      <div key={index} className="w-full">
                        {renderFilePreview(fileUrl)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="mt-4 flex flex-wrap gap-2">
              {discussionToView.tags?.map((tag, idx) => (
                <Tag key={idx} color="#00A99D">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDiscussions;
