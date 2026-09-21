import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

const COFFEE = "#000";
const API_BASE = "http://31.97.228.17:4077";

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Normalise image URLs: replace localhost:4077 with the real host.
 */
const normaliseUrl = (url) => {
    if (!url) return null;
    return url.replace(/https?:\/\/localhost:4077/g, API_BASE);
};

/**
 * Return the best available product image.
 */
const getProductImage = (product) => {
    if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
            if (variant.mainImage && variant.mainImage.trim() !== "") {
                return normaliseUrl(variant.mainImage);
            }
        }
        for (const variant of product.variants) {
            if (variant.images && variant.images.length > 0) {
                return normaliseUrl(variant.images[0]);
            }
        }
    }
    if (product.mainImages && product.mainImages.length > 0) {
        return normaliseUrl(product.mainImages[0]);
    }
    return "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image";
};

const getUniqueSizesFromProducts = (products) => {
    const sizesSet = new Set();
    products.forEach((product) => {
        if (product.availableSizes && product.availableSizes.length > 0) {
            product.availableSizes.forEach((size) => sizesSet.add(size));
        }
    });
    return Array.from(sizesSet).sort();
};

const toINR = (usd) => {
    if (!usd) return "0";
    return (usd * 83).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

// Get userId from sessionStorage
const getUserId = () => {
    try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        return user?.id || null;
    } catch {
        return null;
    }
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const COLOR_GROUPS = [
    { label: "Blues", colors: ["#3b82f6", "#1d4ed8", "#93c5fd"] },
    { label: "Browns", colors: ["#92400e", "#b45309", "#d97706"] },
    { label: "Greens", colors: ["#16a34a", "#4ade80", "#166534"] },
    { label: "Neutrals", colors: ["#374151", "#9ca3af", "#f3f4f6"] },
    { label: "Purples", colors: ["#7c3aed", "#a855f7", "#c4b5fd"] },
    { label: "Reds", colors: ["#dc2626", "#f87171", "#991b1b"] },
];

// ─── URL helpers ──────────────────────────────────────────────────────────────
function parseFiltersFromParams(searchParams) {
    return {
        sizes: searchParams.getAll("size"),
        types: searchParams.getAll("type"),
        colors: searchParams.getAll("color"),
        availability: searchParams.get("availability") || "all",
    };
}

function updateUrlParams(searchParams, filters, setSearchParams) {
    const newParams = new URLSearchParams();
    filters.sizes.forEach((s) => newParams.append("size", s));
    filters.types.forEach((t) => newParams.append("type", t));
    filters.colors.forEach((c) => newParams.append("color", c));
    if (filters.availability !== "all")
        newParams.set("availability", filters.availability);
    setSearchParams(newParams, { replace: true });
}

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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
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
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
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
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
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
                                            ₹{toINR(getPrice())}
                                        </span>
                                        {getActualPrice() > getPrice() && (
                                            <span className="text-xs text-gray-400 line-through ml-2">
                                                ₹{toINR(getActualPrice())}
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
                                        ₹{toINR(getPrice() * quantity)}
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
                        {addingToCart ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        )}
                        {addingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── HeartIcon ─────────────────────────────────────────────────────────────
function HeartIcon({ saved, onToggle }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className="
                absolute top-3 right-3 z-10
                w-8 h-8 flex items-center justify-center
                rounded-full transition-all duration-200
                hover:scale-110
            "
            style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(4px)"
            }}
            aria-label="Wishlist"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={saved ? "#ef4444" : "none"}
                stroke={saved ? "#ef4444" : COFFEE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-200"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
    );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ onClick, product, onAddToCart }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [wishlist, setWishlist] = useState([]);
    const userId = getUserId();

    // Get images
    let productImages = [];

    if (product.mainImages?.length > 0) {
        productImages = product.mainImages;
    } else if (product.variants?.length > 0) {
        const variantMainImages = product.variants
            .map((v) => v.mainImage)
            .filter(Boolean);
        if (variantMainImages.length > 0) {
            productImages = variantMainImages;
        } else {
            productImages = product.variants.flatMap((v) => v.images || []);
        }
    }

    productImages = productImages.map((img) => normaliseUrl(img));

    if (productImages.length === 0) {
        productImages = ["https://placehold.co/600x800/e5e7eb/64748b?text=No+Image"];
    }

    // Auto slide
    useEffect(() => {
        if (productImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [productImages.length]);

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

    const productImage = productImages[currentImageIndex];
    const discount = product.maxDiscount ||
        (product.displayActualPrice > product.displayPrice
            ? Math.round(((product.displayActualPrice - product.displayPrice) / product.displayActualPrice) * 100)
            : null);
    const inStock = product.totalStock > 0;

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-100">
                <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = "https://placehold.co/600x800/e5e7eb/64748b?text=No+Image";
                    }}
                />

                <HeartIcon
                    saved={wishlist.includes(product._id)}
                    onToggle={() => toggleWishlist(product._id)}
                />

                {!inStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 border border-gray-400 px-3 py-1 rounded-full">
                            Sold Out
                        </span>
                    </div>
                )}

                {productImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {productImages.map((_, idx) => (
                            <span
                                key={idx}
                                className={`transition-all duration-300 rounded-full ${
                                    idx === currentImageIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"
                                }`}
                            />
                        ))}
                    </div>
                )}

                {discount && inStock && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{discount}%
                        </span>
                    </div>
                )}

                {inStock && (
                    <div className="absolute z-20 bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            className="w-full py-3 text-xs font-semibold tracking-widest uppercase text-white transition-colors"
                            style={{ backgroundColor: COFFEE }}
                        >
                            Add to Cart
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                        {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">
                            ₹{toINR(product.displayPrice)}
                        </span>
                        {product.displayActualPrice > product.displayPrice && (
                            <span className="text-xs text-gray-400 line-through">
                                ₹{toINR(product.displayActualPrice)}
                            </span>
                        )}
                        {discount && (
                            <span className="text-xs text-green-600 font-medium">
                                -{discount}%
                            </span>
                        )}
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

                    {product.subcategoryName && (
                        <p className="text-xs text-gray-400 mt-1 capitalize">
                            {product.subcategoryName}
                        </p>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    className="flex-shrink-0 w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all duration-200 text-gray-700"
                    style={{ fontSize: 18, lineHeight: 1 }}
                >
                    +
                </button>
            </div>
        </div>
    );
}

// ─── FilterSection ───────────────────────────────────────────────────────────
function FilterSection({ title, children }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 py-5">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between text-left"
            >
                <span className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                    {title}
                </span>
                <span className="text-gray-400 text-lg leading-none">
                    {open ? "−" : "+"}
                </span>
            </button>
            {open && <div className="mt-4">{children}</div>}
        </div>
    );
}

// ─── FilterDrawer ─────────────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onApply, availableSizes }) {
    const totalActive =
        filters.sizes.length +
        filters.types.length +
        filters.colors.length +
        (filters.availability !== "all" ? 1 : 0);

    function toggleArr(key, val) {
        setFilters((f) => ({
            ...f,
            [key]: f[key].includes(val)
                ? f[key].filter((x) => x !== val)
                : [...f[key], val],
        }));
    }

    function clearAll() {
        setFilters({ sizes: [], types: [], colors: [], availability: "all" });
    }

    function handleApply() {
        onApply(filters);
        onClose();
    }

    return (
        <>
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                style={{ background: "rgba(0,0,0,0.25)" }}
                onClick={onClose}
            />

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
                            Filter
                        </p>
                        <p className="text-sm text-gray-500">
                            {totalActive > 0
                                ? `${totalActive} active filter${totalActive > 1 ? "s" : ""}`
                                : "All products"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6">
                    <FilterSection title="Size">
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => toggleArr("sizes", s)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${filters.sizes.includes(s)
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </FilterSection>

                    <FilterSection title="Availability">
                        <div className="flex gap-2 flex-wrap">
                            {["all", "inStock", "outOfStock"].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setFilters((f) => ({ ...f, availability: v }))}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${filters.availability === v
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    {v === "all" ? "All" : v === "inStock" ? "In stock" : "Out of stock"}
                                </button>
                            ))}
                        </div>
                    </FilterSection>

                    <FilterSection title="Color">
                        <div className="grid grid-cols-2 gap-3">
                            {COLOR_GROUPS.map((g) => (
                                <button
                                    key={g.label}
                                    onClick={() => toggleArr("colors", g.label)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-150 ${filters.colors.includes(g.label)
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    <div className="flex -space-x-1">
                                        {g.colors.map((c, i) => (
                                            <div key={i} className="w-4 h-4 rounded-full border-2 border-white" style={{ background: c }} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">{g.label}</span>
                                </button>
                            ))}
                        </div>
                    </FilterSection>
                </div>

                <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
                    <button
                        onClick={clearAll}
                        className="flex-1 py-3 rounded-full border border-gray-300 text-xs font-semibold tracking-widest uppercase text-gray-700 hover:border-gray-500 transition-colors"
                    >
                        Remove All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-3 rounded-full text-white text-xs font-semibold tracking-widest uppercase transition-colors"
                        style={{ backgroundColor: COFFEE }}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-[3/4]" />
                    <div className="mt-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Empty / Error states ─────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Products</h2>
                <p className="text-gray-500 mb-6 text-sm">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ backgroundColor: COFFEE }}
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}

function EmptyState({ onReset }) {
    return (
        <div className="py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-gray-700 mb-2">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your category or filters</p>
            <button
                onClick={onReset}
                className="mt-5 px-6 py-2.5 rounded-full text-white text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-80"
                style={{ backgroundColor: COFFEE }}
            >
                Reset
            </button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AllProducts() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);

    const [activeCategory, setActiveCategory] = useState("View all");
    const [categories, setCategories] = useState(["View all"]);
    const [availableSizes, setAvailableSizes] = useState(ALL_SIZES);

    const [filterOpen, setFilterOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        sizes: [], types: [], colors: [], availability: "all",
    });
    const [filters, setFilters] = useState(() => parseFiltersFromParams(searchParams));

    // Cart modal state
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [toast, setToast] = useState(null);

    const navRef = useRef(null);
    const userId = getUserId();

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch products
    useEffect(() => {
        let cancelled = false;

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const response = await fetch(`${API_BASE}/api/admin/products`, {
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Server error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (cancelled) return;

                if (!data || typeof data !== "object") {
                    throw new Error("Invalid response format from server.");
                }
                if (data.success === false) {
                    throw new Error(data.message || "API returned success: false.");
                }

                const rawProducts = Array.isArray(data.products) ? data.products : [];
                const activeProducts = rawProducts.filter((p) => p.isActive === true);

                setProducts(activeProducts);

                const catSet = new Set(["View all"]);
                activeProducts.forEach((p) => {
                    if (p.subcategoryName) catSet.add(p.subcategoryName);
                    if (p.categoryId?.name) catSet.add(p.categoryId.name);
                });
                setCategories(Array.from(catSet));

                const sizes = getUniqueSizesFromProducts(activeProducts);
                setAvailableSizes(sizes.length > 0 ? sizes : ALL_SIZES);
            } catch (err) {
                if (cancelled) return;
                const isAbort = err.name === "AbortError";
                setError(
                    isAbort
                        ? "Request timed out. Please check your connection and try again."
                        : err.message || "An unexpected error occurred."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, [retryKey]);

    // Sync URL → filter state
    useEffect(() => {
        setFilters(parseFiltersFromParams(searchParams));
    }, [searchParams]);

    // Sync URL → active category
    useEffect(() => {
        const cat = searchParams.get("category");
        if (cat && categories.includes(cat)) {
            setActiveCategory(cat);
        } else if (!cat) {
            setActiveCategory("View all");
        }
    }, [searchParams, categories]);

    // Mouse-drag scroll on category bar
    useEffect(() => {
        const el = navRef.current;
        if (!el) return;
        let isDown = false, startX, scrollLeft;
        const onDown = (e) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
        const onUp = () => { isDown = false; };
        const onLeave = () => { isDown = false; };
        const onMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            el.scrollLeft = scrollLeft - (x - startX);
        };
        el.addEventListener("mousedown", onDown);
        el.addEventListener("mouseup", onUp);
        el.addEventListener("mouseleave", onLeave);
        el.addEventListener("mousemove", onMove);
        return () => {
            el.removeEventListener("mousedown", onDown);
            el.removeEventListener("mouseup", onUp);
            el.removeEventListener("mouseleave", onLeave);
            el.removeEventListener("mousemove", onMove);
        };
    }, []);

    // Add to cart handlers
    const handleAddToCart = (product) => {
        setSelectedProduct(product);
        setShowVariantModal(true);
    };

    const addToCartWithVariant = async (product, variantData) => {
        if (!userId) {
            showToast("Please login to add items to cart", "error");
            return;
        }
        
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
    const filtered = products.filter((p) => {
        if (activeCategory !== "View all") {
            const productCat = p.subcategoryName || p.categoryId?.name;
            if (productCat !== activeCategory) return false;
        }

        const inStock = p.totalStock > 0;
        if (filters.availability === "inStock" && !inStock) return false;
        if (filters.availability === "outOfStock" && inStock) return false;

        if (filters.sizes.length > 0) {
            const productSizes = p.availableSizes || [];
            if (!filters.sizes.some((s) => productSizes.includes(s))) return false;
        }

        if (filters.colors.length > 0) {
            const productColors = (p.availableColors || []).map((c) => c.toLowerCase());
            const hasColor = filters.colors.some((colorGroup) =>
                productColors.some((c) => c.includes(colorGroup.toLowerCase()))
            );
            if (!hasColor && productColors.length > 0) return false;
        }

        return true;
    });

    const activeFilterCount =
        filters.sizes.length +
        filters.types.length +
        filters.colors.length +
        (filters.availability !== "all" ? 1 : 0);

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        const newParams = new URLSearchParams(searchParams);
        if (cat === "View all") {
            newParams.delete("category");
        } else {
            newParams.set("category", cat);
        }
        setSearchParams(newParams, { replace: true });
    };

    const handleApplyFilters = (newFilters) => {
        updateUrlParams(searchParams, newFilters, setSearchParams);
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        const empty = { sizes: [], types: [], colors: [], availability: "all" };
        updateUrlParams(searchParams, empty, setSearchParams);
        setFilters(empty);
    };

    const handleResetAll = () => {
        handleClearFilters();
        setActiveCategory("View all");
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    const openFilterDrawer = () => {
        setTempFilters(filters);
        setFilterOpen(true);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                    * { box-sizing: border-box; }
                    ::-webkit-scrollbar { height: 4px; width: 4px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    @keyframes scaleIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
                `}</style>

                {/* Sticky top bar */}
                <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3 py-3">
                            <div ref={navRef} className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar select-none">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 whitespace-nowrap ${
                                            activeCategory === cat
                                                ? "text-white border-transparent"
                                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                        }`}
                                        style={activeCategory === cat ? { backgroundColor: COFFEE } : {}}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-shrink-0">
                                <button
                                    onClick={openFilterDrawer}
                                    className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold tracking-wide text-gray-700 hover:border-gray-400 transition-all duration-200 whitespace-nowrap"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                    </svg>
                                    <span className="hidden sm:inline">Advance Filters</span>
                                    <span className="sm:hidden">Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ backgroundColor: COFFEE }}>
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : error && products.length === 0 ? (
                        <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                                <p className="text-xs text-gray-400 uppercase tracking-widest">
                                    {filtered.length}{" "}
                                    <span className="text-gray-600">Product{filtered.length !== 1 ? "s" : ""}</span>
                                </p>
                                {activeFilterCount > 0 && (
                                    <button onClick={handleClearFilters} className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors">
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            {filtered.length === 0 ? (
                                <EmptyState onReset={handleResetAll} />
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                                    {filtered.map((product) => (
                                        <ProductCard
                                            key={product._id || product.id}
                                            product={product}
                                            onClick={() => navigate(`/product/${product._id || product.id}`)}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Filter drawer */}
                <FilterDrawer
                    open={filterOpen}
                    onClose={() => setFilterOpen(false)}
                    filters={tempFilters}
                    setFilters={setTempFilters}
                    onApply={handleApplyFilters}
                    availableSizes={availableSizes}
                />

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
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
                            toast.type === "success" ? "bg-black text-white" : "bg-red-500 text-white"
                        }`}>
                            {toast.type === "success" ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            )}
                            <p className="text-sm font-medium">{toast.message}</p>
                            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}