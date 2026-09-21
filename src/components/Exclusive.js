import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";

// ─────────────────────────────────────────────────────────────────────────────
// PLAY STORE ICON (monochrome)
// ─────────────────────────────────────────────────────────────────────────────
const PlayStoreIcon = ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFFFFF" d="M48 432c0 22.1 17.9 40 40 40l216-216L88 40C65.9 40 48 57.9 48 80v352z" />
        <path fill="#FFFFFF" d="M416 216l-72-40-72 80 72 80 73-41c20-11 20-68-1-79z" />
        <path fill="#FFFFFF" d="M304 256L88 472c6.7 4.5 14.8 7.1 23.5 7L344 336l-40-80z" />
        <path fill="#FFFFFF" d="M304 256L111 49C102.3 49 94.2 51.7 87.5 56.3L304 256z" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// APP STORE ICON (monochrome)
// ─────────────────────────────────────────────────────────────────────────────
const AppStoreIcon = ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="115" fill="#FFFFFF" />
        <path fill="#000000"
            d="M256 108c-8.8 0-16 7.2-16 16v16h-24c-8.8 0-16 7.2-16 16s7.2 16 16 16h24v16c0 8.8 7.2 16 16 16s16-7.2 16-16v-16h24c8.8 0 16-7.2 16-16s-7.2-16-16-16h-24v-16c0-8.8-7.2-16-16-16z" />
        <path fill="#000000"
            d="M347.5 270.2l-68.1-118c-9.5-16.5-33.3-16.5-42.8 0l-68.1 118c-9.5 16.5 2.4 37.1 21.4 37.1H326c19.1 0 31-20.6 21.5-37.1zM256 362c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zM176 362c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zM336 362c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24z" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// GEM ICON
// ─────────────────────────────────────────────────────────────────────────────
const GemIcon = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M2 9h20M6 3l4 6m4 0l4-6m-8 0v6" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE DATA
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: "◈", title: "Members-Only Drops", desc: "First access to exclusive collections before anyone else" },
    { icon: "✦", title: "Curated Style Feed", desc: "AI-personalised looks based on your taste profile" },
    { icon: "◉", title: "Private Sale Events", desc: "Up to 70% off — app members only, 24 hours only" },
    { icon: "◆", title: "Express Checkout", desc: "Saved addresses, 1-tap reorder, instant confirmation" },
    { icon: "⬡", title: "Live Stylist Chat", desc: "Real-time advice from our in-house style experts" },
    { icon: "◎", title: "Loyalty Rewards", desc: "Earn NM Gold on every purchase, redeem anytime" },
];

const STATS = [
    { value: "4.9★", label: "App Rating" },
    { value: "2M+", label: "Downloads" },
    { value: "500+", label: "Exclusive Styles" },
    { value: "70%", label: "Members-Only Offers" },
];

const PREVIEW_IMGS = [
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=180&h=240&fit=crop&q=80&auto=format",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=180&h=240&fit=crop&q=80&auto=format",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=180&h=240&fit=crop&q=80&auto=format",
];

