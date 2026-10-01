import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────
const API_HOST = "http://31.97.228.17:4077";
const CATEGORIES_URL = `${API_HOST}/api/admin/categories`;

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

// Show at most this many categories, then a "View all" tile.
// It is only a maximum: 1, 2, 3 … categories all lay out fine.
// Use Infinity to show every category.
const MAX_CATEGORIES = 3;

// When there are only a few tiles, each tile is capped at this width (px)
// so a single category doesn't stretch across the whole screen.
const MAX_TILE_W = 420;
const GAP_PX = 16;

// With only a few tiles every tile gets the same height, so they form a clean row.
const FEW_TILE_HEIGHTS = [1.15];

// Tile height ÷ width for each of the 8 positions.
// Tuned so columns end at almost the same height with 2 columns (mobile)
// and 4 columns (tablet / desktop). Change them for a different rhythm.
const TILE_HEIGHTS = [1.25, 1.0, 1.4, 0.9, 1.1, 1.3, 0.85, 1.4];
const tileHeight = (index, heights = TILE_HEIGHTS) => heights[index % heights.length];
const tileRatio = (index, heights) => `1 / ${tileHeight(index, heights)}`;

// Maximum columns: 2 on phones, 4 from 640px up.
// The real column count is lowered automatically when there are fewer tiles.
const getColumnCount = (w) => (w < 640 ? 2 : 4);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Consistent accent colour per category name
const ACCENTS = ["#ffffff", "#f87171", "#60a5fa", "#4ade80", "#c084fc", "#fb923c", "#fbbf24"];
const getAccentColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

// Product count (based on subcategories)
const getProductCount = (category) => category.subcategories?.length || 0;

// Turns whatever the API returns into a full image URL, or null when there is none.
// Handles full URLs, localhost URLs and relative paths like "/uploads/a.jpg".
const resolveImage = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.includes("localhost:4077")) return url.replace("http://localhost:4077", API_HOST);
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
};

