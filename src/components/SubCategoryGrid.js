import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK DATA (if API fails)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_SUBCATEGORIES = [];

const COFFEE = "#000";

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="break-inside-avoid overflow-hidden rounded-xl bg-gray-200 animate-pulse">
                <div className="w-full h-64 bg-gray-200" />
            </div>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SubCategoriesGrid() {
    const [hovered, setHovered] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { categoryId } = useParams();
    const navigate = useNavigate();

    // Helper function to get item count text
    const getItemCount = () => {
        const subCount = subcategories.length || 0;
        if (subCount === 0) return "Explore now";
        if (subCount === 1) return "1 item";
        if (subCount < 1000) return `${subCount} items`;
        return `${Math.floor(subCount / 1000)}.${Math.floor((subCount % 1000) / 100)}k items`;
    };

    // Helper function to get subcategory image
    const getSubcategoryImage = (subcategory) => {
        if (subcategory.image) {
            let imgUrl = subcategory.image;
            // Replace localhost with actual API host
            if (imgUrl.includes("localhost:4077")) {
                imgUrl = imgUrl.replace("http://localhost:4077", "http://31.97.228.17:4077");
            }
            return imgUrl;
        }
        // Fallback images based on subcategory name
        const fallbackImages = {
            "Jeans": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
            "Bridal Lehengar": "https://images.unsplash.com/photo-1583391733956-3750e0b4f5d6?w=600&q=80",
            "Shirts": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
            "T-Shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
            "Shoes": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
            "Dresses": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
        };
        return fallbackImages[subcategory.name] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80";
    };

    // Helper function to generate tag based on subcategory name
    const getTag = (name) => {
        const tagMap = {
            "Jeans": "Trending",
            "Bridal Lehengar": "New",
            "Shirts": "Popular",
            "T-Shirts": "Basics",
            "Shoes": "Footwear",
            "Dresses": "Fashion",
            "Kurtas": "Traditional",
            "Sarees": "Ethnic",
        };

        for (const [key, value] of Object.entries(tagMap)) {
            if (name.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        return "Explore";
    };

    // Fetch subcategories from API
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!categoryId) {
                setError("No category ID provided");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://31.97.228.17:4077/api/admin/categories/${categoryId}/subcategories`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.subcategories && data.subcategories.length > 0) {
                    // Filter only active subcategories
                    const activeSubcategories = data.subcategories.filter(sub => sub.isActive === true);
                    
                    // Set category name from response
                    if (data.category && data.category.name) {
                        setCategoryName(data.category.name);
                    }

                    const mappedSubcategories = activeSubcategories.map((sub) => ({
                        id: sub._id,
                        name: sub.name,
                        itemCount: "View products",
                        image: getSubcategoryImage(sub),
                        tag: getTag(sub.name),
                    }));

                    setSubcategories(mappedSubcategories);
                } else {
                    // No subcategories from API, use fallback
                    console.warn("No subcategories found in API response, using fallback data");
                    const fallbackMapped = FALLBACK_SUBCATEGORIES.map((sub) => ({
                        id: String(sub.id),
                        name: sub.name,
                        itemCount: sub.itemCount,
                        image: sub.image,
                        tag: sub.tag,
                    }));
                    setSubcategories(fallbackMapped);
                    if (data.category && data.category.name) {
                        setCategoryName(data.category.name);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch subcategories:", err);
                setError(err instanceof Error ? err.message : "Failed to load subcategories");
                // Use fallback data on error
                const fallbackMapped = FALLBACK_SUBCATEGORIES.map((sub) => ({
                    id: String(sub.id),
                    name: sub.name,
                    itemCount: sub.itemCount,
                    image: sub.image,
                    tag: sub.tag,
                }));
                setSubcategories(fallbackMapped);
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategories();
    }, [categoryId]);

    const handleSaveClick = (e, subcategoryId) => {
        e.stopPropagation();
        // Implement save functionality here
        console.log("Save subcategory:", subcategoryId);
    };

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="max-w-9xl mx-auto mb-8">
                    <p className="text-xs uppercase tracking-[0.3em] text-coffee mb-2" style={{ color: COFFEE }}>
                        Browse by
                    </p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                        {categoryName ? `${categoryName} Subcategories` : "Subcategories"}
                    </h1>
                    <div className="mt-3 h-[2px] w-20 bg-coffee" style={{ backgroundColor: COFFEE }} />
                    {categoryName && (
                        <button
                            onClick={() => navigate("/category")}
                            className="mt-4 text-sm text-gray-600 hover:text-coffee transition-colors flex items-center gap-2"
                        >
                            ← Back to Categories
                        </button>
                    )}
                </div>

                {/* Masonry Layout */}
                {loading ? (
                    <LoadingSkeleton />
                ) : subcategories.length > 0 ? (
                    <div className="max-w-9xl mx-auto columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {subcategories.map((sub) => (
                            <div
                                key={sub.id}
                                className="relative break-inside-avoid overflow-hidden rounded-xl cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300"
                                onMouseEnter={() => setHovered(sub.id)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => navigate(`/category/subcategory/${sub.id}`)}
                            >
                                {/* Image Wrapper */}
                                <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] lg:h-[320px] overflow-hidden bg-gray-100">
                                    {/* Image */}
                                    <img
                                        src={sub.image}
                                        alt={sub.name}
                                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                                        loading="lazy"
                                        draggable={false}
                                        onError={(e) => {
                                            e.target.src =
                                                "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image";
                                        }}
                                    />
                                </div>

                                {/* Overlay - Light gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent group-hover:from-gray-900/70 transition duration-300" />

                                {/* Tag */}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className="text-[10px] px-2 py-1 font-semibold uppercase rounded-md shadow-sm"
                                        style={{ backgroundColor: COFFEE, color: "#fff" }}
                                    >
                                        {sub.tag}
                                    </span>
                                </div>

                                

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900/80 to-transparent">
                                    <h2 className="text-white text-base sm:text-lg font-bold tracking-tight">
                                        {sub.name.replace(/-/g, " ")}
                                    </h2>
                                    <p className="text-gray-200 text-[10px] sm:text-xs mt-0.5">
                                        {sub.itemCount}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* No subcategories found */
                    <div className="max-w-9xl mx-auto text-center py-16">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Subcategories Found</h3>
                        <p className="text-gray-500 mb-6">No subcategories are available in this category at the moment.</p>
                        <button
                            onClick={() => navigate("/category")}
                            className="px-6 py-2 bg-coffee text-white rounded-md hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: COFFEE }}
                        >
                            Browse Categories
                        </button>
                    </div>
                )}

                {/* Error message (silent fallback, no UI change) */}
                {error && !loading && subcategories.length === 0 && (
                    <div className="text-center text-red-500 text-sm mt-8">
                        Unable to load subcategories. Please try again later.
                    </div>
                )}
            </div>
        </>
    );
}