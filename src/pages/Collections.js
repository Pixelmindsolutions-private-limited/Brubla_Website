import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const COFFEE = "#1B1816";

// API Configuration
const API_BASE_URL = "http://31.97.228.17:4077";
const COLLECTIONS_API_URL = `${API_BASE_URL}/api/users/collections`;

// Collection Card Component
const CollectionCard = ({ collection, index, onClick }) => {
    const [visible, setVisible] = useState(false);
    const [hovered, setHovered] = useState(false);
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
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Generate random product count for demo (or use from API if available)
    const tagline = collection.tagline ||
        (collection.tag === "summer" ? "Summer Edition" :
            collection.tag === "winter" ? "Winter Collection" : "New Arrivals");

    return (
        <div
            ref={ref}
            className="masonry-item group cursor-pointer mb-6 break-inside-avoid"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
            }}
            onClick={() => onClick(collection)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                {/* Image Container */}
                <div className="relative overflow-hidden bg-[#F5F2EB]">
                    <img
                        src={collection.image}
                        alt={collection.title}
                        className="w-full object-cover transition-transform duration-700 ease-out"
                        style={{
                            transform: hovered ? "scale(1.06)" : "scale(1)",
                            minHeight: "280px",
                            maxHeight: "500px"
                        }}
                        loading="lazy"
                    />

                    {/* Tag Overlay - Top */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                        <span className="inline-block px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm"
                            style={{ color: COFFEE, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                            {tagline}
                        </span>
                    </div>

                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0 transition-all duration-500"
                        style={{
                            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.65) 100%)",
                        }}
                    />

                    {/* Content Overlay - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                        <div
                            className="transition-all duration-300"
                            style={{
                                transform: hovered ? "translateY(-4px)" : "translateY(0)"
                            }}
                        >
                            {/* Title */}
                            <h3
                                className="font-bold text-white leading-tight mb-1 drop-shadow-md"
                                style={{
                                    fontSize: "clamp(18px, 4.5vw, 22px)",
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    letterSpacing: "-0.02em"
                                }}
                            >
                                {collection.title}
                            </h3>

                            {/* Subtitle - Capitalized tag */}
                            <p className="text-white/80 text-[10px] sm:text-[11px] font-medium tracking-wide mb-2 drop-shadow uppercase">
                                {collection.tag || "COLLECTION"}
                            </p>

                            {/* Description - Reveal on Hover */}
                            <div
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    maxHeight: hovered ? "60px" : "0",
                                    opacity: hovered ? 1 : 0,
                                }}
                            >
                                <p className="text-white/85 text-[11px] sm:text-xs leading-relaxed mb-3 drop-shadow">
                                    {collection.description}
                                </p>
                            </div>

                            {/* Explore Button */}
                            <div
                                className="flex items-center justify-between transition-all duration-300"
                                style={{
                                    opacity: hovered ? 1 : 0.85,
                                }}
                            >
                                <button
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] tracking-wide transition-all duration-300 shadow-md hover:shadow-lg"
                                    style={{
                                        background: "#FFFFFF",
                                        color: COFFEE,
                                        transform: hovered ? "translateX(0)" : "translateX(4px)",
                                    }}
                                >
                                    EXPLORE
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
    <>
        <Header />
        <div className="min-h-screen bg-[#F9F7F2]">
            <div className="relative bg-white border-b border-gray-100/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
                    <div className="animate-pulse">
                        <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
                        <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <div className="masonry-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="masonry-item mb-6 break-inside-avoid">
                            <div className="rounded-2xl overflow-hidden bg-gray-200 animate-pulse" style={{ height: "350px" }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
);

// Error Component
const ErrorState = ({ message, onRetry }) => (
    <>
        <Header />
        <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
            <div className="text-center px-4">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Collections</h3>
                <p className="text-gray-500 text-sm mb-4">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2 rounded-full font-medium transition-all hover:scale-105"
                    style={{ background: COFFEE, color: "#fff" }}
                >
                    Try Again
                </button>
            </div>
        </div>
    </>
);

