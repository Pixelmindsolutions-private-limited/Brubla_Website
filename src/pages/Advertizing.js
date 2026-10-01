import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import productImage from "../assets/latest1.png";

const API_BASE = "http://31.97.228.17:4077";
const fixImageUrl = (url = "") => url.replace("http://localhost:4077", API_BASE);

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA — used only when you don't pass `items` (products only)
// ─────────────────────────────────────────────────────────────────────────────
export const SAMPLE_PRODUCTS = [
    { id: 1, name: "Linen Shirt", price: 1299, originalPrice: 1999, image: productImage, badge: "New" },
    { id: 2, name: "Cotton Kurta Set", price: 1799, originalPrice: 2999, image: "https://placehold.co/600x800/e5e7eb/64748b?text=BRUBLA" },
    { id: 3, name: "Oversized Tee", price: 799, originalPrice: 1199, image: productImage, badge: "Trending" },
    { id: 4, name: "Palazzo Pants", price: 999, originalPrice: 1499, image: productImage },
    { id: 5, name: "Co-ord Set", price: 2199, originalPrice: 3199, image: "https://placehold.co/600x800/e5e7eb/64748b?text=BRUBLA" },
    { id: 6, name: "Denim Jacket", price: 2499, originalPrice: 3499, image: productImage },
    { id: 7, name: "Printed Kurta", price: 1499, originalPrice: 2199, image: productImage },
];

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUTS FOR 3 / 5 / 7 ITEMS
//
// Grid = 2 columns on phones, 4 columns from tablet (md) up.
// Class names are written out in full so Tailwind keeps them.
//
// PHONE (2 cols): first tile is big (2×2), the rest are small (1×1)
//   3 items → big + 2 small      = 3 rows, no gaps
//   5 items → big + 4 small      = 4 rows, no gaps
//   7 items → big + 6 small      = 5 rows, no gaps
//
// TABLET / DESKTOP (4 cols):
//   3 items → big (2×2) on the left, two wide tiles stacked on the right
//   5 items → big (2×2) on the left, four small tiles in a 2×2 on the right
//   7 items → same as 5, plus two wide tiles filling a third row
// ─────────────────────────────────────────────────────────────────────────────
const BIG = "col-span-2 row-span-2";
const WIDE = "md:col-span-2";

const LAYOUTS = {
    1: [`${BIG} md:col-span-4`],
    2: ["row-span-2 md:col-span-2", "row-span-2 md:col-span-2"],
    3: [BIG, WIDE, WIDE],
    5: [BIG, "", "", "", ""],
    7: [BIG, "", "", "", "", WIDE, WIDE],
};

// Largest supported count that fits the data (4 → 3, 6 → 5, 8+ → 7)
const pickCount = (len, wanted) => {
    if (wanted && LAYOUTS[wanted] && wanted <= len) return wanted;
    if (len >= 7) return 7;
    if (len >= 5) return 5;
    return len; // 1, 2 or 3
};