// Uses the category's own image first (e.g. "/uploads/categories/cat-123.jpg").
// If it has none, uses the first subcategory that has an image.
// Returns null when neither exists → the letter tile is shown.
const getCategoryImage = (category) =>
  resolveImage(category.image) ||
  resolveImage(category.subcategories?.find((sub) => sub?.image)?.image);

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/* Live column count. Updates on resize / rotate. */
const useColumnCount = () => {
  const [cols, setCols] = useState(() =>
    typeof window === "undefined" ? 2 : getColumnCount(window.innerWidth),
  );

  useEffect(() => {
    const onResize = () => setCols(getColumnCount(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return cols;
};

/* Deal items into columns left → right (item 0 → col 0, item 1 → col 1, …). */
const useMasonryColumns = (items, cols) =>
  useMemo(() => {
    const out = Array.from({ length: cols }, () => []);
    items.forEach((item, index) => out[index % cols].push({ item, index }));
    return out;
  }, [items, cols]);

/* Becomes true once the element scrolls into view (for the fade-in). */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
};

// ─────────────────────────────────────────────────────────────────────────────
// ICON
// ─────────────────────────────────────────────────────────────────────────────
const ArrowRight = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Shared tile classes / style
const TILE_BASE =
  "group relative block w-full cursor-pointer overflow-hidden rounded-2xl text-left shadow-md transition-shadow duration-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

// `flex` makes tiles stretch to fill their column, so every column ends at the
// same height (no gaps at the bottom), whatever the number of tiles.
const tileStyle = (index, visible, heights) => {
  const delay = Math.min(index, 11) * 0.05;
  return {
    aspectRatio: tileRatio(index, heights),
    flex: `${tileHeight(index, heights)} 1 auto`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s, box-shadow 0.3s ease`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY TILE
// Shows the category image. If there is no image (or it fails to load),
// the first letter of the name is shown instead.
// ─────────────────────────────────────────────────────────────────────────────
const CategoryTile = ({ cat, index, heights, onClick }) => {
  const [ref, visible] = useReveal();
  const [imgError, setImgError] = useState(false);

  const showImage = Boolean(cat.image) && !imgError;
  const letter = (cat.name || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={`${cat.name}, ${cat.productCount} products`}
      className={`${TILE_BASE} bg-neutral-800`}
      style={tileStyle(index, visible, heights)}
    >
      {showImage ? (
        <img
          src={cat.image}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-950 transition-transform duration-700 ease-out group-hover:scale-105"
        >
          <span
            className="select-none leading-none text-white/90"
            style={{
              fontFamily: "Georgia,'Times New Roman',serif",
              fontSize: "clamp(3.5rem, 9vw, 7rem)",
              paddingBottom: "0.4em", // keeps the letter above the name text
            }}
          >
            {letter}
          </span>
        </div>
      )}

      {/* Gradient so the text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <h3 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
          {cat.name}
        </h3>
        <p className="text-[11px] font-medium text-white/75 sm:text-xs">
          {cat.productCount} {cat.productCount === 1 ? "Product" : "Products"}
        </p>
        <span
          className="mt-2 block h-0.5 w-6 rounded-full transition-all duration-300 group-hover:w-full"
          style={{ background: cat.accent || "#fff" }}
        />
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VIEW ALL TILE (always the last tile)
// ─────────────────────────────────────────────────────────────────────────────
const ViewAllTile = ({ index, total, heights, onClick }) => {
  const [ref, visible] = useReveal();

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="View all categories"
      className={`${TILE_BASE} flex flex-col items-center justify-center gap-3 bg-neutral-900 p-4 text-center`}
      style={tileStyle(index, visible, heights)}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110 sm:h-14 sm:w-14">
        <ArrowRight size={22} />
      </span>
      <span>
        <span
          className="block text-lg font-semibold text-white sm:text-xl"
          style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
        >
          View all
        </span>
        {total > 0 && (
          <span className="mt-0.5 block text-[11px] text-white/60 sm:text-xs">
            {total} {total === 1 ? "category" : "categories"}
          </span>
        )}
      </span>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON (same masonry layout, 8 tiles)
// ─────────────────────────────────────────────────────────────────────────────
const LoadingSkeleton = ({ cols }) => {
  const placeholders = useMemo(() => Array.from({ length: MAX_CATEGORIES + 1 }, (_, i) => i), []);
  const columns = useMasonryColumns(placeholders, cols);

  return (
    <div className="flex gap-3 sm:gap-4">
      {columns.map((col, c) => (
        <div key={c} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
          {col.map(({ item, index }) => (
            <div
              key={item}
              className="w-full animate-pulse rounded-2xl bg-gray-200"
              style={{ aspectRatio: tileRatio(index), flex: `${tileHeight(index)} 1 auto` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT – Category Section (responsive masonry)
// ─────────────────────────────────────────────────────────────────────────────
export default function CategorySection() {
  const [headerVis, setHeaderVis] = useState(false);
  const headerRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const cols = useColumnCount();

  // Up to MAX_CATEGORIES categories, plus a "View all" tile at the end
  // (the View all tile is skipped when there is only one category).
  const tiles = useMemo(() => {
    const shown = categories.slice(0, MAX_CATEGORIES);
    return categories.length > 1
      ? [...shown, { id: "__view-all", isViewAll: true }]
      : shown;
  }, [categories]);

  // Never use more columns than tiles, so 1, 2 or 3 tiles fill the row
  const gridCols = Math.max(1, Math.min(cols, tiles.length));
  const columns = useMasonryColumns(tiles, gridCols);

  // With few tiles, limit the grid width so tiles keep a sensible size
  const fewTiles = tiles.length < cols;
  const gridMaxWidth = fewTiles
    ? tiles.length * MAX_TILE_W + (tiles.length - 1) * GAP_PX
    : undefined;
  const heights = fewTiles ? FEW_TILE_HEIGHTS : TILE_HEIGHTS;

  // Fetch categories
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(CATEGORIES_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const list = data.success && Array.isArray(data.categories) ? data.categories : [];

        if (!cancelled) {
          setCategories(
            list
              .filter((cat) => cat.isActive === true)
              .map((cat) => ({
                id: cat._id,
                name: cat.name === "Womenn" ? "Women" : cat.name,
                productCount: getProductCount(cat),
                image: getCategoryImage(cat), // null when there is no image → letter tile
                accent: getAccentColor(cat.name),
              })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load categories");
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Header entrance animation
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHeaderVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleCategoryClick = useCallback(
    (category) => {
      navigate(`/category/${category.id}`, {
        state: { categoryName: category.name },
      });
    },
    [navigate],
  );

  const handleViewAll = useCallback(() => navigate("/category"), [navigate]);

  return (
    <section
      className="w-full overflow-hidden bg-white py-10 md:py-12"
      aria-label="Shop by Category"
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        {/* HEADER */}
        <div
          ref={headerRef}
          className={[
            "mb-6 md:mb-8",
            "transition-[opacity,transform] duration-500",
            headerVis ? "translate-y-0 opacity-100" : "translate-y-3 opacity-100",
          ].join(" ")}
        >
          <h2
            className="font-medium tracking-wide text-[#1a1a1a]"
            style={{
              fontSize: "clamp(24px,4.5vw,44px)",
              fontFamily: "Georgia,'Times New Roman',serif",
              letterSpacing: "-0.02em",
            }}
          >
            Shop by Category
          </h2>
        </div>

        {/* MASONRY GRID */}
        {loading ? (
          <LoadingSkeleton cols={cols} />
        ) : (
          <div
            className="flex gap-3 sm:gap-4"
            style={gridMaxWidth ? { maxWidth: gridMaxWidth } : undefined}
          >
            {columns.map((col, c) => (
              <div key={c} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
                {col.map(({ item, index }) =>
                  item.isViewAll ? (
                    <ViewAllTile
                      key={item.id}
                      index={index}
                      heights={heights}
                      total={categories.length}
                      onClick={handleViewAll}
                    />
                  ) : (
                    <CategoryTile
                      key={item.id}
                      cat={item}
                      index={index}
                      heights={heights}
                      onClick={() => handleCategoryClick(item)}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error / empty message */}
        {!loading && categories.length === 0 && (
          <div
            className={`py-4 text-center text-sm ${error ? "text-red-500" : "text-gray-500"}`}
          >
            {error
              ? "Unable to load categories. Please check your connection."
              : "No categories available right now."}
          </div>
        )}
      </div>
    </section>
  );
}