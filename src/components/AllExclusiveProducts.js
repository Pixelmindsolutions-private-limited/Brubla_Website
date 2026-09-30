import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    .font-display { font-family: 'Playfair Display', Georgia, serif; }
    .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
    .white-shimmer {
      background: linear-gradient(90deg, #FFFFFF, #CCCCCC, #FFFFFF);
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      animation: shimmer 3.5s linear infinite;
    }
    .product-card:hover .card-img { transform: scale(1.07); }
    .product-card:hover .quick-add { transform: translateY(0); opacity: 1; }
    .product-card:hover .hover-overlay { opacity: 1; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    @media (prefers-reduced-motion: reduce) { .white-shimmer { animation: none !important; } }
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
const ChevUp = ({ c }) => <Ic className={c || "w-4 h-4"} d="M18 15l-6-6-6 6" />;
const GridIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Ic>;
const ListIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" sw={3} /><line x1="3" y1="12" x2="3.01" y2="12" sw={3} /><line x1="3" y1="18" x2="3.01" y2="18" sw={3} /></Ic>;
const CheckIcon = ({ c }) => <Ic className={c || "w-3.5 h-3.5"} d="M5 13l4 4L19 7" sw={2.5} />;
const SearchIcon = ({ c }) => <Ic className={c || "w-4 h-4"}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Ic>;
const CloseIcon = ({ c }) => <Ic className={c || "w-3.5 h-3.5"} d="M6 6l12 12M18 6L6 18" />;

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DATA  (12 pieces — swap the images for your own catalog photos)
// ─────────────────────────────────────────────────────────────────────────────
const IMG = {
    a: ["photo-1509631179647-0177331693ae", "photo-1515886657613-9f3515b0c78f"],
    b: ["photo-1469334031218-e382a71b716b", "photo-1490481651871-ab68de25d43d"],
    c: ["photo-1485230895905-ec40ba36b9bc", "photo-1496747611176-843222e1e57c"],
    d: ["photo-1503341504253-dff4815485f1", "photo-1617137968427-85924c800a22"],
    e: ["photo-1483985988355-763728e1935b", "photo-1558618666-fcd25c85cd64"],
};
const u = id => `https://images.unsplash.com/${id}?w=480&h=600&fit=crop&q=85&auto=format`;
const mk = (id, name, brand, cat, price, orig, rating, reviews, badge, im, sizes) => ({
    id, name, brand, cat, price, orig, rating, reviews, badge,
    disc: Math.round((1 - price / orig) * 100),
    img: u(IMG[im][0]), himg: u(IMG[im][1]),
    colors: ["#1a1a1a", "#555555", "#999999"], sizes,
});
const STD = ["XS", "S", "M", "L", "XL"];

const PRODUCTS = [
    mk(1, "Silk Organza Lehenga", "NewMe Atelier", "Lehengas", 12999, 22999, 4.9, 412, "SIGNATURE", "a", STD),
    mk(2, "Handwoven Banarasi Saree", "Heritage Weaves", "Sarees", 8499, 14999, 5.0, 289, "HERITAGE", "b", ["Free Size"]),
    mk(3, "Velvet Blazer Dress", "Studio Noir", "Blazers", 5999, 10499, 4.8, 631, "EXCLUSIVE", "c", ["XS", "S", "M", "L"]),
    mk(4, "Zardozi Anarkali Suit", "Craft House", "Suits", 9299, 16999, 4.9, 178, "HANDCRAFTED", "d", ["S", "M", "L", "XL"]),
    mk(5, "Premium Linen Co-ord Set", "NewMe Originals", "Co-ords", 3799, 6999, 4.7, 924, "MEMBERS", "e", STD),
    mk(6, "Emerald Georgette Gown", "Studio Noir", "Gowns", 11499, 19999, 4.8, 203, "NEW", "c", ["XS", "S", "M", "L"]),
    mk(7, "Pearl Embroidered Lehenga", "NewMe Atelier", "Lehengas", 15999, 27999, 4.9, 156, "LIMITED", "a", STD),
    mk(8, "Kanjivaram Silk Saree", "Heritage Weaves", "Sarees", 10999, 18499, 5.0, 341, "HERITAGE", "b", ["Free Size"]),
    mk(9, "Tailored Wool Blazer Set", "Studio Noir", "Blazers", 7299, 12999, 4.6, 512, "MEMBERS", "e", ["S", "M", "L", "XL"]),
    mk(10, "Chikankari Kurta Suit", "Craft House", "Suits", 4599, 8499, 4.7, 768, "POPULAR", "d", STD),
    mk(11, "Satin Evening Gown", "NewMe Originals", "Gowns", 8999, 15499, 4.8, 274, "TRENDING", "c", ["XS", "S", "M", "L"]),
    mk(12, "Cotton Linen Co-ord", "NewMe Originals", "Co-ords", 2999, 5499, 4.5, 1102, "BESTSELLER", "e", STD),
];

const FILTERS = ["All", "Lehengas", "Sarees", "Suits", "Co-ords", "Blazers", "Gowns"];
const SORT_OPTIONS = ["Featured", "Newest First", "Price: Low–High", "Price: High–Low", "Top Rated"];
const PAGE_SIZE = 8;

const sortItems = (items, sort) => {
    const a = [...items];
    if (sort === "Newest First") return a.sort((x, y) => y.id - x.id);
    if (sort === "Price: Low–High") return a.sort((x, y) => x.price - y.price);
    if (sort === "Price: High–Low") return a.sort((x, y) => y.price - x.price);
    if (sort === "Top Rated") return a.sort((x, y) => y.rating - x.rating || y.reviews - x.reviews);
    return a;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const BackToTop = () => {
    const [show, setShow] = useState(false);
    useRafScroll(() => setShow(window.scrollY > 700));
    return (
        <button aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center bg-white text-black shadow-xl transition-all duration-300 hover:scale-110 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <ChevUp c="w-5 h-5" />
        </button>
    );
};

const Stars = ({ rating }) => (
    <div className="flex items-center gap-0.5 text-white">
        {Array.from({ length: 5 }).map((_, i) => (
            <StarFull key={i} c={`w-2.5 h-2.5 ${i < Math.floor(rating) ? "" : "opacity-25"}`} />
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HERO (compact, parallax)
// ─────────────────────────────────────────────────────────────────────────────
const PageHero = ({ total }) => {
    const [vis, setVis] = useState(false);
    const root = useRef(null), img = useRef(null), content = useRef(null);
    useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

    useRafScroll(() => {
        if (reduceMotion() || !root.current) return;
        const h = root.current.offsetHeight;
        const y = Math.min(Math.max(window.scrollY, 0), h);
        const p = y / h;
        if (img.current) img.current.style.transform = `translate3d(0,${y * 0.3}px,0) scale(${1.1 + p * 0.06})`;
        if (content.current) {
            content.current.style.transform = `translate3d(0,${y * 0.15}px,0)`;
            content.current.style.opacity = String(1 - p * 1.3);
        }
    });

    return (
        <div ref={root} className="relative w-full overflow-hidden py-10">
            <div className="absolute inset-0">
                <img ref={img} src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=700&fit=crop&q=90&auto=format" alt="" className="w-full h-full object-cover will-change-transform" style={{ transform: "scale(1.1)" }} />
                <div className="absolute inset-0 bg-black/75" />
            </div>
            <div ref={content} className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-10 xl:px-14 py-16 md:py-24 text-center will-change-transform">
                <div style={{ animation: vis ? "fadeUp 0.7s ease 0.1s both" : "none", opacity: vis ? 1 : 0 }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 bg-white/10 border border-white/20">
                        <GemIcon c="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] font-black tracking-[0.22em] uppercase text-white">Members Exclusive</span>
                    </div>
                </div>
                <div style={{ animation: vis ? "fadeUp 0.7s ease 0.22s both" : "none", opacity: vis ? 1 : 0 }}>
                    <h1 className="font-black leading-none mb-1 font-display text-white text-[clamp(34px,6vw,64px)] tracking-[-0.03em]">All Exclusive</h1>
                    <h1 className="font-black leading-none font-display white-shimmer text-[clamp(34px,6vw,64px)] tracking-[-0.03em]">Products</h1>
                </div>
                <p className="mt-4 font-body text-sm md:text-base max-w-lg mx-auto leading-relaxed text-white/60"
                    style={{ animation: vis ? "fadeUp 0.6s ease 0.42s both" : "none", opacity: vis ? 1 : 0 }}>
                    Every members-only piece in one place. {total} styles, all at exclusive pricing.
                </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
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

    const stop = fn => e => { e.stopPropagation(); fn(); };
    const handleCart = () => { setAdded(true); setTimeout(() => setAdded(false), 1800); };
    const delay = (index % 4) * 0.06;

    if (isListView) {
        return (
            <div ref={ref} onClick={onClick} className="product-card flex gap-5 p-4 rounded-2xl cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-16px)", transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s, background-color 0.3s` }}>
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
                    <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                        <div className="flex items-baseline gap-2"><span className="font-black text-white text-base">₹{p.price.toLocaleString()}</span><span className="text-xs line-through text-white/30">₹{p.orig.toLocaleString()}</span><span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/10 text-white">{p.disc}% off</span></div>
                        <div className="flex items-center gap-2">
                            <button aria-label="Wishlist" onClick={stop(() => setWish(w => !w))} className="p-1.5 rounded-full transition-all bg-white/10 text-white/50 hover:text-red-400"><HeartIcon c="w-3.5 h-3.5" filled={wish} /></button>
                            <button onClick={stop(handleCart)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] bg-white text-black">{added ? <CheckIcon c="w-3 h-3" /> : <CartIcon c="w-3 h-3" />}{added ? "Added" : "Add"}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} onClick={onClick} className="product-card cursor-pointer rounded-2xl overflow-hidden bg-neutral-900 border border-white/10"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.52s ease ${delay}s, transform 0.52s ease ${delay}s` }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <img src={p.img} alt={p.name} className="card-img absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700" loading="lazy" />
                <img src={p.himg} alt="" className="hover-overlay absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-500" loading="lazy" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50" />
                <div className="absolute top-3 left-3 z-10"><span className="text-[8px] font-black tracking-[0.12em] uppercase px-2 py-1 rounded-lg bg-white text-black">{p.badge}</span></div>
                <div className="absolute top-3 right-3 z-10"><span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-black/70 text-white backdrop-blur-sm">-{p.disc}%</span></div>
                <button aria-label="Wishlist" onClick={stop(() => setWish(w => !w))} className="absolute right-3 top-12 z-20 flex items-center justify-center rounded-full transition-all duration-300 w-8 h-8 bg-white/90 text-black shadow-md"><HeartIcon c="w-3.5 h-3.5" filled={wish} /></button>
                <div className="absolute left-3 bottom-14 z-10 flex items-center gap-1.5">{p.colors.map((col, ci) => (<button key={ci} aria-label="Color" onClick={stop(() => setSel(ci))} className="rounded-full transition-all duration-200" style={{ width: selColor === ci ? "13px" : "9px", height: selColor === ci ? "13px" : "9px", background: col, border: selColor === ci ? "2px solid white" : "1.5px solid rgba(255,255,255,0.3)" }} />))}</div>
                <div className="quick-add absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2.5 translate-y-full opacity-0 transition-all duration-300 bg-black/80 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">{p.sizes.slice(0, 3).map(sz => (<span key={sz} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white/75">{sz}</span>))}{p.sizes.length > 3 && <span className="text-[9px] text-white/40">+{p.sizes.length - 3}</span>}</div>
                    <button onClick={stop(handleCart)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] active:scale-95 bg-white text-black">{added ? <CheckIcon c="w-3 h-3" /> : <CartIcon c="w-3 h-3" />}{added ? "Added!" : "Quick Add"}</button>
                </div>
            </div>
            <div className="px-3.5 pt-3 pb-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-0.5 text-white/50">{p.brand}</p>
                <h3 className="font-bold text-white text-sm leading-snug mb-1.5 font-display tracking-[-0.01em]">{p.name}</h3>
                <div className="flex items-center gap-1.5 mb-2.5"><Stars rating={p.rating} /><span className="text-[9px] font-semibold text-white/40">({p.reviews.toLocaleString()})</span></div>
                <div className="flex items-center justify-between">
                    <div><div className="flex items-baseline gap-1.5"><span className="font-black text-white text-base">₹{p.price.toLocaleString()}</span><span className="text-[10px] line-through text-white/30">₹{p.orig.toLocaleString()}</span></div><span className="text-[9px] font-black text-white/70">Save ₹{(p.orig - p.price).toLocaleString()}</span></div>
                    <span className="p-2 rounded-xl bg-white/5 text-white/40"><EyeIcon c="w-3.5 h-3.5" /></span>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR (search + filters + sort + view)
// ─────────────────────────────────────────────────────────────────────────────
const Toolbar = ({ query, setQuery, activeFilter, setFilter, sort, setSort, viewMode, setView, count }) => {
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef(null);

    useEffect(() => {
        const fn = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    return (
        <div className="sticky top-0 z-30 py-3 px-4 md:px-6 lg:px-10 xl:px-14 bg-black/90 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-3 bg-white/5 border border-white/10 focus-within:border-white/30 transition-colors">
                    <SearchIcon c="w-4 h-4 text-white/40" />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or brand"
                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30 font-body" />
                    {query && <button aria-label="Clear search" onClick={() => setQuery("")} className="text-white/40 hover:text-white"><CloseIcon c="w-3.5 h-3.5" /></button>}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar" style={{ scrollbarWidth: "none" }}>
                    {FILTERS.map(f => (<button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 text-[11px] font-bold px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap font-body ${activeFilter === f ? "bg-white text-black shadow-[0_4px_14px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white/60 border border-white/10 hover:text-white"}`}>{f}</button>))}
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold font-body text-white/40"><span className="text-white font-bold">{count}</span> exclusive pieces</p>
                    <div className="flex items-center gap-2">
                        <div className="relative" ref={sortRef}>
                            <button onClick={() => setSortOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold font-body bg-white/5 text-white/65 border border-white/10"><FilterIcon c="w-3 h-3" />{sort}<ChevRight c={`w-3 h-3 transition-transform ${sortOpen ? "rotate-90" : ""}`} /></button>
                            {sortOpen && (<div className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[180px] bg-neutral-900 border border-white/10 shadow-2xl">{SORT_OPTIONS.map(opt => (<button key={opt} onClick={() => { setSort(opt); setSortOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold text-left transition-colors font-body hover:bg-white/10" style={{ color: sort === opt ? "#FFFFFF" : "rgba(255,255,255,0.65)" }}>{opt}{sort === opt && <CheckIcon c="w-3 h-3" />}</button>))}</div>)}
                        </div>
                        <div className="flex items-center rounded-xl overflow-hidden border border-white/10">
                            {[{ id: "grid", Icon: GridIcon }, { id: "list", Icon: ListIcon }].map(({ id, Icon }) => (<button key={id} aria-label={`${id} view`} onClick={() => setView(id)} className={`p-1.5 transition-colors ${viewMode === id ? "bg-white/20 text-white" : "bg-transparent text-white/40"}`}><Icon c="w-3.5 h-3.5" /></button>))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AllExclusiveProductsPage() {
    const [query, setQuery] = useState("");
    const [activeFilter, setFilter] = useState("All");
    const [sort, setSort] = useState("Featured");
    const [viewMode, setView] = useState("grid");
    const [shown, setShown] = useState(PAGE_SIZE);
    const navigate = useNavigate();

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = PRODUCTS.filter(p =>
            (activeFilter === "All" || p.cat === activeFilter) &&
            (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)));
        return sortItems(filtered, sort);
    }, [query, activeFilter, sort]);

    useEffect(() => { setShown(PAGE_SIZE); }, [query, activeFilter, sort]);

    const visible = results.slice(0, shown);
    const remaining = results.length - visible.length;
    const reset = () => { setQuery(""); setFilter("All"); };

    return (
        <>
            <Navbar />
            <ScrollProgress />
            <div className="min-h-screen font-body bg-black">
                <Styles />
                <PageHero total={PRODUCTS.length} />
                <Toolbar query={query} setQuery={setQuery} activeFilter={activeFilter} setFilter={setFilter}
                    sort={sort} setSort={setSort} viewMode={viewMode} setView={setView} count={results.length} />

                <div className="px-4 md:px-6 lg:px-10 xl:px-14 py-8 max-w-7xl mx-auto min-h-[50vh]">
                    {results.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="font-display text-white text-2xl font-bold mb-2">No pieces match your search</p>
                            <p className="text-sm text-white/40 mb-6">Try a different name or clear the filters.</p>
                            <button onClick={reset} className="px-6 py-3 rounded-xl font-black text-sm bg-white text-black hover:scale-105 active:scale-95 transition-all">Clear filters</button>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {visible.map((p, i) => (<ProductCard key={p.id} p={p} index={i} isListView={false} onClick={() => navigate(`/exclusiveproducts/${p.id}`)} />))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {visible.map((p, i) => (<ProductCard key={p.id} p={p} index={i} isListView onClick={() => navigate(`/exclusiveproducts/${p.id}`)} />))}
                        </div>
                    )}
                </div>

                {results.length > 0 && (
                    <div className="flex flex-col items-center gap-3 pb-20 px-4">
                        <p className="text-[11px] font-semibold text-white/40">Showing {visible.length} of {results.length}</p>
                        <div className="w-40 h-[3px] rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-white transition-all duration-500" style={{ width: `${(visible.length / results.length) * 100}%` }} /></div>
                        {remaining > 0 && (
                            <button onClick={() => setShown(s => s + PAGE_SIZE)} className="flex items-center gap-2 mt-2 px-10 py-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 bg-white/5 border border-white/20 text-white shadow-lg">Load {Math.min(PAGE_SIZE, remaining)} more<ChevRight c="w-4 h-4" /></button>
                        )}
                    </div>
                )}

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="py-6 text-center px-4"><p className="text-[11px] font-semibold font-body text-white/25">All exclusive pieces are authenticated · Members-only pricing · Free delivery above ₹999</p></div>
            </div>
            <BackToTop />
            <Footer />
        </>
    );
}