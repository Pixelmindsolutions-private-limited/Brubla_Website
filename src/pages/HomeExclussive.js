import { Link } from "react-router-dom";
import image from "../assets/latest1.png";

/**
 * HomeExclussive – dark, premium "BRUBLA Exclusive" section.
 * Text and button on the left, image on the right.
 *
 * Props (all optional)
 *  - image    (string) image URL shown on the right
 *  - eyebrow  (string) small label above the heading
 *  - title    (string) main heading
 *  - text     (string) short intro paragraph
 *  - to       (string) where the button goes (default "/exclusive")
 *  - label    (string) button text
 *
 * Usage
 *  <HomeExclussive image="/images/exclusive.jpg" to="/exclusive" />
 */

const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";
const ACCENT = "#cdb77f"; // champagne

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function HomeExclussive({
  eyebrow = "BRUBLA Exclusive",
  title = "Only here. Only BRUBLA.",
  text = "Designs made for BRUBLA and no one else. Small runs, considered details and pieces you will not find anywhere else, kept for those who want to feel certain in what they wear.",
  to = "/exclusive",
  label = "Explore the collection",
}) {
  return (
    <section
      aria-labelledby="exclusive-heading"
      className="relative w-full overflow-hidden"
      style={{ background: "#0b0b0b", color: "#fff", fontFamily: FONT_SANS }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@400;500&display=swap');

        .hx-glow {
          position: absolute; pointer-events: none;
          right: 0; top: 50%; width: min(80vw, 760px); height: min(90%, 640px);
          transform: translate(25%, -50%);
          background: radial-gradient(closest-side, rgba(205,183,127,0.12), rgba(205,183,127,0));
        }

        /* image with an offset champagne frame */
        .hx-figure { position: relative; width: 100%; max-width: 480px; aspect-ratio: 4 / 5; margin: 0 auto; }
        .hx-frame {
          position: absolute; inset: 0; border: 1px solid rgba(205,183,127,0.55);
          border-radius: 1.25rem; transform: translate(16px, 16px); pointer-events: none;
        }
        .hx-img {
          position: absolute; inset: 0; overflow: hidden; border-radius: 1.25rem; background: #1a1a1a;
        }
        .hx-img img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 25%;
          transition: transform 1400ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hx-figure:hover .hx-img img { transform: scale(1.05); }
        .hx-img::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0) 45%);
        }

        .hx-btn {
          display: inline-flex; align-items: center; gap: 0.75rem;
          padding: 1rem 2.25rem; border-radius: 999px;
          border: 1px solid rgba(205,183,127,0.55); color: #fff; text-decoration: none;
          font-size: 0.875rem; letter-spacing: 0.06em;
          transition: background 300ms ease, color 300ms ease, border-color 300ms ease, gap 300ms ease;
        }
        .hx-btn:hover { background: ${ACCENT}; border-color: ${ACCENT}; color: #111; gap: 1.1rem; }
        .hx-btn:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 4px; }

        @media (prefers-reduced-motion: reduce) {
          .hx-btn, .hx-img img { transition: none; }
        }
      `}</style>

      <div className="hx-glow" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-14 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-20">
        {/* LEFT: text (below the image on mobile) */}
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <p style={{ fontSize: "0.625rem", letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, margin: 0 }}>
            {eyebrow}
          </p>

          <span
            aria-hidden="true"
            style={{ display: "block", width: 56, height: 1, margin: "1.5rem 0", background: `linear-gradient(to right, ${ACCENT}, rgba(205,183,127,0))` }}
          />

          <h2
            id="exclusive-heading"
            style={{
              fontFamily: FONT_SERIF,
              fontWeight: 400,
              fontSize: "clamp(2.25rem, 4.8vw, 4.25rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              margin: 0,
              maxWidth: "13ch",
              textWrap: "balance",
            }}
          >
            {title}
          </h2>

          <p style={{ margin: "1.5rem 0 2.5rem", maxWidth: "30rem", fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
            {text}
          </p>

          <Link to={to} className="hx-btn">
            {label}
            <Arrow />
          </Link>
        </div>

        {/* RIGHT: image (above the text on mobile) */}
        <div className="order-1 pr-4 pb-4 lg:order-2 lg:pr-0 lg:pb-0">
          <figure className="hx-figure m-0">
            <div className="hx-frame" aria-hidden="true" />
            <div className="hx-img">
              <img
                src={image}
                alt="BRUBLA Exclusive collection"
                loading="lazy"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}