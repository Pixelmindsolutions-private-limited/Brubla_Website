import { CheckCircle, Clock, CreditCard, Download, FileText, MapPin, MessageCircle, Package, Truck, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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

const SingleOrderModal = ({ order: propOrder, orderId, userId, onClose }) => {
  const [activeTab, setActiveTab] = useState("items");
  const [order, setOrder] = useState(propOrder || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch order details if only orderId is provided
  useEffect(() => {
    if (propOrder) {
      setOrder(propOrder);
      return;
    }

    if (orderId && userId) {
      fetchOrderDetails();
    }
  }, [propOrder, orderId, userId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/users/order/${userId}/${orderId}`);

      console.log("Order details response:", response.data);

      if (response.data.success && response.data.order) {
        setOrder(response.data.order);
      } else {
        setError(response.data.message || "Failed to load order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.response?.data?.message || "Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!order && !loading) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", hour: '2-digit', minute: '2-digit' });
  };

  // Get order status for tracking steps
  const orderStatus = (order?.orderStatus || "").toLowerCase();

  const trackingSteps = [
    { label: "Order Placed", key: "placed", completed: true, date: order?.createdAt },
    { label: "Confirmed", key: "confirmed", completed: orderStatus !== "pending", date: order?.createdAt },
    { label: "Processing", key: "processing", completed: orderStatus === "processing" || orderStatus === "shipped" || orderStatus === "delivered", date: order?.updatedAt },
    { label: "Shipped", key: "shipped", completed: orderStatus === "shipped" || orderStatus === "delivered", date: order?.shippedDate || order?.updatedAt },
    { label: "Delivered", key: "delivered", completed: orderStatus === "delivered", date: order?.deliveredDate || (orderStatus === "delivered" ? order?.updatedAt : null) }
  ];

  const getStatusColor = () => {
    switch (orderStatus) {
      case "delivered": return "text-green-600";
      case "shipped": return "text-blue-600";
      case "processing": return "text-orange-600";
      case "pending": return "text-yellow-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = () => {
    const status = orderStatus;
    if (status === "delivered") return { label: "Delivered", color: "bg-green-100 text-green-700" };
    if (status === "shipped") return { label: "Shipped", color: "bg-blue-100 text-blue-700" };
    if (status === "processing") return { label: "Processing", color: "bg-orange-100 text-orange-700" };
    if (status === "pending") return { label: "Pending", color: "bg-yellow-100 text-yellow-700" };
    if (status === "cancelled") return { label: "Cancelled", color: "bg-red-100 text-red-700" };
    return { label: order?.orderStatus || "Unknown", color: "bg-gray-100 text-gray-700" };
  };

  const statusBadge = getStatusBadge();

  const handleDownloadInvoice = () => {
    // Create invoice HTML content
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order?.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; text-align: right; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Order #${order?.orderId}</p>
        </div>
        <div class="order-info">
          <p><strong>Date:</strong> ${formatDateTime(order?.createdAt)}</p>
          <p><strong>Payment Method:</strong> ${order?.paymentMethod === "cod" ? "Cash on Delivery" : order?.paymentMethod}</p>
          <p><strong>Order Status:</strong> ${statusBadge.label}</p>
        </div>
        <h3>Items</h3>
        <table>
          <thead>
            <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${order?.items?.map(item => `
              <tr>
                <td>${item.productName}${item.variant?.color ? ` (${item.variant.color})` : ''}${item.variant?.size ? ` - ${item.variant.size}` : ''}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Total Amount: ${formatPrice(order?.finalAmount || order?.totalAmount)}</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with us!</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${order?.orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNeedHelp = () => {
    window.location.href = "mailto:support@example.com?subject=Order%20Help%20-%20" + order?.orderId;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-3xl bg-white rounded-xl sm:rounded-2xl p-8 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
          <Loader2 size={40} className="animate-spin text-black mb-4" />
          <p className="text-gray-500 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white rounded-xl sm:rounded-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Order</h3>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchOrderDetails}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 ml-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-white border border-gray-200 shadow-xl animate-scaleIn" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 sm:p-4 md:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-black">Order Details</h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-500 font-mono">{order.orderId}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XCircle size={20} className="text-gray-400 hover:text-black" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-3 sm:px-4 md:px-5 overflow-x-auto hide-scrollbar">
          {[
            { id: "items", label: "Items", icon: Package },
            { id: "tracking", label: "Tracking", icon: Truck },
            { id: "details", label: "Details", icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-black" : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <tab.icon size={14} className="sm:w-3.5 sm:h-3.5" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-5">

          {/* Items Tab */}
          {activeTab === "items" && (
            <div className="space-y-3 sm:space-y-4">
              {order.items?.map((item, idx) => (
                <div key={item._id || idx} className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={item.variant?.mainImage || "https://placehold.co/600x800/e5e7eb/64748b?text=BRUBLA"}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://placehold.co/600x800/e5e7eb/64748b?text=BRUBLA"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black text-sm sm:text-base">{item.productName}</h3>
                    {item.productDescription && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.productDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-1">
                      {item.variant?.size && <p className="text-xs text-gray-500">Size: {item.variant.size}</p>}
                      {item.variant?.color && <p className="text-xs text-gray-500">Color: {item.variant.color}</p>}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-black mt-1.5">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-black">{formatPrice(order.totalAmount || order.finalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600">{formatPrice(order.discountAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="text-black capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-black">Total</span>
                    <span className="text-black">{formatPrice(order.finalAmount || order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === "tracking" && (
            <div className="space-y-5 sm:space-y-6">
              <div className="relative">
                <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-5 sm:space-y-6 relative">
                  {trackingSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 sm:gap-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.completed ? "bg-black/10" : "bg-gray-100"
                        }`}>
                        {step.completed ? (
                          <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px] text-black" />
                        ) : (
                          <Clock size={12} className="sm:w-4 sm:h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${step.completed ? "text-black" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(step.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Delivery Info */}
              {orderStatus === "shipped" && (
                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Estimated Delivery: 3-5 business days</p>
                  </div>
                </div>
              )}

              {orderStatus === "delivered" && (
                <div className="p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-sm font-medium text-green-800">Delivered on {formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-4 sm:space-y-5">
              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-semibold text-black flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <MapPin size={14} className="text-black" />
                  Shipping Address
                </h3>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-medium text-black text-sm sm:text-base">{order.deliveryAddress?.fullName || "N/A"}</p>
                  <p className="text-sm text-gray-600 mt-1 break-words">{order.deliveryAddress?.address || "N/A"}</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress?.city && order.deliveryAddress?.state
                      ? `${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`
                      : "N/A"}
                  </p>
                  {order.deliveryAddress?.landmark && (
                    <p className="text-sm text-gray-500 mt-1">Landmark: {order.deliveryAddress.landmark}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 break-words">{order.deliveryAddress?.mobile || "N/A"}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-sm font-semibold text-black flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <CreditCard size={14} className="text-black" />
                  Payment Information
                </h3>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="text-black capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Status</span>
                    <span className={order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}>
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Order Date</span>
                    <span className="text-black">{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div>
                <h3 className="text-sm font-semibold text-black flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Package size={14} className="text-black" />
                  Order Summary
                </h3>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Items Total</span>
                    <span className="text-black">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-black">Final Amount</span>
                      <span className="text-black">{formatPrice(order.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex-1 py-2.5 rounded-lg bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <Download size={14} />
                  Download Invoice
                </button>
                <button
                  onClick={handleNeedHelp}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle size={14} />
                  Need Help?
                </button>
              </div> */}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SingleOrderModal;