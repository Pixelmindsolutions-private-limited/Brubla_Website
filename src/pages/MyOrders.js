import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Truck, CheckCircle, Clock, XCircle, Search,
  Filter, ChevronDown, ChevronRight, Eye, Download,
  Star, MessageCircle, RefreshCw, Calendar, MapPin,
  CreditCard, Receipt, FileText, ShoppingBag, Heart,
  Loader2, AlertCircle, TrendingUp, Award, Gift,
  Home, Phone, Mail, User, ChevronLeft, ChevronsLeft,
  ChevronsRight, MoreHorizontal
} from "lucide-react";
import SingleOrderModal from "./SingleOrderModal";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

// API Base URL
const API_BASE_URL = "http://31.97.228.17:4077/api";

// Format price in Indian Rupees
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

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
    .animate-scaleIn { animation: scaleIn 0.4s ease forwards; }
    
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    @media (max-width: 640px) {
      button, .cursor-pointer {
        -webkit-tap-highlight-color: transparent;
      }
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "delivered":
      case "completed":
        return { icon: CheckCircle, label: "Delivered", bgColor: "#22c55e" };
      case "shipped":
        return { icon: Truck, label: "Shipped", bgColor: "#eab308" };
      case "processing":
      case "pending":
        return { icon: Clock, label: "Processing", bgColor: "#f97316" };
      case "cancelled":
        return { icon: XCircle, label: "Cancelled", bgColor: "#ef4444" };
      default:
        return { icon: Clock, label: status || "Processing", bgColor: "#f97316" };
    }
  };

  const { icon: Icon, label, bgColor } = getStatusConfig(status);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100">
      <Icon size={12} className="flex-shrink-0" style={{ color: bgColor }} />
      <span className="text-xs font-semibold fs" style={{ color: bgColor }}>{label}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CARD (Card View - Mobile/Tablet) - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden active:scale-[0.99] sm:active:scale-100"
    >
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-mono text-gray-700 fs">{order.orderId || order.orderNumber}</span>
            <div className="w-px h-3 bg-gray-200 hidden xs:block" />
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 fs">{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex gap-3">
          <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={order.items[0]?.variant?.mainImage}
              alt={order.items[0]?.productName || "Product"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/40x48/f3f4f6/9ca3af?text=BRUBLA";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 fs truncate">{order.items[0]?.productName || "Product"}</p>
            <p className="text-xs text-gray-400 fs mt-0.5">{order.items.length} item(s)</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-base font-bold text-gray-900 fd">{formatPrice(order.finalAmount)}</p>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER ROW (Table View - Desktop) - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const OrderRow = ({ order, onClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-12 gap-4 items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300 cursor-pointer group"
    >
      <div className="col-span-3 flex items-center gap-3 min-w-0">
        <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={order.items[0]?.variant?.mainImage || "https://via.placeholder.com/40x48/f3f4f6/9ca3af?text=P"}
            alt={order.items[0]?.productName || "Product"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 fs truncate">{order.items[0]?.productName || "Product"}</p>
          <p className="text-xs text-gray-400 fs">{order.items.length} item(s)</p>
        </div>
      </div>
      <div className="col-span-2">
        <p className="text-sm font-mono text-gray-700 fs">{order.orderId}</p>
        <p className="text-xs text-gray-400 fs">{formatDate(order.createdAt)}</p>
      </div>
      <div className="col-span-2">
        <StatusBadge status={order.orderStatus} />
      </div>
      <div className="col-span-2">
        <p className="text-base font-bold text-gray-900 fd">{formatPrice(order.finalAmount)}</p>
      </div>
      <div className="col-span-3 flex justify-end">
        <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION COMPONENT - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const ellipsis = { type: "ellipsis", value: "..." };

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push({ type: "page", value: i });
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push({ type: "page", value: i });
        }
        pages.push(ellipsis);
        pages.push({ type: "page", value: totalPages });
      } else if (currentPage >= totalPages - 2) {
        pages.push({ type: "page", value: 1 });
        pages.push(ellipsis);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push({ type: "page", value: i });
        }
      } else {
        pages.push({ type: "page", value: 1 });
        pages.push(ellipsis);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push({ type: "page", value: i });
        }
        pages.push(ellipsis);
        pages.push({ type: "page", value: totalPages });
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6 sm:mt-8">
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft size={14} className="sm:w-4 sm:h-4" />
        </button>

        {getPageNumbers().map((item, idx) => (
          item.type === "ellipsis" ? (
            <div key={`ellipsis-${idx}`} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
              <MoreHorizontal size={14} className="text-gray-400" />
            </div>
          ) : (
            <button
              key={item.value}
              onClick={() => onPageChange(item.value)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-medium fs text-sm transition-all ${currentPage === item.value
                ? "bg-black text-white font-bold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
            >
              {item.value}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
        <Icon size={14} className="sm:w-[18px] sm:h-[18px]" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-gray-400 fs uppercase tracking-wide">{label}</p>
        <p className="text-base sm:text-xl font-bold text-gray-900 fd">{value}</p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BUTTON - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium fs transition-all whitespace-nowrap active:scale-95 ${active
      ? "bg-black text-white font-semibold"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      }`}
  >
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// VIEW TOGGLE BUTTON - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const ViewToggle = ({ view, setView }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
    <button
      onClick={() => setView("card")}
      className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium fs transition-all ${view === "card" ? "bg-black text-white" : "text-gray-500 hover:text-gray-700"
        }`}
    >
      <div className="flex items-center gap-1">
        <Package size={12} />
        <span className="hidden xs:inline">Cards</span>
      </div>
    </button>
    <button
      onClick={() => setView("table")}
      className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium fs transition-all ${view === "table" ? "bg-black text-white" : "text-gray-500 hover:text-gray-700"
        }`}
    >
      <div className="flex items-center gap-1">
        <FileText size={12} />
        <span className="hidden xs:inline">Table</span>
      </div>
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
export default function MyOrders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("card");
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  // Get userId from sessionStorage
  const getUserId = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      return user?.id || null;
    } catch {
      return null;
    }
  };

  const userId = getUserId();

  const filters = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" }
  ];

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/users/order/${userId}`);

      console.log("Orders response:", response.data);

      if (response.data.success && response.data.orders) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
      } else {
        setOrders([]);
        setFilteredOrders([]);
        if (response.data.message) {
          console.warn(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to load orders. Please try again.");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let result = [...orders];

    if (activeFilter !== "all") {
      result = result.filter(order => {
        const status = (order.orderStatus || "").toLowerCase();
        return status === activeFilter.toLowerCase();
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        (order.orderId || "").toLowerCase().includes(query) ||
        (order.orderNumber || "").toLowerCase().includes(query) ||
        order.items.some(item => (item.productName || "").toLowerCase().includes(query))
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [activeFilter, searchQuery, orders]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    totalOrders: orders.length,
    delivered: orders.filter(o => (o.orderStatus || "").toLowerCase() === "delivered").length,
    inTransit: orders.filter(o => (o.orderStatus || "").toLowerCase() === "shipped").length,
    pending: orders.filter(o => (o.orderStatus || "").toLowerCase() === "pending" || (o.orderStatus || "").toLowerCase() === "processing").length,
    totalSpent: orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0)
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <Loader2 size={32} className="sm:w-10 sm:h-10 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-500 fs text-sm sm:text-base">Loading your orders...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Orders</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-5 py-2 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
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
              <div>
                <h1 className="fd font-black text-gray-900 text-2xl sm:text-3xl md:text-4xl">My Orders</h1>
                <p className="text-gray-500 fs text-xs sm:text-sm mt-1">Track and manage all your purchases</p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors fs text-xs sm:text-sm text-gray-700"
              >
                <RefreshCw size={12} className="sm:w-3.5 sm:h-3.5" />
                Refresh
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="#000000" />
            <StatCard icon={CheckCircle} label="Delivered" value={stats.delivered} color="#22c55e" />
            <StatCard icon={Truck} label="In Transit" value={stats.inTransit} color="#eab308" />
            <StatCard icon={TrendingUp} label="Total Spent" value={formatPrice(stats.totalSpent)} color="#ef4444" />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 fs text-xs sm:text-sm placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {filters.map(filter => (
                  <FilterButton
                    key={filter.id}
                    label={filter.label}
                    active={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                  />
                ))}
              </div>
              <ViewToggle view={view} setView={setView} />
            </div>
          </div>

          {/* Orders List */}
          {paginatedOrders.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <Package size={36} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 fd mb-1 sm:mb-2">No orders found</h3>
              <p className="text-gray-500 fs text-xs sm:text-sm mb-4 sm:mb-6 px-4">
                {searchQuery ? "Try a different search term" : "You haven't placed any orders yet"}
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white font-semibold fs text-xs sm:text-sm transition-all hover:opacity-90 active:scale-95 bg-black"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {view === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {paginatedOrders.map(order => (
                    <OrderCard key={order._id || order.orderId} order={order} onClick={() => setSelectedOrder(order)} />
                  ))}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block space-y-2">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 fs border-b border-gray-200">
                      <div className="col-span-3">Product</div>
                      <div className="col-span-2">Order ID / Date</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Total</div>
                      <div className="col-span-3"></div>
                    </div>
                    {paginatedOrders.map(order => (
                      <OrderRow key={order._id || order.orderId} order={order} onClick={() => setSelectedOrder(order)} />
                    ))}
                  </div>

                  {/* Mobile/Tablet Card View for Table mode */}
                  <div className="lg:hidden">
                    <div className="grid grid-cols-1 gap-3">
                      {paginatedOrders.map(order => (
                        <OrderCard key={order._id || order.orderId} order={order} onClick={() => setSelectedOrder(order)} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />

              {/* Order count info */}
              <p className="text-center text-xs text-gray-400 fs mt-4">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </p>
            </>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <SingleOrderModal
            order={selectedOrder}
            onClose={handleCloseModal}
          />
        )}
      </div>
      <Footer />
    </>
  );
}