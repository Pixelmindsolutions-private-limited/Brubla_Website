import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronDown, Heart, ShoppingBag, Star,
  SlidersHorizontal, X, LayoutGrid, List, ArrowLeft, Loader2, CheckCircle,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

const COFFEE = "#000";
const API_BASE = "http://31.97.228.17:4077";

// ─── URL normaliser ────────────────────────────────────────────────────────────
const normaliseUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  return url.replace(/https?:\/\/localhost:4077/g, API_BASE);
};

// ─── Get product image ─────────────────────────────────────────────────────────
const getProductImage = (product) => {
  if (product.mainImage) return normaliseUrl(product.mainImage);
  if (Array.isArray(product.mainImages) && product.mainImages.length > 0)
    return normaliseUrl(product.mainImages[0]);
  for (const v of product.variants || []) {
    if (v.mainImage) return normaliseUrl(v.mainImage);
    if (Array.isArray(v.images) && v.images.length > 0) return normaliseUrl(v.images[0]);
  }
  return "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image";
};

// ─── Discount % ───────────────────────────────────────────────────────────────
const getDiscount = (product) => {
  const actual = product.displayActualPrice;
  const sale = product.displayPrice;
  if (actual && sale && actual > sale)
    return Math.round(((actual - sale) / actual) * 100);
  return product.maxDiscount || null;
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
      const response = await axios.get(`${API_BASE}/api/admin/products/${product._id}`);
      
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

              {selectedVariant?.sizes && selectedVariant.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.sizes.map(size => (
                      <button
                        key={size._id}
                        onClick={() => handleSizeSelect(size)}
                        disabled={size.stock === 0}
                        className={`relative min-w-[52px] py-2 rounded-lg text-sm font-medium transition-all ${
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

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

// ─── Price filter buckets ─────────────────────────────────────────────────────
const PRICE_RANGES = [
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "Over ₹10,000", min: 10000, max: Infinity },
];

// ─── Tag colour map ────────────────────────────────────────────────────────────
const TAG_COLOURS = {
  winter: "bg-blue-50 text-blue-600",
  summer: "bg-sky-50 text-sky-600",
  jacket: "bg-amber-50 text-amber-600",
  premium: "bg-emerald-50 text-emerald-600",
  casual: "bg-purple-50 text-purple-600",
  warm: "bg-orange-50 text-orange-600",
  trending: "bg-rose-50 text-rose-600",
  bestseller: "bg-green-50 text-green-600",
  default: "bg-gray-100 text-gray-500",
};

function Tag({ label }) {
  const cls = TAG_COLOURS[label?.toLowerCase()] ?? TAG_COLOURS.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[11px] text-gray-600 shadow-sm">
      {label}
      <button onClick={onRemove} className="hover:text-gray-900 ml-0.5">
        <X size={9} />
      </button>
    </span>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="bg-gray-100" style={{ aspectRatio: "3/4" }} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        <ShoppingBag size={24} className="text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">No products found</h3>
      <p className="text-xs text-gray-400 max-w-xs">Try adjusting your filters to find what you're looking for.</p>
      <button onClick={onClear}
        className="mt-5 px-5 py-2 rounded-full text-sm font-medium text-white"
        style={{ backgroundColor: COFFEE }}>
        Clear filters
      </button>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-base font-semibold text-gray-800 mb-2">Failed to Load</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <button onClick={onRetry}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: COFFEE }}>
          Try Again
        </button>
      </div>
    </div>
  );
}

// ─── Product Card (Grid) ──────────────────────────────────────────────────────
function ProductCard({ product, isWishlisted, onWishlistToggle, wishlist, onAddToCart }) {
  const navigate = useNavigate();
  const discount = getDiscount(product);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productImages = useMemo(() => {
    const images = [];
    if (product.mainImage) images.push(normaliseUrl(product.mainImage));
    if (Array.isArray(product.mainImages)) {
      product.mainImages.forEach((img) => images.push(normaliseUrl(img)));
    }
    for (const v of product.variants || []) {
      if (v.mainImage) images.push(normaliseUrl(v.mainImage));
      if (Array.isArray(v.images)) {
        v.images.forEach((img) => images.push(normaliseUrl(img)));
      }
    }
    const unique = [...new Set(images.filter(Boolean))];
    return unique.length > 0 ? unique : ["https://placehold.co/600x800/e5e7eb/64748b?text=No+Image"];
  }, [product]);

  useEffect(() => {
    if (productImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [productImages]);

  const img = productImages[currentImageIndex];
  const pid = product._id || product.id;
  const inStock = (product.totalStock ?? 1) > 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${pid}`)}>

      <div className="relative overflow-hidden bg-gray-50 flex-shrink-0" style={{ aspectRatio: "3/4" }}>
        <img
          key={img}
          src={img}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image";
          }}
        />

        {productImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {productImages.map((_, idx) => (
              <span key={idx} className={`rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"}`} />
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: COFFEE }}>
              -{discount}%
            </span>
          )}
          {product.tags?.[0] && <Tag label={product.tags[0]} />}
        </div>

        <button onClick={(e) => { e.stopPropagation(); onWishlistToggle(pid); }}
          className={`absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 shadow-sm ${isWishlisted ? "bg-rose-50" : "bg-white/85 hover:bg-white"}`}>
          <Heart size={19} className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"} />
        </button>

        {!inStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Out of Stock
            </span>
          </div>
        )}

        {inStock && (
          <div className="absolute z-20 bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="w-full py-2.5 text-[11px] font-bold tracking-widest uppercase text-white"
              style={{ backgroundColor: COFFEE }}>
              Add to Bag
            </button>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium truncate">
          {product.subcategoryName || "Fashion"}
        </p>
        <h3 className="text-gray-800 text-xs sm:text-sm font-semibold leading-snug line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-1">
          <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
          <span className="text-[10px] text-gray-500">{(product.averageRating || 0).toFixed(1)}</span>
          <span className="text-[10px] text-gray-400">({product.reviews?.length || product.reviewCount || 0})</span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-900 font-bold text-sm">{toINR(product.displayPrice)}</span>
            {product.displayActualPrice > product.displayPrice && (
              <span className="text-gray-400 text-[10px] line-through">{toINR(product.displayActualPrice)}</span>
            )}
          </div>
        </div>

        {product.availableSizes?.length > 0 && (
          <div className="flex gap-0.5">
            {product.availableSizes.slice(0, 3).map((s) => (
              <span key={s} className="text-[8px] text-gray-400 border border-gray-100 rounded px-1 py-0.5 bg-gray-50">{s}</span>
            ))}
            {product.availableSizes.length > 3 && (
              <span className="text-[8px] text-gray-400">+{product.availableSizes.length - 3}</span>
            )}
          </div>
        )}

        {product.availableColors?.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {product.availableColors.slice(0, 5).map((c) => {
              const lower = c.toLowerCase();
              const bg = lower === "white" ? "#f9fafb"
                : lower === "black" ? "#111"
                : lower === "red" ? "#ef4444"
                : lower === "blue" ? "#3b82f6"
                : lower === "green" ? "#22c55e"
                : lower === "yellow" ? "#eab308"
                : lower === "pink" ? "#ec4899"
                : lower === "gray" || lower === "grey" ? "#9ca3af"
                : "#d1d5db";
              return (
                <span key={c} title={c}
                  className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
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
  );
}

// ─── Product List Item ────────────────────────────────────────────────────────
function ProductListItem({ product, isWishlisted, onWishlistToggle, wishlist, onAddToCart }) {
  const navigate = useNavigate();
  const discount = getDiscount(product);
  const img = getProductImage(product);
  const pid = product._id || product.id;
  const inStock = (product.totalStock ?? 1) > 0;

  return (
    <div className="flex gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/product/${pid}`)}>

      <div className="relative w-24 sm:w-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50" style={{ aspectRatio: "3/4" }}>
        <img src={img} alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image"; }} />
        {!inStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-[8px] font-semibold text-gray-500 text-center leading-tight px-1">Sold Out</span>
          </div>
        )}
        {discount && (
          <div className="absolute top-1.5 left-1.5">
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white" style={{ backgroundColor: COFFEE }}>
              -{discount}%
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium mb-0.5">
                {product.subcategoryName || "Fashion"}
              </p>
              <h3 className="text-gray-800 text-sm font-semibold leading-snug line-clamp-2">
                {product.name}
              </h3>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onWishlistToggle(pid); }}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
              <Heart size={19} className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-gray-500">{(product.averageRating || 0).toFixed(1)}</span>
            <span className="text-[10px] text-gray-400">({product.reviews?.length || 0})</span>
            {product.tags?.[0] && <Tag label={product.tags[0]} />}
          </div>

          {product.availableSizes?.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mr-0.5">Sizes:</span>
              {product.availableSizes.slice(0, 5).map((s) => (
                <span key={s} className="text-[9px] text-gray-500 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">{s}</span>
              ))}
            </div>
          )}

          {product.availableColors?.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mr-0.5">Colours:</span>
              {product.availableColors.slice(0, 5).map((c) => {
                const lower = c.toLowerCase();
                const bg = lower === "white" ? "#f3f4f6"
                  : lower === "black" ? "#111"
                  : lower === "red" ? "#ef4444"
                  : lower === "blue" ? "#3b82f6"
                  : lower === "green" ? "#22c55e"
                  : lower === "yellow" ? "#eab308"
                  : lower === "pink" ? "#ec4899"
                  : "#d1d5db";
                return (
                  <span key={c} title={c}
                    className="w-3.5 h-3.5 rounded-full border border-gray-200"
                    style={{ backgroundColor: bg }} />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-900 font-bold text-sm">{toINR(product.displayPrice)}</span>
            {product.displayActualPrice > product.displayPrice && (
              <span className="text-gray-400 text-xs line-through">{toINR(product.displayActualPrice)}</span>
            )}
          </div>
          <button
            disabled={!inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${inStock ? "text-white hover:opacity-80" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            style={inStock ? { backgroundColor: COFFEE } : {}}>
            <ShoppingBag size={11} />
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────
function FilterDrawer({ selectedFilters, setSelectedFilters, onClose }) {
  const [local, setLocal] = useState({ ...selectedFilters });

  const apply = () => { setSelectedFilters(local); onClose(); };
  const reset = () => setLocal({ priceRange: null, minRating: null, inStockOnly: false });

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
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────
function SortDropdown({ sortBy, setSortBy }) {
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
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubCategoryProductsPage() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const [sortBy, setSortBy] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ priceRange: null, minRating: null, inStockOnly: false });
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  
  // Cart modal state
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

  // Fetch products
  useEffect(() => {
    if (!subcategoryId) { setError("No subcategory ID."); setLoading(false); return; }
    let cancelled = false;

    const run = async () => {
      setLoading(true); setError(null);
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 15_000);
        const res = await fetch(`${API_BASE}/api/admin/subcategories/${subcategoryId}/products`, { signal: ctrl.signal });
        clearTimeout(tid);

        if (!res.ok) throw new Error(`Server error ${res.status}: ${res.statusText}`);

        const data = await res.json();
        if (cancelled) return;

        if (!data || data.success === false)
          throw new Error(data?.message || "Failed to load products.");

        if (data.subcategory) setSubcategory(data.subcategory);
        if (data.category) setCategory(data.category);

        const raw = Array.isArray(data.products) ? data.products : [];
        const subName = data.subcategory?.name || "";
        const catName = data.category?.name || "";
        const enriched = raw
          .filter((p) => p.isActive !== false)
          .map((p) => ({ ...p, subcategoryName: p.subcategoryName || subName, categoryName: catName }));

        setProducts(enriched);
      } catch (err) {
        if (cancelled) return;
        setError(err.name === "AbortError" ? "Request timed out." : err.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [subcategoryId, retryKey]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_BASE}/api/users/${userId}`);
        if (res.data.success) {
          setWishlist((res.data.user.wishlist || []).map((item) => item.productId));
        }
      } catch (err) {
        console.log("Wishlist fetch error", err);
      }
    };
    fetchWishlist();
  }, [userId]);

  // Toggle wishlist
  const toggleWishlist = useCallback(async (productId) => {
    if (!userId) return;
    try {
      setWishlist((prev) =>
        prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]
      );
      await axios.post(`${API_BASE}/api/users/wishlist/${userId}/toggle`, { productId });
    } catch (err) {
      console.log("Wishlist update error", err);
    }
  }, [userId]);

  // Add to cart with variant selection
  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowVariantModal(true);
  };

  const addToCartWithVariant = async (product, variantData) => {
    if (!userId) return;
    
    setAddingToCart(true);
    try {
      const response = await axios.post(`${API_BASE}/api/users/cart/${userId}/add`, {
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

  // Filtered products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedFilters.priceRange) {
      const { min, max } = selectedFilters.priceRange;
      list = list.filter((p) => {
        const inr = (p.displayPrice ?? 0) * 83;
        return inr >= min && inr <= max;
      });
    }

    if (selectedFilters.minRating !== null) {
      list = list.filter((p) => (p.averageRating || 0) >= selectedFilters.minRating);
    }

    if (selectedFilters.inStockOnly) {
      list = list.filter((p) => (p.totalStock ?? 1) > 0);
    }

    switch (sortBy) {
      case "price_asc": list.sort((a, b) => (a.displayPrice ?? 0) - (b.displayPrice ?? 0)); break;
      case "price_desc": list.sort((a, b) => (b.displayPrice ?? 0) - (a.displayPrice ?? 0)); break;
      case "rating": list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)); break;
      case "newest": list.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)); break;
      default: break;
    }

    return list;
  }, [products, sortBy, selectedFilters]);

  const clearFilters = () => setSelectedFilters({ priceRange: null, minRating: null, inStockOnly: false });
  const activeFilterCount = [selectedFilters.priceRange, selectedFilters.minRating, selectedFilters.inStockOnly || null].filter(Boolean).length;

  if (error && products.length === 0)
    return <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />;

  const pageTitle = subcategory?.name || "Products";
  const catTitle = category?.name || "";

  return (
    <>
      <Header />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-12">
            <button onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 rounded-full transition-all mb-6">
              <ArrowLeft size={12} /> Back
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                {catTitle && (
                  <p className="text-[11px] text-white/50 uppercase tracking-widest font-medium mb-2">{catTitle}</p>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-none">
                  {pageTitle}
                </h1>
                <p className="mt-3 text-white/60 text-sm max-w-xl">
                  Explore our curated collection of {pageTitle.toLowerCase()} — quality craftsmanship at unbeatable prices.
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                <div className="text-3xl sm:text-4xl font-bold text-white/20 tabular-nums">
                  {loading ? "—" : filteredProducts.length}
                </div>
                <p className="text-[11px] text-white/40 uppercase tracking-widest">Products</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <button onClick={() => setIsFilterOpen(true)}
                className="relative flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-full text-xs text-gray-600 shadow-sm transition-colors flex-shrink-0">
                <SlidersHorizontal size={12} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: COFFEE }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedFilters.priceRange && (
                    <Chip label={selectedFilters.priceRange.label}
                      onRemove={() => setSelectedFilters({ ...selectedFilters, priceRange: null })} />
                  )}
                  {selectedFilters.minRating && (
                    <Chip label={`${selectedFilters.minRating}★+`}
                      onRemove={() => setSelectedFilters({ ...selectedFilters, minRating: null })} />
                  )}
                  {selectedFilters.inStockOnly && (
                    <Chip label="In Stock"
                      onRemove={() => setSelectedFilters({ ...selectedFilters, inStockOnly: false })} />
                  )}
                  <button onClick={clearFilters}
                    className="text-[10px] text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors whitespace-nowrap">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                {[
                  { mode: "grid", Icon: LayoutGrid },
                  { mode: "list", Icon: List },
                ].map(({ mode, Icon }) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-full transition-all ${viewMode === mode ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                    style={viewMode === mode ? { backgroundColor: COFFEE } : {}}>
                    <Icon size={13} />
                  </button>
                ))}
              </div>

              <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product._id || product.id)}
                  onWishlistToggle={toggleWishlist}
                  wishlist={wishlist}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProducts.map((product) => (
                <ProductListItem
                  key={product._id || product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product._id || product.id)}
                  onWishlistToggle={toggleWishlist}
                  wishlist={wishlist}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-8">
              Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {isFilterOpen && (
        <FilterDrawer
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scaleIn">
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
    </>
  );
}