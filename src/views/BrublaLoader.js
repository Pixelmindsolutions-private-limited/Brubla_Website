import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * BrublaLoader – full-screen black loader with the BRUBLA wordmark.
 *
 * Props
 *  - loading     (bool)   true while your app/data is loading. Set to false when ready.
 *  - minDuration (number) minimum time in ms the loader stays visible (default 2200)
 *  - onDone      (func)   called once the exit animation finishes
 *
 * Usage
 *  const [loading, setLoading] = useState(true);
 *  useEffect(() => { fetchStuff().finally(() => setLoading(false)); }, []);
 *  return <> <BrublaLoader loading={loading} /> <App /> </>;
 *
 * If you only want a timed splash, use <BrublaLoader loading={false} />
 */

const NAME = "BRUBLA".split("");
const EXIT_MS = 800;

export default function BrublaLoader({ loading = true, minDuration = 2200, onDone }) {
  const [progress, setProgress] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const raf = useRef(null);

  /* Minimum display time so the animation never flashes by */
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), minDuration);
    return () => clearTimeout(t);
  }, [minDuration]);

  /* Progress eases toward 92% while loading, then snaps to 100% when ready */
  useEffect(() => {
    const ready = !loading && minElapsed;
    if (ready) {
      setProgress(100);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / minDuration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setProgress(Math.min(92, eased * 92));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [loading, minElapsed, minDuration]);

  /* Exit sequence */
  useEffect(() => {
    if (loading || !minElapsed) return;
    const t1 = setTimeout(() => setExiting(true), 450); // let the bar finish at 100%
    const t2 = setTimeout(() => {
      setMounted(false);
      onDone?.();
    }, 450 + EXIT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading, minElapsed, onDone]);

  /* Lock page scroll while the loader is visible */
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted || typeof document === "undefined") return null;

  // Rendered into document.body via a portal, with the critical styles inline,
  // so no parent transform/stacking context and no missing Tailwind class
  // (e.g. z-[9999]) can hide it behind the page.
  return createPortal(
    <div
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#000",
        padding: "0 24px",
        height: "100dvh",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.04)" : "scale(1)",
        transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
      }}
    >
      <style>{`
        @keyframes brubla-letter {
          0%   { opacity: 0; transform: translateY(0.35em); filter: blur(12px); }
          60%  { opacity: 1; filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes brubla-track {
          from { letter-spacing: 0.08em; }
          to   { letter-spacing: 0.32em; }
        }
        @keyframes brubla-glow {
          0%, 100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
          50%      { text-shadow: 0 0 28px rgba(200, 183, 30, 0.35); }
          70%      { text-shadow: 0 0 28px rgba(200, 183, 30, 0.35); }
        }
        @keyframes brubla-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .brubla-word {
          animation: brubla-track 1800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .brubla-letter {
          display: inline-block;
          opacity: 0;
          animation:
            brubla-letter 1000ms cubic-bezier(0.22, 1, 0.36, 1) forwards,
            brubla-glow 3200ms ease-in-out 1400ms infinite;
        }
        .brubla-meta { opacity: 0; animation: brubla-fade 800ms ease 1000ms forwards; }
        .brubla-suffix { opacity: 0; animation: brubla-fade 900ms ease 1500ms forwards; }
        @media (prefers-reduced-motion: reduce) {
          .brubla-suffix { animation: none; opacity: 1; }
          .brubla-word   { animation: none; letter-spacing: 0.3em; }
          .brubla-letter { animation: none; opacity: 1; }
          .brubla-meta   { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Soft vignette so the black feels deep, not flat */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 55%)",
        }}
      />

      {/* LOCKUP: wordmark + hairline + suffix */}
      <div className="relative" style={{ fontSize: "clamp(2.5rem, 11vw, 7rem)" }}>
        <h1
          className="brubla-word relative select-none text-center font-light text-white"
          style={{
            fontSize: "1em",
            lineHeight: 1,
            fontFamily: "'Helvetica Neue', 'Inter', 'Segoe UI', Arial, sans-serif",
            // trailing letter-spacing would shift the word off-centre, so offset it
            paddingLeft: "0.32em",
          }}
        >
          {NAME.map((ch, i) => (
            <span
              key={i}
              className="brubla-letter"
              style={{ animationDelay: `${i * 110}ms, ${1400 + i * 120}ms` }}
            >
              {ch}
            </span>
          ))}
        </h1>      
      </div>
    </div>,
    document.body
  );
}



// import { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
// import logo from "../assets/Wonlylogo.png"; // put brubla-logo.png next to this file (or fix the path)

// /**
//  * BrublaLoader – full-screen black loader with the BRUBLA logo and wordmark.
//  *
//  * Props
//  *  - loading     (bool)   true while your app/data is loading. Set to false when ready.
//  *  - minDuration (number) minimum time in ms the loader stays visible (default 2200)
//  *  - onDone      (func)   called once the exit animation finishes
//  *
//  * Usage
//  *  const [loading, setLoading] = useState(true);
//  *  useEffect(() => { fetchStuff().finally(() => setLoading(false)); }, []);
//  *  return <> <BrublaLoader loading={loading} /> <App /> </>;
//  *
//  * If you only want a timed splash, use <BrublaLoader loading={false} />
//  */

// const NAME = "BRUBLA".split("");
// const EXIT_MS = 800;
// const LETTER_START_MS = 450; // wordmark starts after the logo begins to appear

// export default function BrublaLoader({ loading = true, minDuration = 2200, onDone }) {
//   const [progress, setProgress] = useState(0);
//   const [minElapsed, setMinElapsed] = useState(false);
//   const [exiting, setExiting] = useState(false);
//   const [mounted, setMounted] = useState(true);
//   const raf = useRef(null);

//   /* Minimum display time so the animation never flashes by */
//   useEffect(() => {
//     const t = setTimeout(() => setMinElapsed(true), minDuration);
//     return () => clearTimeout(t);
//   }, [minDuration]);

//   /* Progress eases toward 92% while loading, then snaps to 100% when ready */
//   useEffect(() => {
//     const ready = !loading && minElapsed;
//     if (ready) {
//       setProgress(100);
//       return;
//     }
//     const start = performance.now();
//     const tick = (now) => {
//       const t = Math.min((now - start) / minDuration, 1);
//       const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
//       setProgress(Math.min(92, eased * 92));
//       raf.current = requestAnimationFrame(tick);
//     };
//     raf.current = requestAnimationFrame(tick);
//     return () => cancelAnimationFrame(raf.current);
//   }, [loading, minElapsed, minDuration]);

//   /* Exit sequence */
//   useEffect(() => {
//     if (loading || !minElapsed) return;
//     const t1 = setTimeout(() => setExiting(true), 450); // let the bar finish at 100%
//     const t2 = setTimeout(() => {
//       setMounted(false);
//       onDone?.();
//     }, 450 + EXIT_MS);
//     return () => {
//       clearTimeout(t1);
//       clearTimeout(t2);
//     };
//   }, [loading, minElapsed, onDone]);

//   /* Lock page scroll while the loader is visible */
//   useEffect(() => {
//     if (!mounted) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [mounted]);

//   if (!mounted || typeof document === "undefined") return null;

//   // Rendered into document.body via a portal, with the critical styles inline,
//   // so no parent transform/stacking context and no missing Tailwind class
//   // (e.g. z-[9999]) can hide it behind the page.
//   return createPortal(
//     <div
//       role="status"
//       aria-live="polite"
//       aria-label="Loading BRUBLA"
//       style={{
//         position: "fixed",
//         top: 0,
//         right: 0,
//         bottom: 0,
//         left: 0,
//         zIndex: 2147483647,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         overflow: "hidden",
//         background: "#000",
//         padding: "0 24px",
//         height: "100dvh",
//         opacity: exiting ? 0 : 1,
//         transform: exiting ? "scale(1.04)" : "scale(1)",
//         transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
//       }}
//     >
//       <style>{`
//         @keyframes brubla-letter {
//           0%   { opacity: 0; transform: translateY(0.35em); filter: blur(12px); }
//           60%  { opacity: 1; filter: blur(2px); }
//           100% { opacity: 1; transform: translateY(0); filter: blur(0); }
//         }
//         @keyframes brubla-logo {
//           0%   { opacity: 0; transform: translateY(0.2em) scale(0.92); filter: blur(14px); }
//           60%  { opacity: 1; filter: blur(2px); }
//           100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
//         }
//         @keyframes brubla-track {
//           from { letter-spacing: 0.08em; }
//           to   { letter-spacing: 0.32em; }
//         }
//         @keyframes brubla-glow {
//           0%, 100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
//           50%      { text-shadow: 0 0 28px rgba(255,255,255,0.35); }
//         }
//         @keyframes brubla-logo-glow {
//           0%, 100% { filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
//           50%      { filter: drop-shadow(0 0 18px rgba(255,255,255,0.35)); }
//         }
//         @keyframes brubla-fade {
//           from { opacity: 0; }
//           to   { opacity: 1; }
//         }
//         .brubla-logo {
//           display: block;
//           width: 1.1em;
//           height: auto;
//           margin: 0 auto 0.5em;
//           user-select: none;
//           -webkit-user-drag: none;
//           opacity: 0;
//           animation:
//             brubla-logo 1100ms cubic-bezier(0.22, 1, 0.36, 1) forwards,
//             brubla-logo-glow 3200ms ease-in-out 1500ms infinite;
//         }
//         .brubla-word {
//           animation: brubla-track 1800ms cubic-bezier(0.22, 1, 0.36, 1) ${LETTER_START_MS}ms both;
//         }
//         .brubla-letter {
//           display: inline-block;
//           opacity: 0;
//           animation:
//             brubla-letter 1000ms cubic-bezier(0.22, 1, 0.36, 1) forwards,
//             brubla-glow 3200ms ease-in-out 1400ms infinite;
//         }
//         @media (prefers-reduced-motion: reduce) {
//           .brubla-logo   { animation: none; opacity: 1; }
//           .brubla-word   { animation: none; letter-spacing: 0.3em; }
//           .brubla-letter { animation: none; opacity: 1; }
//         }
//       `}</style>

//       {/* Soft vignette so the black feels deep, not flat */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-0"
//         style={{
//           background:
//             "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 55%)",
//         }}
//       />

//       {/* LOCKUP: logo mark above the wordmark. Everything scales with this font-size. */}
//       <div
//         className="relative"
//         style={{
//           fontSize: "clamp(2.5rem, 11vw, 7rem)",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <img src={logo} alt="" aria-hidden="true" draggable={false} className="brubla-logo" />

//         <h1
//           className="brubla-word relative select-none text-center font-light text-white"
//           style={{
//             margin: 0,
//             fontSize: "1em",
//             lineHeight: 1,
//             fontFamily: "'Helvetica Neue', 'Inter', 'Segoe UI', Arial, sans-serif",
//             // trailing letter-spacing would shift the word off-centre, so offset it
//             paddingLeft: "0.32em",
//           }}
//         >
//           {NAME.map((ch, i) => (
//             <span
//               key={i}
//               className="brubla-letter"
//               style={{
//                 animationDelay: `${LETTER_START_MS + i * 110}ms, ${LETTER_START_MS + 1400 + i * 120}ms`,
//               }}
//             >
//               {ch}
//             </span>
//           ))}
//         </h1>
//       </div>
//     </div>,
//     document.body
//   );
// }