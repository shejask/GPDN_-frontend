"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { Input, Upload, Button, Select, Tag, message, Spin, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import logo from "../../assets/registation/logo.png";
import { MdClose, MdDashboard, MdMenu } from "react-icons/md";
import { FaRegFolder } from "react-icons/fa6";
import { TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { UploadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { createResource } from "@/api/resource";
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
        placeholder="Start writing your content here..."
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

const { Option } = Select;
const { TextArea } = Input;

function UploadResource() {
  const pathname = usePathname();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [processingFiles, setProcessingFiles] = useState(false);
  const router = useRouter();
  const uploadRef = useRef(null); // 1. Add this ref

  // Use the professional React Quill editor reference
  const editorRef = useRef(null);

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

  const handleFileChange = (info) => {
    console.log("File change info:", info);
    let newFileList = [...info.fileList];

    // Filter out files that failed to validate
    newFileList = newFileList.filter((file) => {
      if (file.status === "error") {
        return false;
      }
      return true;
    });

    // Ensure all files have the correct structure
    newFileList = newFileList.map((file) => ({
      ...file,
      status: "done", // Mark as done since we're handling upload manually
    }));

    setFileList(newFileList);
    console.log("Updated file list:", newFileList);
  };

  const handleTagClose = (removedTag) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // File validation function
  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
    ];

    const maxSize = 25 * 1024 * 1024; // 25MB in bytes (increased from 10MB)

    if (!allowedTypes.includes(file.type)) {
      message.error(
        `${file.name} is not a supported file type. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, or PNG files.`
      );
      return false;
    }

    if (file.size > maxSize) {
      message.error(`${file.name} is too large. Maximum file size is 25MB.`);
      return false;
    }

    return true;
  };

  const uploadProps = {
    onChange: handleFileChange,
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      const isValid = validateFile(file);
      if (!isValid) {
        return Upload.LIST_IGNORE;
      }
      // Return false to prevent automatic upload and keep file in list
      return false;
    },
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png",
    listType: "text",
    showUploadList: {
      showRemoveIcon: true,
      showPreviewIcon: false,
    },
    // FIXED: Add customRequest to prevent auto-upload
    customRequest: ({ file, onSuccess }) => {
      // Immediately call onSuccess to mark file as uploaded
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
  };
  <style jsx global>{`
    .ant-input:focus,
    .ant-input-focused {
      border-color: #00a99d !important;
      box-shadow: 0 0 0 2px rgba(0, 169, 157, 0.1) !important;
    }

    .ant-input:hover {
      border-color: #d1d5db !important;
    }

    .ant-btn-primary {
      background-color: #00a99d !important;
      border-color: #00a99d !important;
    }

    .ant-btn-primary:hover {
      background-color: #008f84 !important;
      border-color: #008f84 !important;
    }

    .ant-upload-list-item {
      display: none !important;
    }

    /* Rich Text Editor Customizations */
    .react-quill-container .ql-container {
      border: none !important;
      font-size: 16px !important;
    }

    .react-quill-container .ql-editor {
      min-height: 200px !important;
      padding: 20px !important;
      color: #374151 !important;
    }

    .react-quill-container .ql-toolbar {
      border: none !important;
      border-bottom: 1px solid #e5e7eb !important;
      background: #f9fafb !important;
      padding: 12px 20px !important;
    }

    .react-quill-container .ql-toolbar .ql-formats {
      margin-right: 16px !important;
    }
  `}</style>;

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      message.error("Please sign in to upload a resource");
      router.push("/signin");
      return;
    }

    if (!title.trim()) {
      message.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      message.error("Please enter a description");
      return;
    }

    // Get content from rich text editor
    const editorContent = editorRef.current?.getContent();
    if (!editorContent) {
      message.error("Please enter content");
      return;
    }

    if (fileList.length === 0) {
      message.error("Please upload at least one file");
      return;
    }

    setLoading(true);
    setProcessingFiles(true);
    setUploadProgress(null);

    try {
      // Create FormData to handle multiple file uploads
      const formData = new FormData();

      // Add basic resource data first
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("content", editorContent);
      formData.append("authorId", userId);

      // Get files for size calculation
      const files = fileList
        .map((file) => file.originFileObj || file)
        .filter((file) => file instanceof File);

      // Calculate total file size for warning
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

      if (totalSize > 50 * 1024 * 1024) {
        // 50MB total warning
        message.warning(
          `Large upload detected (${totalSizeMB}MB). This may take a while. Please be patient.`
        );
      }

      // Add all files to FormData - FIXED: Use "file" field name (not "files")
      files.forEach((file, index) => {
        formData.append("file", file); // Changed from "files" to "file"
        console.log(`Added file ${index}:`, file.name, file.size);
      });

      // FIXED: Send tags as individual entries (not JSON string)
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          formData.append("tags", tag);
        });
      } else {
        // Add empty tags field if no tags
        formData.append("tags", "");
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await createResource(
        formData,
        // Progress callback
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setProcessingFiles(false);
      setUploadProgress(null);

      if (response.success) {
        message.success({
          content: "Resource uploaded successfully!",
          duration: 3,
          style: {
            marginTop: "20vh",
          },
        });
        router.push("/resource-library");
      } else {
        // Enhanced error messages based on the error type
        if (
          response.status === 413 ||
          response.error?.toLowerCase().includes("too large")
        ) {
          message.error(response.error);
        } else if (response.status === 408) {
          message.error(response.error);
        } else if (response.status === 507) {
          message.error(response.error);
        } else if (response.status === 415) {
          message.error(response.error);
        } else if (response.status === 0) {
          // Check if this might be a file size issue disguised as network error
          if (
            response.error?.toLowerCase().includes("too large") ||
            response.error?.toLowerCase().includes("entity") ||
            files.length > 0
          ) {
            message.error(
              "Uploaded files are too large. Try uploading smaller ones."
            );
          } else {
            message.error(response.error);
          }
        } else {
          message.error(response.error || "Failed to upload resource");
        }
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      message.error({
        content:
          error.message || "Failed to upload resource. Please try again.",
        duration: 5,
        style: {
          marginTop: "20vh",
        },
      });
    } finally {
      setLoading(false);
      setProcessingFiles(false);
      setUploadProgress(null);
    }
  };

  // 2. Handler to trigger file input
  const handleUploadClick = () => {
    if (uploadRef.current) {
      const input = uploadRef.current.querySelector('input[type="file"]');
      if (input) input.click();
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Header */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 mt-16 md:mt-0">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Upload Resource</h1>
        </div>

        <div className="p-8 md:max-w-4xl">
          <div className="mb-8">
            <label className="block text-gray-900 text-base font-semibold mb-3">
              Title
            </label>
            <div className="relative">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter resource title"
                className="w-full h-12 px-4 text-base border-2 border-gray-200 rounded-lg focus:border-[#00A99D] focus:ring-0 hover:border-gray-300 transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#374151",
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-gray-900 text-base font-semibold mb-3">
              Description
            </label>
            <div className="relative">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief description of the resource"
                className="w-full h-12 px-4 text-base border-2 border-gray-200 rounded-lg focus:border-[#00A99D] focus:ring-0 hover:border-gray-300 transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#374151",
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-900 text-base font-semibold mb-3">
              Content
            </label>

            {/* Editor Tabs */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="flex bg-gray-50 border-b border-gray-200">
                <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  {" "}
                  {/* // modified line */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                  </svg>
                  Add Media
                </button>
                <div className="flex ml-auto">
                  <button className="px-4 py-3 text-sm font-medium text-gray-900 bg-white border-b-2 border-[#00A99D] transition-colors">
                    Visual
                  </button>
                  <button className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Text
                  </button>
                </div>
              </div>

              {/* Rich Text Editor Container */}
              <div className="bg-white">
                <ProfessionalRichTextEditor ref={editorRef} />
              </div>
            </div>
          </div>

          {/* Category/Tags Field */}
          <div className="mb-8">
            <label className="block text-gray-900 text-base font-semibold mb-3">
              Tags
            </label>{" "}
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              {" "}
              <div className="flex flex-wrap gap-2 mb-4">
                {" "}
                {/* // modified line */}
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {" "}
                    {/* // modified line */}
                    <span>{tag}</span>
                    <button
                      onClick={() => handleTagClose(tag)}
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
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
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
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setTags([])}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear All
                </button>
                <button className="px-4 py-2 bg-[#00A99D] text-white text-sm font-medium rounded-lg hover:bg-[#008F84] transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Upload File Section */}
          <div className="mb-8">
            {" "}
            {/* // modified line - increased margin */}
            <label className="block text-gray-900 text-base font-semibold mb-3">
              Upload File
            </label>{" "}
            {/* // modified line */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              {" "}
              {/* // modified line */}
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-[#00A99D]"
                  >
                    {" "}
                    {/* // modified line */}
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                </div>
                <div className="mb-2">
                  <span
                    className="text-[#00A99D] font-medium cursor-pointer hover:underline"
                    onClick={handleUploadClick} // 3. Attach handler here
                  >
                    Click here
                  </span>
                  <span className="text-gray-600 ml-1">
                    to upload your file or drag.
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Supported Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT,
                  CSV, JPG, JPEG, PNG (Max 25MB each)
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  ℹ️ Large images will be automatically compressed to improve
                  upload speed
                </div>
              </div>
              {/* Hidden Upload Component */}
              <div className="hidden" ref={uploadRef}>
                {" "}
                {/* 4. Attach ref here */}
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Select Files</Button>
                </Upload>
              </div>
            </div>
            {/* File Size Warning */}
            {fileList.length > 0 &&
              (() => {
                const files = fileList
                  .map((file) => file.originFileObj || file)
                  .filter((file) => file instanceof File);
                const totalSize = files.reduce(
                  (sum, file) => sum + file.size,
                  0
                );
                const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);
                const largeFiles = files.filter(
                  (f) => f.size > 10 * 1024 * 1024
                );

                if (totalSize > 50 * 1024 * 1024) {
                  return (
                    <Alert
                      message="Large Upload Detected"
                      description={`Total size: ${totalSizeMB}MB. This may take longer to upload and could fail. Consider uploading files separately.`}
                      type="warning"
                      showIcon
                      className="mt-4"
                      action={
                        <button
                          onClick={() => {
                            setFileList([]);
                          }}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                        >
                          Clear All
                        </button>
                      }
                    />
                  );
                } else if (largeFiles.length > 0) {
                  return (
                    <Alert
                      message="Large Files Will Be Compressed"
                      description={`${largeFiles.length} large image(s) detected. They will be automatically compressed to improve upload speed.`}
                      type="info"
                      showIcon
                      className="mt-4"
                    />
                  );
                }
                return null;
              })()}
            {/* Upload Progress */}
            {(processingFiles || uploadProgress) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Spin size="small" />
                  <div className="flex-1">
                    {processingFiles && (
                      <p className="text-sm text-blue-700 font-medium">
                        Processing files...
                      </p>
                    )}
                    {uploadProgress && (
                      <div>
                        <p className="text-sm text-blue-700 font-medium">
                          Processing {uploadProgress.fileName}... (
                          {uploadProgress.current}/{uploadProgress.total})
                        </p>
                        {uploadProgress.processed && (
                          <p className="text-xs text-blue-600">
                            ✓ Image compressed to reduce upload time
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* File List Display */}
            {fileList.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {" "}
                {/* // modified line */}
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  {" "}
                  {/* // modified line */}
                  Selected files ({fileList.length}):
                </p>
                <div className="space-y-2">
                  {fileList.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {file.name}
                        </span>{" "}
                        {/* // modified line */}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {" "}
                          {/* // modified line */}
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const newFileList = fileList.filter(
                            (_, i) => i !== index
                          );
                          setFileList(newFileList);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
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
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            {" "}
            {/* // modified line */}
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading || processingFiles}
              disabled={loading || processingFiles}
              className="bg-[#00A99D] hover:bg-[#008F84] border-[#00A99D] hover:border-[#008F84] text-white font-semibold px-8 py-3 h-auto text-base rounded-lg transition-colors flex items-center gap-2"
            >
              {loading || processingFiles ? (
                <>
                  <Spin size="small" />
                  {processingFiles ? "Processing..." : "Uploading..."}
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadResource;
