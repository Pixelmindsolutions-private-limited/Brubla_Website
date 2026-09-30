import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Heart, ChevronLeft, Star, Truck, ShieldCheck,
    RotateCcw, Share2, ShoppingBag,
    MapPin, Calendar, CheckCircle, Minus, Plus, ChevronRight, X
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SizeGuideModal from "../views/SizeGuide";
import axios from "axios";

const COFFEE = "#000";
const API_BASE = "http://31.97.228.17:4077";

// ─── URL normaliser ────────────────────────────────────────────────────────────
const normaliseUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    return url.replace(/https?:\/\/localhost:4077/g, API_BASE);
};

// ─── Images for a specific variant ───────────────────────────────────────────
// Returns de-duped, normalised image list for one variant object
const getVariantImages = (variant) => {
    if (!variant) return [];
    const seen = new Set();
    const out = [];
    const push = (raw) => {
        const u = normaliseUrl(raw);
        if (u && !seen.has(u)) { seen.add(u); out.push(u); }
    };
    if (variant.mainImage) push(variant.mainImage);
    if (Array.isArray(variant.images)) variant.images.forEach(push);
    return out;
};

// ─── ALL images: first-variant images first, then remaining variants ──────────
// selectedColor controls ordering (selected variant's images shown first)
const getOrderedImages = (product, selectedColor = null) => {
    if (!product || !Array.isArray(product.variants)) return [];
    const seen = new Set();
    const result = [];

    const push = (raw) => {
        const u = normaliseUrl(raw);
        if (u && !seen.has(u)) { seen.add(u); result.push(u); }
    };

    // 1) Selected colour's variant images first
    const selectedVariant = selectedColor
        ? product.variants.find((v) => v.color === selectedColor)
        : product.variants[0];

    if (selectedVariant) {
        if (selectedVariant.mainImage) push(selectedVariant.mainImage);
        if (Array.isArray(selectedVariant.images)) selectedVariant.images.forEach(push);
    }

    // 2) Remaining variants in order
    product.variants.forEach((v) => {
        if (v === selectedVariant) return;
        if (v.mainImage) push(v.mainImage);
        if (Array.isArray(v.images)) v.images.forEach(push);
    });

    return result;
};

// ─── Unique colours / sizes ───────────────────────────────────────────────────
const getUniqueColors = (variants = []) =>
    [...new Set(variants.map((v) => v.color).filter(Boolean))];

const getUniqueSizes = (variants = []) => {
    const set = new Set();
    variants.forEach((v) => {
        if (Array.isArray(v.sizes)) v.sizes.forEach((s) => { if (s.size) set.add(s.size); });
    });
    return Array.from(set);
};

// ─── Stock for (color, size) ──────────────────────────────────────────────────
const getStockForColorSize = (variants = [], color, size) => {
    const v = variants.find((x) => x.color === color);
    if (!v || !Array.isArray(v.sizes)) return 0;
    const s = v.sizes.find((x) => x.size === size);
    return s ? (s.stock ?? 0) : 0;
};

// ─── Price for a colour variant ───────────────────────────────────────────────
// discountPrice can be null → treat as no discount
const getPriceForColor = (variants = [], color) => {
    const v = variants.find((x) => x.color === color);
    if (!v) return null;
    const actual = v.price ?? 0;
    const discounted = (v.discountPrice != null && v.discountPrice > 0) ? v.discountPrice : actual;
    const pct = actual > discounted
        ? Math.round(((actual - discounted) / actual) * 100)
        : 0;
    return { price: discounted, actualPrice: actual, discount: pct };
};

const toINR = (usd) => {
    if (!usd) return "0";
    return (usd * 83).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = "small" }) => {
    const px = size === "small" ? 13 : 16;
    const n = Number(rating) || 0;
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i} size={px}
                    className={
                        i < Math.floor(n) ? "text-amber-400 fill-amber-400"
                            : i < n ? "text-amber-400 fill-amber-400 opacity-50"
                                : "text-gray-200 fill-gray-200"
                    }
                />
            ))}
        </div>
    );
};

