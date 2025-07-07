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
import { fetchResources, fetchResourceTags, fetchResourcesByTag } from "../../api/resource";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

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
          const processedTags = tagsData.flatMap(tag => {
            // Check if the tag is a JSON string array
            if (typeof tag === 'string' && tag.trim().startsWith('[') && tag.trim().endsWith(']')) {
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
          console.error('Failed to fetch tags or invalid response format:', response);
          // Set default tags as fallback
          setDefaultTags();
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
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
  const handleImageError = useCallback((resourceId) => {
    setImageErrors((prev) => ({
      ...prev,
      [resourceId]: true,
    }));
    setImageLoadingStates((prev) => ({
      ...prev,
      [resourceId]: false,
    }));
  }, []);

  const handleImageLoad = useCallback((resourceId) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [resourceId]: false,
    }));
  }, []);

  const handleImageLoadStart = useCallback((resourceId) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [resourceId]: true,
    }));
  }, []);

  const handleDownload = useCallback(
    async (files, title) => {
      if (!files || !files.length) {
        message.error("No file available for download");
        return;
      }

      try {
        const filePath = files[0];
        // Determine if the file path is already a full URL
        const isFullUrl =
          filePath.startsWith("http") || filePath.startsWith("https");
        // Get the file URL - either use directly or construct it
        const fileURL = isFullUrl ? filePath : getImageUrl(filePath);

        if (!fileURL) {
          throw new Error("Invalid file URL");
        }

        console.log("Attempting to download from:", fileURL);

        // Extract filename from the file path for better naming
        const originalFilename =
          filePath.split("/").pop() || filePath.split("\\").pop() || "download";
        const fileExtension = getFileExtension(filePath) || "file";
        const filename = originalFilename.includes(".")
          ? originalFilename
          : `${title || originalFilename}.${fileExtension}`;

        // Method 1: Direct download using Blob
        try {
          // Use 'cors' mode for same-origin requests, but don't specify mode for cross-origin
          // This lets the browser handle CORS properly
          const fetchOptions = {
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
            },
          };

          const response = await fetch(fileURL, fetchOptions);

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

          // Cleanup
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);

          message.success("File downloaded successfully");
          return; // Exit if successful
        } catch (fetchError) {
          console.log(
            "Blob download failed, trying alternative method:",
            fetchError
          );
        }

        // Method 2: Direct link with download attribute
        try {
          const a = document.createElement("a");
          a.href = fileURL;
          a.download = filename;
          a.rel = "noopener noreferrer";
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();

          // Cleanup
          setTimeout(() => {
            document.body.removeChild(a);
          }, 100);

          message.success("Download initiated");
          return; // Exit if successful
        } catch (linkError) {
          console.error("Link download failed:", linkError);
        }

        // Method 3: Open in new tab as last resort
        window.open(fileURL, "_blank");
        message.success("Opening file in new tab");
      } catch (error) {
        console.error("Error downloading file:", error);
        message.error("Failed to download the file. Please try again later.");

        // Show more detailed error to help with debugging
        console.log("Download error details:", {
          error: error.message,
          files,
          title,
        });
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
        
        console.log("Filtered approved resources by tag:", approvedResources.length, "out of", resourcesArray.length);
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
      let matchesCategory = !selectedCategory || 
                           resource.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      // Also check tags if we have them
      if (!matchesCategory && selectedCategory && resource.tags && resource.tags.length > 0) {
        matchesCategory = resource.tags.some(tag => {
          // Handle case where tag is a JSON string array
          if (typeof tag === 'string' && 
             (tag.trim().startsWith('[') || tag.trim().startsWith(' [')) && 
              tag.trim().endsWith(']')) {
            try {
              // Remove leading space if present
              const cleanTag = tag.trim().startsWith(' [') ? tag.trim().substring(1) : tag.trim();
              const parsedTags = JSON.parse(cleanTag);
              if (Array.isArray(parsedTags)) {
                return parsedTags.some(t => 
                  t.toLowerCase() === selectedCategory.toLowerCase()
                );
              }
            } catch (e) {
              // If parsing fails, check the original tag
              return tag.toLowerCase().includes(selectedCategory.toLowerCase());
            }
          }
          // Check regular tag
          return typeof tag === 'string' && 
                 tag.toLowerCase() === selectedCategory.toLowerCase();
        });
      }

      return matchesSearch && matchesCategory;
    });
  }, [resources, searchTerm, selectedCategory]);

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
        <button
          onClick={loadResources}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
          title="Reset filters and show all resources"
        >
          <MdClose className="text-sm" /> Reset
        </button>
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

    const file = resource.files[0];
    const isImage = isImageFile(file);
    const imageUrl = getImageUrl(file);
    const hasImageError = imageErrors[resource._id];
    const isImageLoading = imageLoadingStates[resource._id];

    console.log("Rendering file preview:", {
      file,
      imageUrl,
      isImage,
      hasImageError,
    });

    return (
      <div className="mt-4 border-t pt-4">
        {isImage && !hasImageError ? (
          <div className="mb-4 relative">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                <Spin size="large" />
              </div>
            )}
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={imageUrl}
                alt={resource.title}
                className="max-w-full rounded-lg shadow-sm"
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl, e);
                  handleImageError(resource._id);
                }}
                onLoad={(e) => {
                  console.log("Image loaded successfully:", imageUrl);
                  handleImageLoad(resource._id);
                }}
                onLoadStart={() => handleImageLoadStart(resource._id)}
                style={{
                  maxHeight: "250px", // Reduced from 400px to 300px
                  objectFit: "contain",
                  width: "100%",
                  display: isImageLoading ? "none" : "block",
                }}
              />
            </div>
            {hasImageError && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <FaImage />
                  <span className="text-sm">Image preview not available</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4 border">
            <div className="text-2xl">{getFileIcon(file)}</div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 break-all">
                {file.split("/").pop() ||
                  file.split("\\").pop() ||
                  "Unknown file"}
              </div>
              <div className="text-sm text-gray-500">
                {getFileExtension(file).toUpperCase()} File
                {hasImageError && isImage && (
                  <span className="text-red-500 ml-2">
                    (Image preview failed)
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1 break-all">
                Path: {file}
              </div>
            </div>
          </div>
        )}

        <div className=" md:flex md:gap-2   ">
          <button
            onClick={() => handleDownload(resource.files, resource.title)}
            className="w-full  flex items-center justify-center px-4 py-2 border-2 border-[#00A99D] rounded-lg gap-2 text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all font-medium"
          >
            <FaImage className="text-xs md:text-sm" />
            <span>Download</span>
          </button>

          {isImage && (
            <button
              onClick={() => window.open(imageUrl, "_blank")}
              className="flex mt-2 w-full items-center justify-center px-4 py-2 border border-gray-300 rounded-lg gap-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaImage className="text-xs md:text-sm" />
              <span>View Full Size</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResourceCard = (resource) => (
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
                e.target.src = azeem.src; // Fallback to default image
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
            {resource.authorId?.fullName || "Anonymous"}
          </h3>
          <span className="text-sm text-gray-500">
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
      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
        {resource.title}
      </h3>
      <p className="text-gray-600 mb-4 leading-relaxed">
        {resource.description}
      </p>

      {/* HTML Content */}
      {resource.content && (
        <div className="mt-4 mb-4 prose max-w-none">
          <div
            className="text-gray-800 leading-relaxed overflow-auto"
            dangerouslySetInnerHTML={{ __html: resource.content }}
          />
        </div>
      )}

      {/* Category Tag */}
      {resource.category && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-4 py-2 bg-gradient-to-r from-[#E3F5FE] to-[#F0FFFE] text-[#00A99D] rounded-full text-sm font-medium border border-[#00A99D]/20">
            {resource.category}
          </span>
        </div>
      )}
      
      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag, index) => {
            // Handle case where tag is a JSON string array
            let processedTags = [tag];
            if (typeof tag === 'string' && tag.trim().startsWith('[') && tag.trim().endsWith(']')) {
              try {
                const parsedTags = JSON.parse(tag.trim());
                if (Array.isArray(parsedTags)) {
                  processedTags = parsedTags;
                }
              } catch (e) {
                // If parsing fails, use original tag
                processedTags = [tag.trim()];
              }
            } else if (typeof tag === 'string' && tag.trim().startsWith(' [') && tag.trim().endsWith(']')) {
              // Handle case with leading space
              try {
                const parsedTags = JSON.parse(tag.trim().substring(1));
                if (Array.isArray(parsedTags)) {
                  processedTags = parsedTags;
                }
              } catch (e) {
                // If parsing fails, use original tag
                processedTags = [tag.trim()];
              }
            }
            
            return processedTags.map((processedTag, tagIndex) => (
              <span 
                key={`${index}-${tagIndex}`} 
                className="px-3 py-1 bg-gradient-to-r from-[#F0F9FF] to-[#F5FFFD] text-[#00A99D] rounded-full text-xs font-medium border border-[#00A99D]/10 cursor-pointer hover:bg-[#E3F5FE] transition-colors"
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
      {renderFilePreview(resource)}
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
        {tagsLoading ? (
          <div className="flex justify-center py-4">
            <Spin size="small" />
          </div>
        ) : tags.map((tag) => (
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex md:hidden w-full h-16 bg-[#00A99D] fixed top-0 z-30 px-5 items-center justify-between">
        <Image alt="GPDN Logo" src={logo} width={100} className="h-auto" />

        {/* Animated Menu/Close Button */}
        <div
          onClick={handleMobileMenuToggle}
          className="text-2xl text-white cursor-pointer p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-all duration-200 relative"
        >
          {/* Menu Icon */}
          <MdMenu
            className={`absolute inset-0 transition-all duration-300 ${
              mobileMenuOpen
                ? "rotate-180 opacity-0 scale-75"
                : "rotate-0 opacity-100 scale-100"
            }`}
          />

          {/* Close Icon */}
          <MdClose
            className={`absolute inset-0 transition-all duration-300 ${
              mobileMenuOpen
                ? "rotate-0 opacity-100 scale-100"
                : "rotate-180 opacity-0 scale-75"
            }`}
          />
        </div>
      </div>
      {/* Sidebar */}
      <div
        className={`w-64 border-r border-gray-200 fixed h-screen overflow-y-auto bg-white z-30 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
        <div className="p-5">
          <Image
            alt="GPDN Logo"
            src={logo}
            width={100}
            className="h-auto hidden md:block"
          />
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

      {/* Main Content */}
      <div className="flex-1 md:ml-64 mt-16 md:mt-0">
        {renderHeader()}

        <div className="flex pt-24">
          {/* Posts Section */}
          <div className="flex-1 p-6 md:mr-80">
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
          <div className=" hidden md:block">{renderCategories()}</div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLibrary;
