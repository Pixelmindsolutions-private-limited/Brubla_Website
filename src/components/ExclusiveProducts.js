import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ─────────────────────────────────────────────────────────────────────────────
// CSS ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

    .font-display { font-family: 'Playfair Display', Georgia, serif; }
    .font-body { font-family: 'DM Sans', system-ui, sans-serif; }

    .white-shimmer {
      background: linear-gradient(90deg, #FFFFFF, #CCCCCC, #FFFFFF);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3.5s linear infinite;
    }

    .marquee-track { animation: marquee 32s linear infinite; }

    .product-card:hover .card-img { transform: scale(1.07); }
    .product-card:hover .quick-add { transform: translateY(0); opacity: 1; }
    .product-card:hover .hover-overlay { opacity: 1; }

    @media (prefers-reduced-motion: reduce) {
      .marquee-track, .white-shimmer { animation: none !important; }
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Ic = ({ d, className = "w-5 h-5", fill = "none", sw = 2, children }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={fill}
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {d ? <path d={d} /> : children}
    </svg>
);

const HeartIcon = ({ c, filled }) => <Ic className={c || "w-5 h-5"} fill={filled ? "currentColor" : "none"} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />;
const StarFull = ({ c }) => <Ic className={c || "w-3.5 h-3.5"} fill="currentColor" sw={0} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const CartIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></Ic>;
const GemIcon = ({ c }) => <Ic className={c || "w-5 h-5"}><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20M6 3l4 6m4 0l4-6m-8 0v6" /></Ic>;
const EyeIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Ic>;
const FilterIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" sw={3} /></Ic>;
const ChevRight = ({ c }) => <Ic className={c || "w-4 h-4"} d="M9 18l6-6-6-6" />;
const GridIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Ic>;
const ListIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" sw={3} /><line x1="3" y1="12" x2="3.01" y2="12" sw={3} /><line x1="3" y1="18" x2="3.01" y2="18" sw={3} /></Ic>;
const CheckIcon = ({ c }) => <Ic className={c || "w-3.5 h-3.5"} d="M5 13l4 4L19 7" sw={2.5} />;
const ShareIcon = ({ c }) => <Ic className={c || "w-4 h-4"} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />;
const ZapIcon = ({ c }) => <Ic className={c || "w-4 h-4"} fill="currentColor" sw={0} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DATA
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [
    { id: 1, name: "Silk Organza Lehenga", brand: "NewMe Atelier", price: 12999, orig: 22999, disc: 43, rating: 4.9, reviews: 412, badge: "SIGNATURE", badgeCol: "#FFFFFF", accent: "#FFFFFF", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=480&h=600&fit=crop&q=85&auto=format", himg: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=480&h=600&fit=crop&q=85&auto=format", colors: ["#1a1a1a", "#333333", "#666666"], sizes: ["XS", "S", "M", "L", "XL"], tag: "BESTSELLER" },
    { id: 2, name: "Handwoven Banarasi Saree", brand: "Heritage Weaves", price: 8499, orig: 14999, disc: 43, rating: 5.0, reviews: 289, badge: "HERITAGE", badgeCol: "#FFFFFF", accent: "#FFFFFF", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=480&h=600&fit=crop&q=85&auto=format", himg: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&h=600&fit=crop&q=85&auto=format", colors: ["#333333", "#666666", "#1a1a1a"], sizes: ["Free Size"], tag: "LIMITED" },
    { id: 3, name: "Velvet Blazer Dress", brand: "Studio Noir", price: 5999, orig: 10499, disc: 43, rating: 4.8, reviews: 631, badge: "EXCLUSIVE", badgeCol: "#FFFFFF", accent: "#FFFFFF", img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=480&h=600&fit=crop&q=85&auto=format", himg: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=480&h=600&fit=crop&q=85&auto=format", colors: ["#1a1a1a", "#333333", "#444444"], sizes: ["XS", "S", "M", "L"], tag: "NEW" },
    { id: 4, name: "Zardozi Anarkali Suit", brand: "Craft House", price: 9299, orig: 16999, disc: 45, rating: 4.9, reviews: 178, badge: "HANDCRAFTED", badgeCol: "#FFFFFF", accent: "#FFFFFF", img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=480&h=600&fit=crop&q=85&auto=format", himg: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=480&h=600&fit=crop&q=85&auto=format", colors: ["#666666", "#1a1a1a", "#555555"], sizes: ["S", "M", "L", "XL"], tag: "TRENDING" },
    { id: 5, name: "Premium Linen Co-ord Set", brand: "NewMe Originals", price: 3799, orig: 6999, disc: 46, rating: 4.7, reviews: 924, badge: "MEMBERS", badgeCol: "#FFFFFF", accent: "#FFFFFF", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=480&h=600&fit=crop&q=85&auto=format", himg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=600&fit=crop&q=85&auto=format", colors: ["#EEEEEE", "#555555", "#1a1a1a"], sizes: ["XS", "S", "M", "L", "XL"], tag: "POPULAR" },
];

const FILTERS = ["All", "Lehengas", "Sarees", "Co-ords", "Blazers", "Gowns"];
const SORT_OPTIONS = ["Featured", "Newest First", "Price: Low–High", "Price: High–Low", "Top Rated"];

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Runs `fn` on scroll/resize, throttled with requestAnimationFrame (no re-renders)
const useRafScroll = (fn) => {
    const saved = useRef(fn);
    saved.current = fn;
    useEffect(() => {
        let raf = 0;
        const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => saved.current()); };
        run();
        window.addEventListener("scroll", run, { passive: true });
        window.addEventListener("resize", run);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", run);
            window.removeEventListener("resize", run);
        };
    }, []);
};