// ─── Mobile Image Gallery ─────────────────────────────────────────────────────
const MobileGallery = ({ images, productName, currentStock, tags, discount }) => {
    const [idx, setIdx] = useState(0);
    const [fullscreen, setFs] = useState(false);

    // Reset to first image when images array changes (colour switch)
    useEffect(() => { setIdx(0); }, [images]);

    const go = useCallback((n) => setIdx((n + images.length) % images.length), [images.length]);
    const prev = () => go(idx - 1);
    const next = () => go(idx + 1);

    const src = images[idx] || "https://placehold.co/800x800/e5e7eb/64748b?text=BRUBLA";

    return (
        <>
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="relative cursor-zoom-in" style={{ aspectRatio: "4/5" }} onClick={() => setFs(true)}>
                    <img
                        src={src}
                        alt={`${productName} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.co/800x800/e5e7eb/64748b?text=BRUBLA"; }}
                    />

                    {/* Overlays */}
                    {currentStock === 0 && (
                        <div className="absolute inset-0 bg-white/65 flex items-center justify-center">
                            <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 border border-gray-400 px-4 py-2 rounded-full bg-white">Sold Out</span>
                        </div>
                    )}
                    {tags?.[0] && (
                        <div className="absolute top-3 left-3">
                            <span className="bg-black/80 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1 rounded-full capitalize">{tags[0]}</span>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-full">-{discount}%</span>
                        </div>
                    )}

                    {/* Arrows */}
                    {images.length > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); prev(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); next(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center">
                                <ChevronRight size={16} />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                                {idx + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-hide">
                    {images.map((img, i) => (
                        <button key={i} onClick={() => setIdx(i)}
                            className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? "border-gray-900" : "border-transparent opacity-60 hover:opacity-90"}`}
                            style={{ width: 60, height: 60 }}>
                            <img src={img} alt="" className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://placehold.co/60x60/e5e7eb/64748b?text=?"; }} />
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen lightbox */}
            {fullscreen && (
                <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center" onClick={() => setFs(false)}>
                    <button onClick={() => setFs(false)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center z-10">
                        <X size={20} />
                    </button>
                    <img src={images[idx]} alt={productName} className="max-w-full max-h-full object-contain px-4" />
                    {images.length > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); prev(); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">
                                <ChevronLeft size={22} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); next(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">
                                <ChevronRight size={22} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

// ─── Designer Card ────────────────────────────────────────────────────────────
const DesignerCard = ({ product }) => {
    const [following, setFollowing] = useState(false);

    const designer = product.createdBy === "admin" ? {
        name: "Brubla Premium", brand: "Brubla Official",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=brubla",
        verified: true, rating: 4.9, followers: "25K", products: 120,
        joined: "2024",
        bio: "Brubla Premium offers high-quality fashion essentials with premium craftsmanship and modern style.",
        location: "Worldwide Shipping",
    } : {
        name: product.creatorDetails?.name || product.createdBy || "Brand Studio",
        brand: product.creatorDetails?.brandName || "Premium Brand",
        avatar: product.creatorDetails?.profileImage || "https://api.dicebear.com/7.x/adventurer/svg?seed=designer",
        verified: true,
        rating: product.creatorDetails?.rating || 4.8,
        followers: product.creatorDetails?.followers || "12.5K",
        products: product.creatorDetails?.products || 20,
        joined: product.creatorDetails?.joined || new Date(product.createdAt).getFullYear().toString(),
        bio: product.creatorDetails?.bio || product.description || "Premium quality products crafted with care.",
        location: product.creatorDetails?.location || "Global Shipping",
    };

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                        <img src={designer.avatar} alt={designer.name}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100" />
                        {designer.verified && (
                            <CheckCircle size={17} className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm">{designer.name}</h3>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">Verified</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{designer.brand}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <StarRating rating={designer.rating} />
                            <span className="text-xs text-gray-400">({designer.rating})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                {[
                   
                    { Icon: Calendar, text: `Joined ${designer.joined}` },
                ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
                        <Icon size={13} className="flex-shrink-0" /><span>{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Loading / Error states ───────────────────────────────────────────────────
function LoadingState() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: COFFEE }} />
                    <p className="text-gray-500 text-sm">Loading product…</p>
                </div>
            </div>
        </>
    );
}

function ErrorState({ message, onBack, onRetry }) {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag size={30} className="text-gray-400" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h1>
                    <p className="text-gray-500 mb-6 text-sm">{message || "This product doesn't exist or has been removed."}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onBack} className="px-5 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:border-gray-500 transition-colors">Go Back</button>
                        {onRetry && (
                            <button onClick={onRetry} className="px-5 py-2 rounded-full text-white text-sm" style={{ backgroundColor: COFFEE }}>Try Again</button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Product Info Panel ───────────────────────────────────────────────────────
function ProductInfoPanel({
    product, colors, sizes,
    selectedColor, setSelectedColor,
    selectedSize, setSelectedSize,
    currentStock,
    displayPrice, displayActualPrice, discount,
    quantity, setQuantity,
    handleAddToCart, handleBuyNow,
    setIsSizeOpen,
    isMobile = false,
}) {
    return (
        <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col gap-5 ${!isMobile ? "sticky top-24" : ""}`}>

            {/* Name + meta */}
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug font-display">
                    {product.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StarRating rating={product.averageRating || 0} />
                    <span className="text-xs text-gray-400">{product.reviews?.length || 0} reviews</span>
                    {product.subcategoryName && (
                        <><span className="text-gray-200">|</span>
                            <span className="text-xs text-gray-400">{product.subcategoryName}</span></>
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">₹{toINR(displayPrice)}</span>
                {displayActualPrice > displayPrice && (
                    <>
                        <span className="text-sm text-gray-400 line-through">₹{toINR(displayActualPrice)}</span>
                        {discount > 0 && (
                            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                                -{discount}% OFF
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Colour selector */}
            {colors.length > 0 && (
                <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                        Colour — <span className="text-gray-700 normal-case font-medium tracking-normal">{selectedColor}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                            <button key={color} onClick={() => setSelectedColor(color)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${selectedColor === color
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                    }`}>
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                            Size — <span className="text-gray-700 normal-case font-medium tracking-normal">{selectedSize || "Select"}</span>
                        </p>
                        <button onClick={() => setIsSizeOpen(true)}
                            className="text-[11px] text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full hover:border-gray-400 transition-colors">
                            Size Guide
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                            const stock = getStockForColorSize(product.variants, selectedColor, size);
                            return (
                                <button key={size} onClick={() => setSelectedSize(size)} disabled={stock === 0}
                                    className={`w-12 h-10 rounded-xl text-sm font-medium border-2 transition-all ${selectedSize === size
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : stock === 0
                                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed relative overflow-hidden"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-500"
                                        }`}>
                                    {size}
                                    {stock === 0 && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <span className="block w-full border-t border-gray-300 rotate-[-35deg]" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stock pill */}
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentStock > 0 ? "bg-green-500" : "bg-red-400"}`} />
                {currentStock > 0 ? (
                    <span className="text-xs text-green-600 font-medium">
                        In Stock <span className="text-gray-400 font-normal">· {currentStock} available</span>
                    </span>
                ) : (
                    <span className="text-xs text-red-500 font-medium">Out of Stock for this combination</span>
                )}
            </div>

            {/* Quantity */}
            {currentStock > 0 && (
                <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Quantity</p>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center transition-colors">
                            <Minus size={13} />
                        </button>
                        <span className="text-base font-bold min-w-[36px] text-center tabular-nums">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                            className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center transition-colors">
                            <Plus size={13} />
                        </button>
                    </div>
                </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                    onClick={() => {

                        const variant = product.variants.find(
                            (v) => v.color === selectedColor
                        );

                        const size = variant?.sizes?.find(
                            (s) => s.size === selectedSize
                        );

                        handleAddToCart(product, variant, size, quantity);

                    }}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-xs font-bold tracking-widest text-gray-800 hover:border-gray-900 transition-all disabled:opacity-35 disabled:cursor-not-allowed uppercase">
                    Add to Bag
                </button>
                <button onClick={handleBuyNow} disabled={currentStock === 0}
                    className="flex-1 py-3 rounded-2xl text-white text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{ backgroundColor: COFFEE }}>
                    Buy Now
                </button>
            </div>

            {/* Delivery badges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                    { Icon: Truck, title: "Free Delivery", sub: "Above ₹999" },
                    { Icon: RotateCcw, title: "30-Day Return", sub: "Easy exchange" },
                    { Icon: ShieldCheck, title: "Secure Pay", sub: "100% safe" },
                ].map(({ Icon, title, sub }) => (
                    <div key={title} className="flex flex-col items-center text-center gap-1 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                        <Icon size={16} className="text-gray-500" />
                        <p className="text-[11px] font-semibold text-gray-700 leading-tight">{title}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);

    const [wishlist, setWishlist] = useState([]);

    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState("details");
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Desktop gallery state — which image is "main"
    const [desktopMain, setDesktopMain] = useState(null);

    // ── Fetch product ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) { setError("No product ID provided"); setLoading(false); return; }
        let cancelled = false;

        const run = async () => {
            setLoading(true); setError(null);
            try {
                const ctrl = new AbortController();
                const tid = setTimeout(() => ctrl.abort(), 15_000);
                const res = await fetch(`${API_BASE}/api/admin/products/${id}`, { signal: ctrl.signal });
                clearTimeout(tid);

                if (!res.ok) throw new Error(`Server error ${res.status}: ${res.statusText}`);

                const data = await res.json();
                if (cancelled) return;

                if (!data?.product) throw new Error(data?.message || "Product not found.");

                const p = data.product;
                const colors = getUniqueColors(p.variants);
                const sizes = getUniqueSizes(p.variants);

                setProduct(p);
                const firstColor = colors[0] ?? null;
                const firstSize = sizes[0] ?? null;
                setSelectedColor(firstColor);
                setSelectedSize(firstSize);

                // Set desktop main to first image of first variant
                const firstImg = getOrderedImages(p, firstColor)[0] ?? null;
                setDesktopMain(firstImg);
            } catch (err) {
                if (cancelled) return;
                setError(err.name === "AbortError"
                    ? "Request timed out. Check your connection."
                    : err.message || "Failed to load product.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => { cancelled = true; };
    }, [id, retryKey]);

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

    useEffect(() => {

        const fetchWishlist = async () => {

            try {

                const res = await axios.get(
                    `http://31.97.228.17:4077/api/users/${userId}`
                );

                if (res.data.success) {

                    setWishlist(
                        (res.data.user.wishlist || []).map(
                            (item) => item.productId
                        )
                    );

                }

            } catch (err) {

                console.log("Wishlist fetch error", err);

            }
        };

        fetchWishlist();

    }, []);


    const toggleWishlist = useCallback(async (productId) => {

        try {

            // optimistic update
            setWishlist((prev) =>
                prev.includes(productId)
                    ? prev.filter((x) => x !== productId)
                    : [...prev, productId]
            );

            // const token = sessionStorage.getItem("authToken");

            await axios.post(
                `http://31.97.228.17:4077/api/users/wishlist/${userId}/toggle`,
                {
                    productId,
                },
                // {
                //   headers: {
                //     Authorization: `Bearer ${token}`,
                //   },
                // }
            );

        } catch (err) {

            console.log("Wishlist update error", err);

        }

    }, [userId]);

    const handleAddToCart = async (
        product,
        variant,
        size,
        quantity
    ) => {

        console.log("Adding to cart:", { productId: product._id, variantId: variant?._id, sizeId: size?._id, quantity });

        try {


            if (!variant || !size) {
                alert("Please select variant and size");
                return;
            }

            await axios.post(
                `http://31.97.228.17:4077/api/users/cart/${userId}/add`,
                {
                    productId: product._id,
                    variantId: variant._id,
                    sizeId: size._id,
                    quantity: quantity,
                }
            );

            alert("Added to cart successfully!");
            navigate("/mycart");

        } catch (err) {

            console.log("Cart Error:", err);

            alert(
                err?.response?.data?.message ||
                "Failed to add to cart"
            );
        }
    };

    // ── When colour changes, reset gallery to first image of that colour ──────
    useEffect(() => {
        if (!product || !selectedColor) return;
        const imgs = getOrderedImages(product, selectedColor);
        setDesktopMain(imgs[0] ?? null);
        setQuantity(1);
    }, [selectedColor, product]);

    // Reset qty on size change too
    useEffect(() => { setQuantity(1); }, [selectedSize]);

    // ── Related products ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!product) return;
        let cancelled = false;
        const run = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/admin/products`);
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                if (data.success && Array.isArray(data.products)) {
                    const pid = product._id || product.id;
                    setRelatedProducts(
                        data.products.filter((p) => p.isActive && (p._id || p.id) !== pid).slice(0, 4)
                    );
                }
            } catch { /* non-critical */ }
        };
        run();
        return () => { cancelled = true; };
    }, [product]);

    // ── Derived ────────────────────────────────────────────────────────────────
    const allImages = product ? getOrderedImages(product, selectedColor) : [];
    const colors = product ? getUniqueColors(product.variants) : [];
    const sizes = product ? getUniqueSizes(product.variants) : [];
    const variantPrice = product && selectedColor ? getPriceForColor(product.variants, selectedColor) : null;
    const displayPrice = variantPrice?.price ?? product?.displayPrice ?? 0;
    const displayActualPrice = variantPrice?.actualPrice ?? product?.displayActualPrice ?? 0;
    const discount = variantPrice?.discount ?? product?.maxDiscount ?? 0;
    const currentStock = (product && selectedColor && selectedSize)
        ? getStockForColorSize(product.variants, selectedColor, selectedSize) : 0;

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleShare = () => {
        if (navigator.share) navigator.share({ title: product?.name, url: window.location.href }).catch(() => { });
        else { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }
    };

    const handleBuyNow = () => alert(`Proceeding to checkout with ${quantity}× ${product?.name}`);

    // ── Guards ─────────────────────────────────────────────────────────────────
    if (loading) return <LoadingState />;
    if (error || !product) return <ErrorState message={error} onBack={() => navigate(-1)} onRetry={error ? () => setRetryKey((k) => k + 1) : null} />;

    const panelProps = {
        product, colors, sizes,
        selectedColor, setSelectedColor,
        selectedSize, setSelectedSize,
        currentStock,
        displayPrice, displayActualPrice, discount,
        quantity, setQuantity,
        handleAddToCart, handleBuyNow,
        setIsSizeOpen,
    };


    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <Header />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
                * { box-sizing: border-box; }
                html { scroll-behavior: smooth; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .font-display { font-family: 'Instrument Serif', Georgia, serif; }
                .font-body    { font-family: 'DM Sans', system-ui, sans-serif; }
                .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
            `}</style>

            <div className="min-h-screen font-body bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

                    {/* ── Top nav ── */}
                    <div className="flex justify-between items-center mb-5 sm:mb-6">
                        <button onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
                            <ChevronLeft size={18} /> <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => toggleWishlist(product._id)}
                                className="
                                    p-2 rounded-full bg-white
                                    shadow-sm hover:shadow-md
                                    transition-all duration-200
                                    hover:scale-105
                                "
                                aria-label="Wishlist"
                            >

                                <Heart
                                    size={19}
                                    className={
                                        wishlist.includes(product._id)
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-500"
                                    }
                                />

                            </button>
                            <button onClick={handleShare}
                                className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow" aria-label="Share">
                                <Share2 size={19} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* MOBILE layout (< lg)                                    */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div className="block lg:hidden space-y-4">
                        <MobileGallery
                            images={allImages}
                            productName={product.name}
                            currentStock={currentStock}
                            tags={product.tags}
                            discount={discount}
                        />
                        <ProductInfoPanel {...panelProps} isMobile />
                    </div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* DESKTOP layout (≥ lg) — 3 columns                      */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div className="hidden lg:grid lg:grid-cols-[1fr_auto_340px] xl:grid-cols-[1fr_auto_380px] gap-5 items-start">

                        {/* Col 1 — Main large image (sticky) */}
                        <div className="sticky top-24">
                            <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm cursor-zoom-in"
                                style={{ aspectRatio: "3/4" }}>
                                <img
                                    src={desktopMain || allImages[0] || "https://placehold.co/800x1067/e5e7eb/64748b?text=BRUBLA"}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                    onError={(e) => { e.target.src = "https://placehold.co/800x1067/e5e7eb/64748b?text=BRUBLA"; }}
                                />
                                {currentStock === 0 && (
                                    <div className="absolute inset-0 bg-white/65 flex items-center justify-center">
                                        <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 border border-gray-400 px-4 py-2 rounded-full bg-white">Sold Out</span>
                                    </div>
                                )}
                                {product.tags?.[0] && (
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full capitalize">{product.tags[0]}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Col 2 — Vertical thumbnail strip */}
                        <div className="w-[88px] sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto flex flex-col gap-2.5 scrollbar-hide">
                            {allImages.slice(0, 10).map((img, i) => (
                                <button key={i} onClick={() => setDesktopMain(img)}
                                    className={`flex-shrink-0 w-full rounded-2xl overflow-hidden border-2 transition-all ${desktopMain === img ? "border-gray-900 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    style={{ aspectRatio: "4/5" }}>
                                    <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = "https://placehold.co/88x110/e5e7eb/64748b?text=?"; }} />
                                </button>
                            ))}
                        </div>

                        {/* Col 3 — Info panel */}
                        <ProductInfoPanel {...panelProps} />
                    </div>

                    {/* ── Tabs ── */}
                    <div className="mt-10 sm:mt-14">
                        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                            {[
                                { id: "details", label: "Product Details" },
                                { id: "designer", label: "Designer Info" },
                                { id: "reviews", label: `Reviews (${product.reviews?.length || 0})` },
                            ].map((t) => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className={`pb-3 px-4 text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id
                                        ? "text-gray-900 border-b-2 border-gray-900"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[280px]">
                            {/* Details */}
                            {activeTab === "details" && (
                                <div className="space-y-7">
                                    {/* Description */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                            {showFullDesc
                                                ? product.description
                                                : `${product.description?.substring(0, 280) ?? "No description"}${(product.description?.length ?? 0) > 280 ? "…" : ""}`}
                                        </p>
                                        {(product.description?.length ?? 0) > 280 && (
                                            <button onClick={() => setShowFullDesc(!showFullDesc)}
                                                className="text-sm text-gray-500 hover:text-gray-900 mt-2 underline underline-offset-2">
                                                {showFullDesc ? "Show Less" : "Read More"}
                                            </button>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {product.tags?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {product.tags.map((tag) => (
                                                    <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 capitalize">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Specs grid */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: "Subcategory", value: product.subcategoryName || "Apparel" },
                                                { label: "Total Stock", value: `${product.totalStock ?? 0} units` },
                                                { label: "Colors", value: (product.availableColors || []).join(", ") || "Standard" },
                                                { label: "Sizes", value: (product.availableSizes || []).join(", ") || "One Size" },
                                                { label: "Variants", value: `${product.variants?.length || 1} colour${(product.variants?.length || 1) > 1 ? "s" : ""}` },
                                                { label: "Delivery", value: product.deliveryAddresses?.length ? `${product.deliveryAddresses.length} cities` : "Multiple" },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-white p-3 rounded-xl border border-gray-100">
                                                    <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                                                    <p className="text-sm font-medium text-gray-800">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ships to */}
                                    {product.deliveryAddresses?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Ships To</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {product.deliveryAddresses.map((a) => (
                                                    <span key={a} className="flex items-center gap-1 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
                                                        <MapPin size={9} className="text-gray-400" />{a}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Designer */}
                            {activeTab === "designer" && <DesignerCard product={product} />}

                            {/* Reviews */}
                            {activeTab === "reviews" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold text-gray-900">{(product.averageRating || 0).toFixed(1)}</span>
                                                <StarRating rating={product.averageRating || 0} size="large" />
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">Based on {product.reviews?.length || 0} reviews</p>
                                        </div>
                                        <button className="px-4 py-2 rounded-full border border-gray-300 text-sm hover:border-gray-500 transition-colors">Write a Review</button>
                                    </div>

                                    {product.reviews?.length > 0 ? product.reviews.map((review, i) => (
                                        <div key={i} className="border-t border-gray-100 pt-5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <img src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? "women" : "men"}/${i + 20}.jpg`}
                                                    className="w-9 h-9 rounded-full object-cover" alt="" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">User {i + 1}</p>
                                                    <StarRating rating={review.rating || 4} />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">{review.comment || "Great product! Exactly as described."}</p>
                                            <p className="text-xs text-gray-400 mt-1.5">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : new Date(Date.now() - i * 86400000).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )) : (
                                        <div className="py-14 text-center">
                                            <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Related Products ── */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-14 sm:mt-16">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5 font-display">You May Also Like</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {relatedProducts.map((rp) => {
                                    const rpImg = getOrderedImages(rp)[0] ||
                                        "https://placehold.co/600x600/e5e7eb/64748b?text=BRUBLA";
                                    return (
                                        <div key={rp._id || rp.id} onClick={() => navigate(`/product/${rp._id || rp.id}`)}
                                            className="bg-white rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all">
                                            <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
                                                <img src={rpImg} alt={rp.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => { e.target.src = "https://placehold.co/600x600/e5e7eb/64748b?text=BRUBLA"; }} />
                                            </div>
                                            <div className="p-3">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{rp.name}</p>
                                                <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                                                    <p className="text-sm font-bold text-gray-900">₹{toINR(rp.displayPrice)}</p>
                                                    {rp.displayActualPrice > rp.displayPrice && (
                                                        <p className="text-xs text-gray-400 line-through">₹{toINR(rp.displayActualPrice)}</p>
                                                    )}
                                                </div>
                                                <div className="mt-1"><StarRating rating={rp.averageRating || 0} /></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SizeGuideModal isOpen={isSizeOpen} onClose={() => setIsSizeOpen(false)} />
            <Footer />
        </>
    );
}