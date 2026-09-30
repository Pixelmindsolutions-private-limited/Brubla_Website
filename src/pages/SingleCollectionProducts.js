import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { Heart, ShoppingBag, Star, X, Loader2, CheckCircle, AlertCircle, ChevronDown, SlidersHorizontal } from "lucide-react";

const COFFEE = "#C9A96E";
const API_BASE_URL = "http://31.97.228.17:4077";

// ─── URL normaliser ────────────────────────────────────────────────────────────
const normaliseUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  return url.replace(/https?:\/\/localhost:4077/g, API_BASE_URL);
};

// ─── INR formatter ────────────────────────────────────────────────────────────
const toINR = (usd) => {
  if (!usd && usd !== 0) return "—";
  return "₹" + (usd * 83).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

// ─── Get user ID ──────────────────────────────────────────────────────────────
const getUserId = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    return user?.id || null;
  } catch {
    return null;
  }
};

// Styles
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .fd { font-family: 'Playfair Display', Georgia, serif; }
    .fs { font-family: 'DM Sans', system-ui, sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .animate-fadeUp { animation: fadeUp 0.6s ease forwards; }
    .animate-scaleIn { animation: scaleIn 0.4s ease forwards; }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
    }
    
    @media (min-width: 480px) {
      .product-grid {
        gap: 1.25rem;
      }
    }
    
    @media (min-width: 640px) {
      .product-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
    }
    
    @media (min-width: 1024px) {
      .product-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (min-width: 1280px) {
      .product-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    @media (max-width: 640px) {
      button, .cursor-pointer {
        -webkit-tap-highlight-color: transparent;
      }
    }
  `}</style>
);

// Price filter buckets
const PRICE_RANGES = [
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "Over ₹10,000", min: 10000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest First" },
];

// ─── Chip Component for Active Filters ─────────────────────────────────────────
const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[11px] text-gray-600 shadow-sm">
    {label}
    <button onClick={onRemove} className="hover:text-gray-900 ml-0.5">
      <X size={9} />
    </button>
  </span>
);

// ─── Sort Dropdown ────────────────────────────────────────────────────────────
const SortDropdown = ({ sortBy, setSortBy }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-full text-xs text-gray-600 shadow-sm transition-colors whitespace-nowrap">
        <span className="hidden sm:inline text-gray-400">Sort:</span>
        <span className="font-medium text-gray-700">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
        <ChevronDown size={11} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-2xl overflow-hidden z-30 shadow-xl">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value}
              onClick={() => { setSortBy(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${sortBy === opt.value ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
              style={sortBy === opt.value ? { backgroundColor: COFFEE } : {}}>
              {opt.label}
              {sortBy === opt.value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Filter Drawer ────────────────────────────────────────────────────────────
const FilterDrawer = ({ selectedFilters, setSelectedFilters, onClose }) => {
  const [local, setLocal] = useState({ ...selectedFilters });

  const apply = () => { setSelectedFilters(local); onClose(); };
  const reset = () => setLocal({ priceRange: null, minRating: null, inStockOnly: false, sortBy: "featured" });

  const Radio = ({ checked, onClick }) => (
    <span onClick={onClick}
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${checked ? "border-black bg-black" : "border-gray-300 hover:border-gray-500"}`}>
      {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
    </span>
  );

  const Checkbox = ({ checked, onClick }) => (
    <span onClick={onClick}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${checked ? "border-black bg-black" : "border-gray-300 hover:border-gray-500"}`}>
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white border-l border-gray-100 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-gray-800 font-semibold">Filters</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7">
          <section>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Price Range</h3>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <Radio checked={local.priceRange === null} onClick={() => setLocal({ ...local, priceRange: null })} />
                <span className="text-sm text-gray-600">Any price</span>
              </label>
              {PRICE_RANGES.map((r) => (
                <label key={r.label} className="flex items-center gap-3 cursor-pointer">
                  <Radio checked={local.priceRange?.label === r.label} onClick={() => setLocal({ ...local, priceRange: r })} />
                  <span className="text-sm text-gray-600">{r.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Rating</h3>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <Radio checked={local.minRating === null} onClick={() => setLocal({ ...local, minRating: null })} />
                <span className="text-sm text-gray-600">Any rating</span>
              </label>
              {[4, 3, 2].map((v) => (
                <label key={v} className="flex items-center gap-3 cursor-pointer">
                  <Radio checked={local.minRating === v} onClick={() => setLocal({ ...local, minRating: v })} />
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    {v} <Star size={11} className="fill-amber-400 text-amber-400" /> &amp; above
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Availability</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={local.inStockOnly} onClick={() => setLocal({ ...local, inStockOnly: !local.inStockOnly })} />
              <span className="text-sm text-gray-600">In Stock Only</span>
            </label>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={reset} className="flex-1 py-2.5 rounded-2xl border border-gray-300 text-sm text-gray-600 hover:border-gray-500 transition-colors">
            Reset
          </button>
          <button onClick={apply} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-80" style={{ backgroundColor: COFFEE }}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

// Star Rating Component
const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const empty = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-0.5" style={{ color: COFFEE }}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={12} fill="currentColor" />
      ))}
      {hasHalf && (
        <div className="relative">
          <Star size={12} className="text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={12} fill={COFFEE} className="text-coffee" />
          </div>
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={12} className="text-gray-300" />
      ))}
    </div>
  );
};

// ─── Variant Selection Modal ──────────────────────────────────────────────────
const VariantSelectionModal = ({ isOpen, onClose, product, onConfirm, addingToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState(null);

  useEffect(() => {
    if (isOpen && product && product._id) {
      fetchProductDetails();
    }
  }, [isOpen, product]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setStockError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/products/${product._id}`);

      if (response.data.success && response.data.product) {
        const prod = response.data.product;
        setProductData(prod);

        if (prod.variants && prod.variants.length > 0) {
          const firstVariant = prod.variants[0];
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
    return product?.displayPrice || 0;
  };

  const getActualPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return selectedVariant.price;
    }
    return product?.displayActualPrice || 0;
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
            <h2 className="text-lg font-bold text-gray-900">Select Options</h2>
            <p className="text-xs text-gray-500 mt-0.5">{product?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {productData?.mainImages?.[0] && (
            <div className="flex justify-center">
              <img
                src={normaliseUrl(productData.mainImages[0])}
                alt={product?.name}
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
              {productData?.variants && productData.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Color</label>
                  <div className="flex flex-wrap gap-2">
                    {productData.variants.map(variant => (
                      <button
                        key={variant._id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedVariant?._id === variant._id
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

              {selectedVariant?.sizes && selectedVariant.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.sizes.map(size => (
                      <button
                        key={size._id}
                        onClick={() => handleSizeSelect(size)}
                        disabled={size.stock === 0}
                        className={`relative min-w-[52px] py-2 rounded-lg text-sm font-medium transition-all ${selectedSize?._id === size._id
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

              {selectedSize && selectedSize.stock > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
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

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price:</span>
                  <div className="text-right">
                    <span className="font-bold text-black text-lg">
                      {toINR(getPrice())}
                    </span>
                    {getActualPrice() > getPrice() && (
                      <span className="text-xs text-gray-400 line-through ml-2">
                        {toINR(getActualPrice())}
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
                  <span className="text-xl font-bold text-black">
                    {toINR(getPrice() * quantity)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={addingToCart || loading || (selectedSize && selectedSize.stock === 0)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: COFFEE }}
          >
            {addingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Card Component with Wishlist & Add to Cart
const ProductCard = ({ product, index, wishlist, onWishlistToggle, onAddToCart }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Get product images
  const getProductImages = () => {
    const images = [];
    if (product.mainImages && product.mainImages.length > 0) {
      product.mainImages.forEach(img => images.push(normaliseUrl(img)));
    }
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach(img => images.push(normaliseUrl(img)));
        }
      });
    }
    if (images.length === 0) {
      images.push("https://placehold.co/600x800/e5e7eb/64748b?text=BRUBLA");
    }
    return [...new Set(images)];
  };

  const images = getProductImages();
  const displayPrice = product.displayPrice || product.variants?.[0]?.discountPrice || product.variants?.[0]?.price || 0;
  const originalPrice = product.displayActualPrice || product.variants?.[0]?.price || 0;
  const discount = originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const productName = product.name || "Product";
  const productBrand = product.subcategoryName || "Brubla";
  const rating = product.averageRating || 4.5;
  const reviewCount = product.reviews?.length || 0;
  const isNew = product.tags?.includes("new") || false;
  const inStock = (product.totalStock ?? 1) > 0;
  const isWishlisted = wishlist.includes(product._id);

  // Auto-rotate images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <div
      ref={ref}
      className="group cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={currentImage}
            alt={productName}
            className="w-full h-full object-cover object-top transition-transform duration-700"
            style={{
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
          />

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"
                    }`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
            {isNew && (
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black text-white rounded">
                NEW
              </span>
            )}
            {discount > 0 && (
              <span className="text-[8px] sm:text-[9px] font-black px-1 py-0.5 sm:px-1.5 sm:py-0.5 text-white rounded" style={{ backgroundColor: COFFEE }}>
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 z-20 flex items-center justify-center transition-all duration-300 rounded-full bg-white/85 hover:bg-white shadow-md w-7 h-7`}
          >
            <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />
          </button>

          {/* Add to Cart Button (appears on hover) */}
          {inStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-1.5 transition-all duration-300 bg-black/85 text-white"
              style={{
                height: "36px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                transform: hovered ? "translateY(0)" : "translateY(100%)",
                backgroundColor: COFFEE,
              }}
            >
              <ShoppingBag size={12} />
              ADD TO CART
            </button>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2.5 sm:p-3">
          <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider mb-0.5 text-gray-500">
            {productBrand}
          </p>
          <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-1">{productName}</h3>

          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <StarRating rating={rating} />
              {reviewCount > 0 && (
                <span className="text-[8px] sm:text-[9px] font-semibold text-gray-500">({reviewCount})</span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <span className="font-black text-gray-900 text-sm sm:text-base">{toINR(displayPrice)}</span>
            {originalPrice > displayPrice && (
              <span className="text-[9px] sm:text-[10px] line-through text-gray-400">{toINR(originalPrice)}</span>
            )}
          </div>

          {/* Available Colors */}
          {product.availableColors?.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {product.availableColors.slice(0, 5).map((c) => {
                const lower = c.toLowerCase();
                const bg = lower === "white" ? "#f3f4f6"
                  : lower === "black" ? "#111"
                    : lower === "red" ? "#ef4444"
                      : lower === "blue" ? "#3b82f6"
                        : lower === "green" ? "#22c55e"
                          : "#d1d5db";
                return (
                  <span key={c} title={c}
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: bg }} />
                );
              })}
              {product.availableColors.length > 5 && (
                <span className="text-[8px] text-gray-400">+{product.availableColors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <>
    <Header />
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        <div className="h-64 bg-gray-300"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-100 aspect-[3/4]" />
                <div className="p-3 space-y-2">
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

// Main Component
export default function SingleCollectionProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ priceRange: null, minRating: null, inStockOnly: false });
  const [wishlist, setWishlist] = useState([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState(null);

  const userId = getUserId();

  // Show toast message
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch collection from API
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/users/collections/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const collectionData = result.data;
          setCollection({
            id: collectionData._id,
            title: collectionData.title,
            tag: collectionData.tag,
            description: collectionData.description,
            image: collectionData.image,
            products: collectionData.products || [],
            subtitle: collectionData.tag === "summer" ? "SUMMER ESSENTIALS" :
              collectionData.tag === "winter" ? "WINTER COLLECTION" : "NEW ARRIVALS",
          });
          setProducts(collectionData.products || []);
          setFilteredProducts(collectionData.products || []);
        } else {
          navigate("/collections");
        }
      } catch (err) {
        console.error('Error fetching collection:', err);
        navigate("/collections");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCollection();
    }
  }, [id, navigate]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
        if (res.data.success) {
          setWishlist((res.data.user.wishlist || []).map((item) => item.productId));
          console.log("Wishlist fetched:", res.data.user.wishlist);
        }
      } catch (err) {
        console.log("Wishlist fetch error", err);
      }
    };
    fetchWishlist();
  }, [userId]);

  // Toggle wishlist
  const toggleWishlist = useCallback(async (productId) => {
    if (!userId) {
      showToast("Please login to add to wishlist", "error");
      return;
    }
    try {
      const wasInWishlist = wishlist.includes(productId);
      setWishlist((prev) =>
        prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]
      );
      await axios.post(`${API_BASE_URL}/api/users/wishlist/${userId}/toggle`, { productId });
      showToast(wasInWishlist ? "Removed from wishlist" : "Added to wishlist", "success");
    } catch (err) {
      console.log("Wishlist update error", err);
      showToast("Failed to update wishlist", "error");
    }
  }, [userId, wishlist]);

  // Add to cart with variant selection
  const handleAddToCart = (product) => {
    if (!userId) {
      showToast("Please login to add to cart", "error");
      return;
    }
    setSelectedProduct(product);
    setShowVariantModal(true);
  };

  const addToCartWithVariant = async (product, variantData) => {
    if (!userId) return;

    setAddingToCart(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/cart/${userId}/add`, {
        productId: product._id,
        variantId: variantData.variantId,
        sizeId: variantData.sizeId,
        quantity: variantData.quantity
      });

      if (response.data.success) {
        showToast(`Added ${variantData.quantity} item(s) to cart!`, "success");
        setShowVariantModal(false);
      } else {
        showToast(response.data.message || "Failed to add to cart", "error");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast(err.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  // Apply filters, search, and sort
  useEffect(() => {
    if (!products.length) return;

    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query)
      );
    }

    // Price filter
    if (selectedFilters.priceRange) {
      const { min, max } = selectedFilters.priceRange;
      filtered = filtered.filter(p => {
        const price = (p.displayPrice || p.variants?.[0]?.discountPrice || p.variants?.[0]?.price || 0) * 83;
        return price >= min && price <= max;
      });
    }

    // Rating filter
    if (selectedFilters.minRating !== null) {
      filtered = filtered.filter(p => (p.averageRating || 0) >= selectedFilters.minRating);
    }

    // In stock filter
    if (selectedFilters.inStockOnly) {
      filtered = filtered.filter(p => (p.totalStock ?? 1) > 0);
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => {
          const priceA = a.displayPrice || a.variants?.[0]?.discountPrice || a.variants?.[0]?.price || 0;
          const priceB = b.displayPrice || b.variants?.[0]?.discountPrice || b.variants?.[0]?.price || 0;
          return priceA - priceB;
        });
        break;
      case "price_high":
        filtered.sort((a, b) => {
          const priceA = a.displayPrice || a.variants?.[0]?.discountPrice || a.variants?.[0]?.price || 0;
          const priceB = b.displayPrice || b.variants?.[0]?.discountPrice || b.variants?.[0]?.price || 0;
          return priceB - priceA;
        });
        break;
      case "rating":
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        // featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, sortBy, selectedFilters]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    setSelectedFilters({ priceRange: null, minRating: null, inStockOnly: false });
  };

  const activeFilterCount = [
    selectedFilters.priceRange,
    selectedFilters.minRating,
    selectedFilters.inStockOnly
  ].filter(Boolean).length + (searchQuery ? 1 : 0);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!collection) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <Styles />

        {/* Hero Section with Background Image */}
        <div
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${collection.image})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <button
              onClick={() => navigate("/collections")}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors mb-5 sm:mb-6 text-xs sm:text-sm group"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to Collections
            </button>

            <div className="text-center">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: COFFEE }}>
                {collection.subtitle}
              </p>
              <h1
                className="fd font-black text-white px-2"
                style={{ fontSize: "clamp(28px, 8vw, 52px)" }}
              >
                {collection.title}
              </h1>
              <p className="text-white/90 fs text-xs sm:text-sm max-w-2xl mx-auto mt-3 px-4">
                {collection.description}
              </p>
              <div className="flex justify-center gap-6 mt-5 sm:mt-6">
                <div>
                  <p className="text-xl sm:text-2xl font-black" style={{ color: COFFEE }}>{products.length}</p>
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-white/70">Products</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-coffee/30 to-transparent" />
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative w-full sm:w-72 md:w-80">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:border-coffee focus:outline-none transition-colors"
                style={{ borderColor: searchQuery ? COFFEE : undefined }}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="relative flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-full text-xs text-gray-600 shadow-sm transition-colors"
              >
                <SlidersHorizontal size={12} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: COFFEE }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />

              {wishlist.length > 0 && (
                <button
                  onClick={() => navigate("/wishlist")}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-coffee transition-colors"
                >
                  <Heart size={12} className="text-red-500" />
                  <span className="hidden sm:inline">Wishlist</span>
                  <span className="text-coffee">({wishlist.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              {searchQuery && (
                <Chip label={`Search: "${searchQuery}"`} onRemove={() => setSearchQuery("")} />
              )}
              {selectedFilters.priceRange && (
                <Chip label={selectedFilters.priceRange.label} onRemove={() => setSelectedFilters({ ...selectedFilters, priceRange: null })} />
              )}
              {selectedFilters.minRating && (
                <Chip label={`${selectedFilters.minRating}★ & above`} onRemove={() => setSelectedFilters({ ...selectedFilters, minRating: null })} />
              )}
              {selectedFilters.inStockOnly && (
                <Chip label="In Stock Only" onRemove={() => setSelectedFilters({ ...selectedFilters, inStockOnly: false })} />
              )}
              <button
                onClick={clearAllFilters}
                className="text-[10px] text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-2xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" className="sm:w-8 sm:h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1">No products found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-5 py-2 text-sm font-medium rounded-lg transition-colors border border-coffee text-coffee hover:bg-coffee/10"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products
                  </p>
                </div>
                <div className="product-grid">
                  {filteredProducts.map((product, idx) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      index={idx}
                      wishlist={wishlist}
                      onWishlistToggle={toggleWishlist}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter Drawer */}
        {isFilterOpen && (
          <FilterDrawer
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        )}

        {/* Variant Selection Modal */}
        <VariantSelectionModal
          isOpen={showVariantModal}
          onClose={() => {
            setShowVariantModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onConfirm={(variantData) => addToCartWithVariant(selectedProduct, variantData)}
          addingToCart={addingToCart}
        />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scaleIn">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${toast.type === "success" ? "bg-black text-white" : "bg-red-500 text-white"
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
    </>
  );
}