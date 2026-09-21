import { useState, useRef, useEffect } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .fd  { font-family: 'Playfair Display', Georgia, serif; }
    .fs  { font-family: 'DM Sans', system-ui, sans-serif; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes pulseRing{ 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.06);opacity:.2} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes scaleIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

    .gold-text {
      background: linear-gradient(90deg,#C9A96E,#E8C97A,#C9A96E);
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3.5s linear infinite;
    }
    .thumb-track::-webkit-scrollbar { display: none; }
    .tab-track::-webkit-scrollbar   { display: none; }
    .review-track::-webkit-scrollbar{ display: none; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Ic = ({ d, c = "w-5 h-5", fill = "none", sw = 2, ch }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={c} fill={fill}
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {d ? <path d={d} /> : ch}
    </svg>
);
const Heart = ({ c, f }) => <Ic c={c || "w-5 h-5"} fill={f ? "currentColor" : "none"} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />;
const Cart = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></>} />;
const StarFull = ({ c }) => <Ic c={c || "w-4 h-4"} fill="currentColor" sw={0} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const Check = ({ c }) => <Ic c={c || "w-4 h-4"} d="M5 13l4 4L19 7" sw={2.5} />;
const Share = ({ c }) => <Ic c={c || "w-5 h-5"} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />;
const Gem = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20M6 3l4 6m4 0l4-6m-8 0v6" /></>} />;
const Shield = ({ c }) => <Ic c={c || "w-4 h-4"} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const Truck = ({ c }) => <Ic c={c || "w-4 h-4"} ch={<><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>} />;
const RefreshCw = ({ c }) => <Ic c={c || "w-4 h-4"} d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />;
const Ruler = ({ c }) => <Ic c={c || "w-4 h-4"} d="M2 16L16 2l6 6L8 22l-6-6zM8 8l4 4M12 4l4 4M4 12l4 4" />;
const Plus = ({ c }) => <Ic c={c || "w-4 h-4"} d="M12 5v14M5 12h14" />;
const Minus = ({ c }) => <Ic c={c || "w-4 h-4"} d="M5 12h14" />;
const ChevD = ({ c }) => <Ic c={c || "w-4 h-4"} d="M19 9l-7 7-7-7" sw={2.5} />;
const Zap = ({ c }) => <Ic c={c || "w-4 h-4"} fill="currentColor" sw={0} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const Eye = ({ c }) => <Ic c={c || "w-4 h-4"} ch={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} />;

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DATA
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT = {
    name: "Silk Organza Lehenga",
    brand: "NewMe Atelier",
    badge: "SIGNATURE PIECE",
    badgeCol: "#E8C97A",
    sku: "NMA-SOL-001",
    price: 12999,
    orig: 22999,
    disc: 43,
    rating: 4.9,
    reviews: 412,
    inStock: true,
    freeShip: true,
    images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1100&fit=crop&q=90&auto=format",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1100&fit=crop&q=90&auto=format",
        "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=900&h=1100&fit=crop&q=90&auto=format",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1100&fit=crop&q=90&auto=format",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1100&fit=crop&q=90&auto=format",
    ],
    colors: [
        { name: "Ivory Gold", hex: "#C9A96E" },
        { name: "Midnight Red", hex: "#8B0000" },
        { name: "Onyx Black", hex: "#1a1812" },
        { name: "Rose Dust", hex: "#c9948a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    features: [
        "100% Pure Silk Organza fabric",
        "Hand-embroidered zardozi work",
        "Gold-plated mirror embellishments",
        "Fully lined with premium satin",
        "Custom stitching available",
    ],
    delivery: "Express 3–4 days · Free above ₹999",
    origin: "Varanasi, India",
    views: "3.4k",
};

const REVIEWS = [
    { id: 1, name: "Priya S.", rating: 5, date: "Jan 2025", text: "Absolutely breathtaking. The craftsmanship is beyond anything I've seen online. Worth every rupee — wore it at my sister's wedding and got stopped every 5 minutes.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&q=80" },
    { id: 2, name: "Anjali M.", rating: 5, date: "Dec 2024", text: "The fabric drape is ethereal. Delivery was faster than promised. NewMe Atelier truly lives up to its premium tag. I'm ordering the dupatta next!", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&q=80" },
    { id: 3, name: "Deepika R.", rating: 5, date: "Nov 2024", text: "Ordered for my engagement. The embroidery detail in real life is even more stunning than the pictures. Couldn't be happier.", img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=60&h=60&fit=crop&q=80" },
];

const RELATED = [
    { id: 1, name: "Zardozi Anarkali", price: 9299, img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=320&h=420&fit=crop&q=80&auto=format" },
    { id: 2, name: "Mirror Work Lehenga", price: 7499, img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=320&h=420&fit=crop&q=80&auto=format" },
    { id: 3, name: "Banarasi Saree", price: 8499, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=320&h=420&fit=crop&q=80&auto=format" },
    { id: 4, name: "Chanderi Tissue Set", price: 5299, img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=320&h=420&fit=crop&q=80&auto=format" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STAR RATING ROW
// ─────────────────────────────────────────────────────────────────────────────
const Stars = ({ rating, size = "w-3.5 h-3.5", accent = "#C9A96E" }) => (
    <div className="flex items-center gap-0.5" style={{ color: accent }}>
        {Array.from({ length: 5 }).map((_, i) => (
            <StarFull key={i} c={`${size} ${i < Math.round(rating) ? "" : "opacity-20"}`} />
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE GALLERY
// ─────────────────────────────────────────────────────────────────────────────
const Gallery = ({ images }) => {
    const [active, setActive] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    return (
        <div className="flex gap-3 w-full">
            {/* Thumbnails — vertical strip */}
            <div className="thumb-track flex flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: "560px", scrollbarWidth: "none" }}>
                {images.map((img, i) => (
                    <button key={i} onClick={() => setActive(i)}
                        className="flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200"
                        style={{
                            width: "68px", height: "84px",
                            border: i === active ? "2px solid #C9A96E" : "2px solid rgba(255,255,255,0.08)",
                            boxShadow: i === active ? "0 0 0 3px rgba(201,169,110,0.20)" : "none",
                        }}>
                        <img src={img} alt={`View ${i + 1}`}
                            className="w-full h-full object-cover object-top"
                            style={{ opacity: i === active ? 1 : 0.55, transition: "opacity 0.2s" }}
                            loading="lazy" draggable={false} />
                    </button>
                ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden rounded-2xl cursor-zoom-in"
                style={{
                    background: "#141410",
                    border: "1px solid rgba(201,169,110,0.12)",
                    aspectRatio: "4/5",
                }}
                onClick={() => setZoomed(z => !z)}>
                <img src={images[active]} alt={PRODUCT.name}
                    className="w-full h-full object-cover object-top transition-all duration-700"
                    style={{ transform: zoomed ? "scale(1.35)" : "scale(1.0)" }}
                    loading="eager" draggable={false} />

                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="text-[9px] font-black tracking-[0.14em] uppercase px-2.5 py-1.5 rounded-full"
                        style={{ background: PRODUCT.badgeCol, color: "#0C0C0C" }}>
                        {PRODUCT.badge}
                    </span>
                </div>

                {/* Discount */}
                <div className="absolute top-4 right-4 z-10">
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg"
                        style={{ background: "rgba(12,12,12,0.72)", color: "#E8C97A", backdropFilter: "blur(6px)" }}>
                        -{PRODUCT.disc}%
                    </span>
                </div>

                {/* Views */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                    style={{ background: "rgba(12,12,12,0.60)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    <Eye c="w-3 h-3 text-white/50" />
                    <span className="text-[10px] font-semibold text-white/50 fs">{PRODUCT.views} views today</span>
                </div>

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(12,12,12,0.60)", backdropFilter: "blur(8px)" }}>
                    <span className="text-[10px] font-bold text-white/50 fs tabular-nums">
                        {active + 1} / {images.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIZE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
const SizeSelector = ({ sizes, selected, onSelect }) => (
    <div className="flex flex-wrap gap-2">
        {sizes.map(sz => (
            <button key={sz} onClick={() => onSelect(sz)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 fs"
                style={selected === sz
                    ? {
                        background: "linear-gradient(135deg,#C9A96E,#a8843f)", color: "#0C0C0C",
                        boxShadow: "0 4px 14px rgba(201,169,110,0.35)"
                    }
                    : {
                        background: "rgba(255,255,255,0.05)", color: "rgba(245,240,232,0.65)",
                        border: "1px solid rgba(255,255,255,0.10)"
                    }}>
                {sz}
            </button>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLOR SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
const ColorSelector = ({ colors, selected, onSelect }) => (
    <div className="flex items-center gap-3">
        {colors.map((col, i) => (
            <button key={i} onClick={() => onSelect(i)}
                className="flex flex-col items-center gap-1 group" title={col.name}>
                <div className="rounded-full transition-all duration-200"
                    style={{
                        width: "28px", height: "28px",
                        background: col.hex,
                        border: selected === i ? "2px solid #F5F0E8" : "2px solid rgba(255,255,255,0.12)",
                        boxShadow: selected === i ? `0 0 0 3px ${col.hex}` : "none",
                        transform: selected === i ? "scale(1.12)" : "scale(1)",
                    }} />
                <span className="text-[8px] font-semibold opacity-50 group-hover:opacity-80 transition-opacity fs hidden sm:block">
                    {col.name.split(" ")[0]}
                </span>
            </button>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// QUANTITY STEPPER
// ─────────────────────────────────────────────────────────────────────────────
const QtyInput = ({ qty, setQty }) => (
    <div className="flex items-center rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
        <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "rgba(245,240,232,0.6)" }}>
            <Minus c="w-3.5 h-3.5" />
        </button>
        <span className="w-10 text-center font-black text-sm text-white fs tabular-nums">{qty}</span>
        <button onClick={() => setQty(q => Math.min(10, q + 1))}
            className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "rgba(245,240,232,0.6)" }}>
            <Plus c="w-3.5 h-3.5" />
        </button>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BADGES
// ─────────────────────────────────────────────────────────────────────────────
const TrustBadge = ({ Icon, title, sub }) => (
    <div className="flex items-start gap-2.5 p-3 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.10)" }}>
        <span style={{ color: "#C9A96E" }}><Icon c="w-4 h-4 flex-shrink-0 mt-0.5" /></span>
        <div>
            <p className="text-[11px] font-bold text-white fs">{title}</p>
            <p className="text-[10px] fs" style={{ color: "rgba(245,240,232,0.40)" }}>{sub}</p>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ACCORDION
// ─────────────────────────────────────────────────────────────────────────────
const Accordion = ({ title, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b" style={{ borderColor: "rgba(201,169,110,0.12)" }}>
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-4 text-left transition-colors group fs"
                style={{ color: "rgba(245,240,232,0.80)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.80)"}>
                <span className="text-sm font-bold">{title}</span>
                <ChevD c={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-4" : "max-h-0"}`}>
                <div className="text-sm fs leading-relaxed" style={{ color: "rgba(245,240,232,0.50)" }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW CARD
// ─────────────────────────────────────────────────────────────────────────────
const ReviewCard = ({ r }) => (
    <div className="flex-shrink-0 p-5 rounded-2xl w-72"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.10)" }}>
        <div className="flex items-center gap-3 mb-3">
            <img src={r.img} alt={r.name} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
            <div>
                <p className="text-xs font-bold text-white fs">{r.name}</p>
                <p className="text-[10px] fs" style={{ color: "rgba(245,240,232,0.35)" }}>{r.date}</p>
            </div>
            <Stars rating={r.rating} size="w-3 h-3" />
        </div>
        <p className="text-xs leading-relaxed fs" style={{ color: "rgba(245,240,232,0.55)" }}>{r.text}</p>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATED PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
const RelatedCard = ({ p }) => {
    const [hov, setHov] = useState(false);
    return (
        <div className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 w-44"
            style={{
                border: "1px solid rgba(201,169,110,0.10)",
                background: "#141410",
                boxShadow: hov ? "0 20px 48px rgba(12,12,12,0.35)" : "0 4px 18px rgba(12,12,12,0.15)",
            }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}>
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <img src={p.img} alt={p.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700"
                    style={{ transform: hov ? "scale(1.08)" : "scale(1)" }}
                    loading="lazy" draggable={false} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 60%,rgba(12,12,12,0.6) 100%)" }} />
            </div>
            <div className="px-3 py-2.5">
                <p className="text-[11px] font-bold text-white leading-tight mb-0.5 fd truncate">{p.name}</p>
                <p className="text-[11px] font-black" style={{ color: "#C9A96E" }}>₹{p.price.toLocaleString()}</p>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SingleExclusiveProduct() {
    const [selColor, setColor] = useState(0);
    const [selSize, setSize] = useState("");
    const [qty, setQty] = useState(1);
    const [wish, setWish] = useState(false);
    const [added, setAdded] = useState(false);
    const [bought, setBought] = useState(false);
    const [vis, setVis] = useState(false);
    const [activeTab, setTab] = useState("details");

    useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

    const handleCart = () => {
        if (!selSize) { alert("Please select a size"); return; }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };
    const handleBuy = () => {
        if (!selSize) { alert("Please select a size"); return; }
        setBought(true);
        setTimeout(() => setBought(false), 1500);
    };

    const savings = PRODUCT.orig - PRODUCT.price;

    return (
        <>
            <Header />
            <div className="min-h-screen fs" style={{ background: "#0C0C0C", color: "#F5F0E8" }}>
                <Styles />

              

                {/* ── MAIN GRID ── */}
                <div className="px-4 md:px-8 lg:px-14 py-6 grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 max-w-7xl mx-auto">

                    {/* ══ LEFT: GALLERY ══ */}
                    <div style={{
                        opacity: vis ? 1 : 0,
                        animation: vis ? "fadeUp 0.65s ease 0.05s both" : "none",
                    }}>
                        <Gallery images={PRODUCT.images} />
                    </div>

                    {/* ══ RIGHT: PRODUCT INFO ══ */}
                    <div className="flex flex-col gap-6" style={{
                        opacity: vis ? 1 : 0,
                        animation: vis ? "fadeUp 0.65s ease 0.20s both" : "none",
                    }}>

                        {/* Brand + badge */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Gem c="w-4 h-4 text-[#C9A96E]" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] fs" style={{ color: "#C9A96E" }}>
                                    {PRODUCT.brand}
                                </span>
                            </div>
                            <span className="text-[9px] font-black tracking-[0.14em] uppercase px-2.5 py-1 rounded-full fs"
                                style={{ background: PRODUCT.badgeCol, color: "#0C0C0C" }}>
                                {PRODUCT.badge}
                            </span>
                        </div>

                        {/* Name */}
                        <div>
                            <h1 className="fd font-black leading-tight"
                                style={{ fontSize: "clamp(26px,4vw,44px)", letterSpacing: "-0.02em", color: "#F5F0E8" }}>
                                {PRODUCT.name}
                            </h1>
                            <p className="text-xs mt-1 fs" style={{ color: "rgba(245,240,232,0.35)" }}>
                                SKU: {PRODUCT.sku} · Origin: {PRODUCT.origin}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3 py-3 px-4 rounded-xl"
                            style={{ background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.12)" }}>
                            <Stars rating={PRODUCT.rating} size="w-4 h-4" accent="#E8C97A" />
                            <span className="font-black text-sm fd" style={{ color: "#E8C97A" }}>{PRODUCT.rating}</span>
                            <span className="text-xs fs" style={{ color: "rgba(245,240,232,0.45)" }}>
                                {PRODUCT.reviews.toLocaleString()} verified reviews
                            </span>
                            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold fs"
                                style={{ color: "#6fcf97" }}>
                                <Check c="w-3 h-3" /> Authenticated
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="fd font-black" style={{ fontSize: "clamp(28px,4vw,40px)", color: "#F5F0E8" }}>
                                    ₹{PRODUCT.price.toLocaleString()}
                                </span>
                                <span className="text-base line-through fs" style={{ color: "rgba(245,240,232,0.30)" }}>
                                    ₹{PRODUCT.orig.toLocaleString()}
                                </span>
                                <span className="text-sm font-black px-3 py-1 rounded-full fs"
                                    style={{ background: "rgba(232,201,122,0.14)", color: "#E8C97A" }}>
                                    {PRODUCT.disc}% OFF
                                </span>
                            </div>
                            <p className="text-sm font-bold fs" style={{ color: "#6fcf97" }}>
                                You save ₹{savings.toLocaleString()} · Members-only price
                            </p>
                        </div>

                        {/* Color */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] fs"
                                    style={{ color: "rgba(245,240,232,0.55)" }}>
                                    Colour
                                </p>
                                <p className="text-xs font-bold fs" style={{ color: "#C9A96E" }}>
                                    {PRODUCT.colors[selColor].name}
                                </p>
                            </div>
                            <ColorSelector colors={PRODUCT.colors} selected={selColor} onSelect={setColor} />
                        </div>

                        {/* Size */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] fs"
                                    style={{ color: "rgba(245,240,232,0.55)" }}>
                                    Size
                                </p>
                                <button className="flex items-center gap-1 text-xs font-bold fs transition-colors"
                                    style={{ color: "#C9A96E" }}
                                    onMouseEnter={e => e.currentTarget.style.color = "#E8C97A"}
                                    onMouseLeave={e => e.currentTarget.style.color = "#C9A96E"}>
                                    <Ruler c="w-3 h-3" /> Size Guide
                                </button>
                            </div>
                            <SizeSelector sizes={PRODUCT.sizes} selected={selSize} onSelect={setSize} />
                            {!selSize && (
                                <p className="text-[10px] mt-1.5 fs" style={{ color: "rgba(245,240,232,0.30)" }}>
                                    Please select a size to continue
                                </p>
                            )}
                        </div>

                        {/* Quantity + Wishlist row */}
                        <div className="flex items-center gap-3">
                            <QtyInput qty={qty} setQty={setQty} />
                            <button onClick={() => setWish(w => !w)}
                                className="flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                                style={{
                                    width: "42px", height: "42px",
                                    background: wish ? "rgba(232,93,74,0.15)" : "rgba(255,255,255,0.06)",
                                    color: wish ? "#e85d4a" : "rgba(245,240,232,0.50)",
                                    border: wish ? "1px solid rgba(232,93,74,0.3)" : "1px solid rgba(255,255,255,0.10)",
                                }}
                                aria-label="Wishlist">
                                <Heart c="w-4.5 h-4.5" f={wish} />
                            </button>
                            <button className="flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                style={{
                                    width: "42px", height: "42px",
                                    background: "rgba(255,255,255,0.06)",
                                    color: "rgba(245,240,232,0.50)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                }}
                                aria-label="Share">
                                <Share c="w-4 h-4" />
                            </button>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={handleCart}
                                className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm
                               tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] fs"
                                style={{
                                    background: added ? "#6fcf97" : "linear-gradient(135deg,#C9A96E,#a8843f)",
                                    color: "#0C0C0C",
                                    boxShadow: added ? "0 6px 24px rgba(111,207,151,0.40)" : "0 6px 24px rgba(201,169,110,0.40)",
                                    transition: "all 0.3s ease",
                                }}>
                                {added ? <Check c="w-4 h-4" /> : <Cart c="w-4 h-4" />}
                                {added ? "Added to Cart!" : "Add to Cart"}
                            </button>
                            <button onClick={handleBuy}
                                className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm
                               tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] fs"
                                style={{
                                    background: bought ? "rgba(111,207,151,0.12)" : "rgba(255,255,255,0.06)",
                                    color: bought ? "#6fcf97" : "rgba(245,240,232,0.85)",
                                    border: `1.5px solid ${bought ? "rgba(111,207,151,0.30)" : "rgba(255,255,255,0.12)"}`,
                                }}>
                                {bought ? <Check c="w-4 h-4" /> : <Zap c="w-4 h-4" />}
                                {bought ? "Order Placed!" : "Buy Now"}
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <TrustBadge Icon={Truck} title="Express Delivery" sub="3–4 days · Free ₹999+" />
                            <TrustBadge Icon={Shield} title="Authenticity" sub="100% genuine, certified" />
                            <TrustBadge Icon={RefreshCw} title="Easy Returns" sub="15-day hassle-free" />
                        </div>

                        {/* Accordions */}
                        <div className="rounded-2xl overflow-hidden px-1"
                            style={{ border: "1px solid rgba(201,169,110,0.12)", background: "rgba(255,255,255,0.02)" }}>
                            <div className="px-4">
                                <Accordion title="Product Details">
                                    <ul className="space-y-1.5 mt-1">
                                        {PRODUCT.features.map(f => (
                                            <li key={f} className="flex items-start gap-2">
                                                <Check c="w-3 h-3 mt-0.5 flex-shrink-0 text-[#C9A96E]" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </Accordion>
                                <Accordion title="Fabric & Care">
                                    <p>Dry clean only. Store in a breathable garment bag. Avoid direct sunlight for extended periods.
                                        Iron on lowest setting with a pressing cloth.</p>
                                </Accordion>
                                <Accordion title="Shipping & Returns">
                                    <p>{PRODUCT.delivery}. Returns accepted within 15 days in original condition with tags attached.
                                        Customised pieces are non-returnable.</p>
                                </Accordion>
                                <Accordion title="Craftsmanship">
                                    <p>Each piece is handcrafted by master artisans in {PRODUCT.origin}. Production takes 7–10 days
                                        for standard sizes, 14–18 days for custom orders.</p>
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── GOLD DIVIDER ── */}
                <div className="h-px mx-4 md:mx-8 lg:mx-14 my-2"
                    style={{ background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.35),transparent)" }} />

                {/* ── REVIEWS ── */}
                <div className="px-4 md:px-8 lg:px-14 py-10 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1 fs" style={{ color: "#C9A96E" }}>What they say</p>
                            <h2 className="fd font-black leading-none" style={{ fontSize: "clamp(22px,3.5vw,36px)", color: "#F5F0E8" }}>
                                Customer Reviews
                            </h2>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                            style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.15)" }}>
                            <Stars rating={4.9} size="w-4 h-4" accent="#E8C97A" />
                            <span className="fd font-black text-white text-lg">4.9</span>
                            <span className="fs text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>/ 412 reviews</span>
                        </div>
                    </div>
                    <div className="review-track flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
                        {REVIEWS.map(r => <ReviewCard key={r.id} r={r} />)}
                    </div>
                </div>

                {/* ── GOLD DIVIDER ── */}
                <div className="h-px mx-4 md:mx-8 lg:mx-14"
                    style={{ background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.25),transparent)" }} />

                {/* ── YOU MAY ALSO LIKE ── */}
                <div className="px-4 md:px-8 lg:px-14 py-10 max-w-7xl mx-auto pb-24">
                    <div className="mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1 fs" style={{ color: "#C9A96E" }}>Curated for you</p>
                        <h2 className="fd font-black leading-none" style={{ fontSize: "clamp(22px,3.5vw,36px)", color: "#F5F0E8" }}>
                            You May Also Love
                        </h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
                        {RELATED.map(p => <RelatedCard key={p.id} p={p} />)}
                    </div>
                </div>

                {/* ── STICKY BOTTOM BAR (mobile) ── */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
                    style={{
                        background: "rgba(12,12,12,0.95)", backdropFilter: "blur(16px)",
                        borderTop: "1px solid rgba(201,169,110,0.15)"
                    }}>
                    <div className="flex items-center gap-3 max-w-lg mx-auto">
                        <div className="flex flex-col">
                            <span className="fd font-black text-white text-lg">₹{PRODUCT.price.toLocaleString()}</span>
                            <span className="fs text-[10px]" style={{ color: "#C9A96E" }}>Save ₹{savings.toLocaleString()}</span>
                        </div>
                        <button onClick={handleCart}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm fs
                             transition-all active:scale-95"
                            style={{
                                background: added ? "#6fcf97" : "linear-gradient(135deg,#C9A96E,#a8843f)",
                                color: "#0C0C0C",
                                boxShadow: "0 4px 18px rgba(201,169,110,0.35)",
                            }}>
                            {added ? <Check c="w-4 h-4" /> : <Cart c="w-4 h-4" />}
                            {added ? "Added!" : "Add to Cart"}
                        </button>
                        <button onClick={handleBuy}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm fs
                             transition-all active:scale-95"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                color: "rgba(245,240,232,0.85)",
                                border: "1.5px solid rgba(255,255,255,0.12)",
                            }}>
                            <Zap c="w-4 h-4" />
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}