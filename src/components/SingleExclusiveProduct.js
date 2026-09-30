import { useState, useRef, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SizeGuideModal from "../views/SizeGuide";
import { useNavigate } from "react-router-dom";

const GOLD = "#C9A96E";
const GOLD2 = "#E8C97A";
const CREAM = "#F5F0E8";
const INK = "#0C0C0C";
const EASE = "cubic-bezier(.22,1,.36,1)";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .fd { font-family: 'Playfair Display', Georgia, serif; }
    .fs { font-family: 'DM Sans', system-ui, sans-serif; }

    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes wordUp  { from{transform:translateY(110%)} to{transform:translateY(0)} }
    @keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    @keyframes toastIn { from{opacity:0;transform:translate(-50%,-14px)} to{opacity:1;transform:translate(-50%,0)} }
    @keyframes imgIn   { from{opacity:0;transform:scale(1.08)} to{opacity:1;transform:scale(1)} }

    .gold-text {
      background: linear-gradient(90deg,#C9A96E,#E8C97A,#C9A96E);
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      animation: shimmer 3.5s linear infinite;
    }
    .no-scrollbar { scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }

    .btn-shine { position: relative; overflow: hidden; }
    .btn-shine::after {
      content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
      background: linear-gradient(120deg, transparent, rgba(255,255,255,.45), transparent);
      transform: skewX(-20deg); transition: left .7s ease;
    }
    .btn-shine:hover::after { left: 130%; }

    @media (prefers-reduced-motion: reduce) {
      *, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
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
const ChevL = ({ c }) => <Ic c={c || "w-4 h-4"} d="M15 18l-6-6 6-6" sw={2.5} />;
const ChevR = ({ c }) => <Ic c={c || "w-4 h-4"} d="M9 18l6-6-6-6" sw={2.5} />;
const Zap = ({ c }) => <Ic c={c || "w-4 h-4"} fill="currentColor" sw={0} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const Eye = ({ c }) => <Ic c={c || "w-4 h-4"} ch={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} />;

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT = {
    name: "Silk Organza Lehenga",
    brand: "NewMe Atelier",
    badge: "SIGNATURE PIECE",
    sku: "NMA-SOL-001",
    price: 12999,
    orig: 22999,
    disc: 43,
    rating: 4.9,
    reviews: 412,
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
const BREAKDOWN = [[5, 88], [4, 9], [3, 2], [2, 1], [1, 0]];

const RELATED = [
    { id: 1, name: "Zardozi Anarkali", price: 9299, img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=320&h=420&fit=crop&q=80&auto=format" },
    { id: 2, name: "Mirror Work Lehenga", price: 7499, img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=320&h=420&fit=crop&q=80&auto=format" },
    { id: 3, name: "Banarasi Saree", price: 8499, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=320&h=420&fit=crop&q=80&auto=format" },
    { id: 4, name: "Chanderi Tissue Set", price: 5299, img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=320&h=420&fit=crop&q=80&auto=format" },
];

const STATS = [
    { n: 40, s: "+", l: "Hours of hand embroidery" },
    { n: 12, s: "", l: "Master artisans per piece" },
    { n: 100, s: "%", l: "Pure silk organza" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MOTION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// scroll/resize handler throttled with rAF; never re-renders by itself
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

const useInView = (threshold = 0.12) => {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        if (reduceMotion()) { setSeen(true); return; }
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); obs.disconnect(); } }, { threshold, rootMargin: "0px 0px -6% 0px" });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, seen];
};

const Reveal = ({ children, delay = 0, y = 28, className = "", style }) => {
    const [ref, seen] = useInView();
    return (
        <div ref={ref} className={className}
            style={{
                opacity: seen ? 1 : 0,
                transform: seen ? "none" : `translate3d(0,${y}px,0)`,
                transition: `opacity .85s ${EASE} ${delay}s, transform .85s ${EASE} ${delay}s`,
                ...style,
            }}>
            {children}
        </div>
    );
};

const CountUp = ({ to, suffix = "" }) => {
    const [ref, seen] = useInView(0.4);
    const [v, setV] = useState(0);
    useEffect(() => {
        if (!seen) return;
        if (reduceMotion()) { setV(to); return; }
        let raf, start = null;
        const tick = t => {
            if (start === null) start = t;
            const p = Math.min((t - start) / 1600, 1);
            setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [seen, to]);
    return <span ref={ref}>{v}{suffix}</span>;
};

// Headline with each word sliding up from a mask
const WordReveal = ({ text }) => (
    <>
        {text.split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-1 mr-[0.25em]">
                <span className="inline-block" style={{ animation: `wordUp .9s ${EASE} ${0.15 + i * 0.09}s both` }}>{w}</span>
            </span>
        ))}
    </>
);

const ScrollProgress = () => {
    const bar = useRef(null);
    useRafScroll(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    });
    return (
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none">
            <div ref={bar} className="h-full origin-left" style={{ transform: "scaleX(0)", background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
        </div>
    );
};

// Soft gold light that drifts at a different speed than the page
const Ambient = () => {
    const a = useRef(null), b = useRef(null);
    useRafScroll(() => {
        if (reduceMotion()) return;
        const y = window.scrollY;
        if (a.current) a.current.style.transform = `translate3d(0,${y * 0.12}px,0)`;
        if (b.current) b.current.style.transform = `translate3d(0,${-y * 0.08}px,0)`;
    });
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div ref={a} className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full will-change-transform"
                style={{ background: "radial-gradient(circle,rgba(201,169,110,.13),transparent 70%)" }} />
            <div ref={b} className="absolute top-1/2 -right-48 w-[600px] h-[600px] rounded-full will-change-transform"
                style={{ background: "radial-gradient(circle,rgba(201,169,110,.09),transparent 70%)" }} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL UI PIECES
// ─────────────────────────────────────────────────────────────────────────────
const Stars = ({ rating, size = "w-3.5 h-3.5", accent = GOLD }) => (
    <div className="flex items-center gap-0.5" style={{ color: accent }}>
        {Array.from({ length: 5 }).map((_, i) => (
            <StarFull key={i} c={`${size} ${i < Math.round(rating) ? "" : "opacity-20"}`} />
        ))}
    </div>
);

const SizeSelector = ({ sizes, selected, onSelect }) => (
    <div className="flex flex-wrap gap-2">
        {sizes.map(sz => (
            <button key={sz} onClick={() => onSelect(sz)}
                className="min-w-[48px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 fs hover:-translate-y-0.5"
                style={selected === sz
                    ? { background: `linear-gradient(135deg,${GOLD},#a8843f)`, color: INK, boxShadow: "0 6px 18px rgba(201,169,110,0.35)" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(245,240,232,0.65)", border: "1px solid rgba(255,255,255,0.10)" }}>
                {sz}
            </button>
        ))}
    </div>
);

const ColorSelector = ({ colors, selected, onSelect }) => (
    <div className="flex items-center gap-3.5">
        {colors.map((col, i) => (
            <button key={i} onClick={() => onSelect(i)} title={col.name} aria-label={col.name}
                className="rounded-full transition-all duration-300 hover:scale-110"
                style={{
                    width: 30, height: 30, background: col.hex,
                    border: selected === i ? `2px solid ${CREAM}` : "2px solid rgba(255,255,255,0.12)",
                    boxShadow: selected === i ? `0 0 0 3px ${col.hex}66` : "none",
                    transform: selected === i ? "scale(1.12)" : undefined,
                }} />
        ))}
    </div>
);

const QtyInput = ({ qty, setQty }) => (
    <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
        <button aria-label="Decrease" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: "rgba(245,240,232,0.6)" }}><Minus c="w-3.5 h-3.5" /></button>
        <span className="w-9 text-center font-black text-sm text-white fs tabular-nums">{qty}</span>
        <button aria-label="Increase" onClick={() => setQty(q => Math.min(10, q + 1))} className="w-10 h-11 flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: "rgba(245,240,232,0.6)" }}><Plus c="w-3.5 h-3.5" /></button>
    </div>
);

const IconBtn = ({ children, label, onClick, active }) => (
    <button onClick={onClick} aria-label={label}
        className="flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 w-11 h-11"
        style={{
            background: active ? "rgba(232,93,74,0.15)" : "rgba(255,255,255,0.06)",
            color: active ? "#e85d4a" : "rgba(245,240,232,0.55)",
            border: active ? "1px solid rgba(232,93,74,0.3)" : "1px solid rgba(255,255,255,0.10)",
        }}>
        {children}
    </button>
);

const TrustBadge = ({ Icon, title, sub }) => (
    <div className="flex items-start gap-2.5 p-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.12)" }}>
        <span style={{ color: GOLD }}><Icon c="w-4 h-4 flex-shrink-0 mt-0.5" /></span>
        <div>
            <p className="text-[11px] font-bold text-white fs">{title}</p>
            <p className="text-[10px] fs" style={{ color: "rgba(245,240,232,0.42)" }}>{sub}</p>
        </div>
    </div>
);

const Accordion = ({ title, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b last:border-b-0" style={{ borderColor: "rgba(201,169,110,0.12)" }}>
            <button onClick={() => setOpen(o => !o)} aria-expanded={open}
                className="w-full flex items-center justify-between py-4 text-left transition-colors fs hover:text-[#C9A96E]"
                style={{ color: open ? GOLD : "rgba(245,240,232,0.85)" }}>
                <span className="text-sm font-bold">{title}</span>
                <ChevD c={`w-4 h-4 transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
            </button>
            <div className="grid transition-all duration-500" style={{ gridTemplateRows: open ? "1fr" : "0fr", transitionTimingFunction: EASE }}>
                <div className="overflow-hidden">
                    <div className="pb-4 text-sm fs leading-relaxed" style={{ color: "rgba(245,240,232,0.55)" }}>{children}</div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY  (crossfade, hover-follow zoom, swipe + arrows, responsive thumbs)
// ─────────────────────────────────────────────────────────────────────────────
const Gallery = ({ images }) => {
    const [active, setActive] = useState(0);
    const [zoom, setZoom] = useState(false);
    const zoomRef = useRef(null);
    const touchX = useRef(null);
    const go = d => setActive(a => (a + d + images.length) % images.length);

    const onMove = e => {
        if (!zoomRef.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        zoomRef.current.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    };
    const enter = () => { if (window.matchMedia("(hover: hover)").matches) setZoom(true); };
    const onTouchEnd = e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        touchX.current = null;
    };

    return (
        <div className="flex flex-col-reverse md:flex-row gap-3 w-full mx-auto max-w-[640px] lg:max-w-none" style={{ animation: `imgIn 1.1s ${EASE} both` }}>
            {/* Thumbs: row on mobile, column from md up */}
            <div className="no-scrollbar flex md:flex-col gap-2.5 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[560px] pb-1 md:pb-0">
                {images.map((img, i) => (
                    <button key={i} onClick={() => setActive(i)} aria-label={`View ${i + 1}`}
                        className="flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 w-16 h-20 md:w-[68px] md:h-[84px]"
                        style={{
                            border: i === active ? `2px solid ${GOLD}` : "2px solid rgba(255,255,255,0.08)",
                            boxShadow: i === active ? "0 0 0 3px rgba(201,169,110,0.2)" : "none",
                        }}>
                        <img src={img} alt="" className="w-full h-full object-cover object-top transition-opacity duration-300"
                            style={{ opacity: i === active ? 1 : 0.5 }} loading="lazy" draggable={false} />
                    </button>
                ))}
            </div>

            {/* Main stage */}
            <div className="flex-1 relative overflow-hidden rounded-2xl md:cursor-zoom-in select-none"
                style={{ background: "#141410", border: "1px solid rgba(201,169,110,0.15)", aspectRatio: "4/5", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
                onMouseEnter={enter} onMouseLeave={() => setZoom(false)} onMouseMove={onMove}
                onTouchStart={e => (touchX.current = e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
                <div ref={zoomRef} className="absolute inset-0 transition-transform duration-500"
                    style={{ transform: zoom ? "scale(1.8)" : "scale(1)", transitionTimingFunction: EASE }}>
                    {images.map((img, i) => (
                        <img key={i} src={img} alt={i === active ? PRODUCT.name : ""}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            style={{ opacity: i === active ? 1 : 0, transition: `opacity .7s ${EASE}` }}
                            loading={i === 0 ? "eager" : "lazy"} draggable={false} />
                    ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(12,12,12,.55),transparent)" }} />

                <span className="absolute top-4 left-4 z-10 text-[9px] font-black tracking-[0.14em] uppercase px-2.5 py-1.5 rounded-full" style={{ background: GOLD2, color: INK }}>{PRODUCT.badge}</span>
                <span className="absolute top-4 right-4 z-10 text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: "rgba(12,12,12,0.72)", color: GOLD2, backdropFilter: "blur(6px)" }}>-{PRODUCT.disc}%</span>

                {/* <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: "rgba(12,12,12,0.60)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    <Eye c="w-3 h-3 text-white/50" />
                    <span className="text-[10px] font-semibold text-white/60 fs">{PRODUCT.views} views today</span>
                </div> */}

                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5">
                    <button aria-label="Previous image" onClick={() => go(-1)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors" style={{ background: "rgba(12,12,12,0.6)", backdropFilter: "blur(8px)" }}><ChevL c="w-3.5 h-3.5" /></button>
                    <span className="text-[10px] font-bold text-white/60 fs tabular-nums px-1">{active + 1} / {images.length}</span>
                    <button aria-label="Next image" onClick={() => go(1)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors" style={{ background: "rgba(12,12,12,0.6)", backdropFilter: "blur(8px)" }}><ChevR c="w-3.5 h-3.5" /></button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// PARALLAX CRAFT BAND + COUNTERS
// ─────────────────────────────────────────────────────────────────────────────
const CraftBand = () => {
    const root = useRef(null), img = useRef(null);
    useRafScroll(() => {
        if (reduceMotion() || !root.current || !img.current) return;
        const r = root.current.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        img.current.style.transform = `translate3d(0,${p * -80}px,0) scale(1.2)`;
    });
    return (
        <section ref={root} className="relative overflow-hidden my-10 md:my-14">
            <img ref={img} src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=900&fit=crop&q=85&auto=format" alt=""
                className="absolute inset-0 w-full h-full object-cover will-change-transform" style={{ transform: "scale(1.2)" }} loading="lazy" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(12,12,12,.92),rgba(12,12,12,.7) 50%,rgba(12,12,12,.92))" }} />
            <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-14 py-16 md:py-24 text-center">
                <Reveal>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-3 fs" style={{ color: GOLD }}>Made by hand in {PRODUCT.origin}</p>
                    <h2 className="fd font-black leading-tight mx-auto max-w-2xl" style={{ fontSize: "clamp(26px,4.5vw,48px)", color: CREAM, letterSpacing: "-0.02em" }}>
                        Every stitch is <span className="gold-text italic">placed by an artisan</span>
                    </h2>
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 mt-12 max-w-3xl mx-auto">
                    {STATS.map((s, i) => (
                        <Reveal key={s.l} delay={0.12 * i}>
                            <p className="fd font-black text-[clamp(38px,6vw,60px)] leading-none" style={{ color: GOLD2 }}><CountUp to={s.n} suffix={s.s} /></p>
                            <p className="text-xs mt-2 fs" style={{ color: "rgba(245,240,232,0.55)" }}>{s.l}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
const RatingSummary = () => {
    const [ref, seen] = useInView(0.3);
    return (
        <div ref={ref} className="p-5 rounded-2xl w-full lg:w-72 flex-shrink-0" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.15)" }}>
            <div className="flex items-end gap-3 mb-4">
                <span className="fd font-black text-white text-5xl leading-none">{PRODUCT.rating}</span>
                <div className="pb-1"><Stars rating={PRODUCT.rating} size="w-4 h-4" accent={GOLD2} /><p className="text-[11px] mt-1 fs" style={{ color: "rgba(245,240,232,0.45)" }}>{PRODUCT.reviews} reviews</p></div>
            </div>
            {BREAKDOWN.map(([star, pct], i) => (
                <div key={star} className="flex items-center gap-2 mb-1.5 fs">
                    <span className="text-[10px] w-3 text-white/60">{star}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: seen ? `${pct}%` : "0%", background: `linear-gradient(90deg,${GOLD},${GOLD2})`, transition: `width 1.1s ${EASE} ${0.1 * i}s` }} />
                    </div>
                    <span className="text-[10px] w-7 text-right text-white/40 tabular-nums">{pct}%</span>
                </div>
            ))}
        </div>
    );
};

const ReviewCard = ({ r }) => (
    <div className="flex-shrink-0 snap-start p-5 rounded-2xl w-[82%] sm:w-80 transition-all duration-500 hover:-translate-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,110,0.12)" }}>
        <div className="flex items-center gap-3 mb-3">
            <img src={r.img} alt={r.name} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white fs">{r.name}</p>
                <p className="text-[10px] fs" style={{ color: "rgba(245,240,232,0.35)" }}>{r.date}</p>
            </div>
            <Stars rating={r.rating} size="w-3 h-3" />
        </div>
        <p className="text-xs leading-relaxed fs" style={{ color: "rgba(245,240,232,0.6)" }}>{r.text}</p>
    </div>
);

const RelatedCard = ({ p }) => {

    const navigate = useNavigate();

    return (
    <>
    <div onClick={()=>navigate(`/exclusiveproducts/${p.id}`)} className="group flex-shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer w-40 sm:w-48 transition-all duration-500 hover:-translate-y-2"
        style={{ border: "1px solid rgba(201,169,110,0.12)", background: "#141410" }}>
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
            <img src={p.img} alt={p.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" loading="lazy" draggable={false} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 60%,rgba(12,12,12,0.6))" }} />
        </div>
        <div className="px-3 py-2.5">
            <p className="text-[11px] font-bold text-white leading-tight mb-0.5 fd truncate">{p.name}</p>
            <p className="text-[11px] font-black" style={{ color: GOLD }}>₹{p.price.toLocaleString()}</p>
        </div>
    </div>
    </>
)};

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
    const [shake, setShake] = useState(false);
    const [toast, setToast] = useState(null);
    const [barOn, setBarOn] = useState(false);
    const ctaRef = useRef(null), sizeRef = useRef(null), toastTimer = useRef(null);

    const [isSizeOpen, setIsSizeOpen] = useState(false);

    // Floating buy bar shows whenever the main buttons are off-screen
    useEffect(() => {
        const el = ctaRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => setBarOn(!e.isIntersecting), { threshold: 0 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    useEffect(() => () => clearTimeout(toastTimer.current), []);

    const show = (msg, kind = "ok") => {
        setToast({ msg, kind });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2600);
    };
    const needSize = () => {
        show("Please select a size to continue", "warn");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        if (sizeRef.current) sizeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const handleCart = () => {
        if (!selSize) return needSize();
        setAdded(true);
        show(`${qty} × ${PRODUCT.name} (${selSize}) added to cart`);
        setTimeout(() => setAdded(false), 2000);
    };
    const handleBuy = () => {
        if (!selSize) return needSize();
        setBought(true);
        setTimeout(() => setBought(false), 1500);
    };

    const savings = PRODUCT.orig - PRODUCT.price;

    return (
        <>
            <Header />
            <ScrollProgress />
            <div className="relative min-h-screen fs pb-28 lg:pb-32" style={{ background: INK, color: CREAM, overflowX: "clip" }}>
                <Styles />
                <Ambient />

                <div className="relative z-10">
                    {/* ── MAIN GRID ── */}
                    <div className="px-4 md:px-8 lg:px-14 pt-6 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 max-w-7xl mx-auto">
                        {/* Gallery stays pinned while the details scroll on desktop */}
                        <div className="lg:sticky lg:top-24 self-start min-w-0">
                            <Gallery images={PRODUCT.images} />
                        </div>

                        <div className="flex flex-col gap-6 min-w-0">
                            <Reveal>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Gem c="w-4 h-4 flex-shrink-0 text-[#C9A96E]" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em] fs truncate" style={{ color: GOLD }}>{PRODUCT.brand}</span>
                                    </div>
                                    <span className="flex-shrink-0 text-[9px] font-black tracking-[0.14em] uppercase px-2.5 py-1 rounded-full fs" style={{ background: GOLD2, color: INK }}>{PRODUCT.badge}</span>
                                </div>
                            </Reveal>

                            <div>
                                <h1 className="fd font-black leading-[1.08]" style={{ fontSize: "clamp(30px,5vw,50px)", letterSpacing: "-0.02em", color: CREAM }}>
                                    <WordReveal text={PRODUCT.name} />
                                </h1>
                                <Reveal delay={0.35}>
                                    <p className="text-xs mt-2 fs" style={{ color: "rgba(245,240,232,0.38)" }}>SKU: {PRODUCT.sku} · Origin: {PRODUCT.origin}</p>
                                </Reveal>
                            </div>

                            <Reveal delay={0.1}>
                                <div className="flex items-center gap-x-3 gap-y-2 flex-wrap py-3 px-4 rounded-xl" style={{ background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.14)" }}>
                                    <Stars rating={PRODUCT.rating} size="w-4 h-4" accent={GOLD2} />
                                    <span className="font-black text-sm fd" style={{ color: GOLD2 }}>{PRODUCT.rating}</span>
                                    <span className="text-xs fs" style={{ color: "rgba(245,240,232,0.5)" }}>{PRODUCT.reviews.toLocaleString()} verified reviews</span>
                                    <span className="ml-auto flex items-center gap-1 text-[10px] font-bold fs" style={{ color: "#6fcf97" }}><Check c="w-3 h-3" /> Authenticated</span>
                                </div>
                            </Reveal>

                            <Reveal delay={0.15}>
                                <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap">
                                    <span className="fd font-black" style={{ fontSize: "clamp(30px,4.5vw,44px)", color: CREAM }}>₹{PRODUCT.price.toLocaleString()}</span>
                                    <span className="text-base line-through fs" style={{ color: "rgba(245,240,232,0.3)" }}>₹{PRODUCT.orig.toLocaleString()}</span>
                                    <span className="text-sm font-black px-3 py-1 rounded-full fs" style={{ background: "rgba(232,201,122,0.14)", color: GOLD2 }}>{PRODUCT.disc}% OFF</span>
                                </div>
                                <p className="text-sm font-bold fs mt-1" style={{ color: "#6fcf97" }}>You save ₹{savings.toLocaleString()} · Members-only price</p>
                            </Reveal>

                            <Reveal delay={0.05}>
                                <div className="flex items-center justify-between mb-2.5">
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] fs" style={{ color: "rgba(245,240,232,0.55)" }}>Colour</p>
                                    <p className="text-xs font-bold fs" style={{ color: GOLD }}>{PRODUCT.colors[selColor].name}</p>
                                </div>
                                <ColorSelector colors={PRODUCT.colors} selected={selColor} onSelect={setColor} />
                            </Reveal>

                            <Reveal delay={0.05}>
                                <div ref={sizeRef} style={{ animation: shake ? "shake .55s ease" : "none" }}>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] fs" style={{ color: "rgba(245,240,232,0.55)" }}>Size</p>
                                        <button onClick={() => setIsSizeOpen(true)} className="flex items-center gap-1 text-xs font-bold fs transition-colors hover:text-[#E8C97A]" style={{ color: GOLD }}><Ruler c="w-3 h-3" /> Size Guide</button>
                                    </div>
                                    <SizeSelector sizes={PRODUCT.sizes} selected={selSize} onSelect={setSize} />
                                    {!selSize && <p className="text-[10px] mt-2 fs" style={{ color: "rgba(245,240,232,0.35)" }}>Select a size to continue</p>}
                                </div>
                            </Reveal>

                            <Reveal>
                                <div className="flex items-center gap-3">
                                    <QtyInput qty={qty} setQty={setQty} />
                                    <IconBtn label="Wishlist" active={wish} onClick={() => setWish(w => !w)}><Heart c="w-[18px] h-[18px]" f={wish} /></IconBtn>
                                    <IconBtn label="Share"><Share c="w-4 h-4" /></IconBtn>
                                </div>
                            </Reveal>

                            <Reveal>
                                <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={handleCart}
                                        className="btn-shine flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] fs"
                                        style={{
                                            background: added ? "#6fcf97" : `linear-gradient(135deg,${GOLD},#a8843f)`, color: INK,
                                            boxShadow: added ? "0 8px 28px rgba(111,207,151,0.4)" : "0 8px 28px rgba(201,169,110,0.4)",
                                            transition: "all .3s ease",
                                        }}>
                                        {added ? <Check c="w-4 h-4" /> : <Cart c="w-4 h-4" />}
                                        {added ? "Added to Cart!" : "Add to Cart"}
                                    </button>
                                    <button onClick={handleBuy}
                                        className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] fs"
                                        style={{
                                            background: bought ? "rgba(111,207,151,0.12)" : "rgba(255,255,255,0.06)",
                                            color: bought ? "#6fcf97" : "rgba(245,240,232,0.9)",
                                            border: `1.5px solid ${bought ? "rgba(111,207,151,0.3)" : "rgba(255,255,255,0.14)"}`,
                                            transition: "all .3s ease",
                                        }}>
                                        {bought ? <Check c="w-4 h-4" /> : <Zap c="w-4 h-4" />}
                                        {bought ? "Order Placed!" : "Buy Now"}
                                    </button>
                                </div>
                            </Reveal>

                            <Reveal>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <TrustBadge Icon={Truck} title="Express Delivery" sub="3–4 days · Free ₹999+" />
                                    <TrustBadge Icon={Shield} title="Authenticity" sub="100% genuine, certified" />
                                    <TrustBadge Icon={RefreshCw} title="Easy Returns" sub="15-day hassle-free" />
                                </div>
                            </Reveal>

                            <Reveal>
                                <div className="rounded-2xl px-5" style={{ border: "1px solid rgba(201,169,110,0.14)", background: "rgba(255,255,255,0.02)" }}>
                                    <Accordion title="Product Details" defaultOpen>
                                        <ul className="space-y-1.5">
                                            {PRODUCT.features.map(f => (
                                                <li key={f} className="flex items-start gap-2"><Check c="w-3 h-3 mt-1 flex-shrink-0 text-[#C9A96E]" />{f}</li>
                                            ))}
                                        </ul>
                                    </Accordion>
                                    <Accordion title="Fabric & Care"><p>Dry clean only. Store in a breathable garment bag. Avoid direct sunlight for extended periods. Iron on lowest setting with a pressing cloth.</p></Accordion>
                                    <Accordion title="Shipping & Returns"><p>{PRODUCT.delivery}. Returns accepted within 15 days in original condition with tags attached. Customised pieces are non-returnable.</p></Accordion>
                                    <Accordion title="Craftsmanship"><p>Each piece is handcrafted by master artisans in {PRODUCT.origin}. Production takes 7–10 days for standard sizes, 14–18 days for custom orders.</p></Accordion>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    <CraftBand />

                    {/* ── REVIEWS ── */}
                    <section className="px-4 md:px-8 lg:px-14 py-8 md:py-10 max-w-7xl mx-auto">
                        <Reveal className="mb-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1 fs" style={{ color: GOLD }}>What they say</p>
                            <h2 className="fd font-black leading-none" style={{ fontSize: "clamp(24px,3.5vw,38px)", color: CREAM }}>Customer Reviews</h2>
                        </Reveal>
                        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-stretch">
                            <Reveal><RatingSummary /></Reveal>
                            <div className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 flex-1 min-w-0">
                                {REVIEWS.map((r, i) => (<Reveal key={r.id} delay={0.1 * i} className="flex"><ReviewCard r={r} /></Reveal>))}
                            </div>
                        </div>
                    </section>

                    <div className="h-px mx-4 md:mx-8 lg:mx-14" style={{ background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent)" }} />

                    {/* ── RELATED ── */}
                    <section className="px-4 md:px-8 lg:px-14 py-10 max-w-7xl mx-auto">
                        <Reveal className="mb-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1 fs" style={{ color: GOLD }}>Curated for you</p>
                            <h2 className="fd font-black leading-none" style={{ fontSize: "clamp(24px,3.5vw,38px)", color: CREAM }}>You May Also Love</h2>
                        </Reveal>
                        <div className="no-scrollbar flex gap-4 overflow-x-auto snap-x pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                            {RELATED.map((p, i) => (<Reveal key={p.id} delay={0.09 * i} y={40}><RelatedCard p={p} /></Reveal>))}
                        </div>
                    </section>
                </div>

                {/* ── FLOATING BUY BAR (mobile: full width, desktop: centred pill) ── */}
                <div className="fixed left-0 right-0 bottom-0 z-50 px-3 pb-3 pointer-events-none flex justify-center"
                    style={{
                        transform: barOn ? "translateY(0)" : "translateY(140%)",
                        opacity: barOn ? 1 : 0,
                        transition: `transform .6s ${EASE}, opacity .4s ease`,
                        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
                    }}>
                    <div className="pointer-events-auto w-full max-w-2xl flex items-center gap-3 p-2.5 pr-3 rounded-2xl"
                        style={{ background: "rgba(12,12,12,0.85)", backdropFilter: "blur(18px)", border: "1px solid rgba(201,169,110,0.25)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                        <img src={PRODUCT.images[0]} alt="" className="hidden sm:block w-11 h-14 rounded-lg object-cover object-top flex-shrink-0" />
                        <div className="flex flex-col min-w-0 flex-shrink-0">
                            <span className="hidden sm:block fd font-bold text-white text-xs truncate max-w-[150px]">{PRODUCT.name}</span>
                            <span className="fd font-black text-white text-base leading-tight">₹{PRODUCT.price.toLocaleString()}</span>
                            <span className="fs text-[10px]" style={{ color: GOLD }}>Save ₹{savings.toLocaleString()}</span>
                        </div>
                        <button onClick={handleCart} className="btn-shine flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm fs active:scale-95 transition-transform"
                            style={{ background: added ? "#6fcf97" : `linear-gradient(135deg,${GOLD},#a8843f)`, color: INK }}>
                            {added ? <Check c="w-4 h-4" /> : <Cart c="w-4 h-4" />}{added ? "Added!" : "Add to Cart"}
                        </button>
                        <button onClick={handleBuy} className="hidden sm:flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm fs active:scale-95 transition-transform"
                            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(245,240,232,0.9)", border: "1.5px solid rgba(255,255,255,0.14)" }}>
                            <Zap c="w-4 h-4" />Buy Now
                        </button>
                    </div>
                </div>

                {/* ── TOAST ── */}
                {toast && (
                    <div role="status" className="fixed top-20 left-1/2 z-[110] px-5 py-3 rounded-xl text-xs font-bold fs max-w-[90vw] text-center"
                        style={{
                            animation: "toastIn .5s ease both",
                            background: "rgba(12,12,12,0.92)", backdropFilter: "blur(14px)",
                            border: `1px solid ${toast.kind === "warn" ? "rgba(232,93,74,0.5)" : "rgba(201,169,110,0.4)"}`,
                            color: toast.kind === "warn" ? "#f0917f" : GOLD2,
                            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                        }}>
                        {toast.msg}
                    </div>
                )}
            </div>
            <SizeGuideModal isOpen={isSizeOpen} onClose={() => setIsSizeOpen(false)} />
            <Footer />
        </>
    );
}