"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createThread } from "@/api/forum";
import { message, Spin, Tooltip, Alert } from "antd";
import Image from "next/image";
import { Input, Tag } from "antd";
import logo from "../../assets/registation/logo.png";
import { MdClose, MdDashboard, MdMenu } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { FaImage, FaUpload } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
// ...existing imports...
// Dynamic import for React Quill to avoid SSR issues
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border rounded-lg bg-gray-50 flex items-center justify-center">
      Loading editor...
    </div>
  ),
});

// Import Quill styles
import "react-quill/dist/quill.snow.css";
import Sidebar from "@/components/Sidebar";

// Professional React Quill Editor Component
const ProfessionalRichTextEditor = forwardRef((props, ref) => {
  const [content, setContent] = useState("");
  const quillRef = useRef(null);

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image"],
          ["blockquote", "code-block"],
          [{ color: [] }, { background: [] }],
          ["clean"],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  // Quill formats configuration
  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "indent",
      "align",
      "link",
      "image",
      "blockquote",
      "code-block",
      "color",
      "background",
    ],
    []
  );

  // Handle content change
  const handleChange = useCallback((value) => {
    setContent(value);
  }, []);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (
        content === "<p><br></p>" ||
        content === "<p></p>" ||
        content === ""
      ) {
        return "";
      }
      return content;
    },
    setContent: (newContent) => {
      setContent(newContent);
    },
    clearContent: () => {
      setContent("");
    },
    focus: () => {
      if (quillRef.current) {
        quillRef.current.focus();
      }
    },
    getEditor: () => {
      return quillRef.current?.getEditor();
    },
  }));

  return (
    <div className="react-quill-container">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Write something..."
        style={{
          height: "300px",
          marginBottom: "50px",
        }}
      />

      {/* Custom styles for React Quill */}
      <style jsx global>{`
        .react-quill-container .ql-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          font-size: 14px;
          line-height: 1.6;
        }

        .react-quill-container .ql-editor {
          min-height: 200px;
          padding: 16px;
        }

        .react-quill-container .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        .react-quill-container .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
        }

        .react-quill-container .ql-container {
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0 0 8px 8px;
        }

        .react-quill-container .ql-toolbar .ql-formats {
          margin-right: 12px;
        }

        .react-quill-container .ql-toolbar button:hover {
          color: #00a99d;
        }

        .react-quill-container .ql-toolbar button.ql-active {
          color: #00a99d;
        }

        .react-quill-container .ql-toolbar .ql-stroke {
          stroke: currentColor;
        }

        .react-quill-container .ql-toolbar .ql-fill {
          fill: currentColor;
        }

        .react-quill-container .ql-editor h1 {
          font-size: 2em;
          font-weight: 600;
          margin: 0.67em 0;
        }

        .react-quill-container .ql-editor h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.83em 0;
        }

        .react-quill-container .ql-editor h3 {
          font-size: 1.17em;
          font-weight: 600;
          margin: 1em 0;
        }

        .react-quill-container .ql-editor blockquote {
          border-left: 4px solid #00a99d;
          padding-left: 16px;
          margin: 16px 0;
          color: #6b7280;
        }

        .react-quill-container .ql-editor a {
          color: #00a99d;
          text-decoration: underline;
        }

        .react-quill-container .ql-editor img {
          max-width: 100%;
          height: auto;
        }

        .react-quill-container .ql-editor pre {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          overflow-x: auto;
        }

        .react-quill-container .ql-editor .ql-code-block-container {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          margin: 8px 0;
        }

        .react-quill-container .ql-snow .ql-tooltip {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .react-quill-container .ql-snow .ql-tooltip input {
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 4px 8px;
        }

        .react-quill-container .ql-snow .ql-tooltip a.ql-action {
          color: #00a99d;
        }

        .react-quill-container .ql-snow .ql-tooltip a.ql-remove {
          color: #ef4444;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .react-quill-container .ql-toolbar {
            padding: 8px;
          }

          .react-quill-container .ql-toolbar .ql-formats {
            margin-right: 8px;
          }

          .react-quill-container .ql-editor {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
});

ProfessionalRichTextEditor.displayName = "ProfessionalRichTextEditor";

// Constants for validation
const MAX_TITLE_LENGTH = 100;
const MAX_FILE_SIZE_MB = 2; // Reduced from 5MB to 2MB to avoid 413 errors
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];
const MAX_TAGS = 10;

/**
 * CreatePost Component
 * Allows users to create new forum threads with title, description, tags, and image upload
 */
const CreatePost = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();

  // Form state
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);

  // Reference to the rich text editor
  const editorRef = useRef(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get userId from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, []);

  // Navigation items for the sidebar
  const sidebarMenus = [
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

  // No predefined tags
  const availableTags = useMemo(() => [], []);

  /**
   * Validate a specific form field
   * @param {string} field - Field name to validate
   * @param {any} value - Field value to validate
   * @returns {string|null} - Error message or null if valid
   */
  const validateField = useCallback((field, value) => {
    let errorMessage = null;

    switch (field) {
      case "title":
        if (!value?.trim()) {
          errorMessage = "Title is required";
        } else if (value.length > MAX_TITLE_LENGTH) {
          errorMessage = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
        }
        break;

      case "description":
        if (!value || value === "<p></p>" || value === "<p><br></p>") {
          errorMessage = "Content is required";
        }
        break;

      case "file":
        if (value) {
          if (!ALLOWED_FILE_TYPES.includes(value.type)) {
            errorMessage = "File must be JPEG, PNG, SVG, or WebP";
          } else if (value.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            errorMessage = `File size must be less than ${MAX_FILE_SIZE_MB}MB`;
          }
        }
        break;

      case "tags":
        if (value.length > MAX_TAGS) {
          errorMessage = `Maximum ${MAX_TAGS} tags allowed`;
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: errorMessage,
    }));

    return errorMessage;
  }, []);

  /**
   * Effect to validate description when it changes
   */
  useEffect(() => {
    if (description) {
      validateField("description", description);
      setFormTouched(true);
    }
  }, [description, validateField]);

  /**
   * Validate all form fields
   * @returns {boolean} - True if form is valid
   */
  const validateForm = useCallback(() => {
    const titleError = validateField("title", title);
    const descriptionError = validateField("description", description);
    const fileError = validateField("file", file);
    const tagsError = validateField("tags", selectedTags);

    return !titleError && !descriptionError && !fileError && !tagsError;
  }, [title, description, file, selectedTags, validateField]);

  /**
   * Handle tag selection from available tags
   * @param {string} tag - Tag to add
   */
  const handleTagSelect = useCallback(
    (tag) => {
      if (!selectedTags.includes(tag) && selectedTags.length < MAX_TAGS) {
        setSelectedTags((prev) => [...prev, tag]);
        validateField("tags", [...selectedTags, tag]);
        setFormTouched(true);
      }
    },
    [selectedTags, validateField]
  );

  /**
   * Remove a tag from selected tags
   * @param {string} tagToRemove - Tag to remove
   */
  const removeTag = useCallback((tagToRemove) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    setFormTouched(true);
  }, []);

  /**
   * Handle custom tag input with comma or enter key
   * @param {Event} e - Input event
   */
  const handleTagInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setTagInput(value);

      // Check for comma
      if (value.includes(",") && value.trim() !== "" && value.trim() !== ",") {
        const newTag = value.replace(/,/g, "").trim();

        if (
          newTag &&
          !selectedTags.includes(newTag) &&
          selectedTags.length < MAX_TAGS
        ) {
          setSelectedTags((prev) => [...prev, newTag]);
          setTagInput("");
          validateField("tags", [...selectedTags, newTag]);
        } else {
          setTagInput("");
        }
      }
    },
    [selectedTags, validateField]
  );

  /**
   * Handle tag input key down events
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleTagKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const newTag = tagInput.trim();
        if (
          newTag &&
          !selectedTags.includes(newTag) &&
          selectedTags.length < MAX_TAGS
        ) {
          setSelectedTags((prev) => [...prev, newTag]);
          setTagInput("");
          validateField("tags", [...selectedTags, newTag]);
        }
      }
    },
    [tagInput, selectedTags, validateField]
  );

  /**
   * Handle file selection and validation
   * @param {File} selectedFile - Selected file
   */
  const handleFileSelect = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;

      const error = validateField("file", selectedFile);
      if (!error) {
        // Check if file needs compression
        if (selectedFile.size > 1 * 1024 * 1024) {
          // If larger than 1MB
          messageApi.info("Compressing image to reduce size...");
          compressImage(selectedFile);
        } else {
          setFile(selectedFile);

          // Create preview URL for the image
          const reader = new FileReader();
          reader.onloadend = () => {
            setFilePreview(reader.result);
          };
          reader.readAsDataURL(selectedFile);
        }
      } else {
        messageApi.error(error);
      }

      setFormTouched(true);
    },
    [validateField, messageApi]
  );

  /**
   * Compress image to reduce file size
   * @param {File} imageFile - The image file to compress
   */
  const compressImage = useCallback(
    (imageFile) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed image as data URL
          const quality = 0.7; // Adjust quality (0.7 = 70% quality)
          const dataUrl = canvas.toDataURL(imageFile.type, quality);

          // Convert data URL to Blob
          fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
              // Create a File from the Blob
              const compressedFile = new File([blob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now(),
              });

              setFile(compressedFile);
              setFilePreview(dataUrl);

              const compressionRatio = (
                ((imageFile.size - compressedFile.size) / imageFile.size) *
                100
              ).toFixed(1);
              messageApi.success(`Image compressed by ${compressionRatio}%`);
            });
        };
      };
    },
    [messageApi]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setTitle("");
    setSelectedTags([]);
    setTagInput("");
    setFile(null);
    setFilePreview(null);
    setDescription("");
    setErrors({});
    setFormTouched(false);
    // Clear the rich text editor
    if (editorRef.current) {
      editorRef.current.clearContent();
    }
  }, []);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  <style jsx global>{`
    .react-quill-container .ql-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        sans-serif;
      font-size: 14px;
      line-height: 1.6;
      border: none;
    }

    .react-quill-container .ql-editor {
      min-height: 200px;
      padding: 16px;
      border: none;
    }

    .react-quill-container .ql-editor.ql-blank::before {
      color: #9ca3af;
      font-style: normal;
    }

    .react-quill-container .ql-toolbar {
      border: none;
      border-bottom: 1px solid #e5e7eb;
      background: white;
      border-radius: 0;
      padding: 12px 16px;
    }

    .react-quill-container .ql-container {
      border: none;
      border-radius: 0;
    }

    .react-quill-container .ql-toolbar .ql-formats {
      margin-right: 12px;
    }

    .react-quill-container .ql-toolbar button:hover {
      color: #00a99d;
    }

    .react-quill-container .ql-toolbar button.ql-active {
      color: #00a99d;
    }

    .react-quill-container .ql-toolbar .ql-stroke {
      stroke: currentColor;
    }

    .react-quill-container .ql-toolbar .ql-fill {
      fill: currentColor;
    }

    .react-quill-container .ql-editor h1 {
      font-size: 2em;
      font-weight: 600;
      margin: 0.67em 0;
    }

    .react-quill-container .ql-editor h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0.83em 0;
    }

    .react-quill-container .ql-editor h3 {
      font-size: 1.17em;
      font-weight: 600;
      margin: 1em 0;
    }

    .react-quill-container .ql-editor blockquote {
      border-left: 4px solid #00a99d;
      padding-left: 16px;
      margin: 16px 0;
      color: #6b7280;
    }

    .react-quill-container .ql-editor a {
      color: #00a99d;
      text-decoration: underline;
    }

    .react-quill-container .ql-editor img {
      max-width: 100%;
      height: auto;
    }

    .react-quill-container .ql-editor pre {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
    }

    .react-quill-container .ql-editor .ql-code-block-container {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      margin: 8px 0;
    }

    .react-quill-container .ql-snow .ql-tooltip {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .react-quill-container .ql-snow .ql-tooltip input {
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 4px 8px;
    }

    .react-quill-container .ql-snow .ql-tooltip a.ql-action {
      color: #00a99d;
    }

    .react-quill-container .ql-snow .ql-tooltip a.ql-remove {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .react-quill-container .ql-toolbar {
        padding: 8px;
      }

      .react-quill-container .ql-toolbar .ql-formats {
        margin-right: 8px;
      }

      .react-quill-container .ql-editor {
        padding: 12px;
      }
    }
  `}</style>;

  return (
    <>
      {contextHolder}
      <div className="flex min-h-screen bg-white">
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
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          handleMobileMenuToggle={handleMobileMenuToggle}
        />

        {/* Main Content */}
        <div className="flex-1 md:ml-64 mt-16 md:mt-0 bg-gray-50 min-h-screen">
          <div className="p-3 md:p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              Create Post
            </h1>

            <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl">
              {/* Title Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Legend Of X, Part 3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                  />
                  <MdEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Upload Thumbnail Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Thumbnail
                </label>
                <div
                  className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFile = e.dataTransfer.files[0];
                    if (droppedFile && droppedFile.type.startsWith("image/")) {
                      handleFileSelect(droppedFile);
                    } else {
                      messageApi.error("Please upload an image file");
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="thumbnail-upload"
                    onChange={(e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) handleFileSelect(selectedFile);
                    }}
                  />
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-blue-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="text-blue-600 font-medium">Click here</p>
                      <p className="text-sm text-gray-600">
                        to upload your file or drag.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supported Format: SVG, JPG, PNG (10mb each)
                      </p>
                    </div>
                  </label>
                  {file && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Selected: {file.name}
                      </div>
                      {filePreview && (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="max-w-xs max-h-48 rounded-lg mx-auto"
                        />
                      )}
                    </div>
                  )}
                </div>
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                )}
              </div>

              {/* Description Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ProfessionalRichTextEditor ref={editorRef} />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Tags Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Selected Tags Display */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <IoClose
                        className="w-4 h-4 mr-1 cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => removeTag(tag)}
                      />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Predefined Tags */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "AI/ML",
                      "Crime",
                      "Fitness",
                      "Diet",
                      "Machine Learning",
                      "Healthcare",
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagSelect(tag)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-gray-200 text-gray-700"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <IoClose className="w-4 h-4 mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Healthcare", "Finance", "Banking"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagSelect(tag)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-gray-200 text-gray-700"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <IoClose className="w-4 h-4 mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Tag Input */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add custom tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors text-sm"
                  />
                  <button
                    onClick={() => {
                      const newTag = tagInput.trim();
                      if (
                        newTag &&
                        !selectedTags.includes(newTag) &&
                        selectedTags.length < MAX_TAGS
                      ) {
                        setSelectedTags((prev) => [...prev, newTag]);
                        setTagInput("");
                        validateField("tags", [...selectedTags, newTag]);
                      }
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {errors.tags && (
                  <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      if (!title.trim()) {
                        messageApi.error("Please enter a title");
                        return;
                      }
                      // Get content from rich text editor
                      const editorContent = editorRef.current?.getContent();
                      if (!editorContent) {
                        messageApi.error("Please enter a description");
                        return;
                      }

                      if (!userId) {
                        messageApi.error(
                          "User ID not found. Please log in again."
                        );
                        return;
                      }

                      const response = await createThread({
                        title,
                        content: editorRef.current?.getContent() || "",
                        authorId: userId,
                        tags: selectedTags,
                        file,
                      });

                      if (response.success) {
                        messageApi.success("Thread created successfully!");
                        resetForm();
                        // Navigate to the forum page after successful post
                        router.push("/forum");
                      } else {
                        messageApi.error(
                          response.error || "Failed to create thread"
                        );
                      }
                    } catch (error) {
                      console.error("Error creating thread:", error);
                      messageApi.error("Failed to create thread");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
