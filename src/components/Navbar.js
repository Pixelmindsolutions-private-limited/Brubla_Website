import {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaDownload,
  FaQuestionCircle,
  FaAndroid,
  FaApple,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { ChevronRightIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ICON PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const Ic = ({ children, className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const SearchIcon = ({ c }) => (
  <Ic className={c}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Ic>
);
export const CartIcon = ({ c }) => (
  <Ic className={c}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
    <path d="M3 3h2l2.4 12.5a2 2 0 002 1.5h7.6a2 2 0 002-1.5L21 7H6" />
  </Ic>
);
export const ProfileIcon = ({ c }) => (
  <Ic className={c}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </Ic>
);
export const CloseIcon = ({ c }) => (
  <Ic className={c}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </Ic>
);
export const ChevDown = ({ c }) => (
  <Ic className={c}>
    <polyline points="6 9 12 15 18 9" />
  </Ic>
);
export const ChevRight = ({ c }) => (
  <Ic className={c}>
    <polyline points="9 6 15 12 9 18" />
  </Ic>
);
export const ArrowLeftIcon = ({ c }) => (
  <Ic className={c}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Ic>
);
export const CheckIcon = ({ c }) => (
  <Ic className={c}>
    <polyline points="5 13 9 17 19 7" />
  </Ic>
);
export const TrendingIcon = ({ c }) => (
  <Ic className={c}>
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="21 7 21 13 15 13" />
  </Ic>
);
export const ClockIcon = ({ c }) => (
  <Ic className={c}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </Ic>
);
export const MenuIcon = ({ c }) => (
  <Ic className={c}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </Ic>
);
export const HomeIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M3 10.5l9-7 9 7" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </Ic>
);
export const HeartIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M20.8 7.6a5.5 5.5 0 00-7.8 0L12 8.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 21l8.8-5.6a5.5 5.5 0 000-7.8z" />
  </Ic>
);
export const ScissorsIcon = ({ c }) => (
  <Ic className={c}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <line x1="20" y1="4" x2="8.5" y2="15.5" />
    <line x1="14" y1="14" x2="20" y2="20" />
  </Ic>
);
export const BrushIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M20 4L4 20" />
    <path d="M14 6l4 4" />
    <path d="M7 21a3 3 0 01-3-3" />
  </Ic>
);
export const GemIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M2 9h20" />
  </Ic>
);
export const SparkleIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
  </Ic>
);
export const PinIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2" />
  </Ic>
);
export const GpsIcon = ({ c }) => (
  <Ic className={c}>
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="9" />
  </Ic>
);
export const ZapIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
  </Ic>
);
export const TagIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M20 13l-7 7-10-10V3h7l10 10z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </Ic>
);
export const PaletteIcon = ({ c }) => (
  <Ic className={c}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="10" r="1.5" />
    <circle cx="15" cy="10" r="1.5" />
    <circle cx="12" cy="15" r="1.5" />
  </Ic>
);
export const RulerIcon = ({ c }) => (
  <Ic className={c}>
    <path d="M3 21l18-18M10 3l4 4-7 7-4-4zM14 17l4-4 3 3-4 4z" />
  </Ic>
);

const LoaderIcon = ({ c = "w-4 h-4" }) => (
  <svg
    className={`${c} animate-spin`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = "http://31.97.228.17:4077";

const NOTIFS = [
  "✦  BRUBLA SOS Sale is Live Now  ·  BUY 1 GET 1 on all styles",
  "✦  Free delivery on orders above ₹499  ·  Code: FREESHIP",
  "✦  Flash Deal: Extra 20% off on Kurtas  ·  Limited time",
  "✦  New Arrivals: Summer 2025 Collection — Shop Now",
];

const TRENDING = [
  "Kurta Sets",
  "Oversized Tees",
  "Co-ord Sets",
  "Palazzo Pants",
  "Linen Shirts",
];
const RECENT = ["Blue Denim Jacket", "Floral Midi Dress", "Men's Chinos"];
const SUGGESTIONS = [
  { label: "Women's Kurtas", tag: "2,340 styles" },
  { label: "Men's Shirts", tag: "1,890 styles" },
  { label: "Kids Ethnic Wear", tag: "640 styles" },
  { label: "Summer Dresses", tag: "980 styles" },
  { label: "Formal Trousers", tag: "760 styles" },
];

const CITIES = [
  { pin: "500004", city: "Hyderabad" },
  { pin: "400001", city: "Mumbai" },
  { pin: "110001", city: "Delhi" },
  { pin: "560001", city: "Bengaluru" },
  { pin: "600001", city: "Chennai" },
];

const SIDEBAR_LINKS = [
  { id: "home", label: "Home", Icon: HomeIcon, link: "/home" },
  {
    id: "exclusive",
    label: "Exclusive",
    Icon: GemIcon,
    link: "/exclusiveproducts",
    special: true,
  },
  { id: "tailor", label: "Tailor", Icon: ScissorsIcon, link: "/exclusive" },
  { id: "stylist", label: "AI Stylist", Icon: BrushIcon, link: "/exclusive" },
  { id: "designer", label: "Designer", Icon: HeartIcon, link: "/exclusive" },
  { id: "profile", label: "Profile", Icon: ProfileIcon, link: "/profile" },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const getUserId = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}")?.id || null;
  } catch {
    return null;
  }
};

