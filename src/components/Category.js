import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK DATA (USED ONLY IF API FAILS)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_CATEGORIES = [
  {
    id: "1",
    name: "Women",
    productCount: 124,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Men",
    productCount: 98,
    image:
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300&h=300&fit=crop",
  },
  {
    id: "3",
    name: "Kids",
    productCount: 76,
    image:
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Accessories",
    productCount: 203,
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ARROW ICONS
// ─────────────────────────────────────────────────────────────────────────────
const ChevRight = ({ color = "#000", size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ChevLeft = ({ color = "#000", size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// CIRCULAR CATEGORY CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CategoryCard = ({ cat, index, onClick, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fallbackImage = `https://placehold.co/400x400/111111/f5f5f5?font=playfair-display&text=${encodeURIComponent(
    cat.name.charAt(0),
  )}`;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 cursor-pointer transition-all duration-500 group"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) ${index * 0.05}s, transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) ${index * 0.05}s`,
      }}
    >
      {/* Circular Image Container */}
      <div
        className={`relative overflow-hidden rounded-full mx-auto transition-all duration-400 ${
          hovered ? "shadow-xl scale-[1.02]" : "shadow-md scale-100"
        }`}
        style={{
          width: isMobile ? "110px" : "140px",
          height: isMobile ? "110px" : "140px",
        }}
      >
        <img
          src={imgError ? fallbackImage : cat.image}
          alt={cat.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
          style={{ transform: hovered ? "scale(1.1)" : "scale(1)" }}
          loading="lazy"
          draggable={false}
          onError={() => setImgError(true)}
        />

        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </div>

      {/* Category Name & Count */}
      <div
        className={`mt-3 text-center transition-all duration-300 ${hovered ? "transform -translate-y-0.5" : ""}`}
      >
        <h3
          className={`font-bold text-sm md:text-base tracking-tight transition-colors duration-200 ${
            hovered ? "text-black" : "text-gray-800"
          }`}
        >
          {cat.name}
        </h3>
        <p
          className={`text-[11px] font-medium transition-all duration-200 ${
            hovered ? "text-gray-800 opacity-80" : "text-gray-800 opacity-60"
          }`}
        >
          {cat.productCount} {cat.productCount === 1 ? "Product" : "Products"}
        </p>
      </div>

      {/* Accent Ring on Hover */}
      <div
        className={`absolute rounded-full pointer-events-none transition-all duration-300 ${
          hovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          top: "-4px",
          left: "-4px",
          right: "-4px",
          bottom: "-4px",
          border: `2px solid ${cat.accent || "#000"}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL ARROW BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const ScrollBtn = ({ dir, onClick, visible }) => (
  <button
    onClick={onClick}
    aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
    className={`flex-shrink-0 flex items-center justify-center transition-all duration-200
               hover:scale-110 active:scale-95 rounded-full bg-white border border-gray-200 shadow-sm
               ${visible ? "opacity-100 cursor-pointer" : "opacity-30 cursor-not-allowed"}`}
    style={{ width: "36px", height: "36px" }}
    disabled={!visible}
  >
    {dir === "left" ? (
      <ChevLeft color="#000" size={14} />
    ) : (
      <ChevRight color="#000" size={14} />
    )}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="flex gap-3 sm:gap-5 overflow-x-auto px-4 sm:px-6 lg:px-8">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex-shrink-0 text-center">
        <div
          className="rounded-full bg-gray-200 animate-pulse"
          style={{ width: "140px", height: "140px" }}
        />
        <div className="mt-3 space-y-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mx-auto" />
          <div className="h-2 bg-gray-100 rounded animate-pulse w-16 mx-auto" />
        </div>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT - Category Section (Circular Cards)
// ─────────────────────────────────────────────────────────────────────────────
export default function CategorySection() {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [headerVis, setHeaderVis] = useState(false);
  const headerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ── Auto-scroll control refs (mobile only) ─────────────────────────────
  const pauseAutoScrollRef = useRef(null);
  const scheduleResumeRef = useRef(null);
  const isPausedRef = useRef(false);

  // Helper: Generate consistent accent color
  const getAccentColor = (name) => {
    const colors = [
      "#1a1a1a",
      "#c0392b",
      "#2980b9",
      "#27ae60",
      "#8e44ad",
      "#d35400",
      "#2c3e50",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper: Estimate product count from subcategories
  const getProductCount = (category) => {
    const subCount = category.subcategories?.length || 0;
    return subCount;
  };

  // Helper: Get image for category
  const getCategoryImage = (category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      const imgUrl = category.subcategories[0].image;
      if (imgUrl) {
        if (imgUrl.includes("localhost:4077")) {
          return imgUrl.replace(
            "http://localhost:4077",
            "http://31.97.228.17:4077",
          );
        }
        return imgUrl;
      }
    }
    const fallbacks = {
      Men: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300&h=300&fit=crop",
      Women:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=300&fit=crop",
      Womenn:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=300&fit=crop",
      Kids: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop",
    };
    return (
      fallbacks[category.name] ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop"
    );
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "http://31.97.228.17:4077/api/admin/categories",
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.success && data.categories && data.categories.length > 0) {
          const activeCategories = data.categories.filter(
            (cat) => cat.isActive === true,
          );

          const mappedCategories = activeCategories.map((cat) => ({
            id: cat._id,
            name: cat.name === "Womenn" ? "Women" : cat.name,
            productCount: getProductCount(cat),
            image: getCategoryImage(cat),
            accent: getAccentColor(cat.name),
          }));

          setCategories(mappedCategories);
        } else {
          const fallbackMapped = FALLBACK_CATEGORIES.map((cat) => ({
            ...cat,
            accent: getAccentColor(cat.name),
          }));
          setCategories(fallbackMapped);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load categories",
        );
        const fallbackMapped = FALLBACK_CATEGORIES.map((cat) => ({
          ...cat,
          accent: getAccentColor(cat.name),
        }));
        setCategories(fallbackMapped);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Detect mobile for scroll adjustments
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Header entrance animation
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHeaderVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Update scroll button visibility
  const updateScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const threshold = 4;
    setCanLeft(el.scrollLeft > threshold);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - threshold);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    window.addEventListener("resize", updateScroll);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [categories, updateScroll]);

  // ── Mobile-only continuous auto-scroll ─────────────────────────────────
  useEffect(() => {
    if (!isMobile) return;
    if (loading) return;
    if (!categories || categories.length === 0) return;

    const el = trackRef.current;
    if (!el) return;

    const SPEED = 0.6; // px per frame (~36px/sec) – slow & smooth
    const RESUME_DELAY = 2000; // 2s after user stops interacting

    let paused = false;
    let resumeTimer = null;
    let rafId = null;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      if (!paused) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          if (el.scrollLeft >= maxScroll - 1) {
            el.scrollLeft = 0; // loop back to start
          } else {
            el.scrollLeft += SPEED;
          }
        }
      }
      rafId = requestAnimationFrame(step);
    };

    // Expose control functions via refs so touch handlers can call them
    pauseAutoScrollRef.current = () => {
      paused = true;
      isPausedRef.current = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    };

    scheduleResumeRef.current = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        isPausedRef.current = false;
      }, RESUME_DELAY);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (resumeTimer) clearTimeout(resumeTimer);
      pauseAutoScrollRef.current = null;
      scheduleResumeRef.current = null;
    };
  }, [isMobile, loading, categories]);

  const scrollBy = useCallback(
    (dir) => {
      const el = trackRef.current;
      if (!el) return;
      const cardWidth = 140;
      const gap = isMobile ? 12 : 20;
      const scrollAmount = (cardWidth + gap) * (isMobile ? 2 : 3);
      el.scrollBy({
        left: dir === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    },
    [isMobile],
  );

  const handleCategoryClick = useCallback(
    (category) => {
      navigate(`/category/${category.id}`, {
        state: { categoryName: category.name },
      });
    },
    [navigate],
  );

  return (
    <section
      className="w-full py-10 md:py-12 bg-white overflow-hidden"
      aria-label="Shop by Category"
    >
      <style>{`
    .category-track::-webkit-scrollbar { display: none; }
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
            headerVis
              ? "opacity-100 translate-y-0"
              : "opacity-100 translate-y-3",
          ].join(" ")}
        >
          <div>
            <h2
              className="text-[14px] font-medium text-[#1a1a1a] tracking-wide"
              style={{
                fontSize: "clamp(26px,4.5vw,44px)",
                fontFamily: "Georgia,'Times New Roman',serif",
                letterSpacing: "-0.02em",
              }}
            >
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {categories.length > 4 && (
              <>
                <ScrollBtn
                  dir="left"
                  onClick={() => scrollBy("left")}
                  visible={canLeft}
                />
                <ScrollBtn
                  dir="right"
                  onClick={() => scrollBy("right")}
                  visible={canRight}
                />
              </>
            )}
            <button
              onClick={() => navigate("/category")}
              className="hidden sm:flex items-center gap-0.5 text-[12px] text-[#999] hover:text-[#1a1a1a] transition-colors duration-200 ml-2"
            >
              View all
              <ChevRight color="#999" size={11} />
            </button>
          </div>
        </div>

        {/* CATEGORY TRACK */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div
              ref={trackRef}
              className="category-track flex gap-3 overflow-x-auto"
              style={{
                paddingLeft: isMobile ? "clamp(16px,2vw,32px)" : "clamp(16px,2vw,32px)",
                paddingRight: isMobile ? "clamp(16px,2vw,32px)" : "clamp(16px,2vw,32px)",
                paddingBottom: "8px",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                // Disable snap on mobile so it doesn't fight auto-scroll
                scrollSnapType: isMobile ? "none" : "x mandatory",
                touchAction: "pan-x",
              }}
              onTouchStart={() => pauseAutoScrollRef.current?.()}
              onTouchEnd={() => scheduleResumeRef.current?.()}
              onTouchCancel={() => scheduleResumeRef.current?.()}
              onMouseDown={() => pauseAutoScrollRef.current?.()}
              onMouseUp={() => scheduleResumeRef.current?.()}
              onMouseLeave={() => scheduleResumeRef.current?.()}
            >
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  className="flex-shrink-0"
                  style={{ scrollSnapAlign: isMobile ? "none" : "start" }}
                >
                  <CategoryCard
                    cat={cat}
                    index={i}
                    onClick={() => handleCategoryClick(cat)}
                    isMobile={isMobile}
                  />
                </div>
              ))}
              <div className="min-w-2 flex-shrink-0" />
            </div>

            {/* MOBILE VIEW ALL */}
            <div className="sm:hidden flex justify-center mt-5 px-4">
              <button
                onClick={() => navigate("/category")}
                className="text-[13px] text-[#999] underline underline-offset-4 hover:text-[#1a1a1a] transition-colors"
              >
                View all categories
              </button>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && !loading && categories.length === 0 && (
          <div className="text-center text-red-500 text-sm mt-4 py-4">
            Unable to load categories. Please check your connection.
          </div>
        )}
      </div>
    </section>
  );
}