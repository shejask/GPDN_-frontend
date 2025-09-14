"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Empty,
  Spin,
  Card,
  Tag,
  Button,
  message,
  Modal,
  Tooltip,
  Pagination,
  ConfigProvider,
  Input,
} from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";
import { IoDownloadOutline } from "react-icons/io5";
import { FaImage, FaUser, FaFileAlt } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import {
  fetchResourcesByAuthor,
  deleteResource,
  downloadResourceFile,
  getFileExtension,
  isImageFile,
} from "../../api/resource";
import RichTextEditor from "./RichTextEditor";
import dynamic from "next/dynamic";
import Link from "next/link";

// Using default avatar image path
const defaultAvatarPath = "/assets/default-avatar.png";

const { Meta } = Card;

// Constants
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

const UserResources = () => {
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suppress console errors for development only
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === "string" && args[0].includes("antd:")) {
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalResources, setTotalResources] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    tags: [],
    content: "",
    files: [],
  });

  const [inputVisible, setInputVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [resourceToView, setResourceToView] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const richTextRef = React.useRef();
  const [inputValue, setInputValue] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadUserResources();
  }, [currentPage]);

  const showInput = () => {
    setInputVisible(true);
  };

  const loadUserResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      // Using the updated API call with POST method
      const response = await fetchResourcesByAuthor(userId);

      if (response.success && response.data) {
        // Process the response data
        let resourceData = [];

        if (Array.isArray(response.data)) {
          resourceData = response.data;
        } else if (
          response.data.resources &&
          Array.isArray(response.data.resources)
        ) {
          resourceData = response.data.resources;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          resourceData = response.data.data;
        }

        console.log("Loaded user resources:", resourceData);
        setResources(resourceData);
        setTotalResources(resourceData.length);
      } else {
        throw new Error(response.error || "Failed to load resources");
      }
    } catch (err) {
      console.error("Error loading resources:", err);
      setError(err.message || "Failed to load resources");
      message.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;

    try {
      setDeleteLoading(true);

      const response = await deleteResource(resourceToDelete._id);

      if (response.success) {
        message.success("Resource deleted successfully");
        setDeleteModalVisible(false);
        loadUserResources(); // Reload resources after deletion
      } else {
        throw new Error(response.error || "Failed to delete resource");
      }
    } catch (err) {
      console.error("Error deleting resource:", err);
      message.error(err.message || "Failed to delete resource");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setResourceToDelete(null);
  };

  // Utility functions
  const isImageFile = useCallback((filename) => {
    if (!filename || typeof filename !== "string") return false;
    const extension = filename.split(".").pop()?.toLowerCase();
    return IMAGE_EXTENSIONS.includes(extension);
  }, []);

  const getFileExtension = useCallback((filename) => {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase() || "";
  }, []);

  const getFileIcon = useCallback(
    (filename) => {
      const extension = getFileExtension(filename);

      switch (extension) {
        case "pdf":
          return <FaFileAlt className="text-red-500" />;
        case "doc":
        case "docx":
          return <FaFileAlt className="text-blue-500" />;
        case "xls":
        case "xlsx":
          return <FaFileAlt className="text-green-500" />;
        case "ppt":
        case "pptx":
          return <FaFileAlt className="text-orange-500" />;
        default:
          return isImageFile(filename) ? (
            <FaImage className="text-purple-500" />
          ) : (
            <FaFileAlt className="text-gray-500" />
          );
      }
    },
    [isImageFile, getFileExtension]
  );

  const handleDownload = useCallback(
    async (files, title) => {
      if (!files || !files.length) {
        message.error("No file available for download");
        return;
      }

      try {
        // If multiple files, download them one by one
        if (files.length > 1) {
          message.info(`Downloading ${files.length} files...`);

          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isFullUrl =
              file.startsWith("http") || file.startsWith("https");
            const fileURL = isFullUrl ? file : file;

            if (!fileURL) {
              console.error("Invalid file URL for:", file);
              continue;
            }

            const originalFilename =
              file.split("/").pop() ||
              file.split("\\").pop() ||
              `file-${i + 1}`;
            const fileExtension = getFileExtension(file) || "file";
            const filename = originalFilename.includes(".")
              ? originalFilename
              : `${title || originalFilename}-${i + 1}.${fileExtension}`;

            try {
              const response = await fetch(fileURL);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              a.style.display = "none";

              document.body.appendChild(a);
              a.click();

              setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }, 100);

              // Small delay between downloads
              if (i < files.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            } catch (error) {
              console.error(`Error downloading file ${i + 1}:`, error);
              // Try opening in new tab as fallback
              window.open(fileURL, "_blank");
            }
          }

          message.success(`All ${files.length} files downloaded successfully`);
          return;
        }

        // Single file download
        const filePath = files[0];
        const isFullUrl =
          filePath.startsWith("http") || filePath.startsWith("https");
        const fileURL = isFullUrl ? filePath : filePath;

        if (!fileURL) {
          throw new Error("Invalid file URL");
        }

        const originalFilename =
          filePath.split("/").pop() || filePath.split("\\").pop() || "download";
        const fileExtension = getFileExtension(filePath) || "file";
        const filename = originalFilename.includes(".")
          ? originalFilename
          : `${title || originalFilename}.${fileExtension}`;

        try {
          const response = await fetch(fileURL);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.style.display = "none";

          document.body.appendChild(a);
          a.click();

          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);

          message.success("File downloaded successfully");
        } catch (fetchError) {
          console.log(
            "Blob download failed, trying alternative method:",
            fetchError
          );

          // Fallback methods
          try {
            const a = document.createElement("a");
            a.href = fileURL;
            a.download = filename;
            a.rel = "noopener noreferrer";
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
              document.body.removeChild(a);
            }, 100);

            message.success("Download initiated");
          } catch (linkError) {
            console.error("Link download failed:", linkError);
            window.open(fileURL, "_blank");
            message.success("Opening file in new tab");
          }
        }
      } catch (error) {
        console.error("Error downloading file:", error);
        message.error("Failed to download the file. Please try again later.");
      }
    },
    [getFileExtension]
  );

  const handleSingleImageDownload = useCallback(
    async (filePath, title, index) => {
      try {
        const isFullUrl =
          filePath.startsWith("http") || filePath.startsWith("https");
        const fileURL = isFullUrl ? filePath : filePath;

        if (!fileURL) {
          throw new Error("Invalid file URL");
        }

        const originalFilename =
          filePath.split("/").pop() || filePath.split("\\").pop() || "download";
        const fileExtension = getFileExtension(filePath) || "file";
        const filename = originalFilename.includes(".")
          ? originalFilename
          : `${title || originalFilename}-${index + 1}.${fileExtension}`;

        const response = await fetch(fileURL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        message.success("Image downloaded successfully");
      } catch (error) {
        console.error("Error downloading image:", error);
        message.error("Failed to download the image. Please try again later.");
      }
    },
    [getFileExtension]
  );

  const handlePreview = (resource) => {
    setPreviewResource(resource);
    setPreviewModalVisible(true);
  };

  const handleEdit = (resource) => {
    setResourceToEdit(resource);
    setEditForm({
      title: resource.title,
      description: resource.description,
      tags: Array.isArray(resource.tags)
        ? resource.tags
        : typeof resource.tags === "string"
        ? resource.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      content: resource.content || "",
      files: [],
    });
    setExistingFiles(
      resource.files && resource.files.length ? resource.files : []
    );
    setRemovedFiles([]); // Reset removed files when editing
    setEditModalVisible(true);
    setTimeout(() => {
      if (richTextRef.current && resource.content) {
        richTextRef.current.setContent
          ? richTextRef.current.setContent(resource.content)
          : null;
      }
    }, 200);
  };

  // Add this handler for edit form fields
  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!resourceToEdit) return;
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("_id", resourceToEdit._id);
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      editForm.tags.forEach((tag) => formData.append("tags", tag));
      formData.append(
        "content",
        richTextRef.current?.getContent() || editForm.content
      );

      // Handle new files - append each file individually
      if (editForm.files && editForm.files.length > 0) {
        for (let i = 0; i < editForm.files.length; i++) {
          formData.append("file", editForm.files[i]);
        }
      }

      // Handle files to remove - append each file individually
      if (removedFiles && removedFiles.length > 0) {
        for (let i = 0; i < removedFiles.length; i++) {
          formData.append("removeFiles", removedFiles[i]);
        }
      }

      const response = await fetch(
        "https://api.thegpdn.org/api/resource/EditResource",
        {
          method: "PATCH",
          body: formData,
        }
      );
      const data = await response.json();

      if (data.success) {
        message.success("Resource updated successfully!");
        setEditModalVisible(false);
        setResourceToEdit(null);
        setExistingFiles([]);
        setRemovedFiles([]);
        loadUserResources();
      } else {
        throw new Error(data.message || "Failed to update resource");
      }
    } catch (err) {
      message.error(err.message || "Failed to update resource");
    } finally {
      setEditLoading(false);
    }
  };

  const handleView = (resource) => {
    setResourceToView(resource);
    setViewModalVisible(true);
  };

  // Add this new function after the existing utility functions
  const handleImageView = useCallback((imageUrl, title, index) => {
    setSelectedImage({
      url: imageUrl,
      title: title,
      index: index,
    });
    setImageModalOpen(true);
  }, []);

  // Add this new component after the utility functions
  const ImageModal = ({ isOpen, onClose, image }) => {
    if (!isOpen || !image) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="relative max-w-4xl max-h-[90vh] mx-4">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
          >
            <MdClose />
          </button>
          <img
            src={image.url}
            alt={image.title}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
            <p className="text-white text-sm font-medium">{image.title}</p>
            <p className="text-gray-300 text-xs">Image {image.index + 1}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderFilePreview = (resource) => {
    if (!resource.files || !resource.files.length) return null;

    const imageFiles = resource.files.filter((file) => isImageFile(file));
    const documentFiles = resource.files.filter((file) => !isImageFile(file));

    return (
      <div className="mt-4 border-t pt-4">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaFileAlt className="text-gray-500" />
            Files ({resource.files.length})
          </h4>

          {/* Image Gallery */}
          {imageFiles.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <FaImage className="text-blue-500" />
                Images ({imageFiles.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-lg transition-all duration-300">
                      <div className="relative">
                        <img
                          src={file}
                          alt={`${resource.title} - Image ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />

                        {/* Action buttons overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleImageView(file, resource.title, index)
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                              title="View full size"
                            >
                              <FaImage className="text-sm" />
                              <span className="text-sm font-medium">View</span>
                            </button>
                            <button
                              onClick={() =>
                                handleSingleImageDownload(
                                  file,
                                  resource.title,
                                  index
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors shadow-md"
                              title="Download image"
                            >
                              <IoDownloadOutline className="text-sm" />
                              <span className="text-sm font-medium">
                                Download
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Image info */}
                      <div className="p-3 bg-white">
                        <p className="text-xs text-gray-600 truncate">
                          {file.split("/").pop() || `Image ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getFileExtension(file).toUpperCase()} Image
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Files */}
          {documentFiles.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <FaFileAlt className="text-green-500" />
                Documents ({documentFiles.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentFiles.map((file, index) => {
                  const fileExtension = getFileExtension(file);
                  const fileName =
                    file.split("/").pop() ||
                    file.split("\\").pop() ||
                    `Document ${index + 1}`;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                          {getFileIcon(file)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate mb-1">
                          {fileName}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {fileExtension.toUpperCase()} Document
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleDownload(
                                [file],
                                `${resource.title}-${index + 1}`
                              )
                            }
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-[#00A99D] text-white rounded hover:bg-[#008F84] transition-colors"
                          >
                            <IoDownloadOutline className="text-xs" />
                            Download
                          </button>
                          {(fileExtension === "pdf" ||
                            fileExtension === "doc" ||
                            fileExtension === "docx") && (
                            <button
                              onClick={() => window.open(file, "_blank")}
                              className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                            >
                              <FaFileAlt className="text-xs" />
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleDownload(resource.files, resource.title)}
              className="flex items-center justify-center px-4 py-2 bg-[#00A99D] text-white rounded-lg gap-2 hover:bg-[#008F84] transition-all font-medium shadow-sm"
            >
              <IoDownloadOutline className="text-sm" />
              <span>Download All Files</span>
            </button>

            {imageFiles.length > 0 && (
              <button
                onClick={() =>
                  handleDownload(imageFiles, `${resource.title}-images`)
                }
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg gap-2 hover:bg-gray-50 transition-colors"
              >
                <FaImage className="text-sm" />
                <span>Download All Images</span>
              </button>
            )}

            {documentFiles.length > 0 && (
              <button
                onClick={() =>
                  handleDownload(documentFiles, `${resource.title}-documents`)
                }
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg gap-2 hover:bg-gray-50 transition-colors"
              >
                <FaFileAlt className="text-sm" />
                <span>Download All Documents</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (!previewResource) return null;

    // Get file path from files array if available, otherwise use filePath or file
    const filePath =
      previewResource.files && previewResource.files.length
        ? previewResource.files[0]
        : previewResource.filePath || previewResource.file;

    if (!filePath) {
      return (
        <div className="text-center p-8">
          <p>No preview available for this resource</p>
        </div>
      );
    }

    if (isImageFile(filePath)) {
      return (
        <div className="flex justify-center">
          <img
            src={filePath}
            alt={previewResource.title}
            className="max-w-full max-h-[70vh]"
          />
        </div>
      );
    }

    const extension = getFileExtension(filePath);

    if (extension === "pdf") {
      return (
        <div className="h-[70vh]">
          <iframe
            src={`${filePath}#toolbar=0`}
            className="w-full h-full"
            title={previewResource.title}
          />
        </div>
      );
    }

    return (
      <div className="text-center p-8">
        <div className="mb-4">{getFileIcon(filePath)}</div>
        <p>Preview not available for this file type</p>
        <p className="text-gray-500 mt-2">
          You can download the file to view it
        </p>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          className="mt-4 bg-[#00A99D] hover:bg-[#008F84] border-none"
          onClick={() => handleDownload([filePath], previewResource.title)}
        >
          Download File
        </Button>
      </div>
    );
  };

  // Calculate pagination
  const paginatedResources = resources.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="user-resources">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Resources</h2>
        <Link href="/resource-library/create">
          <Button
            type="primary"
            className="bg-[#00A99D] hover:bg-[#008F84] border-none shadow-sm"
          >
            Create New Resource
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
          <span className="ml-3 text-lg text-gray-600">
            Loading resources...
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No resources yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start sharing your knowledge with the community!
          </p>
          <Link href={"/resource-library/create"}>
            <Button
              type="primary"
              className="bg-[#00A99D] hover:bg-[#008F84] border-none shadow-sm px-6 py-2 h-auto"
            >
              Create Your First Resource
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
            {paginatedResources.map((resource) => (
              <div
                key={resource._id}
                className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00A99D] to-[#008F84] rounded-full overflow-hidden flex items-center justify-center">
                    {resource.authorId?.imageURL ? (
                      <img
                        src={resource.authorId.imageURL}
                        alt={resource.authorId?.fullName || "Author"}
                        width={48}
                        height={48}
                        className="rounded-full w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultAvatarPath; // Fallback to default image
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-white">
                        <FaUser size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {resource.authorId?.fullName || "Anonymous"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(resource.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="ml-auto flex gap-1">
                    <Tooltip title="Edit">
                      <Button
                        type="text"
                        icon={<EditOutlined className="text-[#00A99D]" />}
                        onClick={() => handleEdit(resource)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteClick(resource)}
                      />
                    </Tooltip>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 leading-relaxed line-clamp-2 md:w-4/5">
                  {resource.description}
                </p>
                <hr className="mt-2" />
                <div className="text-gray-600 mb-4 leading-relaxed mt-5 md:w-4/5">
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: resource.content }}
                  />
                </div>

                {/* Approval Status */}
                {resource.approvalStatus === false && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md text-sm font-medium border border-yellow-200">
                      Status: Pending Approval
                    </span>
                  </div>
                )}

                {/* Category Tag */}
                {resource.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags &&
                      Array.isArray(resource.tags) &&
                      resource.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-1 bg-blue-300 rounded-full text-sm font-medium border border-[#00A99D]/20"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}

                {/* File Preview/Download Section */}
                {renderFilePreview(resource)}
              </div>
            ))}
          </div>

          {resources.length > pageSize && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalResources}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Resource"
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
        <p>Are you sure you want to delete this resource?</p>
        {resourceToDelete && (
          <p className="font-bold mt-2 text-gray-800">
            {resourceToDelete.title}
          </p>
        )}
        <p className="text-red-500 mt-2">This action cannot be undone.</p>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={previewResource?.title || "Resource Preview"}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            className="bg-[#00A99D] hover:bg-[#008F84] border-none"
            icon={<DownloadOutlined />}
            onClick={() =>
              previewResource &&
              handleDownload(previewResource.files, previewResource.title)
            }
          >
            Download
          </Button>,
        ]}
        width={800}
        className="resource-preview-modal"
      >
        {renderPreviewContent()}
      </Modal>

      {/* Edit Resource Modal */}
      <Modal
        title="Edit Resource"
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
          <Input
            placeholder="Description"
            value={editForm.description}
            onChange={(e) =>
              handleEditFormChange("description", e.target.value)
            }
          />

          <div className="mb-8">
            <label className="block text-gray-900 text-base font-semibold mb-3">
              Tags
            </label>
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {editForm.tags.map((tag, idx) => (
                  <div
                    key={tag + idx}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((t, i) => i !== idx),
                        }))
                      }
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                {inputVisible ? (
                  <Input
                    type="text"
                    size="small"
                    style={{
                      width: 120,
                      height: 32,
                      fontSize: "14px",
                    }}
                    className="rounded-full border-gray-300 focus:border-[#00A99D] focus:ring-0"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={() => {
                      if (
                        inputValue &&
                        !editForm.tags.includes(inputValue.trim())
                      ) {
                        setEditForm((prev) => ({
                          ...prev,
                          tags: [...prev.tags, inputValue.trim()],
                        }));
                      }
                      setInputVisible(false);
                      setInputValue("");
                    }}
                    onPressEnter={() => {
                      if (
                        inputValue &&
                        !editForm.tags.includes(inputValue.trim())
                      ) {
                        setEditForm((prev) => ({
                          ...prev,
                          tags: [...prev.tags, inputValue.trim()],
                        }));
                      }
                      setInputVisible(false);
                      setInputValue("");
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={showInput}
                    className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Tag
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setEditForm((prev) => ({ ...prev, tags: [] }))}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear All Tags
                </button>
                <button
                  onClick={() => {
                    setEditForm((prev) => ({ ...prev, files: [] }));
                    setRemovedFiles([]); // Reset removed files when clearing
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-900 transition-colors"
                >
                  Clear New Files
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm">Content</label>
            <RichTextEditor
              ref={richTextRef}
              initialContent={editForm.content}
              onChange={(value) => handleEditFormChange("content", value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Files</label>

            {/* Show existing files */}
            {existingFiles && existingFiles.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-600 mb-2">
                  Current Files ({existingFiles.length}):
                </h5>
                <div className="space-y-2">
                  {existingFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                    >
                      <span className="text-xs text-gray-500 flex-1 truncate">
                        {file.split("/").pop() || `File ${index + 1}`}
                      </span>
                      <Button
                        size="small"
                        danger
                        onClick={() => {
                          const fileToRemove = existingFiles[index];
                          const newFiles = existingFiles.filter(
                            (_, i) => i !== index
                          );
                          setExistingFiles(newFiles);
                          // Add to removed files list
                          setRemovedFiles((prev) => [...prev, fileToRemove]);
                        }}
                        title="Remove this file"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Show removed files count */}
                {removedFiles.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-700">
                        {removedFiles.length} file(s) marked for removal
                      </p>
                      <Button
                        size="small"
                        onClick={() => {
                          // Restore all removed files
                          setExistingFiles((prev) => [
                            ...prev,
                            ...removedFiles,
                          ]);
                          setRemovedFiles([]);
                        }}
                        className="text-xs"
                      >
                        Restore All
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Removing files here will delete them from the resource. This
                  action cannot be undone.
                </p>
              </div>
            )}

            {/* File input for new files */}
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setEditForm((prev) => ({ ...prev, files: files }));
              }}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Select multiple files to add. Files will be merged with existing
              ones.
            </p>

            {/* Show selected new files */}
            {editForm.files && editForm.files.length > 0 && (
              <div className="mt-2">
                <h6 className="text-sm font-medium text-gray-600 mb-2">
                  New Files to Add ({editForm.files.length}):
                </h6>
                <div className="space-y-1">
                  {editForm.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200"
                    >
                      <span className="text-xs text-blue-700 flex-1 truncate">
                        {file.name}
                      </span>
                      <Button
                        size="small"
                        danger
                        onClick={() => {
                          const newFiles = editForm.files.filter(
                            (_, i) => i !== index
                          );
                          setEditForm((prev) => ({ ...prev, files: newFiles }));
                        }}
                        title="Remove this new file"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File operation summary */}
            {/* {(editForm.files && editForm.files.length > 0) ||
            (existingFiles && existingFiles.length > 0) ||
            (removedFiles && removedFiles.length > 0) ? (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h6 className="text-sm font-medium text-blue-800 mb-2">
                  File Operation Summary:
                </h6>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Files to keep: {existingFiles.length}</p>
                  <p>• New files to add: {editForm.files?.length || 0}</p>
                  <p>• Files to remove: {removedFiles.length}</p>
                  <p className="font-medium">
                    • Backend will receive: {editForm.files?.length || 0} new
                    files as "file" fields, {removedFiles.length} files as
                    "removeFiles" fields
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  No file changes will be made
                </p>
              </div>
            )} */}
          </div>
        </div>
      </Modal>

      {/* View Resource Modal */}
      <Modal
        title={resourceToView?.title}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {resourceToView && (
          <div>
            <div className="mb-4">
              <strong>Description:</strong>
              <div>{resourceToView.description}</div>
            </div>
            <div className="mb-4">
              <strong>Content:</strong>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: resourceToView.content }}
              />
            </div>
            <div className="mb-4">
              <strong>Tags:</strong>
              <div className="flex flex-wrap gap-2">
                {(resourceToView.tags || []).map((tag, idx) => (
                  <Tag key={idx} color="#00A99D">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
            {resourceToView.files && resourceToView.files.length > 0 && (
              <div className="mb-4">
                <strong>Files:</strong>
                <div className="space-y-2 mt-2">
                  {resourceToView.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-600 flex-1">
                        {file.split("/").pop() || `File ${idx + 1}`}
                      </span>
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        image={selectedImage}
      />
    </div>
  );
};

export default UserResources;
