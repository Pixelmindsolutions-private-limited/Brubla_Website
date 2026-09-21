import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Plus, Edit2, Trash2, CheckCircle, X, Home, 
  Building, Navigation, Phone, User, Mail, ChevronLeft,
  AlertCircle, Loader2, Search, Star, Globe,
  Clock, Shield, Truck, CreditCard, Heart
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
    .animate-scaleIn { animation: scaleIn 0.4s ease forwards; }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @media (max-width: 640px) {
      button, .cursor-pointer { -webkit-tap-highlight-color: transparent; }
    }
  `}</style>
);



// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS CARD COMPONENT - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setIsDeleting(true);
      await onDelete(address._id);
      setIsDeleting(false);
    }
  };
  
  const typeIcons = {
    home: Home,
    office: Building,
    other: Navigation
  };
  
  const Icon = typeIcons[address.type?.toLowerCase()] || Navigation;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            address.type?.toLowerCase() === "home" ? "bg-gray-100" : 
            address.type?.toLowerCase() === "office" ? "bg-gray-100" : "bg-gray-100"
          }`}>
            <Icon size={18} className="text-black" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 fs text-base capitalize">{address.type}</h3>
              {address.isDefault && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black text-white">
                  Default
                </span>
              )}
            </div>
            
            <p className="text-sm font-medium text-gray-800 fs">{address.fullName}</p>
            <p className="text-xs text-gray-500 fs mt-0.5">{address.mobile}</p>
            
            <div className="mt-2 space-y-0.5">
              <p className="text-sm text-gray-600 fs">{address.address}</p>
              <p className="text-sm text-gray-600 fs">
                {address.city}, {address.state} - {address.pincode}
              </p>
              {address.landmark && (
                <p className="text-xs text-gray-400 fs mt-1">
                  📍 Landmark: {address.landmark}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
          {!address.isDefault && (
            <button
              onClick={() => onSetDefault(address._id, address)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium fs hover:bg-gray-200 transition-colors"
            >
              <Star size={12} />
              Set as Default
            </button>
          )}
          <button
            onClick={() => onEdit(address)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium fs hover:bg-gray-800 transition-colors"
          >
            <Edit2 size={12} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium fs hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD/EDIT ADDRESS MODAL - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const AddressModal = ({ isOpen, onClose, onSave, editingAddress }) => {
  const [formData, setFormData] = useState({
    type: "home",
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        type: editingAddress.type?.toLowerCase() || "home",
        fullName: editingAddress.fullName || "",
        mobile: editingAddress.mobile || "",
        address: editingAddress.address || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        pincode: editingAddress.pincode || "",
        landmark: editingAddress.landmark || "",
        isDefault: editingAddress.isDefault || false
      });
    } else {
      setFormData({
        type: "home",
        fullName: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        isDefault: false
      });
    }
    setErrors({});
  }, [editingAddress, isOpen]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Invalid mobile number (10 digits)";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{5,6}$/.test(formData.pincode)) {
      newErrors.pincode = "Invalid pincode (5-6 digits)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-white border border-gray-200 animate-scaleIn shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 sm:p-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 fd">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h2>
            <p className="text-xs text-gray-500 fs mt-0.5">
              {editingAddress ? "Update your address details" : "Enter your delivery address"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 sm:p-5 space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 fs mb-2">Address Type</label>
            <div className="flex gap-2">
              {["home", "office", "other"].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium fs transition-all ${
                    formData.type === type
                      ? "bg-black text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "home" && <Home size={14} />}
                  {type === "office" && <Building size={14} />}
                  {type === "other" && <Navigation size={14} />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 fs mb-1.5">
              Full Name <span className="text-black">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 fs text-sm focus:border-black focus:ring-1 focus:ring-black transition-colors ${
                  errors.fullName ? "border-red-500" : "border-gray-200"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-500 fs mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.fullName}
              </p>
            )}
          </div>
          
          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 fs mb-1.5">
              Mobile Number <span className="text-black">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="9876543210"
                maxLength={10}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 fs text-sm focus:border-black focus:ring-1 focus:ring-black transition-colors ${
                  errors.mobile ? "border-red-500" : "border-gray-200"
                }`}
              />
            </div>
            {errors.mobile && (
              <p className="text-xs text-red-500 fs mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.mobile}
              </p>
            )}
          </div>
          
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 fs mb-1.5">
              Address <span className="text-black">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, apartment, suite, etc."
              rows={2}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 fs text-sm focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none ${
                errors.address ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-500 fs mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.address}
              </p>
            )}
          </div>
          
          {/* City, State, Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 fs mb-1.5">
                City <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 fs text-sm focus:border-black focus:ring-1 focus:ring-black transition-colors ${
                  errors.city ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.city && <p className="text-xs text-red-500 fs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 fs mb-1.5">
                State <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 fs text-sm focus:border-black focus:ring-1 focus:ring-black transition-colors ${
                  errors.state ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.state && <p className="text-xs text-red-500 fs mt-1">{errors.state}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 fs mb-1.5">
              Pincode <span className="text-black">*</span>
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="Pincode"
              maxLength={6}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 fs text-sm focus:border-black focus:ring-1 focus:ring-black transition-colors ${
                errors.pincode ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.pincode && (
              <p className="text-xs text-red-500 fs mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.pincode}
              </p>
            )}
          </div>
          
          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 fs mb-1.5">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="Near any landmark"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 fs text-sm focus:border-black focus:ring-1 focus:ring-black transition-colors"
            />
          </div>
          
          {/* Default Address Toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-all duration-200 ${
                formData.isDefault ? "bg-black" : "bg-gray-300"
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-all duration-200 transform ${
                  formData.isDefault ? "translate-x-5" : "translate-x-0.5"
                } mt-0.5 ml-0.5`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 fs">Set as default address</p>
              <p className="text-xs text-gray-500 fs">This address will be selected by default during checkout</p>
            </div>
          </label>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium fs text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white font-semibold fs text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {saving ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD - Light Theme
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE - Light Theme with API Integration
// ─────────────────────────────────────────────────────────────────────────────
export default function UserAddresses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [toast, setToast] = useState(null);
  
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
  const API_BASE = "http://31.97.228.17:4077";
  
  // Helper function to show toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Fetch all addresses
  const fetchAddresses = async () => {
    if (!userId) {
      setLoading(false);
      showToast("User not found. Please login again.", "error");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/all/${userId}`);
      const data = await response.json();
      
      if (data.success && data.addresses) {
        setAddresses(data.addresses);
        setFilteredAddresses(data.addresses);
      } else {
        setAddresses([]);
        setFilteredAddresses([]);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      showToast("Failed to load addresses", "error");
      setAddresses([]);
      setFilteredAddresses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Add new address
  const addAddress = async (addressData) => {
    if (!userId) {
      showToast("User not found. Please login again.", "error");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/users/add/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addresses: [addressData]
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast("Address added successfully!", "success");
        await fetchAddresses(); // Refresh the list
      } else {
        showToast(data.message || "Failed to add address", "error");
      }
    } catch (error) {
      console.error("Failed to add address:", error);
      showToast("Failed to add address", "error");
    }
  };
  
  // Update address
  const updateAddress = async (addressData, addressId) => {
    if (!userId) {
      showToast("User not found. Please login again.", "error");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/users/update/${userId}/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addresses: [addressData]
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast("Address updated successfully!", "success");
        await fetchAddresses(); // Refresh the list
      } else {
        showToast(data.message || "Failed to update address", "error");
      }
    } catch (error) {
      console.error("Failed to update address:", error);
      showToast("Failed to update address", "error");
    }
  };
  
  // Delete address
  const deleteAddress = async (addressId) => {
    if (!userId) {
      showToast("User not found. Please login again.", "error");
      return;
    }
    
    const addressToDelete = addresses.find(addr => addr._id === addressId);
    if (addressToDelete?.isDefault) {
      showToast("Cannot delete default address. Set another address as default first.", "error");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/users/delete/${userId}/${addressId}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast("Address deleted successfully!", "success");
        await fetchAddresses(); // Refresh the list
      } else {
        showToast(data.message || "Failed to delete address", "error");
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
      showToast("Failed to delete address", "error");
    }
  };
  
  // Set default address (update the address with isDefault=true)
  const setDefaultAddress = async (addressId, address) => {
    if (!userId) return;
    
    const updatedAddress = {
      ...address,
      isDefault: true
    };
    
    try {
      const response = await fetch(`${API_BASE}/api/users/update/${userId}/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addresses: [updatedAddress]
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast("Default address updated successfully!", "success");
        await fetchAddresses(); // Refresh the list
      } else {
        showToast(data.message || "Failed to update default address", "error");
      }
    } catch (error) {
      console.error("Failed to set default address:", error);
      showToast("Failed to update default address", "error");
    }
  };
  
  // Handle save from modal
  const handleSave = async (addressData) => {
    if (editingAddress && editingAddress._id) {
      await updateAddress(addressData, editingAddress._id);
    } else {
      await addAddress(addressData);
    }
  };
  
  // Load addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);
  
  // Filter addresses based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAddresses(addresses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = addresses.filter(addr => 
        addr.fullName?.toLowerCase().includes(query) ||
        addr.address?.toLowerCase().includes(query) ||
        addr.city?.toLowerCase().includes(query) ||
        addr.state?.toLowerCase().includes(query) ||
        addr.pincode?.includes(query) ||
        addr.type?.toLowerCase().includes(query)
      );
      setFilteredAddresses(filtered);
    }
  }, [searchQuery, addresses]);
  
  const stats = {
    total: addresses.length,
    default: addresses.filter(a => a.isDefault).length,
    home: addresses.filter(a => a.type?.toLowerCase() === "home").length,
    office: addresses.filter(a => a.type?.toLowerCase() === "office").length
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <Loader2 size={32} className="sm:w-10 sm:h-10 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-500 fs text-sm sm:text-base">Loading your addresses...</p>
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
                <h1 className="fd font-black text-gray-900 text-2xl sm:text-3xl md:text-4xl">My Addresses</h1>
                <p className="text-gray-500 fs text-xs sm:text-sm mt-1">Manage your delivery addresses</p>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-black text-white font-semibold fs text-xs sm:text-sm transition-all hover:bg-gray-800 active:scale-95"
              >
                <Plus size={14} />
                Add New Address
              </button>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <StatCard icon={MapPin} label="Total Addresses" value={stats.total} color="#000000" />
            <StatCard icon={Star} label="Default Address" value={stats.default} color="#f59e0b" />
            <StatCard icon={Home} label="Home" value={stats.home} color="#000000" />
            <StatCard icon={Building} label="Office" value={stats.office} color="#3b82f6" />
          </div>
          
          {/* Search Bar */}
          <div className="mb-5 sm:mb-6">
            <div className="relative max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search addresses by name, city, or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 fs text-xs sm:text-sm placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
            </div>
          </div>
          
          {/* Addresses List */}
          {filteredAddresses.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <MapPin size={36} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 fd mb-1 sm:mb-2">No addresses found</h3>
              <p className="text-gray-500 fs text-xs sm:text-sm mb-4 sm:mb-6 px-4">
                {searchQuery ? "Try a different search term" : "You haven't added any addresses yet"}
              </p>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setIsModalOpen(true);
                }}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-black text-white font-semibold fs text-xs sm:text-sm transition-all hover:bg-gray-800 active:scale-95"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {filteredAddresses.map(address => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={(addr) => {
                    setEditingAddress(addr);
                    setIsModalOpen(true);
                  }}
                  onDelete={deleteAddress}
                  onSetDefault={setDefaultAddress}
                />
              ))}
            </div>
          )}
          
          {/* Address Count Info */}
          {filteredAddresses.length > 0 && (
            <p className="text-center text-xs text-gray-400 fs mt-6">
              Showing {filteredAddresses.length} of {addresses.length} addresses
            </p>
          )}
        </div>
        
        {/* Add/Edit Modal */}
        <AddressModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={handleSave}
          editingAddress={editingAddress}
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