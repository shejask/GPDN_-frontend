"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import Image from "next/image";
import { Input, Upload, Button, Select, Tag, message } from "antd";
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

import Quill from "quill";
import "quill/dist/quill.snow.css"; // Import Quill styles

// Rich Text Editor component
const RichTextEditor = forwardRef((_, ref) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
        placeholder: "Write something...",
      });
    }

    return () => {
      quillRef.current = null; // Cleanup to avoid memory leaks
    };
  }, []);

  // Expose the getContent function to the parent component
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.root.innerHTML; // Return the HTML content
      }
      return "";
    },
  }));

  return <div ref={editorRef} style={{ height: "300px" }} />;
});

const { Option } = Select;
const { TextArea } = Input;

function UploadResource() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reference to the rich text editor
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
    setFileList(info.fileList);
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

  const uploadProps = {
    onChange: handleFileChange,
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      return false; // Prevent automatic upload
    },
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please sign in to upload a resource");
      router.push("/signin");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    // Get content from rich text editor
    const editorContent = editorRef.current?.getContent();
    if (!editorContent) {
      alert("Please enter content");
      return;
    }

    if (fileList.length === 0) {
      alert("Please upload a file");
      return;
    }

    setLoading(true);
    try {
      // Create FormData to handle file upload
      const formData = new FormData();

      // Add file if present
      if (fileList[0]?.originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      // Add other resource data directly to formData
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("content", editorRef.current?.getContent() || "");
      formData.append("authorId", userId);
      // Send tags directly as an array instead of a stringified JSON
      // The backend expects either an array of strings or a stringified array
      // We'll send each tag as a separate form field with the same name
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          formData.append("tags", tag);
        });
      } else {
        // Send empty array if no tags
        formData.append("tags", "");
      }

      const response = await createResource(formData);

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
        throw new Error(response.error || "Failed to upload resource");
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
    }
  };

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
    const handleMobileMenuToggle = () => {
      setMobileMenuOpen((prev) => !prev);
    };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
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
          {sidebarMenus.map((item, index) => (
            <Link key={index} href={item.link} className="block">
              <div className="cursor-pointer hover:bg-[#00A99D] hover:text-white duration-300 flex items-center gap-5 px-5 py-3 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.menu}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 mt-16 md:mt-0">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Upload Resource</h1>
        </div>

        <div className="p-5 md:max-w-4xl">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Description (Brief summary)
            </label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description or summary"
              rows={3}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Content (Detailed information)
            </label>
            <div className="border rounded-lg overflow-hidden">
              <RichTextEditor ref={editorRef} />
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {tags.map((tag) => (
                  <Tag key={tag} closable onClose={() => handleTagClose(tag)}>
                    {tag}
                  </Tag>
                ))}
                {inputVisible ? (
                  <Input
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                    autoFocus
                  />
                ) : (
                  <Tag onClick={showInput} className="cursor-pointer">
                    <PlusOutlined /> New Tag
                  </Tag>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Resource File
            </label>
            <Upload {...uploadProps} className="upload-list-inline">
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            {fileList.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Selected file: {fileList[0].name}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-start w-full  md:justify-end">
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              className="bg-[#00A99D] text-white hover:bg-[#008F84]"
            >
              Upload Resource
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadResource;
