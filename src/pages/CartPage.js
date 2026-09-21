import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiTrash2, FiPlus, FiMinus, FiHeart, FiShoppingBag, 
  FiMapPin, FiCreditCard, FiTruck, FiClock, FiShield,
  FiChevronRight, FiX, FiEdit2, FiPlusCircle, FiHome, FiBriefcase, FiNavigation,
  FiCheckCircle
} from "react-icons/fi";
import { FaCheckCircle, FaMapMarkerAlt, FaBuilding, FaHome } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const COFFEE = "#000";

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

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove, onSaveForLater, isSelected, onSelect }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    setIsUpdating(true);
    await onUpdateQuantity(item._id, newQuantity, item.productId, item.variantId);
    setIsUpdating(false);
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all relative">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Checkbox */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item._id)}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-coffee focus:ring-coffee"
          />
        </div>

        {/* Product Image */}
        <div className="relative w-full sm:w-32 md:w-40 h-48 sm:h-32 md:h-40 flex-shrink-0">
          <img
            src={item.mainImage || "https://via.placeholder.com/160x160/f3f4f6/9ca3af?text=Product"}
            alt={item.productName}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => e.target.src = "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image"}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">{item.productName}</h3>
              
              {/* Variants */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                {item.color && <span>Color: {item.color}</span>}
                {item.size && <span>Size: {item.size}</span>}
              </div>

              {/* Description */}
              {item.productDescription && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.productDescription}</p>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                {item.displayActualPrice && (
                  <div className="text-xs text-gray-400 line-through">
                    {formatPrice(item.displayActualPrice * item.quantity)}
                  </div>
                )}
                {item.displayActualPrice && (
                  <div className="text-xs text-green-600">
                    Save {formatPrice((item.displayActualPrice - item.price) * item.quantity)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRemove(item._id, item.productId, item.variantId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Quantity:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-coffee hover:bg-coffee/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating || item.quantity >= 10}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-coffee hover:bg-coffee/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
            <div className="text-sm text-green-600">✓ In Stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Address Card Component
const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete }) => {
  const getIcon = () => {
    if (address.type === "home") return <FaHome size={18} className="text-coffee" />;
    if (address.type === "office") return <FaBuilding size={18} className="text-coffee" />;
    return <MdLocationOn size={18} className="text-coffee" />;
  };

  return (
    <div
      onClick={() => onSelect(address._id)}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected 
          ? "border-coffee bg-coffee/5" 
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <FaCheckCircle size={18} className="text-coffee" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 capitalize">{address.type}</h4>
            {address.isDefault && (
              <span className="text-xs bg-coffee/10 text-coffee px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 break-words">{address.fullName}</p>
          <p className="text-sm text-gray-500">{address.mobile}</p>
          <p className="text-sm text-gray-500 mt-1 break-words">
            {address.address}, {address.city}, {address.state} - {address.pincode}
          </p>
          {address.landmark && (
            <p className="text-xs text-gray-400 mt-1">Landmark: {address.landmark}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(address); }}
          className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
        >
          <FiEdit2 size={14} />
          Edit
        </button>
        {!address.isDefault && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(address._id); }}
            className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

// Add Address Modal
const AddAddressModal = ({ isOpen, onClose, onSave, editingAddress }) => {
  const [formData, setFormData] = useState({
    type: "home",
    fullName: "",
    mobile: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    isDefault: false
  });

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        type: editingAddress.type || "home",
        fullName: editingAddress.fullName || "",
        mobile: editingAddress.mobile || "",
        pincode: editingAddress.pincode || "",
        address: editingAddress.address || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        landmark: editingAddress.landmark || "",
        isDefault: editingAddress.isDefault || false
      });
    } else {
      setFormData({
        type: "home",
        fullName: "",
        mobile: "",
        pincode: "",
        address: "",
        city: "",
        state: "",
        landmark: "",
        isDefault: false
      });
    }
  }, [editingAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "home", label: "Home", icon: "🏠" },
                { value: "office", label: "Office", icon: "🏢" },
                { value: "other", label: "Other", icon: "📍" }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setFormData({...formData, type: type.value})}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    formData.type === type.value 
                      ? "text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={{ backgroundColor: formData.type === type.value ? COFFEE : undefined }}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee transition-colors"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee transition-colors"
              placeholder="110001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows="2"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee transition-colors"
              placeholder="House No, Street, Area"
            />
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee transition-colors"
                placeholder="New Delhi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee transition-colors"
                placeholder="Delhi"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({...formData, landmark: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee transition-colors"
              placeholder="Near Metro Station"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
              className="rounded border-gray-300 text-coffee focus:ring-coffee"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 flex flex-col xs:flex-row gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: COFFEE }}
          >
            {editingAddress ? "Update" : "Save"} Address
          </button>
        </div>
      </div>
    </div>
  );
};

