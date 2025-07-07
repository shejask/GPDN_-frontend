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
} from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { Modal, Spin, Input, message, Button, Tag } from "antd";
import Link from "next/link";
import azeem from "../../app/assets/registation/Frame.png";
import { fetchThreads, deleteThread } from "../../api/forum";
import dynamic from "next/dynamic";

import RichTextEditor from "./RichTextEditor";

// Sample data for tags and sidebar
const TAGS = [
  "Palliative Care",
  "Rural Healthcare",
  "Resource Limitations",
  "Education",
  "Research",
  "Policy",
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
    tags: "",
    file: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [discussionToView, setDiscussionToView] = useState(null);

  // For edit modal rich text
  const [existingFile, setExistingFile] = useState(null);
  const richTextRef = React.useRef();

  // Helper function to parse thread tags
  const parseThreadTags = useCallback((tags) => {
    if (!tags || tags.length === 0) return [];

    try {
      const tagItem = tags[0];
      if (typeof tagItem === "string") {
        if (tagItem.startsWith('["') && tagItem.endsWith('"]')) {
          return JSON.parse(tagItem);
        } else if (tagItem.startsWith("[") && tagItem.endsWith("]")) {
          return JSON.parse(tagItem);
        } else {
          return [tagItem];
        }
      } else {
        return Array.isArray(tags) ? tags : [];
      }
    } catch (parseError) {
      console.error("Error parsing tags:", parseError);
      return Array.isArray(tags) ? tags : [];
    }
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
      tags: (discussion.tags || []).join(", "),
      file: null,
    });
    setExistingFile(discussion.thumbnail || null);
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
      formData.append("tags", editForm.tags);

      if (editForm.file) {
        formData.append("file", editForm.file); // New file selected
      } else if (existingFile) {
        formData.append("existingFile", existingFile); // Send existing image as a fallback
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
        <div>
          <h3 className="font-semibold text-gray-800">
            {discussion.authorId?.fullName || "You"}
          </h3>
          <span className="text-sm text-gray-500">
            {formatDate(discussion.createdAt)}
          </span>
        </div>
      </div>

      {/* Thumbnail */}
      {discussion.thumbnail && (
        <div className="mb-4">
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <img
              src={discussion.thumbnail}
              alt={discussion.title}
              className="w-full rounded-lg shadow-sm"
              style={{
                maxHeight: "300px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {discussion.title}
      </h3>
      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
        {discussion.content}
      </p>

      {/* Tags */}
      {discussion.tags && discussion.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {discussion.tags.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gradient-to-r from-[#E3F5FE] to-[#F0FFFE] text-[#00A99D] rounded-full text-sm font-medium border border-[#00A99D]/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 text-gray-600">
        <div className="flex items-center gap-2">
          <FaHeart className="text-red-500" />
          <span className="text-sm">{discussion.upvotes}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaHeartBroken className="text-gray-400" />
          <span className="text-sm">{discussion.downvotes}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaComment className="text-blue-500" />
          <span className="text-sm">{discussion.comments}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaShare className="text-green-500" />
          <span className="text-sm">{discussion.shares}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleView(discussion)}
          className="flex items-center justify-center px-4 py-2 bg-[#00A99D] text-white rounded-lg gap-2 hover:bg-[#008F84] transition-all font-medium flex-1"
        >
          <FaEye className="text-sm" />
          <span>View</span>
        </button>

        <button
          onClick={() => handleEdit(discussion)}
          className="flex items-center justify-center px-4 py-2 border-2 border-[#00A99D] rounded-lg gap-2 text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all font-medium flex-1"
        >
          <FaEdit className="text-sm" />
          <span>Edit</span>
        </button>

        <button
          onClick={() => handleDeleteClick(discussion)}
          className="flex items-center justify-center px-4 py-2 border-2 border-red-500 rounded-lg gap-2 text-red-500 hover:bg-red-500 hover:text-white transition-all font-medium flex-1"
        >
          <FaTrash className="text-sm" />
          <span>Delete</span>
        </button>
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
        onCancel={() => setEditModalVisible(false)}
        okText="Save"
        confirmLoading={editLoading}
        width={700}
      >
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Title"
            value={editForm.title}
            onChange={(e) => handleEditFormChange("title", e.target.value)}
          />
          <div>
            <label className="block mb-1 text-sm">Content</label>
            <RichTextEditor
              ref={richTextRef}
              initialContent={editForm.content}
              onChange={(value) => handleEditFormChange("content", value)}
            />
          </div>
          <Input
            placeholder="Tags (comma separated)"
            value={editForm.tags}
            onChange={(e) => handleEditFormChange("tags", e.target.value)}
          />
          <div>
            <label className="block mb-1 text-sm">Image</label>
            {existingFile && !editForm.file && (
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={existingFile}
                  alt="Current"
                  className="h-16 rounded"
                />
                <Button
                  size="small"
                  danger
                  onClick={() => setExistingFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleEditFormChange("file", e.target.files[0])}
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
        width={700}
      >
        {discussionToView && (
          <div>
            {discussionToView.thumbnail && (
              <img
                src={discussionToView.thumbnail}
                alt="Discussion"
                className="mb-4 w-full rounded"
                style={{ maxHeight: 250, objectFit: "contain" }}
              />
            )}
            <div
              className="prose"
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