const fixImageUrl = (url = "") =>
  url.replace("http://localhost:4077", API_BASE);

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING JOIN BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const FloatingJoinBtn = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2">
      <div
        className="text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg transition-all duration-200 whitespace-nowrap"
        style={{
          background: "#fff",
          color: "#000",
          opacity: hovered ? 1 : 0,
          transform: hovered
            ? "translateY(0) scale(1)"
            : "translateY(6px) scale(0.95)",
          pointerEvents: "none",
          letterSpacing: "0.06em",
        }}
      >
        ✦ Become a Partner
      </div>
      <button
        onClick={() => navigate("/joinUs")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Join us"
        className="relative flex items-center gap-2 rounded-full font-bold text-sm shadow-2xl transition-all duration-300 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#000,#1a1a1a)",
          color: "#fff",
          padding: "12px 20px",
          boxShadow: hovered
            ? "0 8px 32px rgba(0,0,0,0.45)"
            : "0 6px 24px rgba(0,0,0,0.45)",
          letterSpacing: "0.06em",
          minHeight: "48px",
          justifyContent: "center",
          border: hovered
            ? "1.5px solid rgba(0,0,0,0.4)"
            : "1.5px solid transparent",
        }}
      >
        {pulse && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: "rgba(0,0,0,0.35)",
              animationDuration: "1.4s",
            }}
          />
        )}
        <SparkleIcon c="w-3.5 h-3.5 flex-shrink-0" />
        <span className="whitespace-nowrap text-[13px] tracking-wide">
          Join Us
        </span>
        <span
          className="transition-all duration-300 overflow-hidden flex-shrink-0"
          style={{
            maxWidth: hovered ? "20px" : "0px",
            opacity: hovered ? 1 : 0,
          }}
        >
          →
        </span>
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION BANNER
// ─────────────────────────────────────────────────────────────────────────────
const NotifBanner = ({ onClose }) => {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % NOTIFS.length);
        setFade(false);
      }, 280);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="h-10 flex items-center justify-between px-3 md:px-6 overflow-hidden"
      style={{ background: "#000" }}
    >
      <div className="flex-1 overflow-hidden">
        <p
          className={`text-[11px] md:text-xs font-semibold tracking-[0.12em] whitespace-nowrap transition-all duration-300 ${fade ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"}`}
          style={{ color: "#fff" }}
        >
          {NOTIFS[idx]}
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-3">
        <button
          onClick={() => navigate("/exclusive")}
          className="flex items-center gap-1 md:gap-2 text-[11px] md:text-xs font-medium hover:opacity-80 text-white"
        >
          <FaDownload className="text-sm" />
          <span className="hidden md:inline">Download App</span>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DownloadModal = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-bold text-center mb-5 text-gray-800">
        Download App
      </h2>
      <div className="space-y-4">
        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-100 hover:bg-green-200 transition">
          <FaAndroid className="text-2xl text-green-700" />
          <div className="text-left">
            <p className="font-semibold text-gray-800">Android</p>
            <p className="text-xs text-gray-500">Download APK</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
          <FaApple className="text-2xl text-black" />
          <div className="text-left">
            <p className="font-semibold text-gray-800">iOS</p>
            <p className="text-xs text-gray-500">App Store</p>
          </div>
        </button>
      </div>
      <button
        onClick={onClose}
        className="mt-5 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