// Remove Confirmation Modal
const RemoveConfirmationModal = ({ isOpen, onClose, onConfirmRemove, onConfirmSaveForLater }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash2 size={28} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Remove Item?</h3>
          <p className="text-gray-500 mb-6">Would you like to save this item for later or remove it permanently?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onConfirmSaveForLater}
              className="flex-1 px-4 py-2 bg-coffee/10 text-coffee rounded-lg hover:bg-coffee/20 transition-colors flex items-center justify-center gap-2"
            >
              <FiHeart size={16} />
              Save for Later
            </button>
            <button
              onClick={onConfirmRemove}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <FiTrash2 size={16} />
              Remove
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Review Component
const OrderReview = ({ selectedCartItems, selectedAddress, addresses, selectedPaymentMethod, total, onConfirmOrder, onBack, loading }) => {
  const address = addresses.find(addr => addr._id === selectedAddress);
  
  const paymentMethods = {
    cod: "Cash on Delivery",
    card: "Credit/Debit Card",
    upi: "UPI",
    netbanking: "Net Banking"
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-coffee/5 to-transparent">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FiCheckCircle className="text-coffee" size={20} />
            Order Summary
          </h3>
        </div>
        
        {/* Order Items */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3">Items ({selectedCartItems.length})</h4>
          <div className="space-y-3">
            {selectedCartItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                <img 
                  src={item.mainImage || "https://via.placeholder.com/60x60/f3f4f6/9ca3af?text=Product"} 
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => e.target.src = "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image"}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                  {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                </div>
                <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <FiMapPin size={16} className="text-coffee" />
            Delivery Address
          </h4>
          {address && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">{address.fullName}</p>
              <p className="text-sm text-gray-600">{address.mobile}</p>
              <p className="text-sm text-gray-600 mt-1">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
              {address.landmark && <p className="text-sm text-gray-500">Landmark: {address.landmark}</p>}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <FiCreditCard size={16} className="text-coffee" />
            Payment Method
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-900">{paymentMethods[selectedPaymentMethod] || selectedPaymentMethod}</p>
          </div>
        </div>

        {/* Price Details */}
        <div className="p-4 sm:p-6">
          <h4 className="font-medium text-gray-900 mb-3">Price Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total MRP</span>
              <span className="text-gray-900">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Fee</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-coffee text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirmOrder}
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: COFFEE }}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Placing Order...
            </>
          ) : (
            <>
              Confirm & Place Order
              <FiChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Main Cart Page Component
export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [step, setStep] = useState(1);
  const [showOrderReview, setShowOrderReview] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [pendingRemoveItem, setPendingRemoveItem] = useState(null);
  const [placedOrderId, setPlacedOrderId] = useState(null);

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

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    if (!userId) return;
    
    setCartLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/cart/${userId}`);
      if (response.data.success && response.data.cart) {
        const items = response.data.cart.items || [];
        setCartItems(items);
        setSelectedItems(items.map(item => item._id));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setCartLoading(false);
    }
  }, [userId]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!userId) return;
    
    setAddressLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all/${userId}`);
      if (response.data.success && response.data.addresses) {
        setAddresses(response.data.addresses);
        const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (response.data.addresses.length > 0) {
          setSelectedAddress(response.data.addresses[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setAddressLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCart();
      fetchAddresses();
    }
  }, [userId, fetchCart, fetchAddresses]);

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity, productId, variantId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/cart/${userId}/update`, {
        userId: userId,
        cartItemId: cartItemId,
        quantity: newQuantity
      });
      
      if (response.data.success) {
        setCartItems(prev => prev.map(item =>
          item._id === cartItemId ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity } : item
        ));
      } else {
        alert(response.data.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  // Remove item with confirmation
  const confirmRemoveItem = (cartItemId, productId, variantId) => {
    setPendingRemoveItem({ cartItemId, productId, variantId });
    setRemoveModalOpen(true);
  };

  // Permanently remove item
  const handlePermanentRemove = async () => {
    if (!pendingRemoveItem) return;
    
    const { cartItemId, productId, variantId } = pendingRemoveItem;
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/cart/${userId}/remove`, {
        data: { userId: userId, cartItemId: cartItemId }
      });
      
      if (response.data.success) {
        setCartItems(prev => prev.filter(item => item._id !== cartItemId));
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
      } else {
        alert(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item");
    } finally {
      setRemoveModalOpen(false);
      setPendingRemoveItem(null);
    }
  };

  // Save for later (move to wishlist)
  const handleSaveForLater = async () => {
    if (!pendingRemoveItem) return;
    
    const { cartItemId, productId, variantId } = pendingRemoveItem;
    
    try {
      const removeResponse = await axios.delete(`${API_BASE_URL}/users/cart/${userId}/remove`, {
        data: { userId: userId, cartItemId: cartItemId }
      });
      
      if (removeResponse.data.success) {
        try {
          await axios.post(`${API_BASE_URL}/users/wishlist/${userId}/add`, {
            productId: productId,
            variantId: variantId
          });
        } catch (wishlistError) {
          console.error("Error adding to wishlist:", wishlistError);
        }
        
        setCartItems(prev => prev.filter(item => item._id !== cartItemId));
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
        alert("Item saved to wishlist!");
      } else {
        alert(removeResponse.data.message || "Failed to save for later");
      }
    } catch (error) {
      console.error("Error saving for later:", error);
      alert("Failed to save for later");
    } finally {
      setRemoveModalOpen(false);
      setPendingRemoveItem(null);
    }
  };

  // Direct save for later from cart item button
  const saveForLater = async (cartItemId, productId, variantId) => {
    try {
      const removeResponse = await axios.delete(`${API_BASE_URL}/users/cart/${userId}/remove`, {
        data: { userId: userId, cartItemId: cartItemId }
      });
      
      if (removeResponse.data.success) {
        try {
          await axios.post(`${API_BASE_URL}/users/wishlist/${userId}/add`, {
            productId: productId,
            variantId: variantId
          });
        } catch (wishlistError) {
          console.error("Error adding to wishlist:", wishlistError);
        }
        
        setCartItems(prev => prev.filter(item => item._id !== cartItemId));
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
        alert("Item saved to wishlist!");
      } else {
        alert(removeResponse.data.message || "Failed to save for later");
      }
    } catch (error) {
      console.error("Error saving for later:", error);
      alert("Failed to save for later");
    }
  };

  // Select/Deselect items
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item._id));
    }
  };

  const toggleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Calculate totals
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = selectedCartItems.reduce((sum, item) => 
    sum + (item.displayActualPrice ? (item.displayActualPrice - item.price) * item.quantity : 0), 0
  );
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal - discount + shipping + tax;

  // Address operations
  const addAddress = async (address) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/add/${userId}`, {
        addresses: [address]
      });
      
      if (response.data.success) {
        await fetchAddresses();
        setShowAddAddressModal(false);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const editAddress = (address) => {
    setEditingAddress(address);
    setShowAddAddressModal(true);
  };

  const updateAddress = async (updatedAddress) => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/users/update/${userId}/${editingAddress._id}`, {
        addresses: [updatedAddress]
      });
      
      if (response.data.success) {
        await fetchAddresses();
        setShowAddAddressModal(false);
        setEditingAddress(null);
      }
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/delete/${userId}/${addressId}`);
      
      if (response.data.success) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  // Show order review before placing order
  const proceedToOrderReview = () => {
    if (selectedItems.length === 0) {
      alert("Please select items to checkout");
      return;
    }
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }
    setShowOrderReview(true);
  };

  // Place order - using the new API
  const placeOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        addressId: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        cartItemIds: selectedItems
      };

      const response = await axios.post(`${API_BASE_URL}/users/order/${userId}/create`, orderData);

      console.log("Order response:", response.data);
      
      if (response.data.success) {
        setPlacedOrderId(response.data.order?.orderId || response.data.order?._id);
        setOrderPlaced(true);
        
        // Clear selected items from cart
        setTimeout(() => {
          setCartItems(prev => prev.filter(item => !selectedItems.includes(item._id)));
          setSelectedItems([]);
        }, 2000);
      } else {
        alert(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Payment methods
  const paymentMethods = [
    { id: "cod", name: "Cash on Delivery", icon: "💰", available: true },
    { id: "card", name: "Credit/Debit Card", icon: "💳", available: false },
    { id: "upi", name: "UPI", icon: "📱", available: false },
    { id: "netbanking", name: "Net Banking", icon: "🏦", available: false }
  ];

  // Order confirmation component
  if (orderPlaced) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-lg">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-500 text-sm sm:text-base mb-6">
                Thank you for your order. You will receive a confirmation email shortly.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs sm:text-sm text-gray-500">Order Number</p>
                <p className="font-mono text-sm sm:text-lg break-all text-coffee">#{placedOrderId || `ORD-${Date.now()}`}</p>
              </div>
              <div className="flex flex-col xs:flex-row gap-3">
                <button
                  onClick={() => navigate("/products")}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:text-base transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate("/profile/my-orders")}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-semibold text-sm sm:text-base transition-all hover:opacity-90"
                  style={{ backgroundColor: COFFEE }}
                >
                  View Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (cartLoading) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </>
    );
  }

  // Show Order Review Page
  if (showOrderReview) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 text-gray-900 min-h-screen">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            <div className="mb-6">
              <button
                onClick={() => setShowOrderReview(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-coffee transition-colors"
              >
                <FiChevronRight size={20} className="rotate-180" />
                Back to Payment
              </button>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Review Your Order</h1>
            
            <OrderReview
              selectedCartItems={selectedCartItems}
              selectedAddress={selectedAddress}
              addresses={addresses}
              selectedPaymentMethod={selectedPaymentMethod}
              total={total}
              onConfirmOrder={placeOrder}
              onBack={() => setShowOrderReview(false)}
              loading={loading}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="bg-gray-50 text-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8 overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[320px] sm:min-w-0 max-w-md mx-auto">
              {[
                { step: 1, label: "Cart", icon: FiShoppingBag },
                { step: 2, label: "Address", icon: FiMapPin },
                { step: 3, label: "Payment", icon: FiCreditCard }
              ].map((s, idx) => (
                <div key={s.step} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        step >= s.step
                          ? "text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                      style={{ backgroundColor: step >= s.step ? COFFEE : undefined }}
                      onClick={() => step > s.step && setStep(s.step)}
                    >
                      <s.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-gray-600">{s.label}</span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`absolute top-4 sm:top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                        step > s.step ? "bg-coffee" : "bg-gray-200"
                      }`}
                      style={{ backgroundColor: step > s.step ? COFFEE : undefined }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {step === 1 && (
            <div className={`grid ${cartItems.length === 0 ? '' : 'lg:grid-cols-3'} gap-6 lg:gap-8`}>
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-coffee focus:ring-coffee"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">
                        Select All ({cartItems.length} items)
                      </span>
                    </div>
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <FiShoppingBag size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-4">Looks like you haven't added anything yet</p>
                    <button
                      onClick={() => navigate("/products")}
                      className="px-6 py-2 rounded-lg text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: COFFEE }}
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {cartItems.map(item => (
                      <CartItem
                        key={item._id}
                        item={item}
                        isSelected={selectedItems.includes(item._id)}
                        onSelect={toggleSelectItem}
                        onUpdateQuantity={updateQuantity}
                        onRemove={confirmRemoveItem}
                        onSaveForLater={saveForLater}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Order Summary */}
              {cartItems.length > 0 && (
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div className="space-y-2 sm:space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="text-gray-900">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax (10%)</span>
                        <span className="text-gray-900">{formatPrice(tax)}</span>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <div className="flex justify-between font-bold text-base sm:text-lg">
                          <span className="text-gray-900">Total</span>
                          <span className="text-coffee">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          alert("Please select items to checkout");
                        } else {
                          setStep(2);
                        }
                      }}
                      disabled={selectedItems.length === 0}
                      className="w-full py-2.5 sm:py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                      style={{ backgroundColor: COFFEE }}
                    >
                      Proceed to Checkout
                      <FiChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address Selection Step */}
          {step === 2 && (
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Select Delivery Address</h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddAddressModal(true);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: COFFEE }}
                  >
                    <FiPlusCircle size={14} className="sm:w-4 sm:h-4" />
                    Add New Address
                  </button>
                </div>

                {addressLoading ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee mx-auto"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <FiMapPin size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No saved addresses</p>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="mt-4 px-4 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: COFFEE }}
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(address => (
                      <AddressCard
                        key={address._id}
                        address={address}
                        isSelected={selectedAddress === address._id}
                        onSelect={setSelectedAddress}
                        onEdit={editAddress}
                        onDelete={deleteAddress}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Items</span>
                      <span className="text-gray-900">{selectedCartItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Amount</span>
                      <span className="font-bold text-coffee">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!selectedAddress) {
                        alert("Please select a delivery address");
                      } else {
                        setStep(3);
                      }
                    }}
                    className="w-full py-2.5 sm:py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 text-sm sm:text-base transition-all hover:opacity-90"
                    style={{ backgroundColor: COFFEE }}
                  >
                    Continue to Payment
                    <FiChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === 3 && (
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Select Payment Method</h2>
                
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      onClick={() => method.available && setSelectedPaymentMethod(method.id)}
                      className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-coffee bg-coffee/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      } ${!method.available && "opacity-50 cursor-not-allowed"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl sm:text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900">{method.name}</h3>
                          {!method.available && (
                            <p className="text-xs text-gray-400">Coming soon</p>
                          )}
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <FaCheckCircle size={18} className="sm:w-5 sm:h-5 text-coffee" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Info */}
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base text-gray-900">
                    <FiTruck size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Delivery Information
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-gray-500">Estimated Delivery</span>
                      <span className="text-gray-900">3-5 Business Days</span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-gray-500">Shipping Method</span>
                      <span className="text-gray-900">Standard Shipping</span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-1">
                      <span className="text-gray-500">Return Policy</span>
                      <span className="text-gray-900">30 Days Easy Returns</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Order Total</span>
                      <span className="text-gray-900">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="text-gray-900 text-right">{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={proceedToOrderReview}
                    className="w-full py-2.5 sm:py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 text-sm sm:text-base transition-all hover:opacity-90"
                    style={{ backgroundColor: COFFEE }}
                  >
                    Review Order
                    <FiChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  
                  <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-3">
                    Review your order details before placing
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <RemoveConfirmationModal
        isOpen={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setPendingRemoveItem(null);
        }}
        onConfirmRemove={handlePermanentRemove}
        onConfirmSaveForLater={handleSaveForLater}
      />

      {/* Add/Edit Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => {
          setShowAddAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={(address) => {
          if (editingAddress) {
            updateAddress(address);
          } else {
            addAddress(address);
          }
        }}
        editingAddress={editingAddress}
      />
    </>
  );
}