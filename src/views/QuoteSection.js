import { useEffect, useRef, useState } from "react";

/**
 * QuoteSection – dark philosophy / CTA quote block for the Home Page.
 *
 * Props (all optional)
 *  - quote    (string) the quote text, without quotation marks
 *  - label    (string) small caption under the quote
 *  - ctaLabel (string) show a button under the caption (leave empty for none)
 *  - ctaHref  (string) link for the button
 *
 * Usage
 *  <QuoteSection />
 *  <QuoteSection ctaLabel="Explore the collection" ctaHref="/shop" />
 */

const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";

export default function QuoteSection({
    quote = "Fashion should not make you wonder if you look right. It should make you feel like yourself — only more certain.",
    label = "BRUBLA / OUR PHILOSOPHY",
    ctaLabel = "",
    ctaHref = "#",
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    /* Reveal once when the section scrolls into view */
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.25 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            aria-label="Our philosophy"
            className="relative w-full overflow-hidden"
            style={{
                background: "#111111",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@400;500&display=swap');

        .bq-rise {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bq-rise.bq-in { opacity: 1; transform: none; }
        .bq-fade { opacity: 0; transition: opacity 900ms ease 500ms; }
        .bq-fade.bq-in { opacity: 1; }

        .bq-cta {
          display: inline-block;
          padding: 0.9rem 2rem;
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px;
          color: #fff;
          font-size: 0.8125rem;
          letter-spacing: 0.06em;
          text-decoration: none;
          transition: background 250ms ease, color 250ms ease, border-color 250ms ease;
        }
        .bq-cta:hover { background: #fff; color: #111; border-color: #fff; }
        .bq-cta:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .bq-rise, .bq-fade { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

            <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
                <blockquote className="m-0">
                    <p
                        className={`bq-rise m-0 text-white ${visible ? "bq-in" : ""}`}
                        style={{
                            fontFamily: FONT_SERIF,
                            fontWeight: 400,
                            fontSize: "clamp(2rem, 3.6vw, 3.5rem)",
                            lineHeight: 1.04,
                            letterSpacing: "-0.035em",
                            maxWidth: "",
                            marginInline: "auto",
                            textWrap: "balance",
                        }}
                    >
                        {"\u201C"}
                        {quote}
                        {"\u201D"}
                    </p>
                </blockquote>

                <p
                    className={`bq-fade mt-8 sm:mt-10 ${visible ? "bq-in" : ""}`}
                    style={{
                        fontFamily: FONT_SANS,
                        fontSize: "0.625rem",
                        letterSpacing: "0.28em",
                        color: "rgba(140, 150, 175, 0.75)",
                    }}
                >
                    {label}
                </p>

                {ctaLabel && (
                    <div className={`bq-fade mt-10 ${visible ? "bq-in" : ""}`} style={{ fontFamily: FONT_SANS }}>
                        <a href={ctaHref} className="bq-cta">
                            {ctaLabel}
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}