// Main All Collections Page
export default function AllCollections() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heroVisible, setHeroVisible] = useState(false);

    // Fetch collections from API
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const response = await fetch(COLLECTIONS_API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    // Transform API data to match component structure
                    const transformedData = result.data
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((item) => ({
                            id: item._id,
                            title: item.title,
                            tag: item.tag || "collection",
                            description: item.description,
                            image: item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`,
                            order: item.order,
                            // Add additional fields for UI
                            tagline: item.tag === "summer" ? "Summer Edition" :
                                item.tag === "winter" ? "Winter Collection" : "New Arrivals",
                        }));

                    setCollections(transformedData);
                } else {
                    throw new Error('Invalid API response structure');
                }
            } catch (err) {
                console.error('Error fetching collections:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
        setHeroVisible(true);
    }, []);

    const handleCollectionClick = (collection) => {
        navigate(`/collections/${collection.id}`, { state: { collection } });
    };

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        window.location.reload();
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={handleRetry} />;
    }

    if (collections.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
                    <div className="text-center px-4">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Collections Found</h3>
                        <p className="text-gray-500 text-sm">Check back later for new collections</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-[#F9F7F2]">
                {/* Global Styles */}
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
          
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
          
          .masonry-grid {
            column-count: 1;
            column-gap: 1.5rem;
          }
          
          @media (min-width: 640px) {
            .masonry-grid {
              column-count: 2;
            }
          }
          
          @media (min-width: 1024px) {
            .masonry-grid {
              column-count: 3;
            }
          }
          
          @media (min-width: 1280px) {
            .masonry-grid {
              column-count: 4;
            }
          }
          
          .masonry-item {
            break-inside: avoid;
            margin-bottom: 1.5rem;
          }
          
          @media (max-width: 640px) {
            button, .cursor-pointer {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}</style>

                {/* Hero Section */}
                <div className="relative bg-white border-b border-gray-100/80">
                    {/* Subtle background texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #1B1816 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
                        {/* Back button */}
                        <button
                            onClick={() => navigate('/home')}
                            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#1B1816] transition-colors mb-6 sm:mb-8 text-xs sm:text-sm group"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                            Back to home
                        </button>

                        <div
                            className="text-left md:text-center"
                            style={{
                                opacity: heroVisible ? 1 : 0,
                                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                                transition: "opacity 0.6s ease, transform 0.6s ease"
                            }}
                        >
                            {/* Collections Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EB] mb-4 md:mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1B1816]" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#1B1816]/70">
                                    {new Date().getFullYear()} Collection
                                </span>
                            </div>

                            {/* Title */}
                            <h1
                                className="fd font-black text-[#1B1816] mb-3"
                                style={{ fontSize: "clamp(32px, 8vw, 56px)", letterSpacing: "-0.02em" }}
                            >
                                Collections
                            </h1>

                            {/* Separator */}
                            <div className="w-12 h-px bg-[#1B1816]/20 mx-0 md:mx-auto mb-4" />

                            {/* Description */}
                            <p className="text-gray-500 fs text-sm sm:text-base max-w-lg mx-0 md:mx-auto">
                                Discover carefully curated collections, each telling a unique story of craftsmanship and elegance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pinterest Masonry Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                    <div className="masonry-grid">
                        {collections.map((collection, idx) => (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                                index={idx}
                                onClick={handleCollectionClick}
                            />
                        ))}
                    </div>

                    {/* Collections Count */}
                    <div className="flex justify-center mt-10 md:mt-14">
                        <div className="flex items-center gap-3 text-[#1B1816]/40 text-[10px] font-medium uppercase tracking-wider">
                            <span className="w-8 h-px bg-[#1B1816]/20"></span>
                            {collections.length} Collections
                            <span className="w-8 h-px bg-[#1B1816]/20"></span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}