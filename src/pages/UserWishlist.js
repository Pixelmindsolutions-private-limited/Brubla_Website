import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, Trash2, ShoppingBag, ChevronLeft, Search, 
  Loader2, AlertCircle, Star, ChevronRight, X,
  Tag, Clock, Shield, Truck, Filter, Grid3x3, List,
  CheckCircle
} from "lucide-react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes heartBeat {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    .animate-fadeUp { animation: fadeUp 0.5s ease forwards; }
    .animate-scaleIn { animation: scaleIn 0.4s ease forwards; }
    .heart-beat { animation: heartBeat 0.3s ease-in-out; }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @media (max-width: 640px) {
      button, .cursor-pointer { -webkit-tap-highlight-color: transparent; }
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT SELECTION MODAL
// ─────────────────────────────────────────────────────────────────────────────
const VariantSelectionModal = ({ isOpen, onClose, item, onConfirm, addingToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState(null);

  useEffect(() => {
    if (isOpen && item && item.productId) {
      fetchProductDetails();
    }
  }, [isOpen, item]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setStockError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/products/${item.productId}`);
      
      console.log("Product details response:", response.data);
      
      if (response.data.success && response.data.product) {
        const product = response.data.product;
        setProductData(product);
        
        // Set default selections
        if (product.variants && product.variants.length > 0) {
          const firstVariant = product.variants[0];
          setSelectedVariant(firstVariant);
          if (firstVariant.sizes && firstVariant.sizes.length > 0) {
            setSelectedSize(firstVariant.sizes[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setStockError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (selectedSize && newQuantity > selectedSize.stock) {
      setStockError(`Only ${selectedSize.stock} items available in stock`);
      return;
    }
    setStockError(null);
    setQuantity(Math.min(newQuantity, selectedSize?.stock || 10));
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant.sizes && variant.sizes.length > 0) {
      setSelectedSize(variant.sizes[0]);
      // Reset quantity and check stock
      setQuantity(1);
      setStockError(null);
    } else {
      setSelectedSize(null);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1);
    setStockError(null);
  };

  const handleConfirm = () => {
    if (!selectedVariant) {
      alert("Please select a color/variant");
      return;
    }
    if (selectedVariant.sizes && selectedVariant.sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    if (selectedSize && quantity > selectedSize.stock) {
      alert(`Only ${selectedSize.stock} items available in stock`);
      return;
    }
    
    onConfirm({
      variantId: selectedVariant._id,
      sizeId: selectedSize?._id || null,
      quantity: quantity,
      variant: selectedVariant,
      size: selectedSize,
      price: selectedVariant.discountPrice || selectedVariant.price
    });
  };

  const getPrice = () => {
    if (selectedVariant) {
      return selectedVariant.discountPrice || selectedVariant.price;
    }
    return item?.displayPrice || 0;
  };

  const getActualPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return selectedVariant.price;
    }
    return item?.displayActualPrice || 0;
  };

  const discountPercent = getActualPrice() > getPrice() 
    ? Math.round(((getActualPrice() - getPrice()) / getActualPrice()) * 100)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-white border border-gray-200 animate-scaleIn shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 fd">Select Options</h2>
            <p className="text-xs text-gray-500 fs mt-0.5">{item?.productName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Product Image Preview */}
          {productData?.mainImages?.[0] && (
            <div className="flex justify-center">
              <img 
                src={productData.mainImages[0]} 
                alt={item?.productName}
                className="w-24 h-24 rounded-lg object-cover border border-gray-200"
              />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-black" />
            </div>
          ) : (
            <>
              {/* Variant/Color Selection */}
              {productData?.variants && productData.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 fs mb-2">Select Color</label>
                  <div className="flex flex-wrap gap-2">
                    {productData.variants.map(variant => (
                      <button
                        key={variant._id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium fs transition-all ${
                          selectedVariant?._id === variant._id
                            ? "bg-black text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {variant.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {selectedVariant?.sizes && selectedVariant.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 fs mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.sizes.map(size => (
                      <button
                        key={size._id}
                        onClick={() => handleSizeSelect(size)}
                        disabled={size.stock === 0}
                        className={`relative min-w-[52px] py-2 rounded-lg text-sm font-medium fs transition-all ${
                          selectedSize?._id === size._id
                            ? "bg-black text-white"
                            : size.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {size.size}
                        {size.stock === 0 && (
                          <span className="absolute -top-2 -right-2 text-[8px] bg-red-500 text-white px-1 rounded">
                            OUT
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedSize && selectedSize.stock > 0 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={10} />
                      In Stock ({selectedSize.stock} available)
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selection */}
              {selectedSize && selectedSize.stock > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 fs mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-400">Max {selectedSize.stock}</span>
                  </div>
                  {stockError && (
                    <p className="text-xs text-red-500 mt-1">{stockError}</p>
                  )}
                </div>
              )}

              {/* Price Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price:</span>
                  <div className="text-right">
                    <span className="font-bold text-black fd text-lg">
                      {formatPrice(getPrice())}
                    </span>
                    {getActualPrice() > getPrice() && (
                      <span className="text-xs text-gray-400 line-through ml-2">
                        {formatPrice(getActualPrice())}
                      </span>
                    )}
                  </div>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Discount:</span>
                    <span className="text-xs text-green-600 font-medium">
                      {discountPercent}% off
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-black fd">
                    {formatPrice(getPrice() * quantity)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium fs text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={addingToCart || loading || (selectedSize && selectedSize.stock === 0)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white font-semibold fs text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {addingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST ITEM CARD - Grid View
// ─────────────────────────────────────────────────────────────────────────────
const WishlistCard = ({ item, onRemove, onMoveToCart, isRemoving }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const discountPercent = item.displayActualPrice && item.displayPrice 
    ? Math.round(((item.displayActualPrice - item.displayPrice) / item.displayActualPrice) * 100)
    : item.maxDiscount || 0;
  
  return (
    <div 
      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={!imgError && item.mainImage ? item.mainImage : "https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=No+Image"}
          alt={item.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-black text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md">
            {discountPercent}% OFF
          </div>
        )}
        
        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}>
          <button
            onClick={() => onMoveToCart(item)}
            className="px-3 sm:px-4 py-2 bg-white text-black rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
          >
            <ShoppingBag size={14} />
            Move to Cart
          </button>
          <button
            onClick={() => onRemove(item._id, item.productId)}
            disabled={isRemoving}
            className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Remove
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 fs">
          {item.productName}
        </h3>
        
        <p className="text-xs text-gray-400 mt-1 line-clamp-2 fs">
          {item.productDescription}
        </p>
        
        {/* Price Section */}
        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-gray-900 text-lg fd">
            {formatPrice(item.displayPrice)}
          </span>
          {item.displayActualPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(item.displayActualPrice)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-xs text-green-600 font-medium">
              Save {formatPrice(item.displayActualPrice - item.displayPrice)}
            </span>
          )}
        </div>
        
        {/* Variants Info */}
        {item.variantsCount > 0 && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
            <Tag size={10} />
            <span>{item.variantsCount} variant(s) available</span>
          </div>
        )}
        
        {/* Added Date */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock size={10} />
            <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
          </div>
          
          {/* Mobile Action Buttons */}
          <div className="flex gap-2 sm:hidden">
            <button
              onClick={() => onMoveToCart(item)}
              className="p-1.5 rounded-lg bg-gray-100 text-black"
            >
              <ShoppingBag size={14} />
            </button>
            <button
              onClick={() => onRemove(item._id, item.productId)}
              disabled={isRemoving}
              className="p-1.5 rounded-lg bg-red-50 text-red-500"
            >
              {isRemoving ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST ITEM ROW - List View
// ─────────────────────────────────────────────────────────────────────────────
const WishlistRow = ({ item, onRemove, onMoveToCart, isRemoving }) => {
  const [imgError, setImgError] = useState(false);
  
  const discountPercent = item.displayActualPrice && item.displayPrice 
    ? Math.round(((item.displayActualPrice - item.displayPrice) / item.displayActualPrice) * 100)
    : item.maxDiscount || 0;
  
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
      {/* Product Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <img
          src={!imgError && item.mainImage ? item.mainImage : "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No"}
          alt={item.productName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base fs">
          {item.productName}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 fs">
          {item.productDescription}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="font-bold text-gray-900 fd text-base">
            {formatPrice(item.displayPrice)}
          </span>
          {item.displayActualPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(item.displayActualPrice)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[10px] text-green-600 font-medium">
              {discountPercent}% off
            </span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onMoveToCart(item)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-black text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          <ShoppingBag size={14} />
          <span className="hidden sm:inline">Move to Cart</span>
        </button>
        <button
          onClick={() => onRemove(item._id, item.productId)}
          disabled={isRemoving}
          className="p-1.5 sm:p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
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
// VIEW TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
const ViewToggle = ({ view, setView }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
    <button
      onClick={() => setView("grid")}
      className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium fs transition-all ${
        view === "grid" ? "bg-black text-white" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <Grid3x3 size={12} className="inline mr-1" />
      <span className="hidden xs:inline">Grid</span>
    </button>
    <button
      onClick={() => setView("list")}
      className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium fs transition-all ${
        view === "list" ? "bg-black text-white" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <List size={12} className="inline mr-1" />
      <span className="hidden xs:inline">List</span>
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WISHLIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("grid");
  const [removingItem, setRemovingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  
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
  
  // Show toast message
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("Please login to view your wishlist");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/users/wishlist/${userId}`);
      
      console.log("Wishlist response:", response.data);
      
      if (response.data.success && response.data.wishlist) {
        setWishlist(response.data.wishlist);
        setFilteredWishlist(response.data.wishlist);
      } else {
        setWishlist([]);
        setFilteredWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err.response?.data?.message || "Failed to load wishlist");
      setWishlist([]);
      setFilteredWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Open variant selection modal
  const openVariantModal = (item) => {
    setSelectedItem(item);
    setShowVariantModal(true);
  };
  
  // Move item to cart with variant selection
  const moveToCartWithVariant = useCallback(async (item, variantData) => {
    if (!userId) return;
    
    setAddingToCart(true);
    
    try {
      // Add to cart with specific variant and size
      const cartResponse = await axios.post(`${API_BASE_URL}/users/cart/${userId}/add`, {
        productId: item.productId,
        variantId: variantData.variantId,
        sizeId: variantData.sizeId,
        quantity: variantData.quantity
      });
      
      if (cartResponse.data.success) {
        // Remove from wishlist
        await axios.post(`${API_BASE_URL}/users/wishlist/${userId}/toggle`, {
          productId: item.productId
        });
        
        // Update UI
        setWishlist(prev => prev.filter(i => i._id !== item._id));
        setFilteredWishlist(prev => prev.filter(i => i._id !== item._id));
        
        showToast(`Added ${variantData.quantity} item(s) to cart!`, "success");
        setShowVariantModal(false);
      } else {
        showToast(cartResponse.data.message || "Failed to add to cart", "error");
      }
    } catch (err) {
      console.error("Error moving to cart:", err);
      showToast(err.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  }, [userId]);
  
  // Toggle wishlist (remove item)
  const toggleWishlist = useCallback(async (productId, wishlistItemId) => {
    if (!userId) return;
    
    setRemovingItem(wishlistItemId);
    
    try {
      // Optimistic update - remove from UI immediately
      setWishlist(prev => prev.filter(item => item._id !== wishlistItemId));
      setFilteredWishlist(prev => prev.filter(item => item._id !== wishlistItemId));
      
      await axios.post(`${API_BASE_URL}/users/wishlist/${userId}/toggle`, {
        productId: productId
      });
      
      showToast("Item removed from wishlist", "success");
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      // Revert on error - refetch
      await fetchWishlist();
      showToast("Failed to remove item", "error");
    } finally {
      setRemovingItem(null);
    }
  }, [userId, fetchWishlist]);
  
  // Filter wishlist based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredWishlist(wishlist);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = wishlist.filter(item => 
        item.productName?.toLowerCase().includes(query) ||
        item.productDescription?.toLowerCase().includes(query)
      );
      setFilteredWishlist(filtered);
    }
  }, [searchQuery, wishlist]);
  
  // Load wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);
  
  // Calculate stats
  const stats = {
    total: wishlist.length,
    totalValue: wishlist.reduce((sum, item) => sum + (item.displayPrice || 0), 0),
    maxDiscount: wishlist.length > 0 ? Math.max(...wishlist.map(item => item.maxDiscount || 0), 0) : 0,
    avgDiscount: wishlist.length > 0 
      ? Math.round(wishlist.reduce((sum, item) => sum + (item.maxDiscount || 0), 0) / wishlist.length)
      : 0
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <Loader2 size={32} className="sm:w-10 sm:h-10 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-500 fs text-sm sm:text-base">Loading your wishlist...</p>
          </div>
        </div>
      </>
    );
  }
  
  if (error && wishlist.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <Heart size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Wishlist</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchWishlist}
              className="px-5 py-2 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-90"
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
        
        {/* Hero Section */}
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
                <h1 className="fd font-black text-gray-900 text-2xl sm:text-3xl md:text-4xl">My Wishlist</h1>
                <p className="text-gray-500 fs text-xs sm:text-sm mt-1">Your saved items for later</p>
              </div>
              <button
                onClick={() => navigate("/products")}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-black text-white font-semibold fs text-xs sm:text-sm transition-all hover:bg-gray-800 active:scale-95"
              >
                <ShoppingBag size={14} />
                Continue Shopping
              </button>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <StatCard icon={Heart} label="Items in Wishlist" value={stats.total} color="#ef4444" />
            <StatCard icon={Tag} label="Total Value" value={formatPrice(stats.totalValue)} color="#000000" />
            <StatCard icon={Star} label="Max Discount" value={`${stats.maxDiscount}%`} color="#f59e0b" />
            <StatCard icon={Shield} label="Avg Discount" value={`${stats.avgDiscount}%`} color="#22c55e" />
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 fs text-xs sm:text-sm placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3">
              {filteredWishlist.length > 0 && (
                <p className="text-xs text-gray-400 fs">
                  {filteredWishlist.length} of {wishlist.length} items
                </p>
              )}
              <ViewToggle view={view} setView={setView} />
            </div>
          </div>
          
          {/* Wishlist Items */}
          {filteredWishlist.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <Heart size={36} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 fd mb-1 sm:mb-2">
                {searchQuery ? "No matching items found" : "Your wishlist is empty"}
              </h3>
              <p className="text-gray-500 fs text-xs sm:text-sm mb-4 sm:mb-6 px-4">
                {searchQuery 
                  ? "Try a different search term" 
                  : "Save your favorite items here for later purchase"}
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-black text-white font-semibold fs text-xs sm:text-sm transition-all hover:bg-gray-800 active:scale-95 inline-flex items-center gap-2"
              >
                <ShoppingBag size={14} />
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {filteredWishlist.map(item => (
                    <WishlistCard
                      key={item._id}
                      item={item}
                      onRemove={() => toggleWishlist(item.productId, item._id)}
                      onMoveToCart={openVariantModal}
                      isRemoving={removingItem === item._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredWishlist.map(item => (
                    <WishlistRow
                      key={item._id}
                      item={item}
                      onRemove={() => toggleWishlist(item.productId, item._id)}
                      onMoveToCart={openVariantModal}
                      isRemoving={removingItem === item._id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Variant Selection Modal */}
        <VariantSelectionModal
          isOpen={showVariantModal}
          onClose={() => {
            setShowVariantModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onConfirm={(variantData) => moveToCartWithVariant(selectedItem, variantData)}
          addingToCart={addingToCart}
        />
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scaleIn">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              toast.type === "success" ? "bg-black text-white" : "bg-red-500 text-white"
            }`}>
              {toast.type === "success" ? <Heart size={18} fill="currentColor" /> : <AlertCircle size={18} />}
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