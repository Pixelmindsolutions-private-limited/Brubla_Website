import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────
   SLIDES DATA
   type: "mobile"  → shown only on small screens  (use a portrait image, ~800x1000)
         "desktop" → shown only on large screens  (use a wide image, ~1920x900)
   Add as many slides of each type as you like.
───────────────────────────── */

const SLIDES = [
  /* ── DESKTOP BANNERS ── */
  {
    id: "d1",
    type: "desktop",
    title: "Download Our App",
    subtitle: "Get a faster experience and exclusive offers.",
    img: "https://i.pinimg.com/736x/d2/14/bb/d214bbe85aadaaf6378ee7fc3c1c25b5.jpg",
    cta: "Install now",
    link: "/download",
    external: false,
    badge: "Sponsored",
  },
  {
    id: "d2",
    type: "desktop",
    title: "Flat 70% off",
    subtitle: "Limited-time deal on all categories.",
    img: "https://i.pinimg.com/1200x/ea/ed/32/eaed3236c713efb5fd456e69de6f9df0.jpg",
    cta: "Shop now",
    link: "/sale",
    external: false,
    badge: "Ad",
  },
  {
    id: "d3",
    type: "desktop",
    title: "Join Premium Membership",
    subtitle: "Unlock exclusive benefits and rewards.",
    img: "https://i.pinimg.com/1200x/74/5c/16/745c16f44a8ee9ff6dbafe80a423f705.jpg",
    cta: "Join now",
    link: "https://example.com",
    external: true,
    badge: "Sponsored",
  },

  /* ── MOBILE BANNERS ── */
  {
    id: "m1",
    type: "mobile",
    title: "Get the app",
    subtitle: "Faster checkout and app-only offers.",
    img: "https://i.pinimg.com/736x/06/ad/8d/06ad8d6e72ea99e862d181d4de632c38.jpg",
    cta: "Install now",
    link: "/download",
    external: false,
    badge: "Sponsored",
  },
  {
    id: "m2",
    type: "mobile",
    title: "Flat 70% off",
    subtitle: "Limited-time deal on all categories.",
    img: "https://i.pinimg.com/1200x/3d/9e/30/3d9e3004a9385ecacae2bb8eb2ae5277.jpg",
    cta: "Shop now",
    link: "/sale",
    external: false,
    badge: "Ad",
  },
  {
    id: "m3",
    type: "mobile",
    title: "Go Premium",
    subtitle: "Unlock exclusive benefits and rewards.",
    img: "https://i.pinimg.com/736x/1f/68/3f/1f683f967c7bb44876d192f4e559d6c0.jpg",
    cta: "Join now",
    link: "https://example.com",
    external: true,
    badge: "Sponsored",
  },
];

const AUTO_MS = 5000;
const SWIPE_PX = 50;
const DESKTOP_QUERY = "(min-width: 768px)"; // md breakpoint

/* ─────────────────────────────
   HOOKS
───────────────────────────── */

/* True when the viewport matches the query. Updates live on resize/rotate. */
const useMediaQuery = (query) => {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

const useCarousel = (count, autoMs) => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCur((c) => (count ? (c + 1) % count : 0)), [count]);
  const prev = useCallback(() => setCur((c) => (count ? (c - 1 + count) % count : 0)), [count]);

  // Start from the first slide whenever the slide list changes (e.g. mobile ↔ desktop)
  useEffect(() => setCur(0), [count]);

  // Re-runs whenever `cur` changes, so manual navigation restarts the timer
  useEffect(() => {
    if (paused || count < 2) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setTimeout(next, autoMs);
    return () => clearTimeout(t);
  }, [cur, paused, next, autoMs, count]);

  return { cur, next, prev, goTo: setCur, paused, setPaused };
};

/* ─────────────────────────────
   SHARED PIECES
───────────────────────────── */

const Styles = () => (
  <style>{`
    @keyframes ad-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes ad-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) {
      .ad-progress, .ad-rise { animation: none !important; }
    }
  `}</style>
);