const SearchOverlay = ({ open, onClose }) => {
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent searches:", e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Fetch search results from API
  const fetchSearchResults = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://31.97.228.17:4077/api/users/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();

      if (data.success && data.products) {
        // Fix image URLs
        const fixedProducts = data.products.map((product) => ({
          ...product,
          mainImage:
            product.mainImage?.replace("localhost:4077", "31.97.228.17:4077") ||
            "/placeholder-image.jpg",
        }));
        setSearchResults(fixedProducts.slice(0, 5)); // Show top 5 results in overlay
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions as user types
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      // You can create a suggestions endpoint or use product names
      const response = await fetch(
        `http://31.97.228.17:4077/api/users/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();

      if (data.success && data.products) {
        // Extract unique product names as suggestions
        const uniqueNames = [...new Set(data.products.map((p) => p.name))];
        setSuggestions(uniqueNames.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Suggestions error:", error);
      setSuggestions([]);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (q.trim()) {
      debounceTimer.current = setTimeout(() => {
        fetchSearchResults(q);
        fetchSuggestions(q);
      }, 300);
    } else {
      setSearchResults([]);
      setSuggestions([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [q]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQ("");
      setSearchResults([]);
      setSuggestions([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const go = (term) => {
    saveRecentSearch(term);
    onClose();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  // Filter suggestions based on input (for static suggestions)
  const filteredSuggestions =
    q.length > 0
      ? SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(q.toLowerCase()),
      )
      : [];

  // Get product suggestions from API
  const productSuggestions = suggestions.map((s) => ({
    label: s,
    tag: "Product",
  }));

  // Combine static and dynamic suggestions
  const allSuggestions = [...filteredSuggestions, ...productSuggestions].slice(
    0,
    8,
  );

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[500] transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: open ? "blur(4px)" : "blur(0px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      <div
        className="fixed left-0 right-0 top-0 z-[600] transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateY(0)" : "translateY(-100%)",
          background: "#fff",
          borderBottom: "1px solid rgba(111,78,55,0.15)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
        }}
      >
        {/* Input row */}
        <div
          className="flex items-center gap-3 px-4 md:px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(111,78,55,0.12)" }}
        >
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-full transition-colors hover:bg-[#f9f5f0]"
            style={{ color: "#333" }}
          >
            <ArrowLeftIcon c="w-5 h-5" />
          </button>
          <div
            className="flex-1 flex items-center gap-2.5 rounded-full px-4 py-2.5"
            style={{
              background: "#fff",
              border: "1.5px solid #000",
              boxShadow: "0 0 0 3px rgba(111,78,55,0.08)",
            }}
          >
            <SearchIcon c="w-4 h-4 flex-shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, brands, categories…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && q.trim()) go(q.trim());
              }}
              className="bg-transparent text-sm outline-none flex-1 min-w-0 placeholder:opacity-40"
              style={{ color: "#000", caretColor: "#000" }}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="flex-shrink-0 opacity-50 hover:opacity-90 transition-opacity"
              >
                <CloseIcon c="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div
          className="px-4 md:px-6 pb-6 max-h-[70vh] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {q.length > 0 ? (
            <div className="pt-4">
              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              )}

              {/* Direct search option */}
              {!loading &&
                q.trim() &&
                !allSuggestions.some(
                  (s) => s.label.toLowerCase() === q.toLowerCase(),
                ) && (
                  <button
                    onClick={() => go(q.trim())}
                    className="w-full flex items-center justify-between py-2.5 px-1 rounded-xl transition-colors hover:bg-[#f9f5f0] mt-2 border-t border-[rgba(111,78,55,0.1)] pt-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[#f9f5f0]">
                        <SearchIcon c="w-3.5 h-3.5 opacity-50" />
                      </div>
                      <span className="text-sm font-medium text-black">
                        Search for "
                        <span style={{ color: "#7a6a5a" }}>{q}</span>"
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f9f5f0]"
                      style={{ color: "#7a6a5a" }}
                    >
                      Enter ↵
                    </span>
                  </button>
                )}

              {/* Search Results Preview */}
              {!loading && searchResults.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[rgba(111,78,55,0.1)]">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-3 text-black">
                    Products
                  </p>
                  <div className="space-y-3">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-[#f9f5f0] text-left"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/48x48?text=BRUBLA";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-black">
                              ₹{product.price}
                            </span>
                            {product.originalPrice > product.price && (
                              <>
                                <span className="text-xs text-[#7a6a5a] line-through">
                                  ₹{product.originalPrice}
                                </span>
                                <span className="text-xs font-semibold text-green-600">
                                  {product.discount}% OFF
                                </span>
                              </>
                            )}
                          </div>
                          {product.category && (
                            <p className="text-xs text-[#7a6a5a] mt-1">
                              {product.category.name}
                            </p>
                          )}
                        </div>
                        <ChevronRightIcon c="w-4 h-4 opacity-40 flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  {searchResults.length >= 5 && (
                    <button
                      onClick={() => go(q)}
                      className="w-full mt-3 py-2 text-center text-xs font-semibold text-[#7a6a5a] hover:text-black transition"
                    >
                      View all results →
                    </button>
                  )}
                </div>
              )}

              {/* No results */}
              {!loading &&
                allSuggestions.length === 0 &&
                searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <SearchIcon c="w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium text-black">
                      No results for "
                      <span style={{ color: "#7a6a5a" }}>{q}</span>"
                    </p>
                    <p className="text-xs" style={{ color: "#7a6a5a" }}>
                      Try searching for something else
                    </p>
                    <button
                      onClick={() => go(q.trim())}
                      className="mt-4 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 bg-black text-white"
                    >
                      Search for "{q}"
                    </button>
                  </div>
                )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-black">
                      Recent
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] font-semibold"
                      style={{ color: "#7a6a5a" }}
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((r) => (
                      <button
                        key={r}
                        onClick={() => go(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-[#f0ebe4]"
                        style={{
                          background: "#fff",
                          color: "#333",
                          border: "1px solid rgba(111,78,55,0.15)",
                        }}
                      >
                        <ClockIcon c="w-3 h-3 opacity-40" />
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKDROP BRIGHTNESS DETECTION
// Works out how bright the page is right behind a screen rectangle (0 = black,
// 1 = white). It reads real image pixels, and accounts for dark/light overlays.
// Optional override: add data-nav-theme="light" | "dark" to any section.
// ─────────────────────────────────────────────────────────────────────────────
const parseRgb = (str) => {
  const m = str && str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(",").map(parseFloat);
  return { r, g, b, a };
};
const lumOf = ({ r, g, b }) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

// Downscaled pixel copy of each image, cached. null = blocked (no CORS access).
const pixelCache = new Map();
const loadPixels = (url) => {
  if (!pixelCache.has(url)) {
    pixelCache.set(
      url,
      new Promise((resolve) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => {
          try {
            const w = 64;
            const h = Math.max(
              1,
              Math.round((64 * im.naturalHeight) / im.naturalWidth),
            );
            const cv = document.createElement("canvas");
            cv.width = w;
            cv.height = h;
            const ctx = cv.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(im, 0, 0, w, h);
            ctx.getImageData(0, 0, 1, 1); // throws if the image is CORS-blocked
            resolve({ ctx, w, h, iw: im.naturalWidth, ih: im.naturalHeight });
          } catch {
            resolve(null);
          }
        };
        im.onerror = () => resolve(null);
        im.src = url;
      }),
    );
  }
  return pixelCache.get(url);
};

const regionLum = (px, u0, v0, u1, v1) => {
  const cl = (n) => Math.min(Math.max(n, 0), 1);
  const x = Math.min(Math.floor(cl(u0) * px.w), px.w - 1);
  const y = Math.min(Math.floor(cl(v0) * px.h), px.h - 1);
  const w = Math.max(1, Math.min(px.w - x, Math.ceil(cl(u1) * px.w) - x));
  const h = Math.max(1, Math.min(px.h - y, Math.ceil(cl(v1) * px.h) - y));
  const d = px.ctx.getImageData(x, y, w, h).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4)
    sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  return sum / (d.length / 4) / 255;
};

// Brightness of an <img> or url() background under rectangle wr (assumes "cover")
const imageLum = async (url, el, cs, wr, isBg) => {
  if (!url) return null;
  const px = await loadPixels(url);
  if (!px) return 0.25; // can't read pixels → assume a dark photo
  const er = el.getBoundingClientRect();
  const s = Math.max(er.width / px.iw, er.height / px.ih);
  const rw = px.iw * s;
  const rh = px.ih * s;
  const pos = (isBg ? cs.backgroundPosition : cs.objectPosition || "50% 50%")
    .split(" ")
    .map((v) => (isNaN(parseFloat(v)) ? 0.5 : parseFloat(v) / 100));
  const ox = (er.width - rw) * (pos[0] ?? 0.5);
  const oy = (er.height - rh) * (pos[1] ?? 0.5);
  return regionLum(
    px,
    (wr.left - er.left - ox) / rw,
    (wr.top - er.top - oy) / rh,
    (wr.right - er.left - ox) / rw,
    (wr.bottom - er.top - oy) / rh,
  );
};

// Returns 0..1 brightness behind rectangle wr, ignoring the navbar itself
const backdropLum = async (wr, skipEl) => {
  const stack = document
    .elementsFromPoint((wr.left + wr.right) / 2, (wr.top + wr.bottom) / 2)
    .filter((el) => !(skipEl && skipEl.contains(el)));
  if (!stack.length) return 1;

  const hint = stack[0]
    .closest("[data-nav-theme]")
    ?.getAttribute("data-nav-theme");
  if (hint === "dark") return 0;
  if (hint === "light") return 1;

  const overlays = []; // translucent layers above the real backdrop
  let base = null;

  for (const el of stack) {
    const cs = getComputedStyle(el);
    const bi = cs.backgroundImage;
    const bg = parseRgb(cs.backgroundColor);

    if (el.tagName === "IMG") {
      base = await imageLum(el.currentSrc || el.src, el, cs, wr, false);
    } else if (el.tagName === "VIDEO" || el.tagName === "CANVAS") {
      base = 0.25;
    } else if (bi && bi.startsWith("url(")) {
      const url = (bi.match(/url\(["']?(.*?)["']?\)/) || [])[1];
      base = await imageLum(url, el, cs, wr, true);
    } else if (bi && bi !== "none") {
      const cols = [...bi.matchAll(/rgba?\([^)]+\)/g)]
        .map((m) => parseRgb(m[0]))
        .filter((c) => c && c.a > 0.3);
      if (cols.length)
        base = cols.reduce((s, c) => s + lumOf(c), 0) / cols.length;
    }
    if (base !== null) break;

    if (bg && bg.a > 0.02) {
      if (bg.a >= 0.98) {
        base = lumOf(bg);
        break;
      }
      overlays.push({ a: bg.a, l: lumOf(bg) });
    }
  }

  let l = base === null ? 1 : base; // nothing painted → the white page
  for (let i = overlays.length - 1; i >= 0; i--)
    l = overlays[i].a * overlays[i].l + (1 - overlays[i].a) * l;
  return l;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED BACKDROP SCHEDULER
// One scroll/resize/interval listener drives every navbar element, no matter
// how many of them are measuring.
// ─────────────────────────────────────────────────────────────────────────────
const toneSubscribers = new Set();
let toneRaf = 0;
let toneTimer = 0;

const runToneMeasurements = () => {
  cancelAnimationFrame(toneRaf);
  toneRaf = requestAnimationFrame(() => {
    toneSubscribers.forEach((fn) => fn());
  });
};

const subscribeTone = (fn) => {
  if (toneSubscribers.size === 0) {
    window.addEventListener("scroll", runToneMeasurements, { passive: true });
    window.addEventListener("resize", runToneMeasurements);
    toneTimer = setInterval(runToneMeasurements, 800); // late images / route changes
  }
  toneSubscribers.add(fn);
  return () => {
    toneSubscribers.delete(fn);
    if (toneSubscribers.size === 0) {
      window.removeEventListener("scroll", runToneMeasurements);
      window.removeEventListener("resize", runToneMeasurements);
      clearInterval(toneTimer);
      cancelAnimationFrame(toneRaf);
    }
  };
};

// The header element is shared through context so every child can ignore it
const HeaderRefContext = createContext(null);

// Attach the returned ref to any element. `onDark` is true when the page
// behind that element is dark (so the element should be white).
const useBackdropTone = () => {
  const ref = useRef(null);
  const headerRef = useContext(HeaderRefContext);
  const { pathname } = useLocation();
  const [onDark, setOnDark] = useState(true);

  useEffect(() => {
    let ticket = 0;
    const measure = async () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return; // hidden breakpoint
      const mine = ++ticket;
      const l = await backdropLum(rect, headerRef && headerRef.current);
      if (mine !== ticket) return; // a newer measurement is already running
      setOnDark(l < 0.55);
    };
    const unsubscribe = subscribeTone(measure);
    measure();
    return () => {
      ticket++;
      unsubscribe();
    };
  }, [headerRef, pathname]);

  return [ref, onDark];
};

const fgFor = (onDark) => (onDark ? "#fff" : "#1a1a1a");

const hoverProps = (onDark) => ({
  onMouseEnter: (e) => {
    e.currentTarget.style.background = onDark
      ? "rgba(255,255,255,0.14)"
      : "rgba(0,0,0,0.06)";
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.background = "transparent";
  },
});

// Generic navbar button/link that adapts to the backdrop.
// `style` and `children` may be functions of `onDark`.
const NavBtn = ({
  as: Tag = "button",
  className = "p-2 rounded-full transition-colors",
  style,
  children,
  noHover = false,
  ...rest
}) => {
  const [ref, onDark] = useBackdropTone();
  const extraStyle = typeof style === "function" ? style(onDark) : style;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{ color: fgFor(onDark), ...extraStyle }}
      {...(noHover ? {} : hoverProps(onDark))}
      {...rest}
    >
      {typeof children === "function" ? children(onDark) : children}
    </Tag>
  );
};

// Thin divider that adapts to the backdrop
const NavDivider = () => {
  const [ref, onDark] = useBackdropTone();
  return (
    <div
      ref={ref}
      className="w-px h-5 mx-1 flex-shrink-0 transition-colors duration-300"
      style={{
        background: onDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)",
      }}
    />
  );
};

// Logo image; gets a white chip only when sitting on a dark backdrop
const NavLogo = ({ onClick }) => {
  const [ref, onDark] = useBackdropTone();
  return (
    <div
      ref={ref}
      onClick={onClick}
      className="cursor-pointer flex-shrink-0"
    >
      <img
        src="/logo2.png"
        className={`h-10 w-10 transition-colors duration-300 ${onDark ? "bg-white" : ""}`}
        alt="logo"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
const LocationSelector = () => {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(() => {
    const saved = localStorage.getItem("selectedCityIndex");
    return saved !== null ? parseInt(saved) : 0;
  });
  const [gpsLoading, setGps] = useState(false);
  const [gpsLabel, setGpsLbl] = useState(
    () => localStorage.getItem("gpsLocation") || null,
  );
  const ref = useRef(null);
  const userId = getUserId();
  const [btnRef, onDark] = useBackdropTone();

  // Fetch existing live location on mount
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/api/users/live-location/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.liveLocation?.latitude) {
          const { latitude, longitude } = data.liveLocation;
          const str = `${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`;
          setGpsLbl(str);
          localStorage.setItem("gpsLocation", str);
          setSel(-1);
        }
      })
      .catch(() => { });
  }, [userId]);

  const updateLiveLocation = useCallback(
    async (latitude, longitude) => {
      if (!userId) return false;
      try {
        const res = await fetch(
          `${API_BASE}/api/users/live-location/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          },
        );
        const data = await res.json();
        return data.success;
      } catch {
        return false;
      }
    },
    [userId],
  );

  const handleGps = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    if (!userId) {
      alert("Please login to use location services");
      return;
    }
    setGps(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const str = `${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`;
        const ok = await updateLiveLocation(latitude, longitude);
        if (ok) {
          setGpsLbl(str);
          setSel(-1);
          localStorage.setItem("gpsLocation", str);
          localStorage.removeItem("selectedCityIndex");
        } else {
          alert("Failed to save location. Please try again.");
        }
        setGps(false);
        setOpen(false);
      },
      (err) => {
        setGps(false);
        const msgs = {
          1: "Location permission denied.",
          2: "Location unavailable.",
          3: "Location timed out.",
        };
        alert(msgs[err.code] || "Please allow location access.");
      },
    );
  }, [userId, updateLiveLocation]);

  const handleCitySelect = useCallback((i) => {
    setSel(i);
    localStorage.setItem("selectedCityIndex", i.toString());
    localStorage.removeItem("gpsLocation");
    setOpen(false);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const loc =
    sel === -1 ? { pin: "GPS", city: gpsLabel || "Current" } : CITIES[sel];

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full transition-colors"
        style={{ color: fgFor(onDark) }}
        aria-label="Change location"
        {...hoverProps(onDark)}
      >
        <PinIcon c="w-5 h-5" />
        <span
          className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full transition-colors duration-300"
          style={{ background: onDark ? "#fff" : "#000" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-60 rounded-2xl shadow-2xl z-[200] overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid rgba(111,78,55,0.15)",
          }}
        >
          <div
            className="px-4 pt-3 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(111,78,55,0.12)" }}
          >
            <ZapIcon c="w-3 h-3 text-black" />
            <div className="flex flex-col">
              <span
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: "#7a6a5a" }}
              >
                Delivering to
              </span>
              <span className="text-xs font-bold" style={{ color: "#000" }}>
                {sel === -1
                  ? gpsLabel || "Current Location"
                  : `${loc.city} — ${loc.pin}`}
              </span>
            </div>
          </div>
          <button
            onClick={handleGps}
            disabled={gpsLoading}
            className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f9f5f0]"
            style={{ borderBottom: "1px solid rgba(111,78,55,0.1)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#000,#4a3520)" }}
            >
              {gpsLoading ? (
                <LoaderIcon c="w-4 h-4 text-white" />
              ) : (
                <GpsIcon c="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold" style={{ color: "#000" }}>
                Use Current Location
              </span>
              <span className="text-[10px]" style={{ color: "#7a6a5a" }}>
                Detect via GPS
              </span>
            </div>
            {sel === -1 && !gpsLoading && (
              <CheckIcon c="w-4 h-4 ml-auto text-black" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTIONS PANEL
// ─────────────────────────────────────────────────────────────────────────────
const CollectionsPanel = ({
  show,
  onMouseEnter,
  onMouseLeave,
  navbarHeight,
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/collections`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setItems(
            res.data
              .sort((a, b) => a.order - b.order)
              .map((item) => ({
                id: item._id,
                title: item.title,
                img: fixImageUrl(item.image),
              })),
          );
        }
      })
      .catch(() => { });
  }, []);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-0 w-full z-40 transition-all duration-300"
      style={{
        top: `${navbarHeight}px`,
        background: "#f9f5f0",
        borderBottom: "1px solid rgba(111,78,55,0.15)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transform: show ? "translateY(0)" : "translateY(-10px)",
      }}
    >
      <style>{`.hide-sb::-webkit-scrollbar{display:none}`}</style>
      <div className="px-4 md:px-8 lg:px-12 py-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-5 text-black">
          Collections
        </p>
        <div
          className="hide-sb flex gap-4 md:gap-5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(`/collections/${item.id}`)}
              className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px] flex-shrink-0 cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white transition-all duration-500 shadow-[0_6px_18px_rgba(0,0,0,0.08)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.background = "#e8ddd5";
                    e.target.style.minHeight = "176px";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
              <p className="text-xs sm:text-sm font-semibold mt-2 text-center text-[#2f2f2f] tracking-tight">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MEGA MENU PANEL — dynamic from /api/users/menu
// ─────────────────────────────────────────────────────────────────────────────
const MegaMenuPanel = ({ show, onClose, navbarHeight }) => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [activeSubIdx, setActiveSubIdx] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/menu`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Reset sub-index when category changes
  const handleCatClick = (idx) => {
    setActiveCatIdx(idx);
    setActiveSubIdx(0);
  };

  const activeCat = categories[activeCatIdx];
  const activeSub = activeCat?.subcategories?.[activeSubIdx];
  const colors = activeSub?.filters?.colors || [];
  const sizes = activeSub?.filters?.sizes || [];

  const SectionLabel = ({ icon, title }) => (
    <div className="flex items-center gap-1.5 mb-3">
      {icon}
      <h3
        className="text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: "#7a6a5a" }}
      >
        {title}
      </h3>
    </div>
  );

  const Pill = ({ label, onClick, active }) => (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-[1.04] active:scale-95"
      style={{
        background: active ? "#000" : "#fff",
        color: active ? "#fff" : "#333",
        border: active ? "1.5px solid #000" : "1px solid rgba(111,78,55,0.15)",
      }}
    >
      {label}
    </button>
  );

  const ColorDot = ({ color }) => {
    const colorMap = {
      Black: "#000",
      White: "#fff",
      Red: "#e53e3e",
      Blue: "#3182ce",
      "Navy Blue": "#1a365d",
      Green: "#38a169",
      Yellow: "#d69e2e",
      Pink: "#d53f8c",
      Purple: "#805ad5",
      Orange: "#dd6b20",
      Brown: "#744210",
      Grey: "#718096",
      Gray: "#718096",
      Beige: "#d4a574",
    };
    const bg = colorMap[color] || "#ccc";
    return (
      <button
        onClick={() => navigate(`/products?color=${color}`)}
        className="flex flex-col items-center gap-1 group"
        title={color}
      >
        <span
          className="w-7 h-7 rounded-full border-2 border-white shadow transition-transform group-hover:scale-110"
          style={{ background: bg, boxShadow: "0 0 0 1.5px rgba(0,0,0,0.15)" }}
        />
        <span className="text-[9px] font-medium" style={{ color: "#555" }}>
          {color}
        </span>
      </button>
    );
  };

  return (
    <div
      className="fixed left-0 w-full z-40 transition-all duration-300"
      style={{
        top: `${navbarHeight}px`,
        background: "#f9f5f0",
        borderBottom: "1px solid rgba(111,78,55,0.15)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transform: show ? "translateY(0)" : "translateY(-10px)",
      }}
    >
      <div className="px-4 md:px-8 lg:px-12 py-7 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[rgba(111,78,55,0.2)] shadow hover:bg-[#ece5de] transition text-sm"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#7a6a5a]">
            <LoaderIcon c="w-4 h-4" /> Loading menu…
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
            {/* ── COL 1: Categories ── */}
            <div>
              <SectionLabel
                icon={<TagIcon c="w-3.5 h-3.5 text-[#7a6a5a]" />}
                title="Categories"
              />
              <div className="space-y-1">
                {categories.map((cat, i) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCatClick(i)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 text-left"
                    style={{
                      background: activeCatIdx === i ? "#000" : "transparent",
                      color: activeCatIdx === i ? "#fff" : "#1f1f1f",
                    }}
                  >
                    <span>{cat.name}</span>
                    {activeCatIdx === i && (
                      <ChevRight c="w-3.5 h-3.5 opacity-70" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── COL 2: Subcategories ── */}
            <div>
              <SectionLabel
                icon={<ChevRight c="w-3.5 h-3.5 text-[#7a6a5a]" />}
                title="Subcategories"
              />
              {activeCat?.subcategories?.length ? (
                <div className="space-y-1">
                  {activeCat.subcategories.map((sub, i) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubIdx(i);
                        navigate(`/products?subcategory=${sub.id}`);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left group"
                      style={{
                        background:
                          activeSubIdx === i
                            ? "rgba(0,0,0,0.07)"
                            : "transparent",
                        color: activeSubIdx === i ? "#000" : "#333",
                      }}
                    >
                      <span>{sub.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#7a6a5a] px-3">No subcategories</p>
              )}
            </div>

            {/* ── COL 3: Colors ── */}
            <div>
              <SectionLabel
                icon={<PaletteIcon c="w-3.5 h-3.5 text-[#7a6a5a]" />}
                title="Shop by Color"
              />

              {colors.length ? (
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
                      style={{
                        background: "#fff",
                        borderColor: "rgba(122,106,90,0.15)",
                        color: "#333",
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#7a6a5a] px-1">
                  No colors available
                </p>
              )}
            </div>

            {/* ── COL 4: Sizes ── */}
            <div>
              <SectionLabel
                icon={<RulerIcon c="w-3.5 h-3.5 text-[#7a6a5a]" />}
                title="Sizes"
              />
              {sizes.length ? (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Pill
                      key={size}
                      label={size}
                      onClick={() => navigate(`/products?size=${size}`)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#7a6a5a] px-1">
                  No sizes available
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = ({ open, onClose, navigate }) => {
  const [activeId, setActiveId] = useState("home");

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNav = (id, link) => {
    setActiveId(id);
    navigate(link);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[300] transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(3px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      <aside
        className="fixed top-0 left-0 h-full z-[400] flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: "288px",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          background: "#fff",
          borderRight: "1px solid rgba(111,78,55,0.15)",
          boxShadow: open ? "8px 0 40px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(111,78,55,0.12)" }}
        >
          <div
            onClick={() => {
              navigate("/home");
              onClose();
            }}
            className="cursor-pointer flex items-center gap-2"
          >
            <img
              src="/logo2.png"
              className="h-10 w-10"
              alt="logo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-black tracking-[0.18em] uppercase text-black">
                BRU
              </span>
              <span className="text-[13px] font-black tracking-[0.18em] uppercase -mt-[2px] text-black">
                BLA
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-[#f9f5f0]"
            style={{ color: "#333" }}
          >
            <CloseIcon c="w-5 h-5" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-3 py-3"
          style={{ scrollbarWidth: "none" }}
        >
          <p
            className="text-[9px] font-black uppercase tracking-widest px-2 mb-2"
            style={{ color: "#7a6a5a" }}
          >
            Menu
          </p>
          {SIDEBAR_LINKS.map(({ id, label, Icon, link, special }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id, link)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 mb-0.5"
                style={{
                  background: isActive
                    ? special
                      ? "linear-gradient(135deg,#000,#4a3520)"
                      : "#000"
                    : "transparent",
                  color: isActive ? "#fff" : "#333",
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.12)"
                      : special
                        ? "rgba(111,78,55,0.1)"
                        : "#f9f5f0",
                  }}
                >
                  <Icon c="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">{label}</span>
                {special && !isActive && (
                  <span
                    className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(135deg,#000,#8B6347)",
                      color: "#fff",
                    }}
                  >
                    NEW
                  </span>
                )}
                {isActive && <ChevRight c="w-4 h-4 ml-auto opacity-60" />}
              </button>
            );
          })}
        </div>

        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(111,78,55,0.12)" }}
        >
          <button
            onClick={() => {
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("authToken");
              navigate("/");
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-red-50"
            style={{ background: "#f9f5f0" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#000,#1a1a1a)",
                border: "1px solid rgba(111,78,55,0.25)",
              }}
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7"
                />
              </svg>
            </div>

            <div className="flex flex-col items-start min-w-0">
              <span className="text-xs font-bold text-black">Sign Out</span>
              <span className="text-[10px]" style={{ color: "#7a6a5a" }}>
                Sign out of your account
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CART BUTTON  (adapts to backdrop)
// ─────────────────────────────────────────────────────────────────────────────
const CartBtn = ({ count }) => (
  <NavBtn
    as={Link}
    to="/mycart"
    aria-label="View cart"
    className="relative p-2 rounded-full transition-colors"
  >
    {(onDark) => (
      <>
        <CartIcon c="w-5 h-5" />
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-sm transition-colors duration-300"
            style={{
              background: onDark ? "#fff" : "#000",
              color: onDark ? "#000" : "#fff",
            }}
          >
            {count}
          </span>
        )}
      </>
    )}
  </NavBtn>
);

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST BUTTON  (adapts to backdrop)
// ─────────────────────────────────────────────────────────────────────────────
const WishlistBtn = () => (
  <NavBtn as={Link} to="/profile/wishlists" aria-label="View wishlist">
    <HeartIcon c="w-5 h-5" />
  </NavBtn>
);

// ─────────────────────────────────────────────────────────────────────────────
// BRUBLA WORDMARK — black on light backgrounds, white on dark ones
// ─────────────────────────────────────────────────────────────────────────────
const BrublaWordmark = ({ onClick }) => {
  const [btnRef, onDark] = useBackdropTone();

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className="flex flex-col items-center leading-none select-none cursor-pointer"
    >
      <span
        className="font-black uppercase tracking-[0.25em] transition-colors duration-300"
        style={{
          fontSize: "22px",
          color: onDark ? "#fff" : "#000",
          lineHeight: 1,
        }}
      >
        BRUBLA
      </span>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MENU TOGGLE PILL (desktop) — adapts to backdrop unless the mega menu is open
// ─────────────────────────────────────────────────────────────────────────────
const MenuToggle = ({ active, onClick }) => (
  <NavBtn
    noHover
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ml-1"
    style={(onDark) => ({
      color: active ? "#fff" : fgFor(onDark),
      background: active
        ? "#000"
        : onDark
          ? "rgba(255,255,255,0.15)"
          : "#f9f5f0",
      border: active
        ? "1px solid #000"
        : onDark
          ? "1px solid rgba(255,255,255,0.25)"
          : "1px solid rgba(111,78,55,0.15)",
    })}
  >
    <MenuIcon c="w-4 h-4" />
    <span>Menu</span>
  </NavBtn>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [notifVisible, setNotifVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(100);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = getUserId();

  // Scroll listener
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Navbar height tracker
  useEffect(() => {
    const update = () => {
      if (headerRef.current) setNavbarHeight(headerRef.current.offsetHeight);
    };
    update();
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    if (headerRef.current) ro.observe(headerRef.current);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [notifVisible, scrolled]);

  // Cart count polling
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${API_BASE}/api/users/cart/${userId}`);
        const data = await res.json();
        if (data.success) setCartCount(data.cart.summary.totalItems);
      } catch { }
    };
    fetchCart();
    const id = setInterval(fetchCart, 5000);
    return () => clearInterval(id);
  }, [userId]);

  const transparent =
    !scrolled && !sidebarOpen && !openMenu && !showCollections;

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    setShowCollections(false);
    setOpenMenu(false);
  }, []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const hideRoutes = ["/login", "/register", "/mycart", "/product-details"];
  const shouldHide = hideRoutes.some((r) => location.pathname.startsWith(r));

  const TAB_PILLS = [
    { label: "Exclusive", onClick: () => navigate("/exclusiveproducts") },
    {
      label: "Collections",
      onMouseEnter: () => {
        setShowCollections(true);
        setOpenMenu(false);
      },
    },
    { label: "Men", onClick: () => navigate("/products?category=Men") },
    { label: "Women", onClick: () => navigate("/products?category=Women") },
    { label: "Kids", onClick: () => navigate("/products?category=Kids") },
    {
      label: "Sale",
      onClick: () => navigate("/products?sale=true"),
      red: true,
    },
  ];

  return (
    <HeaderRefContext.Provider value={headerRef}>
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} navigate={navigate} />
      {!shouldHide && <FloatingJoinBtn />}

      <CollectionsPanel
        show={showCollections && !openMenu}
        onMouseEnter={() => setShowCollections(true)}
        onMouseLeave={() => setShowCollections(false)}
        navbarHeight={navbarHeight}
      />

      <MegaMenuPanel
        show={openMenu}
        onClose={() => setOpenMenu(false)}
        navbarHeight={navbarHeight}
      />

      {(showCollections || openMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowCollections(false);
            setOpenMenu(false);
          }}
        />
      )}

      {/* STICKY HEADER */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[500] transition-all duration-300"
      >
        {notifVisible && <NotifBanner onClose={() => setNotifVisible(false)} />}

        <div
          className="transition-all duration-300"
          style={{
            background: "transparent",
            borderBottom: transparent
              ? "none"
              : "none",
              // : "1px solid rgba(111,78,55,0.12)",
            boxShadow: "none",
              // ? "none"
              // : scrolled
              //   ? "0 1px 4px rgba(0,0,0,0.04)"
              //   : "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {/* DESKTOP */}
          <div
            className="hidden lg:grid items-center h-16 px-8"
            style={{ gridTemplateColumns: "1fr auto 1fr" }}
          >
            {/* LEFT */}
            <div className="flex items-center gap-2">
              <NavLogo onClick={() => navigate("/home")} />
              <NavDivider />
              <NavBtn
                className="flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                onClick={() => navigate("/exclusiveproducts")}
              >
                Exclusive
              </NavBtn>
              <NavBtn
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                onMouseEnter={() => {
                  setShowCollections(true);
                  setOpenMenu(false);
                }}
              >
                Collections
                <ChevDown
                  c={`w-3 h-3 transition-transform duration-200 ${showCollections ? "rotate-180" : ""}`}
                />
              </NavBtn>
            </div>

            {/* CENTER */}
            <BrublaWordmark onClick={() => navigate("/home")} />

            {/* RIGHT */}
            <div className="flex items-center justify-end gap-0.5">
              <NavBtn onClick={openSearch} aria-label="Search">
                <SearchIcon c="w-5 h-5" />
              </NavBtn>
              <WishlistBtn />
              <CartBtn count={cartCount} />
              <LocationSelector />
              <NavBtn onClick={() => navigate("/profile")} aria-label="Profile">
                <ProfileIcon c="w-5 h-5" />
              </NavBtn>
              <MenuToggle
                active={openMenu}
                onClick={() => {
                  setOpenMenu((o) => !o);
                  setShowCollections(false);
                }}
              />
            </div>
          </div>

          {/* MOBILE */}
          <div className="lg:hidden flex items-center gap-2 px-3 md:px-5 h-14">
            <NavBtn
              onClick={openSidebar}
              className="p-2 rounded-full transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <MenuIcon c="w-5 h-5" />
            </NavBtn>
            <NavLogo onClick={() => navigate("/home")} />
            <div className="flex-1 flex justify-center">
              <BrublaWordmark onClick={() => navigate("/home")} />
            </div>
            <div className="flex items-center gap-0">
              <NavBtn onClick={openSearch} aria-label="Search">
                <SearchIcon c="w-5 h-5" />
              </NavBtn>
              <CartBtn count={cartCount} />
              <LocationSelector />
            </div>
          </div>

          {/* TABLET PILLS — only when scrolled */}
          {!transparent && (
            <div
              className="hidden md:flex lg:hidden items-center gap-1.5 px-5 pb-2.5 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {TAB_PILLS.map(({ label, red, onClick, onMouseEnter }) => (
                <button
                  key={label}
                  onClick={onClick}
                  onMouseEnter={onMouseEnter}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
                  style={{
                    border: `1.5px solid ${red ? "#000" : "rgba(111,78,55,0.18)"}`,
                    background: red ? "#000" : "#f9f5f0",
                    color: red ? "#fff" : "#000",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      {!transparent && <div style={{ height: `${navbarHeight}px` }} />}
    </HeaderRefContext.Provider>
  );
};

export default Navbar;