// ─────────────────────────────────────────────────────────────────────────────
// STORE BADGE BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const StoreBadge = ({ store, href, delay = 0 }) => {
    const [hov, setHov] = useState(false);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVis(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    const isAndroid = store === "android";
    const label = isAndroid ? "GET IT ON" : "DOWNLOAD ON THE";
    const storeName = isAndroid ? "Google Play" : "App Store";

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className={`
                flex items-center gap-3 rounded-2xl transition-all duration-300 active:scale-95 select-none
                py-3.5 px-5 min-w-[190px] backdrop-blur-xl
                ${hov 
                    ? "bg-white shadow-[0_12px_36px_rgba(255,255,255,0.2),0_4px_14px_rgba(0,0,0,0.5)]" 
                    : "bg-white/5 border border-white/20 shadow-[0_4px_18px_rgba(0,0,0,0.4)]"
                }
                ${vis ? "opacity-100 scale-100" : "opacity-0 scale-90"}
            `}
            style={{
                transform: hov ? "translateY(-3px)" : "translateY(0)",
                transition: `opacity 0.5s ease ${delay}ms, transform 0.4s ease`,
            }}
        >
            <div className="flex-shrink-0">
                {isAndroid ? <PlayStoreIcon size={28} /> : <AppStoreIcon size={28} />}
            </div>
            <div className="flex flex-col leading-tight">
                <span className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${hov ? "text-black/60" : "text-white/50"}`}>
                    {label}
                </span>
                <span className={`text-base font-black font-serif tracking-[-0.01em] ${hov ? "text-black" : "text-white"}`}>
                    {storeName}
                </span>
            </div>
        </a>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// QR CODE
// ─────────────────────────────────────────────────────────────────────────────
const QRCode = () => (
    <div className="relative p-3 rounded-2xl bg-white border-2 border-white/20 shadow-[0_8px_28px_rgba(0,0,0,0.4)]">
        <svg width="88" height="88" viewBox="0 0 88 88">
            <rect x="4" y="4" width="24" height="24" fill="none" stroke="#000000" strokeWidth="3" />
            <rect x="8" y="8" width="16" height="16" fill="#000000" />
            <rect x="60" y="4" width="24" height="24" fill="none" stroke="#000000" strokeWidth="3" />
            <rect x="64" y="8" width="16" height="16" fill="#000000" />
            <rect x="4" y="60" width="24" height="24" fill="none" stroke="#000000" strokeWidth="3" />
            <rect x="8" y="64" width="16" height="16" fill="#000000" />
            {[
                [34, 4], [38, 4], [42, 4], [34, 8], [42, 8], [34, 12], [38, 12], [42, 12], [38, 16], [42, 20],
                [34, 20], [38, 20], [34, 24], [42, 24], [4, 34], [8, 34], [12, 34], [20, 34], [24, 34],
                [4, 38], [12, 38], [20, 38], [4, 42], [8, 42], [16, 42], [24, 42], [8, 46], [12, 46], [20, 46],
                [4, 50], [16, 50], [24, 50], [4, 54], [8, 54], [12, 54], [20, 54], [34, 34], [42, 34], [50, 34],
                [54, 34], [58, 34], [34, 38], [46, 38], [54, 38], [38, 42], [46, 42], [34, 46], [38, 46], [50, 46],
                [58, 46], [34, 50], [42, 50], [54, 50], [38, 54], [50, 54], [58, 54], [64, 34], [68, 34], [76, 34],
                [80, 34], [64, 38], [72, 38], [80, 38], [68, 42], [76, 42], [64, 46], [68, 46], [76, 46], [80, 46],
                [64, 50], [72, 50], [64, 54], [68, 54], [76, 54], [80, 54], [34, 60], [42, 60], [50, 60], [58, 60],
                [38, 64], [46, 64], [54, 64], [34, 68], [38, 68], [50, 68], [58, 68], [42, 72], [46, 72], [34, 76],
                [38, 76], [46, 76], [54, 76], [58, 76], [64, 60], [72, 60], [80, 60], [68, 64], [76, 64], [64, 68],
                [72, 68], [80, 68], [64, 72], [68, 72], [76, 72], [64, 76], [68, 76], [72, 76], [80, 76], [80, 80]
            ].map(([x, y], i) => (
                <rect key={i} x={x} y={y} width="4" height="4" fill="#000000" />
            ))}
            <rect x="40" y="40" width="8" height="8" rx="2" fill="#FFFFFF" />
        </svg>
        <p className="text-[9px] font-black text-center mt-1.5 tracking-[0.08em] text-gray-500">SCAN TO DOWNLOAD</p>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PHONE MOCKUP
// ─────────────────────────────────────────────────────────────────────────────
const PhoneMockup = () => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setIdx(i => (i + 1) % PREVIEW_IMGS.length), 2800);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="relative flex-shrink-0 select-none w-[200px]">
            <div className="absolute inset-0 rounded-[40px] blur-2xl opacity-30 pointer-events-none scale-125 bg-radial-white" />
            <div className="relative rounded-[36px] overflow-hidden shadow-2xl w-[200px] h-[400px] bg-neutral-900 border-2 border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                    <div className="w-8 h-1.5 rounded-full bg-neutral-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
                {PREVIEW_IMGS.map((img, i) => (
                    <img key={i} src={img} alt="App preview"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-800 ${i === idx ? "opacity-55" : "opacity-0"}`}
                        loading="eager" draggable={false} />
                ))}
                <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-transparent via-transparent to-black/85">
                    <div className="flex items-center justify-between px-5 pt-10 pb-2">
                        <span className="text-[9px] font-bold text-white/60">9:41</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-1.5 rounded-sm bg-white/40" />
                            <div className="w-3 h-1.5 rounded-sm bg-white/40" />
                            <div className="w-4 h-2 rounded-sm border border-white/30 relative">
                                <div className="absolute inset-y-0.5 left-0.5 w-2/3 rounded-sm bg-white" />
                            </div>
                        </div>
                    </div>
                    <div className="px-4 pt-1">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white">NEWME</p>
                        <p className="text-xs font-black text-white leading-tight font-serif">Exclusive</p>
                    </div>
                    <div className="flex gap-2 px-3 mt-3">
                        {[0, 1].map(i => (
                            <div key={i} className="flex-1 rounded-xl overflow-hidden h-20 bg-white/6 border border-white/10">
                                <img src={PREVIEW_IMGS[i]} alt="" className="w-full h-full object-cover opacity-70" />
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-6 left-4 right-4">
                        <div className="rounded-xl px-3 py-2 flex items-center justify-between bg-white">
                            <span className="text-[9px] font-black text-black">Members Only</span>
                            <span className="text-[9px] font-black text-black">500+ Styles →</span>
                        </div>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/30" />
                </div>
            </div>
            <div className="absolute top-20 -right-1 w-1 h-10 rounded-r-sm bg-neutral-700" />
            <div className="absolute top-14 -left-1 w-1 h-6 rounded-l-sm bg-neutral-700" />
            <div className="absolute top-[88px] -left-1 w-1 h-6 rounded-l-sm bg-neutral-700" />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARD
// ─────────────────────────────────────────────────────────────────────────────
const FeatureCard = ({ feat, index }) => {
    const [vis, setVis] = useState(false);
    const ref = useRef(null);
    
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className={`flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-300 group cursor-default bg-white/5 border border-white/10 hover:bg-white/10 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[14px]"}`}
            style={{ transition: `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s` }}>
            <span className="text-xl flex-shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-white text-base">{feat.icon}</span>
            <div>
                <h4 className="font-black text-sm mb-0.5 text-white">{feat.title}</h4>
                <p className="text-[11px] font-medium leading-relaxed text-white/50">{feat.desc}</p>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT ITEM
// ─────────────────────────────────────────────────────────────────────────────
const StatItem = ({ stat, index }) => {
    const [vis, setVis] = useState(false);
    
    useEffect(() => {
        const t = setTimeout(() => setVis(true), 300 + index * 120);
        return () => clearTimeout(t);
    }, [index]);

    return (
        <div className={`flex flex-col items-center text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10 transition-all duration-450 ${vis ? "opacity-100 scale-100" : "opacity-0 scale-85"}`}
            style={{ transition: `opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)` }}>
            <span className="font-black leading-none text-white font-serif text-[clamp(20px,3.5vw,28px)]">{stat.value}</span>
            <span className="text-[10px] font-semibold mt-1 uppercase tracking-[0.1em] text-white/40">{stat.label}</span>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXCLUSIVE PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ExclusivePage() {
    const [heroVis, setHeroVis] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setHeroVis(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <Header />
            <div className="relative w-full min-h-screen overflow-x-hidden bg-black">
                <style>{`
                    @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                    @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                    @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.08);opacity:0.3} }
                    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
                    @keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
                    .animate-float-a { animation: floatA 5s ease-in-out infinite; }
                    .animate-float-b { animation: floatB 4s ease-in-out infinite 1s; }
                    .animate-rotate { animation: rotate 40s linear infinite; }
                    .animate-shimmer { animation: shimmer 4s linear infinite; background-size: 200% auto; }
                    .bg-radial-white { background: radial-gradient(circle, #FFFFFF 0%, transparent 70%); }
                    .bg-white/5 { background-color: rgba(255,255,255,0.05); }
                    .bg-white/6 { background-color: rgba(255,255,255,0.06); }
                    .duration-450 { transition-duration: 450ms; }
                    .duration-800 { transition-duration: 800ms; }
                    .scale-85 { transform: scale(0.85); }
                    .opacity-55 { opacity: 0.55; }
                `}</style>

                <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none bg-radial-white/6" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none bg-radial-white/4" />
                <div className="absolute top-24 right-8 w-64 h-64 pointer-events-none hidden lg:block animate-rotate opacity-8">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="6 10" />
                        <circle cx="100" cy="100" r="70" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="4 8" />
                        <circle cx="100" cy="100" r="50" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2 6" />
                    </svg>
                </div>

                <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-10 xl:px-14 pt-16 md:pt-24 pb-16">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 ${heroVis ? "opacity-100" : "opacity-0"} animate-fade-up-delay-1`}>
                                <span className="text-white"><GemIcon size={16} /></span>
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Members Exclusive</span>
                            </div>
                            <h1 className={`font-black leading-none mb-4 text-white text-[clamp(36px,6vw,72px)] font-serif tracking-[-0.03em] ${heroVis ? "opacity-100" : "opacity-0"} animate-fade-up-delay-2`}>
                                The App<br />
                                <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">Unlocks More.</span>
                            </h1>
                            <p className={`font-medium leading-relaxed mb-8 max-w-md mx-auto lg:mx-0 text-white/60 text-[clamp(13px,1.5vw,16px)] ${heroVis ? "opacity-100" : "opacity-0"} animate-fade-up-delay-3`}>
                                Download the NewMe app to access member-exclusive drops, personalised style feeds,
                                private sale events, and 500+ styles you won't find anywhere else.
                            </p>
                            <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8 ${heroVis ? "opacity-100" : "opacity-0"} animate-fade-up-delay-4`}>
                                <StoreBadge store="android" href="https://play.google.com/store" delay={500} />
                                <StoreBadge store="ios" href="https://apps.apple.com" delay={640} />
                            </div>
                            <div className={`hidden md:flex items-center gap-5 ${heroVis ? "opacity-100" : "opacity-0"} animate-fade-up-delay-5`}>
                                <QRCode />
                                <div>
                                    <p className="text-xs font-black mb-0.5 text-white">Scan to download instantly</p>
                                    <p className="text-[11px] font-medium text-white/40">Point your camera at the QR code</p>
                                    <p className="text-[11px] font-medium mt-0.5 text-white/40">Works on Android & iOS</p>
                                </div>
                            </div>
                        </div>
                        <div className={`relative flex-shrink-0 order-1 lg:order-2 ${heroVis ? "opacity-100" : "opacity-0"} animate-fade-up-delay-15`}>
                            <div className="absolute inset-0 -m-8 rounded-full border border-white/10 animate-pulse-ring" />
                            <div className="absolute inset-0 -m-16 rounded-full border border-white/5 animate-pulse-ring-delayed" />
                            <div className="animate-float-a"><PhoneMockup /></div>
                            <div className="absolute -left-12 top-20 px-3 py-2 rounded-xl hidden lg:block bg-black/80 backdrop-blur-xl border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.5)] animate-float-b">
                                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/80">Active Members</p>
                                <p className="text-lg font-black leading-tight text-white font-serif">2M+</p>
                            </div>
                            <div className="absolute -right-10 bottom-28 px-3 py-2 rounded-xl hidden lg:block bg-white shadow-[0_8px_24px_rgba(255,255,255,0.2)] animate-float-b-delayed">
                                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-black/60">App Rating</p>
                                <p className="text-lg font-black leading-tight text-black font-serif">4.9 ★</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 md:mt-16">
                        {STATS.map((s, i) => <StatItem key={i} stat={s} index={i} />)}
                    </div>
                </section>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-10 xl:px-14 py-16 md:py-20">
                    <div className="text-center mb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] mb-2 text-white/80">Why the App</p>
                        <h2 className="font-black leading-none text-white text-[clamp(24px,4vw,40px)] font-serif tracking-[-0.02em]">
                            Everything Extra.<br /><span className="text-white/70">Only Inside.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {FEATURES.map((f, i) => <FeatureCard key={i} feat={f} index={i} />)}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                        <StoreBadge store="android" href="https://play.google.com/store" delay={0} />
                        <StoreBadge store="ios" href="https://apps.apple.com" delay={120} />
                    </div>
                    <p className="text-center text-[11px] font-medium mt-5 text-white/30">Free to download · Available on Android 8.0+ and iOS 14+</p>
                </section>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
            <Footer />
        </>
    );
}