const Indicators = ({ slides, cur, paused, goTo, className = "", barClass = "w-8" }) => {
  if (slides.length < 2) return null;
  return (
    <div className={`flex gap-2 ${className}`}>
      {slides.map((slide, i) => (
        <button
          key={slide.id}
          type="button"
          onClick={() => goTo(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === cur}
          className={`relative h-1.5 overflow-hidden rounded-full bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${barClass}`}
        >
          {i === cur && (
            <span
              key={`bar-${cur}`}
              className="ad-progress absolute inset-0 origin-left rounded-full bg-white"
              style={{
                animation: `ad-progress ${AUTO_MS}ms linear forwards`,
                animationPlayState: paused ? "paused" : "running",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

/* ─────────────────────────────
   MOBILE BANNER  (< 768px)
   Shows only slides with type: "mobile".
   Card style: image on top, text panel below, swipe + dots.
───────────────────────────── */

function MobileBanner({ slides, carousel, onCta }) {
  const { cur, next, prev, goTo, paused, setPaused } = carousel;
  const touchStart = useRef(null);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    if (touchStart.current !== null) {
      const dx = e.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(dx) > SWIPE_PX) (dx < 0 ? next : prev)();
    }
    touchStart.current = null;
    setPaused(false);
  };

  const slide = slides[cur] ?? slides[0];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="w-full bg-neutral-900"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Image area */}
      <div className="relative aspect-[4/5] max-h-[460px] w-full overflow-hidden min-[480px]:aspect-[16/10]">
        {slides.map((s, i) => (
          <img
            key={s.id}
            src={s.img}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            aria-hidden={i !== cur}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: i === cur ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-neutral-900 to-transparent" />

        {slide.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {slide.badge}
          </span>
        )}
      </div>

      {/* Text panel */}
      {/* <div className="px-5 pb-6 pt-2">
        <div
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${cur + 1} of ${slides.length}`}
          className="ad-rise"
          style={{ animation: "ad-rise 450ms ease-out both" }}
        >
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">
            {slide.title}
          </h1>
          <p className="mt-2 text-sm text-white/75">{slide.subtitle}</p>
          <button
            type="button"
            onClick={() => onCta(slide)}
            className="mt-5 w-full rounded-full bg-white py-3 text-sm font-semibold text-black active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          >
            {slide.cta}
          </button>
        </div>

        <Indicators
          slides={slides}
          cur={cur}
          paused={paused}
          goTo={goTo}
          className="mt-5 justify-center"
        />
      </div> */}
    </section>
  );
}

/* ─────────────────────────────
   DESKTOP BANNER  (>= 768px)
   Shows only slides with type: "desktop".
   Full-bleed hero, text on the left, arrows, hover-pause.
───────────────────────────── */

function DesktopBanner({ slides, carousel, onCta }) {
  const { cur, next, prev, goTo, paused, setPaused } = carousel;
  const multi = slides.length > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative h-[460px] w-full overflow-hidden bg-neutral-900 lg:h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
    >
      {slides.map((slide, i) => {
        const active = i === cur;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={!active}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
          >
            <img
              src={slide.img}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {slide.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {slide.badge}
              </span>
            )}
            {/* <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" /> */}

            {/* <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-10 lg:px-16">
              <div
                key={active ? `in-${cur}` : `out-${slide.id}`}
                className={`max-w-xl ${active ? "ad-rise" : ""}`}
                style={active ? { animation: "ad-rise 600ms ease-out both" } : undefined}
              >
                {slide.badge && (
                  <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {slide.badge}
                  </span>
                )}
                <h1 className="text-5xl font-bold leading-tight tracking-tight text-white lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-md text-base text-white/80 lg:text-lg">
                  {slide.subtitle}
                </p>
                <button
                  type="button"
                  onClick={() => onCta(slide)}
                  tabIndex={active ? 0 : -1}
                  className="mt-8 rounded-full bg-white px-7 py-3 text-base font-semibold text-black transition hover:scale-105 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {slide.cta}
                </button>
              </div>
            </div> */}
          </div>
        );
      })}

      {/* Arrows */}
      {multi && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ›
          </button>
        </>
      )}

      <Indicators
        slides={slides}
        cur={cur}
        paused={paused}
        goTo={goTo}
        barClass="w-10"
        className="absolute bottom-6 left-10 z-20 lg:left-16"
      />
    </section>
  );
}

/* ─────────────────────────────
   MAIN COMPONENT
   Filters SLIDES by `type` for the current screen size and renders
   the matching banner.
───────────────────────────── */

export default function AdBanner() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const slides = useMemo(
    () => SLIDES.filter((s) => s.type === (isDesktop ? "desktop" : "mobile")),
    [isDesktop]
  );

  const carousel = useCarousel(slides.length, AUTO_MS);

  const handleCta = (slide) => {
    if (slide.external) {
      window.open(slide.link, "_blank", "noopener,noreferrer");
    } else {
      navigate(slide.link);
    }
  };

  // No banners defined for this screen type
  if (slides.length === 0) return null;

  return (
    <>
      <Styles />
      {isDesktop ? (
        <DesktopBanner slides={slides} carousel={carousel} onCta={handleCta} />
      ) : (
        <MobileBanner slides={slides} carousel={carousel} onCta={handleCta} />
      )}
    </>
  );
}