// Row height per screen size. Products are taller so the price block fits.
const ROW_UNITS = {
    image:
        "auto-rows-[150px] sm:auto-rows-[190px] md:auto-rows-[200px] lg:auto-rows-[260px]",
    product:
        "auto-rows-[220px] sm:auto-rows-[260px] md:auto-rows-[280px] lg:auto-rows-[320px]",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const useGo = () => {
    const navigate = useNavigate();
    return useCallback(
        (to) => {
            if (!to) return;
            if (/^https?:\/\//.test(to)) window.open(to, "_blank", "noopener,noreferrer");
            else navigate(to);
        },
        [navigate],
    );
};

const THEMES = {
    light: {
        bg: "bg-[#f9f5f0]",
        eyebrow: "text-[#7a6a5a]",
        title: "text-black",
        text: "text-black",
        muted: "text-[#7a6a5a]",
        card: "bg-white border-[rgba(111,78,55,0.15)]",
        link: "text-black border-black hover:bg-black hover:text-white",
        placeholder: "#e8ddd5",
    },
    dark: {
        bg: "bg-[#0a0a0a]",
        eyebrow: "text-white/50",
        title: "text-white",
        text: "text-white",
        muted: "text-white/50",
        card: "bg-neutral-900 border-white/15",
        link: "text-white border-white/40 hover:bg-white hover:text-black",
        placeholder: "#1c1c1c",
    },
};

// Image that never looks broken: shows a tinted block if the file is missing
const Img = ({ src, alt = "", className = "", placeholder }) => (
    <>
        <div className="absolute inset-0" style={{ background: placeholder }} />
        {src && (
            <img
                src={src}
                alt={alt}
                loading="lazy"
                draggable={false}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                className={`absolute inset-0 h-full w-full object-cover ${className}`}
            />
        )}
    </>
);

const useRemoteItems = (type, enabled) => {
    const [items, setItems] = useState(null);

    useEffect(() => {
        if (!enabled) return;
        let alive = true;

        const url =
            type === "collections"
                ? `${API_BASE}/api/users/collections`
                : type === "categories"
                    ? `${API_BASE}/api/users/menu`
                    : null;
        if (!url) return;

        fetch(url)
            .then((r) => r.json())
            .then((res) => {
                if (!alive || !res.success) return;
                if (type === "collections") {
                    setItems(
                        [...res.data]
                            .sort((a, b) => a.order - b.order)
                            .map((c) => ({
                                id: c._id,
                                title: c.title,
                                image: fixImageUrl(c.image),
                                to: `/collections/${c._id}`,
                            })),
                    );
                } else {
                    setItems(
                        (res.data?.categories || []).map((c) => ({
                            id: c.id,
                            title: c.name,
                            image: c.image ? fixImageUrl(c.image) : "",
                            to: `/products?category=${encodeURIComponent(c.name)}`,
                        })),
                    );
                }
            })
            .catch(() => { });
        return () => { alive = false; };
    }, [type, enabled]);

    return items;
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, subtitle, viewAllTo, viewAllLabel, t }) => {
    const go = useGo();
    return (
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div className="min-w-0">
                {eyebrow && (
                    <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.25em] ${t.eyebrow}`}>{eyebrow}</p>
                )}
                <h2 className={`text-[clamp(22px,4vw,38px)] font-black leading-tight tracking-[-0.02em] ${t.title}`}>
                    {title}
                </h2>
                {subtitle && <p className={`mt-1.5 text-sm ${t.muted}`}>{subtitle}</p>}
            </div>
            {viewAllTo && (
                <button
                    onClick={() => go(viewAllTo)}
                    className={`flex-shrink-0 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 active:scale-95 ${t.link}`}
                >
                    {viewAllLabel}
                </button>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GRID — fixed 2 / 4 columns with a fixed row height; the LAYOUTS table above
// decides which tiles span more than one cell so the grid is always full
// ─────────────────────────────────────────────────────────────────────────────
const LayoutGrid = ({ kind, children }) => (
    <div
        className={`grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5 ${ROW_UNITS[kind]}`}
    >
        {children}
    </div>
);

const tileBase = "group relative overflow-hidden rounded-2xl text-left sm:rounded-3xl";

// ─────────────────────────────────────────────────────────────────────────────
// 1) CATEGORIES / 2) COLLECTIONS — image tiles with title on the image
// ─────────────────────────────────────────────────────────────────────────────
const ImageTiles = ({ items, t, label }) => {
    const go = useGo();
    const layout = LAYOUTS[items.length] || [];
    return (
        <LayoutGrid kind="image">
            {items.map((c, i) => {
                const big = i === 0 && items.length >= 3;
                return (
                    <button
                        key={c.id}
                        onClick={() => go(c.to)}
                        className={`${tileBase} ${layout[i] || ""} transition-shadow duration-300 hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)]`}
                    >
                        <Img
                            src={c.image}
                            alt={c.title}
                            placeholder={t.placeholder}
                            className="transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                    "https://placehold.co/600x800/e5e7eb/64748b?text=BRUBLA";
                            }}
                        />
                        {!c.image && (
                            <span className={`absolute inset-0 flex items-center justify-center text-5xl font-black ${t.muted}`}>
                                {c.title?.[0]}
                            </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                        <div className={`absolute inset-x-0 bottom-0 ${big ? "p-4 sm:p-6 lg:p-8" : "p-3 sm:p-5"}`}>
                            <h3
                                className={`font-black leading-tight text-white ${big ? "text-xl sm:text-3xl lg:text-4xl" : "text-sm sm:text-lg lg:text-xl"
                                    }`}
                            >
                                {c.title}
                            </h3>
                            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:text-[11px]">
                                {label}
                                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                            </span>
                        </div>
                    </button>
                );
            })}
        </LayoutGrid>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3) PRODUCTS — the image fills the tile, the price block sits at the bottom
// ─────────────────────────────────────────────────────────────────────────────
const ProductTiles = ({ items, t }) => {
    const go = useGo();
    const layout = LAYOUTS[items.length] || [];
    return (
        <LayoutGrid kind="product">
            {items.map((p, i) => {
                const big = i === 0 && items.length >= 3;
                const off =
                    p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : 0;
                return (
                    <button
                        key={p.id}
                        onClick={() => go(p.to || `/product/${p.id}`)}
                        className={`${tileBase} ${layout[i] || ""} flex flex-col border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] ${t.card}`}
                    >
                        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
                            <Img src={p.image} alt={p.name} placeholder={t.placeholder} className="object-top transition-transform duration-500 group-hover:scale-105" />
                            {(p.badge || off > 0) && (
                                <span className="absolute left-2.5 top-2.5 rounded-full bg-black px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white sm:left-3 sm:top-3 sm:text-[10px]">
                                    {p.badge || `${off}% off`}
                                </span>
                            )}
                        </div>
                        <div className={`w-full flex-shrink-0 ${big ? "p-4 sm:p-5" : "p-3 sm:p-4"}`}>
                            <p className={`truncate font-semibold ${t.text} ${big ? "text-base sm:text-lg" : "text-sm"}`}>{p.name}</p>
                            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                                <span className={`font-black ${t.text} ${big ? "text-lg sm:text-2xl" : "text-sm sm:text-base"}`}>
                                    ₹{p.price?.toLocaleString()}
                                </span>
                                {off > 0 && (
                                    <>
                                        <span className={`text-xs line-through ${t.muted}`}>₹{p.originalPrice.toLocaleString()}</span>
                                        <span className="text-xs font-bold text-green-600">{off}% off</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </LayoutGrid>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — one section = one kind of content
//
// Props
//   type         "categories" | "collections" | "products"
//   items        array of items; if omitted, categories/collections load from
//                your API and products fall back to sample data
//   count        3 | 5 | 7 — how many items to show (default: the most that fit
//                your data, up to 7)
//   eyebrow, title, subtitle, viewAllTo, viewAllLabel
//   theme        "light" | "dark"
//
// items shape
//   categories / collections: { id, title, image, to }
//   products:                 { id, name, price, originalPrice, image, badge?, to? }
// ─────────────────────────────────────────────────────────────────────────────
export default function Advertising({
    type = "products",
    items,
    count,
    eyebrow,
    title,
    subtitle,
    viewAllTo,
    viewAllLabel = "View all",
    theme = "light",
}) {
    const t = THEMES[theme] || THEMES.light;
    const remote = useRemoteItems(type, !items);
    const all = items || remote || (type === "products" ? SAMPLE_PRODUCTS : []);

    if (!all || all.length === 0) return null;

    const list = all.slice(0, pickCount(all.length, count));

    return (
        <section className={t.bg}>
            <div className="mx-full py-10 px-4 md:px-8 md:py-14">
                <SectionHeader
                    eyebrow={eyebrow}
                    title={title}
                    subtitle={subtitle}
                    viewAllTo={viewAllTo}
                    viewAllLabel={viewAllLabel}
                    t={t}
                />
                {type === "categories" && <ImageTiles items={list} t={t} label="Shop" />}
                {type === "collections" && <ImageTiles items={list} t={t} label="Explore" />}
                {type === "products" && <ProductTiles items={list} t={t} />}
            </div>
        </section>
    );
}