const ScrollProgress = () => {
    const bar = useRef(null);
    useRafScroll(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    });
    return (
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none">
            <div ref={bar} className="h-full bg-white origin-left" style={{ transform: "scaleX(0)" }} />
        </div>
    );
};

const Marquee = () => {
    const words = ["Handcrafted", "Members only", "Limited drops", "Free delivery above ₹999", "Authenticated pieces"];
    const row = [...words, ...words];
    return (
        <div className="overflow-hidden border-y border-white/10 py-4 bg-black">
            <div className="marquee-track flex w-max gap-12 font-display text-white/40 text-lg italic whitespace-nowrap">
                {[...row, ...row].map((w, i) => (
                    <span key={i} className="flex items-center gap-12">{w}<span className="w-1 h-1 rounded-full bg-white/30" /></span>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────────────────────────────────────
const Stars = ({ rating }) => (
    <div className="flex items-center gap-0.5 text-white">
        {Array.from({ length: 5 }).map((_, i) => (
            <StarFull key={i} c={`w-2.5 h-2.5 ${i < Math.floor(rating) ? "" : "opacity-25"}`} />
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HERO BANNER  (parallax image + text drifts and fades on scroll)
// ─────────────────────────────────────────────────────────────────────────────
const HeroBanner = () => {
    const [vis, setVis] = useState(false);
    const root = useRef(null), img = useRef(null), content = useRef(null);

    const navigate = useNavigate();

    useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

    useRafScroll(() => {
        if (reduceMotion() || !root.current) return;
        const h = root.current.offsetHeight;
        const y = Math.min(Math.max(window.scrollY, 0), h);
        const p = y / h;
        if (img.current) img.current.style.transform = `translate3d(0,${y * 0.35}px,0) scale(${1.1 + p * 0.08})`;
        if (content.current) {
            content.current.style.transform = `translate3d(0,${y * 0.18}px,0)`;
            content.current.style.opacity = String(1 - p * 1.4);
        }
    });

    return (
        <div ref={root} className="relative w-full overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img ref={img} src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=900&fit=crop&q=90&auto=format" alt="" className="w-full h-full object-cover will-change-transform" style={{ transform: "scale(1.1)" }} />
                <div className="absolute inset-0 bg-black/70" />
            </div>
            <div ref={content} className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-10 xl:px-14 py-24 md:py-36 text-center will-change-transform">
                <div style={{ opacity: vis ? 1 : 0, animation: vis ? "fadeUp 0.7s ease 0.1s both" : "none" }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-white/10 border border-white/20">
                        <GemIcon c="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] font-black tracking-[0.22em] uppercase text-white">Members Exclusive</span>
                    </div>
                </div>
                <div style={{ opacity: vis ? 1 : 0, animation: vis ? "fadeUp 0.7s ease 0.22s both" : "none" }}>
                    <h1 className="font-black leading-none mb-2 font-display text-white text-[clamp(38px,7vw,80px)] tracking-[-0.03em]">Exclusive</h1>
                    <h1 className="font-black leading-none font-display white-shimmer text-[clamp(38px,7vw,80px)] tracking-[-0.03em]">Collection</h1>
                </div>
                <p className="mt-5 font-body text-base font-medium max-w-xl mx-auto leading-relaxed text-white/60"
                    style={{ opacity: vis ? 1 : 0, animation: vis ? "fadeUp 0.6s ease 0.42s both" : "none" }}>
                    Handpicked luxury. Members-only drops. Styles you won't find anywhere else.
                </p>
                <div className="flex items-center justify-center mt-10"
                    style={{ opacity: vis ? 1 : 0, animation: vis ? "fadeUp 0.6s ease 0.58s both" : "none" }}>
                    <button onClick={() => navigate("/all-exclusiveproducts")}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all hover:scale-105 active:scale-95 bg-white text-black">
                        <ZapIcon c="w-4 h-4" /> Shop Now
                    </button>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = ({ p, onClick, index, isListView }) => {
    const [wish, setWish] = useState(false);
    const [added, setAdded] = useState(false);
    const [selColor, setSel] = useState(0);
    const [visible, setVis] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.08 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const handleCart = () => { setAdded(true); setTimeout(() => setAdded(false), 1800); };

    if (isListView) {
        return (
            <div ref={ref} onClick={onClick} className="product-card flex gap-5 p-4 rounded-2xl cursor-pointer transition-all duration-300 group bg-white/5 border border-white/10 hover:bg-white/10"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-16px)", transition: `opacity 0.5s ease ${index * 0.04}s, transform 0.5s ease ${index * 0.04}s` }}>
                <div className="relative overflow-hidden rounded-xl flex-shrink-0 w-[110px] h-[140px]">
                    <img src={p.img} alt={p.name} className="card-img w-full h-full object-cover transition-transform duration-700" loading="lazy" />
                    <div className="absolute top-2 left-2"><span className="text-[8px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-white text-black">{p.badge}</span></div>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5 text-white/50">{p.brand}</p>
                        <h3 className="font-bold text-white text-sm leading-snug mb-1 font-display">{p.name}</h3>
                        <Stars rating={p.rating} />
                        <p className="text-[10px] mt-0.5 text-white/40">{p.reviews.toLocaleString()} reviews</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div><div className="flex items-baseline gap-2"><span className="font-black text-white text-base">₹{p.price.toLocaleString()}</span><span className="text-xs line-through text-white/30">₹{p.orig.toLocaleString()}</span><span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/10 text-white">{p.disc}% off</span></div></div>
                        <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setWish(w => !w); }} className="p-1.5 rounded-full transition-all bg-white/10 text-white/50 hover:text-red-400"><HeartIcon c="w-3.5 h-3.5" filled={wish} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleCart(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] transition-all bg-white text-black">{added ? <CheckIcon c="w-3 h-3" /> : <CartIcon c="w-3 h-3" />}{added ? "Added" : "Add"}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} onClick={onClick} className="product-card cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 bg-neutral-900 border border-white/10"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.52s ease ${index * 0.06}s, transform 0.52s ease ${index * 0.06}s` }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <img src={p.img} alt={p.name} className="card-img absolute inset-0 w-full h-full object-cover object-top transition-all duration-700" loading="lazy" />
                <img src={p.himg} alt="" className="hover-overlay absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-500" loading="lazy" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50" />
                <div className="absolute top-3 left-3 z-10"><span className="text-[8px] font-black tracking-[0.12em] uppercase px-2 py-1 rounded-lg bg-white text-black">{p.badge}</span></div>
                <div className="absolute top-3 right-3 z-10"><span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-black/70 text-white backdrop-blur-sm">-{p.disc}%</span></div>
                <button onClick={(e) => { e.stopPropagation(); setWish(w => !w); }} className="absolute right-3 top-12 z-20 flex items-center justify-center rounded-full transition-all duration-300 w-8 h-8 bg-white/90 text-black shadow-md"><HeartIcon c="w-3.5 h-3.5" filled={wish} /></button>
                <div className="absolute left-3 bottom-14 z-10 flex items-center gap-1.5">{p.colors.map((col, ci) => (<button key={ci} onClick={(e) => { e.stopPropagation(); setSel(ci); }} className="rounded-full transition-all duration-200" style={{ width: selColor === ci ? "13px" : "9px", height: selColor === ci ? "13px" : "9px", background: col, border: selColor === ci ? "2px solid white" : "1.5px solid rgba(255,255,255,0.3)" }} />))}</div>
                <div className="quick-add absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2.5 translate-y-full opacity-0 transition-all duration-350 bg-black/80 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">{p.sizes.slice(0, 3).map(sz => (<span key={sz} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white/75">{sz}</span>))}{p.sizes.length > 3 && <span className="text-[9px] text-white/40">+{p.sizes.length - 3}</span>}</div>
                    <button onClick={(e) => { e.stopPropagation(); handleCart(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] transition-all active:scale-95 bg-white text-black">{added ? <CheckIcon c="w-3 h-3" /> : <CartIcon c="w-3 h-3" />}{added ? "Added!" : "Quick Add"}</button>
                </div>
            </div>
            <div className="px-3.5 pt-3 pb-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-0.5 text-white/50">{p.brand}</p>
                <h3 className="font-bold text-white text-sm leading-snug mb-1.5 font-display tracking-[-0.01em]">{p.name}</h3>
                <div className="flex items-center gap-1.5 mb-2.5"><Stars rating={p.rating} /><span className="text-[9px] font-semibold text-white/40">({p.reviews.toLocaleString()})</span></div>
                <div className="flex items-center justify-between">
                    <div><div className="flex items-baseline gap-1.5"><span className="font-black text-white text-base">₹{p.price.toLocaleString()}</span><span className="text-[10px] line-through text-white/30">₹{p.orig.toLocaleString()}</span></div><span className="text-[9px] font-black text-white/70">Save ₹{(p.orig - p.price).toLocaleString()}</span></div>
                    <button className="p-2 rounded-xl transition-all hover:scale-105 bg-white/5 text-white/40"><EyeIcon c="w-3.5 h-3.5" /></button>
                </div>
            </div>
        </div>
    );
};

// Needs: `useNavigate` from "react-router-dom" (already imported in your page)
// Replace your existing Toolbar with this one. The Toolbar usage stays the same.

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR
// ─────────────────────────────────────────────────────────────────────────────
const Toolbar = ({ activeFilter, setFilter, sort, setSort, viewMode, setView, count }) => {
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fn = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    return (
        <div className=" top-0 z-20 py-3 px-4 md:px-6 lg:px-10 xl:px-14 bg-black/90 backdrop-blur-md border-b border-white/10">
            {/* Filter chips (left, scrollable) + View All Products (right, fixed) */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {FILTERS.map(f => (<button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 text-[11px] font-bold px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap font-body ${activeFilter === f ? "bg-white text-black shadow-[0_4px_14px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white/60 border border-white/10"}`}>{f}</button>))}
                </div>
                <button onClick={() => navigate("/all-exclusiveproducts")}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap font-body bg-white text-black transition-all hover:scale-105 active:scale-95">
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">View All</span>
                    <ChevRight c="w-3 h-3" />
                </button>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold font-body text-white/40"><span className="text-white font-bold">{count}</span> exclusive pieces</p>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={sortRef}>
                        <button onClick={() => setSortOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all font-body bg-white/5 text-white/65 border border-white/10"><FilterIcon c="w-3 h-3" />{sort}<ChevRight c={`w-3 h-3 transition-transform ${sortOpen ? "rotate-90" : ""}`} /></button>
                        {sortOpen && (<div className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[180px] bg-neutral-900 border border-white/10 shadow-2xl">{SORT_OPTIONS.map(opt => (<button key={opt} onClick={() => { setSort(opt); setSortOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold text-left transition-colors font-body hover:bg-white/10" style={{ color: sort === opt ? "#FFFFFF" : "rgba(255,255,255,0.65)" }}>{opt}{sort === opt && <CheckIcon c="w-3 h-3" />}</button>))}</div>)}
                    </div>
                    <div className="flex items-center rounded-xl overflow-hidden border border-white/10">
                        {[{ id: "grid", Icon: GridIcon }, { id: "list", Icon: ListIcon }].map(({ id, Icon }) => (<button key={id} onClick={() => setView(id)} className={`p-1.5 transition-colors ${viewMode === id ? "bg-white/20 text-white" : "bg-transparent text-white/40"}`}><Icon c="w-3.5 h-3.5" /></button>))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED SPOTLIGHT → stacking cards. Each new card slides up over the
// previous one; the card underneath shrinks and dims as it gets covered.
// ─────────────────────────────────────────────────────────────────────────────
const STACK_TOP = 88;   // px from top where the first card sticks
const STACK_STEP = 22;  // px each later card sits lower, so edges peek out

const SPOTLIGHT_COPY = [
    "Crafted in fine silk organza with hand embroidery and a contemporary silhouette.",
    "Woven by hand on traditional looms, with a rich zari border and a soft drape.",
    "A tailored velvet blazer dress that works for evening events and formal dinners.",
    "Zardozi metalwork on a flared Anarkali cut, finished entirely by hand.",
];

const StackCard = ({ p, i, copy, cardRef }) => {
    const navigate = useNavigate();
    const flip = i % 2 === 1;
    return (
        <div ref={cardRef} className="sticky" style={{ top: STACK_TOP + i * STACK_STEP, marginBottom: 56, zIndex: i + 1 }}>
            <div onClick={() => navigate(`/exclusiveproducts/${p.id}`)} data-inner className="rounded-3xl overflow-hidden border border-white/15 bg-neutral-900 shadow-[0_-24px_60px_rgba(0,0,0,0.7)] will-change-transform"
                style={{ transformOrigin: "50% 0%" }}>
                <div className={`flex flex-col ${flip ? "md:flex-row-reverse" : "md:flex-row"}`}>
                    <div className="relative overflow-hidden md:w-2/5 h-[280px] md:h-auto md:min-h-[400px]">
                        <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className="absolute top-5 left-5 text-[10px] font-black tracking-[0.14em] uppercase px-3 py-1.5 rounded-full bg-white text-black">{p.badge}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-7 py-8 md:px-10 md:py-10">
                        <p className="text-xs font-semibold mb-2 text-white/50 font-body">{p.brand}</p>
                        <h2 className="font-black leading-tight mb-3 font-display text-white text-[clamp(24px,3.5vw,40px)] tracking-[-0.02em]">{p.name}</h2>
                        <p className="text-sm mb-5 font-body text-white/50 leading-relaxed max-w-md">{copy}</p>
                        <div className="flex items-center gap-3 mb-6"><Stars rating={p.rating} /><span className="text-xs font-semibold font-body text-white/40">{p.reviews} verified reviews</span></div>
                        <div className="flex items-center gap-5 mb-7">
                            <div><span className="font-black text-white font-display text-[28px]">₹{p.price.toLocaleString()}</span><span className="text-sm line-through ml-2 font-body text-white/30">₹{p.orig.toLocaleString()}</span></div>
                            <span className="text-[11px] font-black px-2.5 py-1 rounded-full font-body bg-white/10 text-white">Save ₹{(p.orig - p.price).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm tracking-wide transition-all hover:scale-105 active:scale-95 bg-white text-black"><CartIcon c="w-4 h-4" />Add to Cart</button>
                            <button aria-label="Wishlist" className="p-3.5 rounded-xl transition-all hover:scale-105 active:scale-95 bg-white/10 border border-white/20 text-white/60"><HeartIcon c="w-4 h-4" /></button>
                            <button aria-label="Share" className="p-3.5 rounded-xl transition-all hover:scale-105 active:scale-95 bg-white/10 border border-white/20 text-white/60"><ShareIcon c="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeaturedSpotlight = () => {
    const items = PRODUCTS.slice(0, 4);
    const refs = useRef([]);

    useRafScroll(() => {
        if (reduceMotion()) return;
        refs.current.forEach((el, i) => {
            const inner = el && el.querySelector("[data-inner]");
            const next = refs.current[i + 1];
            if (!inner) return;
            if (!next) { inner.style.transform = ""; inner.style.filter = ""; return; }
            // 0 → next card still far away, 1 → next card fully covers this one
            const h = inner.offsetHeight;
            const myStick = STACK_TOP + i * STACK_STEP;
            const nextStick = STACK_TOP + (i + 1) * STACK_STEP;
            const nextTop = next.getBoundingClientRect().top;
            const p = Math.min(Math.max((myStick + h - nextTop) / (myStick + h - nextStick), 0), 1);
            inner.style.transform = `scale(${1 - p * 0.06})`;
            inner.style.filter = `brightness(${1 - p * 0.45})`;
        });
    });

    return (
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 xl:px-14 pt-16 pb-8">
            <h2 className="font-display font-black text-white text-[clamp(26px,4vw,44px)] tracking-[-0.02em] mb-2">The spotlight edit</h2>
            <p className="font-body text-sm text-white/40 mb-10">Scroll to move through this season's editor picks.</p>
            {items.map((p, i) => (
                <StackCard key={p.id} p={p} i={i} copy={SPOTLIGHT_COPY[i]} cardRef={el => (refs.current[i] = el)} />
            ))}
        </section>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ExclusiveProductsPage() {
    const [activeFilter, setFilter] = useState("All");
    const [sort, setSort] = useState("Featured");
    const [viewMode, setView] = useState("grid");
    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <ScrollProgress />
            <div className="min-h-screen font-body bg-black">
                <Styles />
                <HeroBanner />
                <Marquee />
                <FeaturedSpotlight />
                <Toolbar activeFilter={activeFilter} setFilter={setFilter} sort={sort} setSort={setSort} viewMode={viewMode} setView={setView} count={PRODUCTS.length} />
                <div className="px-4 md:px-6 lg:px-10 xl:px-14 py-8 max-w-7xl mx-auto">
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {PRODUCTS.map((p, i) => (<ProductCard key={p.id} p={p} onClick={() => navigate(`/exclusiveproducts/${p.id}`)} index={i} isListView={false} />))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {PRODUCTS.map((p, i) => (<ProductCard key={p.id} p={p} onClick={() => navigate(`/exclusiveproducts/${p.id}`)} index={i} isListView />))}
                        </div>
                    )}
                </div>
                {/* <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" /> */}
                {/* <div className="py-6 text-center px-4"><p className="text-[11px] font-semibold font-body text-white/25">All exclusive pieces are authenticated · Members-only pricing · Free delivery above ₹999</p></div> */}
            </div>
            <Footer />
        </>
    );
}