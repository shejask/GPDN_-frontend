"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Modal, Button as AntButton } from "antd";
import {
  MdDashboard,
  MdOutlineSettings,
  MdMenu,
  MdClose,
  MdLogout,
  MdNotifications,
  MdNotificationsNone,
} from "react-icons/md";
import { FaRegFolder } from "react-icons/fa";
import { TbUser, TbUsers } from "react-icons/tb";
import { PiBuildings } from "react-icons/pi";
import { IoNewspaperOutline, IoCloseOutline } from "react-icons/io5";
import { BiTime } from "react-icons/bi";
import { AiOutlineExclamationCircle, AiOutlineCheckCircle } from "react-icons/ai";
import logo from "../app/assets/registation/logo.png"; // Adjust path as needed

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
  { menu: "Profile", icon: <TbUser />, link: "/settings" },
];

export default function Sidebar({
  mobileMenuOpen,
  handleMobileMenuToggle,
  children,
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationPanelOpen(false);
      }
    };

    if (notificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [notificationPanelOpen]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      // Fetch rejected threads, approved resources, and rejected resources
      const [rejectedThreadResponse, approvedResourceResponse, rejectedResourceResponse] = await Promise.all([
        fetch("https://api.thegpdn.org/api/admin/fetchRejectedThread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("https://api.thegpdn.org/api/admin/fetchApprovedResource", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("https://api.thegpdn.org/api/admin/fetchRejectedResource", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
      ]);

      const rejectedThreadData = await rejectedThreadResponse.json();
      const approvedResourceData = await approvedResourceResponse.json();
      const rejectedResourceData = await rejectedResourceResponse.json();

      let allNotifications = [];

      // Process rejected thread notifications
      if (rejectedThreadData.success && rejectedThreadData.data) {
        const validRejectedThreads = rejectedThreadData.data
          .filter(notification => notification.threadId !== null)
          .map(notification => ({
            ...notification,
            type: 'rejected_thread',
            title: 'Thread Rejected',
            message: `Your thread "${notification.threadId.title}" has been rejected and needs revision.`,
            icon: 'rejected',
            actionText: 'View Details',
            actionLink: '/forum'
          }));
        allNotifications = [...allNotifications, ...validRejectedThreads];
      }

      // Process approved resource notifications
      if (approvedResourceData.success && approvedResourceData.data) {
        const validApprovedResources = approvedResourceData.data
          .filter(notification => notification.resourceId !== null)
          .map(notification => ({
            ...notification,
            type: 'approved_resource',
            title: 'Resource Approved',
            message: `Your resource "${notification.resourceId.title}" has been approved and is now live.`,
            icon: 'approved',
            actionText: 'View Resource',
            actionLink: '/resource-library'
          }));
        allNotifications = [...allNotifications, ...validApprovedResources];
      }

      // Process rejected resource notifications
      if (rejectedResourceData.success && rejectedResourceData.data) {
        const validRejectedResources = rejectedResourceData.data
          .filter(notification => notification.resourceId !== null)
          .map(notification => ({
            ...notification,
            type: 'rejected_resource',
            title: 'Resource Rejected',
            message: `Your resource "${notification.resourceId.title}" has been rejected and needs revision.`,
            icon: 'rejected',
            actionText: 'View Details',
            actionLink: '/resource-library'
          }));
        allNotifications = [...allNotifications, ...validRejectedResources];
      }

      // Sort notifications by creation date (newest first)
      allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(allNotifications);
      setHasNewNotifications(allNotifications.length > 0);

    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Handle notification panel toggle
  const handleNotificationToggle = () => {
    setNotificationPanelOpen(!notificationPanelOpen);
    if (!notificationPanelOpen) {
      fetchNotifications();
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userFullName");
    setLogoutModalOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* Mobile Header/Topbar */}
      <div className="flex md:hidden w-full h-16 bg-[#00A99D] fixed top-0 z-30 px-5 items-center justify-between">
        <Image alt="GPDN Logo" src={logo} width={100} className="h-auto" />
        <div className="flex items-center gap-3">
          {/* Mobile Notification Icon */}
          <div className="relative">
            <button
              onClick={handleNotificationToggle}
              className="text-white text-2xl p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-all duration-200 relative"
            >
              {hasNewNotifications ? (
                <MdNotifications className="text-white" />
              ) : (
                <MdNotificationsNone className="text-white" />
              )}
              {hasNewNotifications && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
          
          <div
            onClick={handleMobileMenuToggle}
            className="text-2xl text-white cursor-pointer p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-all duration-200 relative"
          >
            <MdMenu
              className={`absolute inset-0 transition-all duration-300 ${
                mobileMenuOpen
                  ? "rotate-180 opacity-0 scale-75"
                  : "rotate-0 opacity-100 scale-100"
              }`}
            />
            <MdClose
              className={`absolute inset-0 transition-all duration-300 ${
                mobileMenuOpen
                  ? "rotate-0 opacity-100 scale-100"
                  : "rotate-180 opacity-0 scale-75"
              }`}
            />
          </div>
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
      <div
        className={`w-64 border-r border-gray-200 fixed h-screen overflow-y-auto bg-white z-30 flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:block`}
      >
        <div className="flex flex-col h-screen justify-between">
          <div>
            {/* Header with Logo and Notification */}
            <div className="p-5 relative flex items-center justify-between">
              <Link href="/">
                <Image
                  alt="GPDN Logo"
                  src={logo}
                  width={100}
                  className="h-auto hidden md:block"
                />
              </Link>
              
              {/* Desktop Notification Icon */}
              <div className="relative hidden md:block">
                <button
                  onClick={handleNotificationToggle}
                  className="text-gray-600 hover:text-[#00A99D] text-2xl p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 relative"
                >
                  {hasNewNotifications ? (
                    <MdNotifications className="text-[#00A99D]" />
                  ) : (
                    <MdNotificationsNone />
                  )}
                  {hasNewNotifications && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <nav className="mt-5">
              {sidebarMenus.map((item, index) => {
                const isForum =
                  item.link === "/forum" &&
                  (pathname === "/forum" ||
                    pathname.startsWith("/forum/") ||
                    pathname === `/forum/${params.threadid || ""}`);
                const isActive =
                  isForum ||
                  (item.link !== "/forum" && pathname.startsWith(item.link));
                return (
                  <Link key={index} href={item.link} className="block">
                    <div
                      className={`cursor-pointer flex items-center gap-5 px-5 py-3 transition-colors duration-300 
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
          </div>

          {/* Logout Button */}
          <div>
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-black border-t text-base shadow-md hover:from-[#008F84] hover:to-[#00A99D] transition-all duration-200"
              style={{
                letterSpacing: "0.03em",
                boxShadow: "0 2px 12px 0 rgba(0,169,157,0.08)",
              }}
            >
              <MdLogout size={22} />
              Logout
            </button>
          </div>

          {/* Logout Modal */}
          <Modal
            open={logoutModalOpen}
            onCancel={() => setLogoutModalOpen(false)}
            footer={null}
            centered
            closable={false}
            className="logout-modal"
          >
            <div className="text-center p-6">
              <MdLogout size={48} className="mx-auto text-[#00A99D] mb-3" />
              <h2 className="text-xl font-bold mb-2">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex justify-center gap-4">
                <AntButton
                  onClick={() => setLogoutModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </AntButton>
                <AntButton
                  type="primary"
                  danger
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-lg bg-[#00A99D] hover:bg-[#008F84] border-none text-white font-semibold"
                >
                  Logout
                </AntButton>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      {/* Notification Panel */}
      <div 
        ref={notificationRef}
        className={`fixed z-50 transition-all duration-300 ${
          notificationPanelOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          top: mobileMenuOpen ? '64px' : '80px', // Adjust based on header height
          right: '16px',
          width: '100%',
          maxWidth: '384px'
        }}
      >
        <div className={`
          bg-white shadow-2xl rounded-xl border transform transition-all duration-300 ease-out max-h-[600px] overflow-hidden
          ${notificationPanelOpen ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-2'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <MdNotifications className="text-[#00A99D] text-xl" />
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {hasNewNotifications && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setNotificationPanelOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A99D]"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <MdNotificationsNone size={48} className="mb-2" />
                <p className="text-center">No notifications</p>
                <p className="text-sm text-center mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <div key={notification._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'approved_resource' 
                            ? 'bg-green-100' 
                            : 'bg-red-100'
                        }`}>
                          {notification.type === 'approved_resource' ? (
                            <AiOutlineCheckCircle className="text-green-500 text-lg" />
                          ) : (
                            <AiOutlineExclamationCircle className="text-red-500 text-lg" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-800 text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <BiTime size={12} />
                            {formatDate(notification.createdAt)}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 text-sm mb-2">
                            {notification.message}
                          </p>
                          
                          {/* Display thumbnails/files based on notification type */}
                          {(notification.type === 'rejected_thread') && 
                           notification.threadId?.thumbnail && 
                           notification.threadId.thumbnail.length > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                {notification.threadId.thumbnail[0].endsWith('.pdf') ? (
                                  <div className="w-full h-full flex items-center justify-center bg-red-100">
                                    <span className="text-red-600 text-xs font-bold">PDF</span>
                                  </div>
                                ) : (
                                  <img 
                                    src={notification.threadId.thumbnail[0]} 
                                    alt="Thread thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex-1">
                                {notification.threadId.tags?.join(", ")}
                              </div>
                            </div>
                          )}

                          {(notification.type === 'approved_resource' || notification.type === 'rejected_resource') && 
                           notification.resourceId?.files && 
                           notification.resourceId.files.length > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                {notification.resourceId.files[0].endsWith('.pdf') ? (
                                  <div className={`w-full h-full flex items-center justify-center ${
                                    notification.type === 'approved_resource' ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    <span className={`text-xs font-bold ${
                                      notification.type === 'approved_resource' ? 'text-green-600' : 'text-red-600'
                                    }`}>PDF</span>
                                  </div>
                                ) : (
                                  <img 
                                    src={notification.resourceId.files[0]} 
                                    alt="Resource thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex-1">
                                {notification.resourceId.tags?.join(", ")}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              notification.type === 'approved_resource' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {notification.type === 'approved_resource' ? 'Approved' : 'Rejected'}
                            </span>
                            <button 
                              onClick={() => {
                                router.push(notification.actionLink);
                                setNotificationPanelOpen(false);
                              }}
                              className="text-[#00A99D] hover:text-[#008F84] text-sm font-medium transition-colors"
                            >
                              {notification.actionText}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t p-3 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => {
                  // Clear notifications or navigate to full notifications page
                  setNotifications([]);
                  setHasNewNotifications(false);
                  setNotificationPanelOpen(false);
                }}
                className="w-full text-center text-sm text-[#00A99D] hover:text-[#008F84] font-medium transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content wrapper for layout usage */}
      {children && (
        <div className="flex-1 md:ml-64 mt-16 md:mt-0">{children}</div>
      )}
    </>
  );
}