import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, ShoppingBag, Truck, Tag, Heart, Star, Clock, 
  CheckCircle, XCircle, AlertCircle, ChevronLeft, Settings,
  Trash2, CheckCheck, Filter, Calendar, Package, CreditCard,
  Gift, MessageCircle, UserPlus, MapPin, Sparkles, Loader2,
  ChevronRight, ChevronsLeft, ChevronsRight, Eye, ExternalLink,
  Copy, ThumbsUp, Award, X
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .fd { font-family: 'Playfair Display', Georgia, serif; }
    .fs { font-family: 'DM Sans', system-ui, sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .animate-fadeUp { animation: fadeUp 0.5s ease forwards; }
    .animate-slideInRight { animation: slideInRight 0.5s ease forwards; }
    .animate-scaleIn { animation: scaleIn 0.3s ease forwards; }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @media (max-width: 640px) {
      button, .cursor-pointer { -webkit-tap-highlight-color: transparent; }
    }
  `}</style>
);

// Generate 50+ sample notifications
const generateAllNotifications = () => {
  const notifications = [];
  
  const types = [
    { type: "order", icon: ShoppingBag, color: "#000000", bgColor: "bg-gray-100", titles: ["Order Confirmed", "Order Processed", "Order Shipped"] },
    { type: "delivery", icon: Truck, color: "#3b82f6", bgColor: "bg-blue-50", titles: ["Out for Delivery", "Delivery Scheduled", "Delivered Successfully"] },
    { type: "promotion", icon: Tag, color: "#10b981", bgColor: "bg-emerald-50", titles: ["Weekend Special Offer", "Flash Sale Live", "New Arrivals"] },
    { type: "wishlist", icon: Heart, color: "#ef4444", bgColor: "bg-red-50", titles: ["Back in Stock", "Price Drop Alert"] },
    { type: "review", icon: Star, color: "#f59e0b", bgColor: "bg-amber-50", titles: ["Review Reminder", "Thanks for Your Review"] },
    { type: "payment", icon: CreditCard, color: "#8b5cf6", bgColor: "bg-purple-50", titles: ["Payment Successful", "Refund Processed"] }
  ];
  
  for (let i = 1; i <= 45; i++) {
    const typeData = types[Math.floor(Math.random() * types.length)];
    const title = typeData.titles[Math.floor(Math.random() * typeData.titles.length)];
    const timeAgo = [
      `${Math.floor(Math.random() * 60)} minutes ago`,
      `${Math.floor(Math.random() * 24)} hours ago`,
      `${Math.floor(Math.random() * 7)} days ago`
    ][Math.floor(Math.random() * 3)];
    
    notifications.push({
      id: i.toString(),
      type: typeData.type,
      title: title,
      message: `Update about your order #ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      time: timeAgo,
      read: i > 15 ? Math.random() > 0.3 : Math.random() > 0.5,
      icon: typeData.icon,
      iconColor: typeData.color,
      bgColor: typeData.bgColor,
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      promoCode: typeData.type === "promotion" ? `SAVE${Math.floor(10 + Math.random() * 90)}` : null,
      pointsEarned: typeData.type === "review" ? Math.floor(20 + Math.random() * 80) : null
    });
  }
  
  return notifications.sort((a, b) => {
    const getMinutes = (timeStr) => {
      if (timeStr.includes("minutes")) return -parseInt(timeStr);
      if (timeStr.includes("hours")) return -parseInt(timeStr) * 60;
      if (timeStr.includes("days")) return -parseInt(timeStr) * 1440;
      return 0;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  });
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center gap-2 text-xs text-gray-500 fs">
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-700 fs text-xs focus:border-black transition-colors"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
        <span>per page</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors disabled:opacity-50"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium fs transition-all ${
                currentPage === page
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors disabled:opacity-50"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Notification Card Component - Light Theme
const NotificationCard = ({ notification, onMarkRead, onDelete, onView }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const Icon = notification.icon;
  
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(notification.id);
    setIsDeleting(false);
  };
  
  return (
    <div 
      className={`group relative bg-white rounded-xl border transition-all duration-300 cursor-pointer ${
        !notification.read ? "border-black shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      } ${isDeleting ? "opacity-50" : ""}`}
      onClick={() => onView(notification)}
    >
      {!notification.read && (
        <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-black animate-pulse" />
      )}
      
      <div className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.bgColor}`}>
            <Icon size={18} className="sm:w-5 sm:h-5" style={{ color: notification.iconColor }} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-semibold fs text-sm sm:text-base ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                  {notification.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 fs mt-1 leading-relaxed line-clamp-2">
                  {notification.message}
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onView(notification)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="View details"
                >
                  <Eye size={14} className="text-black" />
                </button>
                {!notification.read && (
                  <button
                    onClick={() => onMarkRead(notification.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck size={14} className="text-black" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-gray-400 hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
            
            {/* Footer with time */}
            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-100">
              <Clock size={10} className="text-gray-400" />
              <span className="text-[10px] sm:text-xs text-gray-400 fs">{notification.time}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Notification Modal - Light Theme
const ViewNotificationModal = ({ notification, isOpen, onClose, onMarkAsRead }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !notification) return null;
  
  const Icon = notification.icon;
  
  const handleCopyCode = () => {
    if (notification.promoCode) {
      navigator.clipboard.writeText(notification.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-white border border-gray-200 animate-scaleIn shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 sm:p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notification.bgColor}`}>
              <Icon size={20} style={{ color: notification.iconColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 fd">{notification.title}</h2>
              <p className="text-xs text-gray-500 fs">{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Time */}
          <div className="flex items-center gap-2 text-xs text-gray-500 fs">
            <Clock size={12} />
            <span>{notification.time}</span>
            {!notification.read && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-black/10 text-black text-[10px] font-semibold">
                New
              </span>
            )}
          </div>
          
          {/* Message */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 fs text-sm leading-relaxed">{notification.message}</p>
          </div>
          
          {/* Additional Details */}
          {notification.orderId && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 fs mb-1">Order ID</p>
              <p className="text-sm font-medium text-gray-900 fs">{notification.orderId}</p>
            </div>
          )}
          
          {notification.promoCode && (
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 fs mb-1">Promo Code</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-bold text-black fd tracking-wider">{notification.promoCode}</p>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium fs hover:bg-gray-300 transition-colors"
                >
                  <Copy size={12} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
          
          {notification.pointsEarned && (
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3 border border-amber-200">
              <Award size={20} className="text-amber-600" />
              <div>
                <p className="text-xs text-gray-500 fs">Loyalty Points Earned</p>
                <p className="text-lg font-bold text-amber-600">+{notification.pointsEarned} points</p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!notification.read && (
              <button
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white font-semibold fs text-sm hover:bg-gray-800 transition-colors"
              >
                <CheckCheck size={16} />
                Mark as Read
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium fs text-sm hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card - Light Theme
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gray-100">
        <Icon size={14} className="sm:w-[18px] sm:h-[18px]" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs text-gray-500 fs uppercase tracking-wide">{label}</p>
        <p className="text-base sm:text-xl font-bold text-gray-900 fd">{value}</p>
      </div>
    </div>
  </div>
);

// Filter Button - Light Theme
const FilterButton = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium fs transition-all whitespace-nowrap ${
      active ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
        active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
      }`}>
        {count}
      </span>
    )}
  </button>
);

// Empty State - Light Theme
const EmptyState = ({ type, onClearFilters }) => (
  <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
      <Bell size={28} className="sm:w-8 sm:h-8 text-gray-400" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 fd mb-2">No notifications</h3>
    <p className="text-gray-500 fs text-xs sm:text-sm max-w-xs mx-auto px-4">
      {type === "all" 
        ? "You don't have any notifications yet." 
        : type === "unread"
        ? "Great! You've read all your notifications."
        : `No ${type} notifications to show.`}
    </p>
    {type !== "all" && type !== "unread" && (
      <button
        onClick={onClearFilters}
        className="mt-4 px-4 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium fs hover:bg-gray-200 transition-colors"
      >
        View all notifications
      </button>
    )}
  </div>
);

// Main Notifications Page - Light Theme
export default function UserNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const allNotifications = generateAllNotifications();
      setNotifications(allNotifications);
      setLoading(false);
    };
    loadNotifications();
  }, []);
  
  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);
  
  // Get filtered notifications
  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case "unread": return notifications.filter(n => !n.read);
      case "order": return notifications.filter(n => n.type === "order");
      case "delivery": return notifications.filter(n => n.type === "delivery");
      case "promotion": return notifications.filter(n => n.type === "promotion");
      default: return notifications;
    }
  };
  
  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Pagination calculations
  const totalItems = filteredNotifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Stats
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    orders: notifications.filter(n => n.type === "order").length,
    promotions: notifications.filter(n => n.type === "promotion").length
  };
  
  // Mark single notification as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    showToast("Marked as read", "success");
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read", "success");
  };
  
  // Delete single notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast("Notification deleted", "success");
    if (viewingNotification?.id === id) {
      setIsViewModalOpen(false);
      setViewingNotification(null);
    }
  };
  
  // Delete selected notifications
  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    setSelectMode(false);
    showToast(`${selectedNotifications.length} notification(s) deleted`, "success");
  };
  
  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Select all on current page
  const selectAllOnPage = () => {
    const currentPageIds = paginatedNotifications.map(n => n.id);
    const allSelected = currentPageIds.every(id => selectedNotifications.includes(id));
    
    if (allSelected) {
      setSelectedNotifications(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedNotifications(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };
  
  // Select all notifications
  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };
  
  // Show toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Clear filters
  const clearFilters = () => {
    setActiveFilter("all");
  };
  
  // Handle view notification
  const handleViewNotification = (notification) => {
    setViewingNotification(notification);
    setIsViewModalOpen(true);
  };
  
  // Handle mark as read from modal
  const handleMarkAsReadFromModal = (id) => {
    markAsRead(id);
    setViewingNotification(prev => prev ? { ...prev, read: true } : prev);
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <Loader2 size={32} className="sm:w-10 sm:h-10 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-500 fs text-sm sm:text-base">Loading notifications...</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <Styles />
        
        {/* Hero Section - Light Theme */}
        <div className="relative overflow-hidden pb-6 sm:pb-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-black transition-colors mb-4 sm:mb-6 fs text-xs sm:text-sm group"
            >
              <ChevronLeft size={14} className="sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell size={28} className="sm:w-8 sm:h-8 text-black" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="fd font-black text-gray-900 text-2xl sm:text-3xl md:text-4xl">Notifications</h1>
                  <p className="text-gray-500 fs text-xs sm:text-sm mt-1">Stay updated with your orders and offers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {selectMode ? (
                  <>
                    <button
                      onClick={selectAllOnPage}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium fs hover:bg-gray-200 transition-colors"
                    >
                      Select Page
                    </button>
                    <button
                      onClick={selectAll}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium fs hover:bg-gray-200 transition-colors"
                    >
                      Select All
                    </button>
                    {selectedNotifications.length > 0 && (
                      <button
                        onClick={deleteSelected}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium fs hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={12} />
                        Delete ({selectedNotifications.length})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectMode(false);
                        setSelectedNotifications([]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium fs hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium fs hover:bg-gray-200 transition-colors"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setSelectMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium fs hover:bg-gray-200 transition-colors"
                    >
                      <Filter size={12} />
                      Select
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <StatCard icon={Bell} label="Total" value={stats.total} color="#000000" />
            <StatCard icon={Clock} label="Unread" value={stats.unread} color="#f59e0b" />
            <StatCard icon={ShoppingBag} label="Orders" value={stats.orders} color="#3b82f6" />
            <StatCard icon={Tag} label="Promotions" value={stats.promotions} color="#10b981" />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 pb-2 overflow-x-auto hide-scrollbar">
            <FilterButton active={activeFilter === "all"} label="All" count={stats.total} onClick={() => setActiveFilter("all")} />
            <FilterButton active={activeFilter === "unread"} label="Unread" count={unreadCount} onClick={() => setActiveFilter("unread")} />
            <FilterButton active={activeFilter === "order"} label="Orders" count={stats.orders} onClick={() => setActiveFilter("order")} />
            <FilterButton active={activeFilter === "delivery"} label="Delivery" onClick={() => setActiveFilter("delivery")} />
            <FilterButton active={activeFilter === "promotion"} label="Promotions" count={stats.promotions} onClick={() => setActiveFilter("promotion")} />
          </div>
          
          {/* Notifications List */}
          {paginatedNotifications.length === 0 ? (
            <EmptyState type={activeFilter} onClearFilters={clearFilters} />
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {paginatedNotifications.map(notification => (
                  <div key={notification.id} className="relative">
                    {selectMode && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-2">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelect(notification.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    )}
                    <div className={selectMode ? "ml-6" : ""}>
                      <NotificationCard
                        notification={notification}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                        onView={handleViewNotification}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                />
              )}
            </>
          )}
          
          {/* Footer Note */}
          {filteredNotifications.length > 0 && (
            <p className="text-center text-[10px] text-gray-400 fs mt-6">
              Notifications are kept for 30 days • {totalItems} total {activeFilter !== "all" ? activeFilter : ""} notifications
            </p>
          )}
        </div>
        
        {/* View Notification Modal */}
        <ViewNotificationModal
          notification={viewingNotification}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingNotification(null);
          }}
          onMarkAsRead={handleMarkAsReadFromModal}
        />
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideInRight">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              toast.type === "success" ? "bg-black text-white" : "bg-red-500 text-white"
            }`}>
              {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-medium">{toast.message}</p>
              <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}