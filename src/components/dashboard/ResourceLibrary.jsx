"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Input, Spin, message } from "antd";
import logo from "../../app/assets/registation/logo.png";
import { IoSearchOutline } from "react-icons/io5";
import { MdClose, MdDashboard, MdMenu } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoDownloadOutline } from "react-icons/io5";
import { FaFileAlt, FaImage } from "react-icons/fa";
import azeem from "../../app/assets/registation/Frame.png";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchResources,
  fetchResourceTags,
  fetchResourcesByTag,
} from "../../api/resource";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Sidebar from "../Sidebar";

// Constants
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

// Consolidated sidebar menu definition
const SIDEBAR_MENUS = [
  { menu: "Forum", icon: <MdDashboard />, link: "/forum" },
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

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const response = await fetchResourceTags();

        if (response.success && response.data && response.data.data) {
          const tagsData = response.data.data;

          // Process the tags data based on the API response format
          const processedTags = tagsData.flatMap((tag) => {
            // Check if the tag is a JSON string array
            if (
              typeof tag === "string" &&
              tag.trim().startsWith("[") &&
              tag.trim().endsWith("]")
            ) {
              try {
                // Parse the JSON string and return the array items
                const parsedTags = JSON.parse(tag.trim());
                return Array.isArray(parsedTags) ? parsedTags : [tag];
              } catch (e) {
                // If parsing fails, return the original tag
                return [tag];
              }
            }
            // Return the tag as is
            return [tag];
          });

          setTags(processedTags);
        } else {
          console.error(
            "Failed to fetch tags or invalid response format:",
            response
          );
          // Set default tags as fallback
          setDefaultTags();
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        // Set default tags as fallback
        setDefaultTags();
      } finally {
        setTagsLoading(false);
      }
    };

    // Fallback function to set default tags if API fails
    const setDefaultTags = () => {
      setTags([
        "Pain Management",
        "Ethical Issues",
        "End-of-Life Care",
        "Spiritual Care",
        "Psychosocial Support",
        "New Virus",
        "Symptom Control",
        "Lifestyle",
        "Caregiver Support",
        "Pediatric Palliative Care",
      ]);
    };

    fetchTags();
  }, []);

  // Utility functions
  const isImageFile = useCallback((filename) => {
    if (!filename || typeof filename !== "string") return false;
    const extension = filename.split(".").pop()?.toLowerCase();
    return IMAGE_EXTENSIONS.includes(extension);
  }, []);

  const getImageUrl = useCallback((filePath) => {
    if (!filePath) return "";

    // Handle different possible URL formats
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath; // Already a full URL
    }

    // Get base URL for API
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "") ||
      "http://localhost:3001";

    // Handle different file path formats
    let cleanPath = filePath;

    // Remove leading slash if present
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }

    // Handle uploads folder structure
    if (cleanPath.includes("uploads/") && !cleanPath.startsWith("uploads/")) {
      const uploadsIndex = cleanPath.indexOf("uploads/");
      cleanPath = cleanPath.substring(uploadsIndex);
    }

    // If path doesn't start with uploads, assume it's in uploads folder
    if (!cleanPath.startsWith("uploads/")) {
      cleanPath = `uploads/${cleanPath}`;
    }

    // Construct final URL
    const finalUrl = `${baseUrl}/api/resource/file/${cleanPath}`;
    console.log("Generated URL:", finalUrl, "from path:", filePath);

    return finalUrl;
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

  // Event handlers
  const handleImageError = useCallback((fileId) => {
    setImageErrors((prev) => ({
      ...prev,
      [fileId]: true,
    }));
    setImageLoadingStates((prev) => ({
      ...prev,
      [fileId]: false,
    }));
  }, []);

  const handleImageLoad = useCallback((fileId) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [fileId]: false,
    }));
  }, []);

  const handleImageLoadStart = useCallback((fileId) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [fileId]: true,
    }));
  }, []);

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
            const fileURL = isFullUrl ? file : getImageUrl(file);

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

        // Single file download (existing logic)
        const filePath = files[0];
        const isFullUrl =
          filePath.startsWith("http") || filePath.startsWith("https");
        const fileURL = isFullUrl ? filePath : getImageUrl(filePath);

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
    [getImageUrl, getFileExtension]
  );

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
  }, []);

  // Handle tag click to fetch resources by tag
  const handleTagClick = useCallback(async (tag) => {
    try {
      setLoading(true);
      const response = await fetchResourcesByTag(tag);

      if (response.success && response.data) {
        let resourcesArray = [];

        // Extract resources array from various possible response structures
        if (response.data.data && Array.isArray(response.data.data)) {
          resourcesArray = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          resourcesArray = response.data;
        } else if (Array.isArray(response)) {
          resourcesArray = response;
        }

        // Filter approved resources
        const approvedResources = resourcesArray.filter(
          (resource) =>
            resource &&
            (resource.approvalStatus === true ||
              resource.registrationStatus === "approved" ||
              resource.status === "approved")
        );

        console.log(
          "Filtered approved resources by tag:",
          approvedResources.length,
          "out of",
          resourcesArray.length
        );
        setResources(approvedResources || []);
        message.success(`Showing resources for tag: ${tag}`);
      } else {
        message.error("No resources found for this tag");
      }
    } catch (error) {
      console.error("Error fetching resources by tag:", error);
      message.error("Failed to fetch resources by tag");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Data loading
  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchResources();
      console.log("API Response:", response);

      // Extract resources array from various possible response structures
      let resourcesArray = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        resourcesArray = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        resourcesArray = response.data;
      } else if (
        response?.data?.resources &&
        Array.isArray(response.data.resources)
      ) {
        resourcesArray = response.data.resources;
      } else if (Array.isArray(response)) {
        resourcesArray = response;
      } else if (response?.resources && Array.isArray(response.resources)) {
        resourcesArray = response.resources;
      }

      // Filter approved resources
      const approvedResources = resourcesArray.filter(
        (resource) =>
          resource &&
          (resource.approvalStatus === true ||
            resource.registrationStatus === "approved" ||
            resource.status === "approved")
      );

      console.log("Filtered approved resources:", approvedResources.length);
      setResources(approvedResources || []);
    } catch (error) {
      console.error("Error loading resources:", error);
      message.error("Failed to load resources");
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Filtered resources based on search and category
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        !searchTerm ||
        resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        resource.authorId?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Check if the selected category matches any of the resource's tags
      let matchesCategory =
        !selectedCategory ||
        resource.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Also check tags if we have them
      if (
        !matchesCategory &&
        selectedCategory &&
        resource.tags &&
        resource.tags.length > 0
      ) {
        matchesCategory = resource.tags.some((tag) => {
          // Handle case where tag is a JSON string array
          if (
            typeof tag === "string" &&
            (tag.trim().startsWith("[") || tag.trim().startsWith(" [")) &&
            tag.trim().endsWith("]")
          ) {
            try {
              // Remove leading space if present
              const cleanTag = tag.trim().startsWith(" [")
                ? tag.trim().substring(1)
                : tag.trim();
              const parsedTags = JSON.parse(cleanTag);
              if (Array.isArray(parsedTags)) {
                return parsedTags.some(
                  (t) => t.toLowerCase() === selectedCategory.toLowerCase()
                );
              }
            } catch (e) {
              // If parsing fails, check the original tag
              return tag.toLowerCase().includes(selectedCategory.toLowerCase());
            }
          }
          // Check regular tag
          return (
            typeof tag === "string" &&
            tag.toLowerCase() === selectedCategory.toLowerCase()
          );
        });
      }

      return matchesSearch && matchesCategory;
    });
  }, [resources, searchTerm, selectedCategory]);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Add this new function after the existing utility functions (around line 200)
  const handleImageView = useCallback((imageUrl, title, index) => {
    setSelectedImage({
      url: imageUrl,
      title: title,
      index: index,
    });
    setImageModalOpen(true);
  }, []);

  // Add this new function after handleImageView
  const handleSingleImageDownload = useCallback(
    async (filePath, title, index) => {
      try {
        const isFullUrl =
          filePath.startsWith("http") || filePath.startsWith("https");
        const fileURL = isFullUrl ? filePath : getImageUrl(filePath);

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
    [getImageUrl, getFileExtension]
  );

  // Add this new component after the utility functions (around line 300)
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

  // Render functions
  const renderSidebar = () => (
    <div className="hidden md:block w-64 border-r border-gray-200 fixed h-screen overflow-y-auto bg-white shadow-sm">
      <div className="p-5">
        <Image alt="Logo" src={logo} width={100} height={40} priority />
      </div>

      <nav className="mt-5">
        {SIDEBAR_MENUS.map((item, index) => {
          // Check if current path matches menu link (exact or subpath)
          const isActive =
            pathname === item.link ||
            (item.link !== "/" && pathname.startsWith(item.link));

          return (
            <Link key={index} href={item.link} className="block">
              <div
                className={`flex items-center gap-5 px-5 py-3 cursor-pointer duration-300
                    ${
                      isActive
                        ? "bg-[#00A99D] text-white"
                        : "hover:bg-[#00A99D] hover:text-white text-gray-700"
                    }
                  `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.menu}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        <button
          onClick={() => {
            localStorage.removeItem("userFullName");
            localStorage.removeItem("userId");

            console.log("User logged out successfully");
          }}
          className="flex items-center gap-5 px-5 py-4 w-full text-left cursor-pointer 
                                 duration-300 text-gray-700 hover:bg-red-50 hover:text-red-600
                                 transition-colors group"
        >
          <LogOut className="text-xl w-5 h-5 group-hover:text-red-600" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="p-5 md:flex justify-between items-center md:border-b border-gray-200 bg-white fixed md:w-[calc(100%-256px)] z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Resource Library
        </h1>
        {/* Reset button to show all resources */}
        {/* <button
          onClick={loadResources}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
          title="Reset filters and show all resources"
        >
          <MdClose className="text-sm" /> Reset
        </button> */}
      </div>
      <div className="mt-1 md:mt-0 flex gap-3 items-center">
        <Input
          placeholder="Search resources, authors..."
          className="md:w-80 text-sm h-9 md:h-10"
          size="large"
          prefix={<IoSearchOutline className="text-gray-400" />}
          onChange={(e) => handleSearch(e.target.value)}
          value={searchTerm}
        />
        <button
          className="hidden md:block md:px-6 w-36 h-10 md:w-auto md:py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors font-medium shadow-sm"
          onClick={() => router.push("/resource-library/create")}
        >
          Create Resource
        </button>
        <button
          className="md:hidden flex items-center justify-center md:px-6 w-36 h-9 md:w-auto md:py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#008F84] transition-colors font-medium shadow-sm"
          onClick={() => router.push("/resource-library/create")}
        >
          Create
        </button>
      </div>
    </div>
  );

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
                {imageFiles.map((file, index) => {
                  const imageUrl = getImageUrl(file);
                  const hasImageError = imageErrors[`${resource._id}-${index}`];
                  const isImageLoading =
                    imageLoadingStates[`${resource._id}-${index}`];

                  return (
                    <div key={index} className="relative group">
                      {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                          <Spin size="small" />
                        </div>
                      )}

                      {!hasImageError ? (
                        <div className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-lg transition-all duration-300">
                          <div className="relative">
                            <img
                              src={imageUrl}
                              alt={`${resource.title} - Image ${index + 1}`}
                              className="w-full h-40 object-cover"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  imageUrl,
                                  e
                                );
                                handleImageError(`${resource._id}-${index}`);
                              }}
                              onLoad={() =>
                                handleImageLoad(`${resource._id}-${index}`)
                              }
                              onLoadStart={() =>
                                handleImageLoadStart(`${resource._id}-${index}`)
                              }
                              style={{
                                display: isImageLoading ? "none" : "block",
                              }}
                            />

                            {/* Action buttons overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    handleImageView(
                                      imageUrl,
                                      resource.title,
                                      index
                                    )
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                                  title="View full size"
                                >
                                  <FaImage className="text-sm" />
                                  <span className="text-sm font-medium">
                                    View
                                  </span>
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
                      ) : (
                        <div className="border rounded-lg p-6 bg-gray-50 text-center h-40 flex flex-col items-center justify-center">
                          <FaImage className="text-gray-400 text-3xl mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Preview unavailable
                          </p>
                          <button
                            onClick={() =>
                              handleSingleImageDownload(
                                file,
                                resource.title,
                                index
                              )
                            }
                            className="flex items-center gap-2 px-3 py-1 bg-[#00A99D] text-white rounded text-xs hover:bg-[#008F84] transition-colors"
                          >
                            <IoDownloadOutline className="text-xs" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                              onClick={() =>
                                window.open(getImageUrl(file), "_blank")
                              }
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

  const renderResourceCard = (resource) => (
    <div
      key={resource._id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header with author info */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-[#00A99D] to-[#008F84] rounded-full overflow-hidden flex items-center justify-center">
          {resource.authorId?.imageURL ? (
            <img
              src={resource.authorId.imageURL}
              alt={resource.authorId?.fullName || "Author"}
              width={40}
              height={40}
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
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">
            {resource.authorId?.fullName || "Anonymous"}
          </h3>
          <span className="text-xs text-gray-500">
            {new Date(resource.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className=" flex flex-col mb-5">
          <p className="text-gray-700 font-semibold text-lg leading-relaxed ">
            {resource.title}
          </p>
          <p className="text-gray-700 text-sm leading-relaxed ">
            {resource.description}
          </p>
        </div>

        {/* HTML Content */}
        {resource.content && (
          <div className="mb-3 prose max-w-none bg-slate-50 p-4 rounded-2xl">
            <div
              className="text-gray-700 text-sm  font-light leading-relaxed overflow-auto"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.map((tag, index) => {
              let processedTags = [tag];
              if (
                typeof tag === "string" &&
                tag.trim().startsWith("[") &&
                tag.trim().endsWith("]")
              ) {
                try {
                  const parsedTags = JSON.parse(tag.trim());
                  if (Array.isArray(parsedTags)) {
                    processedTags = parsedTags;
                  }
                } catch (e) {
                  processedTags = [tag.trim()];
                }
              } else if (
                typeof tag === "string" &&
                tag.trim().startsWith(" [") &&
                tag.trim().endsWith("]")
              ) {
                try {
                  const parsedTags = JSON.parse(tag.trim().substring(1));
                  if (Array.isArray(parsedTags)) {
                    processedTags = parsedTags;
                  }
                } catch (e) {
                  processedTags = [tag.trim()];
                }
              }

              return processedTags.map((processedTag, tagIndex) => (
                <span
                  key={`${index}-${tagIndex}`}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={() => handleTagClick(processedTag)}
                  title={`Show resources with tag: ${processedTag}`}
                >
                  {processedTag}
                </span>
              ));
            })}
          </div>
        )}

        {/* File Preview/Download Section */}
        {resource.files && resource.files.length > 0 && (
          <div className="space-y-3">
            {/* Images */}
            {resource.files.filter((file) => isImageFile(file)).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {resource.files
                  .filter((file) => isImageFile(file))
                  .map((file, index) => {
                    const imageUrl = getImageUrl(file);
                    const hasImageError =
                      imageErrors[`${resource._id}-${index}`];
                    const isImageLoading =
                      imageLoadingStates[`${resource._id}-${index}`];

                    return (
                      <div key={index} className="relative group">
                        {isImageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                            <Spin size="small" />
                          </div>
                        )}

                        {!hasImageError ? (
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={imageUrl}
                              alt={`${resource.title} - Image ${index + 1}`}
                              className="w-full h-52 object-cover"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  imageUrl,
                                  e
                                );
                                handleImageError(`${resource._id}-${index}`);
                              }}
                              onLoad={() =>
                                handleImageLoad(`${resource._id}-${index}`)
                              }
                              onLoadStart={() =>
                                handleImageLoadStart(`${resource._id}-${index}`)
                              }
                              style={{
                                display: isImageLoading ? "none" : "block",
                              }}
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleImageView(
                                      imageUrl,
                                      resource.title,
                                      index
                                    )
                                  }
                                  className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors shadow-md"
                                  title="View full size"
                                >
                                  <FaImage className="text-sm" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleSingleImageDownload(
                                      file,
                                      resource.title,
                                      index
                                    )
                                  }
                                  className="p-2 bg-[#00A99D] text-white rounded-full hover:bg-[#008F84] transition-colors shadow-md"
                                  title="Download image"
                                >
                                  <IoDownloadOutline className="text-sm" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaImage className="text-gray-400 text-xl" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Documents */}
            {resource.files.filter((file) => !isImageFile(file)).length > 0 && (
              <div className="space-y-2">
                {resource.files
                  .filter((file) => !isImageFile(file))
                  .slice(0, 1)
                  .map((file, index) => {
                    const fileName =
                      file.split("/").pop() ||
                      file.split("\\").pop() ||
                      `Document ${index + 1}`;
                    const fileExtension = getFileExtension(file);

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {fileExtension.toUpperCase()}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleDownload(
                              [file],
                              `${resource.title}-${index + 1}`
                            )
                          }
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <IoDownloadOutline className="text-lg" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Video placeholder - if you have video files */}
            {resource.files.some((file) =>
              ["mp4", "webm", "ogg"].includes(getFileExtension(file))
            ) && (
              <div className="relative">
                <div className="w-full h-40 bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download button */}
        {resource.files && resource.files.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleDownload(resource.files, resource.title)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              <IoDownloadOutline className="text-lg" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="w-64 bg-white fixed right-0 h-screen overflow-y-auto border-l border-gray-200 pt-0 mt-5">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-8 text-gray-900 border-b border-gray-200 pb-4">
          Tags
        </h2>
        <div className="space-y-3">
          {tagsLoading ? (
            <div className="flex justify-center py-4">
              <Spin size="small" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <button
                  key={`${tag}-${index}`}
                  onClick={() => handleCategoryFilter(tag)}
                  className={` text-left px-4 py-1 rounded-full text-sm font-medium transition-all bg-blue-100 duration-200  ${
                    selectedCategory === tag
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Existing mobile header code... */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 mt-16 md:mt-0">
        {renderHeader()}

        <div className="flex pt-14 mt-8 md:pt-0 md:mt-16">
          {/* Posts Section */}
          <div className="flex-1 p-3 md:p-6 md:mr-80">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
                <span className="ml-3 text-lg">Loading resources...</span>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm || selectedCategory
                    ? "No matching resources found"
                    : "No resources available"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory
                    ? "Try adjusting your search or filter criteria"
                    : "Be the first to share a resource with the community!"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  {(searchTerm || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                      }}
                      className="text-[#00A99D] hover:text-[#008F84] font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                {filteredResources.map(renderResourceCard)}
              </div>
            )}
          </div>
          <div className="hidden md:block">{renderCategories()}</div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        image={selectedImage}
      />
    </div>
  );
};

export default ResourceLibrary;
