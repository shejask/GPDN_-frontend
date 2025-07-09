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
} from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { Modal, Spin, Input, message, Button, Tag } from "antd";
import Link from "next/link";
import azeem from "../../app/assets/registation/Frame.png";
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
    tags: [], // Changed from string to array
    file: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [discussionToView, setDiscussionToView] = useState(null);

  // Tag management state
  const [tagInput, setTagInput] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);

  // For edit modal rich text
  const [existingFile, setExistingFile] = useState(null);
  const richTextRef = React.useRef();

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
          createdAt: thread.createdAt,
          upvotes: thread.upVote?.length || 0,
          downvotes: thread.downVote?.length || 0,
          comments: thread.comments?.length || 0,
          shares: thread.shares || 0,
          tags: parseThreadTags(thread.tags),
          thumbnail: thread.thumbnail || null,
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
      tags: discussion.tags || [], // Keep as array
      file: null,
    });
    setExistingFile(discussion.thumbnail || null);
    setTagInput(""); // Reset tag input
    setSuggestedTags([]); // Reset suggestions
    setEditModalVisible(true);
    setTimeout(() => {
      if (richTextRef.current && discussion.content) {
        richTextRef.current.setContent
          ? richTextRef.current.setContent(discussion.content)
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

      if (editForm.file) {
        formData.append("file", editForm.file);
      } else if (existingFile) {
        formData.append("existingFile", existingFile);
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
        setExistingFile(null);
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

      {/* Thumbnail */}
      {discussion.thumbnail && (
        <div className="mb-4">
          <div className="rounded-lg overflow-hidden">
            <img
              src={discussion.thumbnail}
              alt={discussion.title}
              className="w-full md:w-96 rounded-lg"
              style={{
                maxHeight: "300px",
                objectFit: "cover",
              }}
            />
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
        width={800}
        className="edit-modal"
      >
        <div className="flex flex-col gap-4">
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

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Image
            </label>
            {existingFile && !editForm.file && (
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={existingFile}
                  alt="Current"
                  className="h-16 w-16 object-cover rounded border"
                />
                <Button
                  size="small"
                  danger
                  onClick={() => setExistingFile(null)}
                  icon={<FaTimes />}
                >
                  Remove Current Image
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleEditFormChange("file", e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#00A99D] file:text-white hover:file:bg-[#008F84]"
            />
          </div>
        </div>
      </Modal>

      {/* View Discussion Modal */}
      <Modal
        title={discussionToView?.title}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {discussionToView && (
          <div>
            {discussionToView.thumbnail && (
              <img
                src={discussionToView.thumbnail}
                alt="Discussion"
                className="mb-4 w-full rounded"
                style={{ maxHeight: 300, objectFit: "contain" }}
              />
            )}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: discussionToView.content }}
            />
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
