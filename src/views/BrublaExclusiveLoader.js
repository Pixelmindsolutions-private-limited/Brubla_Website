import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * BrublaLoader – premium full-screen black loader with the BRUBLA wordmark.
 *
 * Props
 *  - loading     (bool)   true while your app/data is loading. Set to false when ready.
 *  - minDuration (number) minimum time in ms the loader stays visible (default 2400).
 *                         Never goes below 1800ms so the reveal can always finish.
 *  - onDone      (func)   called once the exit animation finishes
 *
 * Usage
 *  <BrublaLoader loading={false} minDuration={2000} />          // timed splash
 *  <BrublaLoader loading={isLoading} />                          // wait for data
 *
 * Self-contained: all styles are inline / injected, so it does not depend on
 * Tailwind, and it renders in a portal on document.body so nothing can cover it.
 */

const NAME = "BRUBLA".split("");
const GOLD = "#fff1b8"; // main gold – used for the wordmark, "Exclusive" and the progress bar
const GOLD_LIGHT = "#fff1b8"; // pale gold for the light sweep across the wordmark
const GOLD_GLOW = "212, 175, 55"; // RGB of GOLD, used for the soft background glow
const MIN_REVEAL_MS = 1800;
const EXIT_MS = 1200;
const FONT_SANS = "'Helvetica Neue', 'Inter', 'Segoe UI', Arial, sans-serif";
const FONT_SERIF = "'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif";

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function BrublaExclusiveLoader({ loading = true, minDuration = 2400, onDone }) {
  const minMs = Math.max(minDuration, MIN_REVEAL_MS);

  const [progress, setProgress] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const raf = useRef(null);

  /* Minimum display time so the reveal never gets cut short */
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(t);
  }, [minMs]);

  /* Progress eases toward 92% while loading, then completes when ready */
  useEffect(() => {
    const ready = !loading && minElapsed;
    if (ready) {
      setProgress(100);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / minMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.min(92, eased * 92));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [loading, minElapsed, minMs]);

  /* Exit: lockup fades up, then the black curtain lifts away */
  useEffect(() => {
    if (loading || !minElapsed) return;
    const t1 = setTimeout(() => setExiting(true), 450);
    const t2 = setTimeout(() => {
      setMounted(false);
      onDone?.();
    }, 450 + EXIT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading, minElapsed, onDone]);

  /* Lock page scroll while visible */
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="brubla-root"
      role="status"
      aria-live="polite"
      aria-label="Loading BRUBLA"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#000",
        padding: "0 24px",
        height: "100dvh",
        // curtain lift on exit, with a softly curved lower edge
        transform: exiting ? "translateY(-100%)" : "translateY(0)",
        borderRadius: exiting ? "0 0 50% 50% / 0 0 9vh 9vh" : "0",
        transition: `transform ${EXIT_MS - 200}ms cubic-bezier(0.76, 0, 0.24, 1) 200ms, border-radius ${EXIT_MS - 200}ms ease 200ms`,
        ["--accent"]: GOLD,
      }}
    >
      <style>{`
        .brubla-root, .brubla-root * { box-sizing: border-box; }

        @keyframes brubla-rise {
          from { transform: translateY(105%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes brubla-track {
          from { letter-spacing: 0.06em; }
          to   { letter-spacing: 0.32em; }
        }
        @keyframes brubla-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes brubla-sheen {
          0%        { background-position: 150% 0; }
          55%, 100% { background-position: -50% 0; }
        }
        @keyframes brubla-breathe {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.94); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.06); }
        }
        @keyframes brubla-grain {
          0%   { transform: translate(0, 0); }
          20%  { transform: translate(-3%, 2%); }
          40%  { transform: translate(2%, -3%); }
          60%  { transform: translate(-2%, -1%); }
          80%  { transform: translate(3%, 3%); }
          100% { transform: translate(0, 0); }
        }

        .brubla-grain {
          position: absolute; top: -10%; right: -10%; bottom: -10%; left: -10%;
          pointer-events: none; opacity: 0.07;
          background-image: ${GRAIN};
          animation: brubla-grain 1.2s steps(1) infinite;
        }
        .brubla-glow {
          position: absolute; left: 50%; top: 50%;
          width: min(95vw, 960px); height: min(65vh, 560px);
          pointer-events: none;
          background: radial-gradient(closest-side, rgba(${GOLD_GLOW},0.12), rgba(${GOLD_GLOW},0));
          transform: translate(-50%, -50%);
          animation: brubla-breathe 6s ease-in-out infinite;
        }

        .brubla-lockup {
          position: relative;
          font-size: clamp(2.25rem, 10.5vw, 7rem);
          transition: opacity 500ms ease, transform 600ms cubic-bezier(0.65, 0, 0.35, 1);
        }

        .brubla-word {
          margin: 0; padding-left: 0.32em;
          font-family: ${FONT_SANS}; font-weight: 300; font-size: 1em; line-height: 1;
          font-kerning: none; white-space: nowrap; text-align: center;
          color: var(--accent); user-select: none;
          animation: brubla-track 1500ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .brubla-ch { display: inline-block; overflow: hidden; vertical-align: top; }
        .brubla-ch > span {
          display: inline-block; opacity: 0; transform: translateY(105%);
          animation: brubla-rise 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* light sweep: a pale-gold gradient clipped to a copy of the text */
        .brubla-sheen {
          position: absolute; top: 0; left: 0; right: 0; pointer-events: none;
          font-family: ${FONT_SANS}; font-weight: 300; font-size: 1em; line-height: 1;
          font-kerning: none; letter-spacing: 0.32em; padding-left: 0.32em;
          white-space: nowrap; text-align: center;
          color: transparent;
          background-image: linear-gradient(105deg, rgba(255,241,184,0) 40%, ${GOLD_LIGHT} 50%, rgba(255,241,184,0) 60%);
          background-size: 250% 100%; background-repeat: no-repeat; background-position: 150% 0;
          -webkit-background-clip: text; background-clip: text;
          opacity: 0;
          animation: brubla-fade 500ms ease 1500ms forwards, brubla-sheen 3200ms ease-in-out 1500ms infinite;
        }

        .brubla-bar { padding: 0.38em 0.32em 0; opacity: 0; animation: brubla-fade 800ms ease 700ms forwards; }
        .brubla-track { position: relative; height: 1px; width: 100%; background: rgba(${GOLD_GLOW},0.2); }
        .brubla-fill {
          position: absolute; left: 0; top: 0; height: 100%;
          background: linear-gradient(90deg, rgba(${GOLD_GLOW},0.2), var(--accent));
          transition: width 250ms linear;
        }
        .brubla-fill::after {
          content: ""; position: absolute; right: -2px; top: 50%;
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); transform: translateY(-50%);
          box-shadow: 0 0 10px 2px var(--accent);
        }

        .brubla-suffix {
          display: flex; justify-content: flex-end; padding: 0.14em 0.32em 0;
          opacity: 0; animation: brubla-fade 900ms ease 1000ms forwards;
        }
        .brubla-suffix span {
          font-family: ${FONT_SERIF}; font-style: italic; font-weight: 400;
          font-size: clamp(0.85rem, 0.26em, 1.5rem);
          letter-spacing: 0.18em; margin-right: -0.18em;
          color: var(--accent);
        }

        @media (prefers-reduced-motion: reduce) {
          .brubla-grain, .brubla-glow { animation: none; }
          .brubla-word { animation: none; letter-spacing: 0.32em; }
          .brubla-ch > span { animation: none; opacity: 1; transform: none; }
          .brubla-sheen { animation: none; opacity: 0; }
          .brubla-bar, .brubla-suffix { animation: none; opacity: 1; }
        }
      `}</style>

      <div className="brubla-glow" aria-hidden="true" />
      <div className="brubla-grain" aria-hidden="true" />

      <div
        className="brubla-lockup"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "translateY(-14px)" : "translateY(0)",
        }}
      >
        <h1 className="brubla-word">
          {NAME.map((ch, i) => (
            <span key={i} className="brubla-ch">
              <span style={{ animationDelay: `${300 + i * 85}ms` }}>{ch}</span>
            </span>
          ))}
        </h1>
        <span className="brubla-sheen" aria-hidden="true">
          {NAME.join("")}
        </span>

        <div className="brubla-bar">
          <div className="brubla-track">
            <div className="brubla-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="brubla-suffix">
          <span>Exclusive</span>
        </div>
      </div>
    </div>,
    document.body
  );
}