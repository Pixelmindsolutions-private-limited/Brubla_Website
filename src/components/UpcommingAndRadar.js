import { useState, useRef, useEffect, useCallback } from "react";
import { 
  IoArrowForward, IoArrowBack, IoNotificationsOutline, 
  IoHeart, IoHeartOutline, IoTimeOutline, IoSparkles,
  IoFlame, IoShareSocial, IoEyeOutline, IoStar
} from "react-icons/io5";

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useCountdown = (targetMs) => {
  const calc = () => {
    const diff = Math.max(0, targetMs - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetMs]);
  return time;
};

// ─────────────────────────────────────────────────────────────────────────────
// ENTRANCE HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useVisible = (threshold = 0.1) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const ScrollBtn = ({ dir, onClick, show }) => (
  <button
    onClick={onClick}
    aria-label={dir}
    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 
      rounded-full transition-all duration-300 ${
      show 
        ? "bg-coffee text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 opacity-100 pointer-events-auto" 
        : "bg-gray-100 text-gray-300 opacity-50 pointer-events-none"
    }`}
    style={{ backgroundColor: show ? "#000" : undefined }}
  >
    {dir === "left" ? <IoArrowBack size={14} /> : <IoArrowForward size={14} />}
  </button>
);

// ═════════════════════════════════════════════════════════════════════════════
// ██  UPCOMING SECTION
// ═════════════════════════════════════════════════════════════════════════════

const UPCOMING = [
  {
    id: 1,
    title: "Monsoon Edit",
    label: "LAUNCHING SOON",
    desc: "Earth tones, linen weaves, and the poetry of the first rains.",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=620&fit=crop&q=80&auto=format",
    launchIn: Date.now() + 2 * 24 * 3600000 + 4 * 3600000 + 23 * 60000,
    notify: false,
    interested: 2840,
  },
  {
    id: 2,
    title: "Festive Gold",
    label: "DROPPING FRIDAY",
    desc: "Zardozi, gota patti, and hand-embroidered masterpieces.",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=620&fit=crop&q=80&auto=format",
    launchIn: Date.now() + 4 * 24 * 3600000 + 12 * 3600000,
    notify: false,
    interested: 5210,
  },
  {
    id: 3,
    title: "Midnight Atelier",
    label: "COMING NEXT WEEK",
    desc: "Dark luxury, velvet textures, and after-dark glamour.",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=620&fit=crop&q=80&auto=format",
    launchIn: Date.now() + 7 * 24 * 3600000 + 6 * 3600000,
    notify: false,
    interested: 1930,
  },
  {
    id: 4,
    title: "Resort Escape",
    label: "EXCLUSIVE DROP",
    desc: "Breezy silhouettes for sun-drenched mornings and ocean drives.",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=620&fit=crop&q=80&auto=format",
    launchIn: Date.now() + 10 * 24 * 3600000 + 2 * 3600000,
    notify: false,
    interested: 3120,
  },
  {
    id: 5,
    title: "Bridal Edit 2025",
    label: "REGISTER INTEREST",
    desc: "Your forever look, curated with love and craftsmanship.",
    img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=500&h=620&fit=crop&q=80&auto=format",
    launchIn: Date.now() + 14 * 24 * 3600000,
    notify: false,
    interested: 7840,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN UNIT
// ─────────────────────────────────────────────────────────────────────────────
const CountUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span className="font-black leading-none tabular-nums text-lg sm:text-xl md:text-2xl text-white font-serif">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider mt-0.5 text-white">
      {label}
    </span>
  </div>
);

const CountSep = () => (
  <span className="font-black text-lg sm:text-xl text-gray-300 mb-1">:</span>
);

// ─────────────────────────────────────────────────────────────────────────────
// UPCOMING CARD
// ─────────────────────────────────────────────────────────────────────────────
const UpcomingCard = ({ item, index }) => {
  const [notified, setNotified] = useState(item.notify);
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useVisible(0.08);
  const time = useCountdown(item.launchIn);

  return (
    <div
      ref={ref}
      className={`
        flex-shrink-0 relative overflow-hidden cursor-pointer group
        w-[260px] sm:w-[280px] md:w-[300px] aspect-[4/5]
        rounded-2xl transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        ${hovered ? "shadow-2xl" : "shadow-md"}
      `}
      style={{ 
        transitionDelay: `${index * 0.08}s`,
        boxShadow: hovered ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "0 10px 30px -15px rgba(0,0,0,0.1)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <img
        src={item.img}
        alt={item.title}
        className={`
          absolute inset-0 w-full h-full object-cover object-top
          transition-transform duration-700 ease-out
          ${hovered ? "scale-110" : "scale-100"}
        `}
        loading="lazy"
        draggable={false}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Top: label + interested count */}
      {/* <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-coffee text-white shadow-md">
          {item.label}
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
          <IoHeartOutline size={12} className="text-rose-400" />
          {item.interested.toLocaleString()}
        </span>
      </div> */}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5">
        {/* Title */}
        <h3 className="font-black text-white leading-tight mb-1 text-lg sm:text-xl md:text-2xl font-serif tracking-tight">
          {item.title}
        </h3>

        {/* Description - appears on hover */}
        <p className={`
          text-white/70 text-[10px] sm:text-[11px] font-medium leading-relaxed mb-3
          transition-all duration-300 max-h-12 overflow-hidden
          ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}>
          {item.desc}
        </p>

        {/* Countdown */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-black/50 backdrop-blur-md text-white rounded-xl border border-white/10">
          <IoTimeOutline size={14} className="flex-shrink-0" />
          <div className="flex items-center gap-1">
            <CountUnit value={time.d} label="D" />
            <CountSep />
            <CountUnit value={time.h} label="H" />
            <CountSep />
            <CountUnit value={time.m} label="M" />
            <CountSep />
            <CountUnit value={time.s} label="S" />
          </div>
        </div>

        {/* Notify button */}
        <button
          onClick={() => setNotified(n => !n)}
          className={`
            w-full flex items-center justify-center gap-2 py-2.5 sm:py-3
            font-black text-[10px] sm:text-[11px] tracking-wide text-white
            rounded-xl transition-all duration-300 active:scale-95
            ${notified
              ? "bg-coffee shadow-lg"
              : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
            }
          `}
          style={{ backgroundColor: notified ? "#C9A96E" : undefined }}
        >
          <IoNotificationsOutline size={14} />
          {notified ? "Notifying You ✓" : "Notify Me"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// UPCOMING SECTION EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export function UpcomingSection() {
  const [headerRef, headerVis] = useVisible(0.2);
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => el.removeEventListener("scroll", updateScroll);
  }, [updateScroll]);

  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: dir === "right" ? 540 : -540, behavior: "smooth" });
  };

  return (
    <section className="w-full py-10 py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white to-gray-50" aria-label="Upcoming Collections">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="px-4 sm:px-6 lg:px-8 xl:px-12">
          <div
            className={`
              flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8
              transition-all duration-500 ease-out
              ${headerVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
            `}
          >
            <div>
              {/* <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-coffee/20 flex items-center justify-center">
                  <IoSparkles size={12} className="text-coffee" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-coffee">
                  What's Next
                </p>
              </div> */}
              <h2 className="font-black leading-none text-3xl sm:text-4xl md:text-5xl text-gray-900 font-serif tracking-tight">
                Upcoming
              </h2>
              {/* <p className="text-xs sm:text-sm font-medium mt-2 text-gray-500">
                Set a reminder — be the first to shop
              </p> */}
              <div className="flex items-center gap-2 mt-3">
                <div className="h-[3px] w-12 bg-coffee rounded-full" />
                <div className="h-[3px] w-6 bg-coffee/40 rounded-full" />
                <div className="h-[3px] w-3 bg-coffee/20 rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ScrollBtn dir="left" onClick={() => scrollBy("left")} show={canLeft} />
              <ScrollBtn dir="right" onClick={() => scrollBy("right")} show={canRight} />
              <button className="hidden sm:flex items-center gap-2 ml-2 text-xs font-black tracking-wide text-gray-700 transition-all group hover:text-coffee">
                See All
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 text-coffee transition-all duration-200 group-hover:scale-110 group-hover:bg-coffee group-hover:text-white">
                  <IoArrowForward size={12} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards track */}
        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 scroll-smooth"
          style={{
            paddingLeft: "clamp(16px, 5vw, 48px)",
            paddingRight: "clamp(16px, 5vw, 48px)",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
        >
          {UPCOMING.map((item, i) => (
            <div key={item.id} className="flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
              <UpcomingCard item={item} index={i} />
            </div>
          ))}
          <div className="min-w-2 flex-shrink-0" />
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="w-full h-px mt-10 bg-gradient-to-r from-transparent via-coffee/50 to-transparent" />
    </section>
  );
}
