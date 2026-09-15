import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────
   API CONFIGURATION
───────────────────────────── */

const API_BASE_URL = "http://31.97.228.17:4077";
const BANNER_API_ENDPOINT = `${API_BASE_URL}/api/admin/homepage/banner`;

/* ─────────────────────────────
   HOOK
───────────────────────────── */

const useCarousel = (count, autoMs) => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const next = useCallback(() => {
    if (count === 0) return;
    setCur((c) => (c + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count === 0) return;
    if (!paused) timer.current = setInterval(next, autoMs);
    return () => clearInterval(timer.current);
  }, [paused, next, autoMs, count]);

  return {
    cur,
    next,
    prev: () => setCur((c) => (c - 1 + count) % count),
    goTo: setCur,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  };
};

/* ─────────────────────────────
   RESPONSIVE BANNER STRIP
───────────────────────────── */

const BannerStrip = ({ banner, onCtaClick }) => {
  const hasRedirect = Boolean(banner.redirectionLink);

  /* Handle banner click: use redirectionLink if present */
  const handleBannerClick = (e) => {
    if (!hasRedirect) {
      // No redirectionLink → prevent "#" navigation, do nothing
      e.preventDefault();
      return;
    }
    // If link is internal (starts with "/"), let router handle it
    // For external URLs, allow the anchor's default behavior
    if (banner.redirectionLink.startsWith("/")) {
      e.preventDefault();
      // Let the parent handle via a synthetic event or call navigate
      // For simplicity, use window.location for both — but for SPA,
      // we can dispatch a custom navigation
      // (handled by parent via onClick prop if needed)
    }
    // External URLs: default anchor behavior opens them
  };

  /* CTA click: stop propagation so it doesn't trigger the anchor */
  const handleCtaClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCtaClick();
  };

  return (
    <a
      href={banner.redirectionLink || "#"}
      onClick={handleBannerClick}
      className="relative w-full h-full block"
      style={{ textDecoration: "none", color: "inherit" }}
      aria-label={banner.title || "Banner"}
    >
      {/* IMAGE */}
      <img
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full "
      />

      {/* OVERLAY */}
      <div className="absolute inset-0" style={{ background: banner.overlay || "rgba(12,12,12,0.55)" }} />

      {/* CONTENT */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">

        {/* EYEBROW / TAG */}
        {banner.tag && (
          <span
            className="text-[9px] sm:text-xs font-bold tracking-[0.2em] mb-1"
            style={{ color: banner.tagColor || "#c4bdbd" }}
          >
            {banner.tag}
          </span>
        )}

        {/* TITLE */}
        <h2 className="
          text-white 
          text-lg sm:text-xl md:text-2xl lg:text-3xl
          font-bold 
          mb-1 sm:mb-2
        ">
          {banner.title}
        </h2>

        {/* SUBTITLE */}
        {banner.subtitle && (
          <p className="
            text-white/70 
            text-[10px] sm:text-xs md:text-sm
            mb-2 sm:mb-3
            max-w-xs md:max-w-md
          ">
            {banner.subtitle}
          </p>
        )}

        {/* CTA BUTTON */}
        {banner.buttonText && (
          <button
            className="
              text-[10px] sm:text-xs md:text-sm
              px-4 py-1.5 sm:px-5 sm:py-2
              font-semibold
              transition-all
              hover:scale-105
            "
            style={{
              background: banner.ctaColor || "#000",
              color: banner.ctaTextColor || "#fff",
            }}
            onClick={handleCtaClick}
          >
            {banner.buttonText}
          </button>
        )}
      </div>
    </a>
  );
};

/* ─────────────────────────────
   MAIN COMPONENT
───────────────────────────── */

export default function FlashBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch(BANNER_API_ENDPOINT);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Filter active banners and sort by order
          const activeBanners = result.data
            .filter(banner => banner.isActive === true)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(banner => ({
              ...banner,
              // Ensure image URL is absolute
              image: banner.image.startsWith('http')
                ? banner.image
                : `${API_BASE_URL}${banner.image}`,
              // Map tag to eyebrow
              tag: banner.tag,
              // Default overlay if not provided
              overlay: banner.overlay || "rgba(12,12,12,0.55)",
              // Default colors
              tagColor: banner.tagColor || "#d1cbcb",
              ctaColor: banner.ctaColor || "#000",
              ctaTextColor: banner.ctaTextColor || "#fff",
              // Ensure all required fields exist
              title: banner.title || "Special Offer",
              subtitle: banner.subtitle || "Limited time offer",
              buttonText: banner.buttonText || "Shop Now",
              // Preserve redirectionLink (can be null)
              redirectionLink: banner.redirectionLink || null,
            }));

          setBanners(activeBanners);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(err.message);
        // Fallback to default banners if API fails
        setBanners(getDefaultBanners());
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const getDefaultBanners = () => {
    return [
      // {
      //   _id: "default-1",
      //   title: "End Of Season Sale 2024",
      //   subtitle: "Get up to 50% off on all items",
      //   tag: "New Arrivals",
      //   buttonText: "Shop Now",
      //   image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=300&fit=crop&q=85&auto=format",
      //   overlay: "rgba(12,12,12,0.55)",
      //   tagColor: "#000000",
      //   ctaColor: "#000",
      //   ctaTextColor: "#fff",
      //   order: 0,
      //   isActive: true,
      // },
      // {
      //   _id: "default-2",
      //   title: "Summer Sale 2024",
      //   subtitle: "Get up to 50% off on all items",
      //   tag: "Summer",
      //   buttonText: "Shop Now",
      //   image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=300&fit=crop&q=85&auto=format",
      //   overlay: "rgba(12,12,12,0.5)",
      //   tagColor: "#000000",
      //   ctaColor: "#000",
      //   ctaTextColor: "#fff",
      //   order: 1,
      //   isActive: true,
      // },
    ];
  };

  const { cur, next, prev, goTo, pause, resume } = useCarousel(
    banners.length,
    4000
  );

  // Get accent color from current banner
  const accent = banners[cur]?.ctaColor || "#000";

  /* CTA button always routes to /products */
  const handleCtaClick = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <div
        className="w-full relative overflow-hidden h-[300px] sm:h-[300px] md:h-[300px] bg-black flex items-center justify-center"
      >
        <div className="text-white text-center">
          <div className="inline-block w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
          <p className="text-xs">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (error && banners.length === 0) {
    return (
      <div
        className="w-full relative overflow-hidden h-[300px] sm:h-[300px] md:h-[300px] bg-black flex items-center justify-center"
      >
        <div className="text-white text-center px-4">
          <p className="text-red-400 text-sm mb-2">Failed to load banners</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div
      className="
        w-full relative overflow-hidden
        h-[200px] sm:h-[300px] md:h-[500px]
      "
      style={{ background: "#0C0C0C" }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* SLIDES */}
      {banners.map((b, i) => (
        <div
          key={b._id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === cur ? 1 : 0 }}
        >
          <BannerStrip banner={b} onCtaClick={handleCtaClick} />
        </div>
      ))}

      {/* ARROWS - only show if more than one banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center transition-all text-sm sm:text-base z-20"
            aria-label="Previous banner"
          >
            ‹
          </button>

          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center transition-all text-sm sm:text-base z-20"
            aria-label="Next banner"
          >
            ›
          </button>
        </>
      )}

      {/* DOTS - only show if more than one banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-1 transition-all rounded-full"
              style={{
                width: i === cur ? 20 : 6,
                background: i === cur ? accent : "#999",
              }}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}