import { useState, useRef, useEffect, useCallback } from "react";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE_URL = "http://31.97.228.17:4077";
const RECOMMENDED_API_URL = `${API_BASE_URL}/api/users/recommended`;

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronIcon = ({ dir = "right", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {dir === "right" ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
const normaliseUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  return url.replace(/https?:\/\/localhost:4077/g, API_BASE_URL);
};

const toINR = (usd) => {
  if (!usd && usd !== 0) return "—";
  return "₹" + (usd * 83).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const getUserId = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    return user?.id || null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${type === "success" ? "bg-black text-white" : "bg-red-500 text-white"
        }`}>
        {type === "success" ? (
          <CheckIcon size={18} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="opacity-70 hover:opacity-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, onWishlistToggle, isWishlisted, showToast }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWish] = useState(isWishlisted);
  const [addedCart, setCart] = useState(false);
  const [visible, setVisible] = useState(false);
  const [images, setImages] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Get product images
  useEffect(() => {
    const productImages = [];

    if (product.mainImage) {
      productImages.push(normaliseUrl(product.mainImage));
    }

    if (product.mainImages && product.mainImages.length > 0) {
      product.mainImages.forEach(img => productImages.push(normaliseUrl(img)));
    }

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        if (variant.mainImage) productImages.push(normaliseUrl(variant.mainImage));
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach(img => productImages.push(normaliseUrl(img)));
        }
      });
    }

    if (productImages.length === 0) {
      productImages.push("https://placehold.co/600x800/e5e7eb/64748b?text=No+Image");
    }

    setImages([...new Set(productImages)]);
  }, [product]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCart(true);
    setTimeout(() => setCart(false), 1800);
    showToast?.("Added to cart!", "success");
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWish(!wishlisted);
    onWishlistToggle?.(product._id);
  };

  const totalImgs = images.length;
  const displayPrice = product.displayPrice || 0;
  const originalPrice = product.displayActualPrice || 0;
  const discount = originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : product.maxDiscount || 0;
  const productName = product.name || "Product";
  const productBrand = product.brand || product.subcategoryName || "Brubla";
  const rating = product.averageRating || 0;

  return (
    <div
      ref={ref}
      className={[
        "flex-shrink-0 cursor-pointer select-none",
        "w-[calc(25vw-12px)] min-w-[200px] max-w-[360px]",
        "transition-[opacity,transform] duration-500 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{ transitionDelay: `${index * 0.06}s` }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* IMAGE CONTAINER */}
      <div className="relative overflow-hidden rounded-xl bg-[#efefed] aspect-[3/4] group">

        {/* Images */}
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={productName}
            className={[
              "absolute inset-0 w-full h-full object-cover object-top",
              "transition-opacity duration-500 ease-in-out",
              activeImg === i ? "opacity-100" : "opacity-0",
            ].join(" ")}
            loading="lazy"
            draggable={false}
          />
        ))}

        {/* Invisible hover zones for image switching */}
        {totalImgs > 1 && (
          <div className="absolute inset-0 z-[5] flex pointer-events-auto">
            {images.map((_, di) => (
              <div
                key={di}
                className="flex-1 h-full"
                onMouseEnter={() => setActiveImg(di)}
              />
            ))}
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {discount}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-20 flex items-center justify-center transition-all duration-300 rounded-full bg-white/85 hover:bg-white shadow-md w-7 h-7"
          aria-label="Save"
        >
          <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />
        </button>

        {/* DOT INDICATORS */}
        {totalImgs > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5 pointer-events-none">
            {images.map((_, di) => (
              <div
                key={di}
                className={[
                  "rounded-full transition-all duration-300",
                  activeImg === di
                    ? "w-4 h-[5px] bg-white"
                    : "w-[5px] h-[5px] bg-white/50",
                ].join(" ")}
              />
            ))}
          </div>
        )}

        {/* Add to Cart Button on Hover */}
        <button
          onClick={handleCart}
          className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-1.5 transition-all duration-300 bg-black text-white py-2 text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100"
        >
          {addedCart ? <CheckIcon size={13} /> : <PlusIcon size={14} />}
          {addedCart ? "Added!" : "Add to Cart"}
        </button>
      </div>

      {/* INFO ROW */}
      <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
            {productBrand}
          </p>
          <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug truncate mt-0.5">
            {productName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[14px] font-bold text-[#1a1a1a]">
              {toINR(displayPrice)}
            </p>
            {originalPrice > displayPrice && (
              <p className="text-[11px] text-[#888] line-through">
                {toINR(originalPrice)}
              </p>
            )}
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-yellow-500">★</span>
              <span className="text-[10px] text-gray-600">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
          className="flex-shrink-0 w-8 h-8 border border-black flex items-center justify-center rounded-full bg-white text-[#000] hover:bg-[#000] hover:text-white transition-colors duration-200"
          aria-label="Quick view"
        >
          <FaEye size={14} className="text-[#000] hover:text-[#fff] transition-colors duration-200" />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const ScrollBtn = ({ dir, onClick, show }) => (
  <button
    onClick={onClick}
    aria-label={dir}
    className={[
      "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full",
      "border border-[#ddd] bg-white text-[#1a1a1a]",
      "transition-all duration-200 hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
      show ? "opacity-100 pointer-events-auto" : "opacity-25 pointer-events-none",
    ].join(" ")}
  >
    <ChevronIcon dir={dir === "left" ? "left" : "right"} size={12} />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="w-full p-10 md:py-12 bg-white overflow-hidden">
    <div className="max-w-9xl mx-auto">
      <div className="px-4 md:px-6 lg:px-8 mb-4 md:mb-5">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="flex gap-3 overflow-hidden px-4 md:px-6 lg:px-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-[200px]">
            <div className="bg-gray-200 rounded-xl aspect-[3/4] animate-pulse"></div>
            <div className="mt-2.5 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function RecommendedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [headerVis, setHdrVis] = useState(false);
  const [toast, setToast] = useState(null);
  const trackRef = useRef(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const userId = getUserId();

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // Fetch recommended products
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(RECOMMENDED_API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const transformedProducts = result.data.map((product) => ({
            _id: product._id,
            id: product._id,
            name: product.name,
            description: product.description,
            displayPrice: product.displayPrice,
            displayActualPrice: product.displayActualPrice,
            maxDiscount: product.maxDiscount,
            mainImage: normaliseUrl(product.mainImage),
            mainImages: product.mainImages || [product.mainImage],
            averageRating: product.averageRating,
            brand: product.brand || product.subcategoryName || "Recommended",
            variants: product.variants || [],
          }));

          setProducts(transformedProducts);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
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
      // Revert on error
      setWishlist((prev) =>
        prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]
      );
    }
  }, [userId, wishlist]);

  // Scroll handling
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHdrVis(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const updateScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => el.removeEventListener("scroll", updateScroll);
  }, [updateScroll]);

  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: dir === "right" ? 600 : -600, behavior: "smooth" });
  };

  // Don't render if no products or error
  if (error && products.length === 0) {
    return null;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10 md:py-12 bg-white overflow-hidden" aria-label="Recommended Products">
      <style>{`
        .prod-track::-webkit-scrollbar { display: none; }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>

      <div className="max-w-9xl mx-auto">

        {/* HEADER */}
        <div
          ref={headerRef}
          className={[
            "px-4 md:px-6 lg:px-8 mb-4 md:mb-5",
            "flex items-center justify-between",
            "transition-[opacity,transform] duration-500",
            headerVis ? "opacity-100 translate-y-0" : "opacity-100 translate-y-3",
          ].join(" ")}
        >
          <div>
            <h2 className="text-[14px] font-medium text-[#1a1a1a] tracking-wide"
              style={{
                fontSize: "clamp(26px,4.5vw,44px)",
                fontFamily: "Georgia,'Times New Roman',serif",
                letterSpacing: "-0.02em",
              }}>
              Recommended for you
            </h2>
            
          </div>

          <div className="flex items-center gap-1.5">
            {products.length > 4 && (
              <>
                <ScrollBtn dir="left" onClick={() => scrollBy("left")} show={canLeft} />
                <ScrollBtn dir="right" onClick={() => scrollBy("right")} show={canRight} />
              </>
            )}
            <button
              onClick={() => navigate("/products")}
              className="hidden sm:flex items-center gap-0.5 text-[12px] text-[#999] hover:text-[#1a1a1a] transition-colors duration-200 ml-2"
            >
              View all
              <ChevronIcon dir="right" size={11} />
            </button>
          </div>
        </div>

        {/* PRODUCT TRACK */}
        <div
          ref={trackRef}
          className="prod-track flex gap-3 overflow-x-auto"
          style={{
            paddingLeft: "clamp(16px,2vw,32px)",
            paddingRight: "clamp(16px,2vw,32px)",
            paddingBottom: "8px",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
        >
          {products.map((p, i) => (
            <div key={p._id} className="flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
              <ProductCard
                product={p}
                index={i}
                isWishlisted={wishlist.includes(p._id)}
                onWishlistToggle={toggleWishlist}
                showToast={showToast}
              />
            </div>
          ))}
          <div className="min-w-2 flex-shrink-0" />
        </div>

        {/* MOBILE VIEW ALL */}
        <div className="sm:hidden flex justify-center mt-5 px-4">
          <button
            onClick={() => navigate("/products")}
            className="text-[13px] text-[#999] underline underline-offset-4 hover:text-[#1a1a1a] transition-colors"
          >
            View all products
          </button>
        </div>

      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}