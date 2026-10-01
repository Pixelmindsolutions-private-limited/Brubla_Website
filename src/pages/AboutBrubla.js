import { useState, useRef, useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import logo from "../assets/Wonlylogo.png"

// ─────────────────────────────────────────────────────────────────────────────
// THEME (same look as the Shop by Category section)
// white page · near-black text · Georgia headings · rounded-2xl dark tiles
// ─────────────────────────────────────────────────────────────────────────────
const SERIF = "Georgia,'Times New Roman',serif";
const DARK_TILE = "bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-950";

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────────────────────────────────────
const CONNECTIONS = [
    {
        letter: "C",
        title: "Customers",
        text: "Discover fashion, explore designer creations, personalize your choices, and connect with tailoring services for measurements and fitting.",
    },
    {
        letter: "D",
        title: "Designers",
        text: "Showcase your creations through your own online presence, reach customers beyond traditional channels, and receive support with marketing and logistics.",
    },
    {
        letter: "T",
        title: "Tailors",
        text: "Connect with customers through appointment bookings and become part of a more connected fashion experience.",
    },
];

const CONNECTS = [
    {
        title: "Designers with Customers",
        text: "So creative work can reach the people looking for something different.",
        accent: "#f87171",
    },
    {
        title: "Customers with Tailors",
        text: "So measurements and fitting can become part of the experience.",
        accent: "#60a5fa",
    },
    {
        title: "Fashion with Personalization",
        text: "So customers have more opportunities to make their clothing work for them.",
        accent: "#4ade80",
    },
    {
        title: "Independent Talent with Opportunity",
        text: "So designers and local tailoring businesses can build their presence and reach more customers.",
        accent: "#fbbf24",
    },
];

const FLOW = ["Discover", "Customize", "Get Measured", "Wear"];

const EXPERIENCE = [
    { title: "Discover", text: "Explore fashion and discover creations from different designers.", accent: "#f87171" },
    { title: "Personalize", text: "Move beyond standard fashion by exploring customization and fit.", accent: "#60a5fa" },
    { title: "Connect", text: "Find designers and local tailoring services through one platform.", accent: "#4ade80" },
    { title: "Experience", text: "Bring together design, craftsmanship, fitting, and fashion in one journey.", accent: "#fbbf24" },
];

const PEOPLE = [
    { role: "The Designer", line: "brings the creativity." },
    { role: "The Tailor", line: "brings the craftsmanship and fit." },
    { role: "The Customer", line: "brings individuality." },
];

// ─────────────────────────────────────────────────────────────────────────────
// SMALL PIECES
// ─────────────────────────────────────────────────────────────────────────────

/* Becomes true once scrolled into view (instantly true if reduced motion is on). */
const useReveal = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }
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

/* Fade + slide-up wrapper, same motion as the category tiles. */
const Reveal = ({ children, delay = 0, className = "" }) => {
    const [ref, visible] = useReveal();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    );
};

const Heading = ({ children, light = false, className = "" }) => (
    <h2
        className={`font-medium ${light ? "text-white" : "text-[#1a1a1a]"} ${className}`}
        style={{
            fontSize: "clamp(26px,4.5vw,44px)",
            fontFamily: SERIF,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
        }}
    >
        {children}
    </h2>
);

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

const Block = ({ children, className = "" }) => (
    <section className={`py-8 md:py-12 ${className}`}>{children}</section>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function AboutBrubla() {
    return (
        <>
            <Navbar />
            <main className="w-full overflow-hidden bg-white mt-16 py-6 md:py-10" aria-label="About BRUBLA">
                <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8">
                    {/* ───────── HERO ───────── */}
                    <Reveal>
                        <header
                            className={`
                            relative overflow-hidden rounded-2xl sm:rounded-3xl
                            ${DARK_TILE}
                            px-5 py-10
                            sm:px-8 sm:py-14
                            md:px-12 md:py-16
                            lg:px-16 lg:py-20
                            xl:px-20 xl:py-24
                        `}
                        >
                            {/* BRUBLA Logo Watermark */}
                            <div
                                aria-hidden="true"
                                className="
                                pointer-events-none
                                absolute
                                -bottom-6 -right-8
                                sm:-bottom-10 sm:-right-6
                                md:-bottom-14 md:right-0
                                lg:-bottom-16 lg:right-4
                                select-none
                                "
                            >
                                <img
                                    src={logo}
                                    alt=""
                                    draggable={false}
                                    className="
                                    h-auto w-auto
                                    object-contain
                                    opacity-[0.06]
                                "
                                    style={{
                                        width: "clamp(180px, 35vw, 520px)",
                                        maxWidth: "45vw",
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 max-w-3xl">
                                {/* Heading */}
                                <h1
                                    className="
                                    font-medium text-white
                                    text-[38px]
                                    leading-[1.05]
                                    sm:text-[48px]
                                    md:text-[60px]
                                    lg:text-[72px]
                                    xl:text-[80px]
                                "
                                    style={{
                                        fontFamily: SERIF,
                                        letterSpacing: "-0.03em",
                                    }}
                                >
                                    About BRUBLA
                                </h1>

                                {/* Tagline */}
                                <p
                                    className="
                                    mt-3
                                    italic
                                    text-base text-white/70
                                    sm:text-lg
                                    md:text-xl
                                    lg:text-2xl
                                    xl:text-[28px]
                                "
                                    style={{
                                        fontFamily: SERIF,
                                    }}
                                >
                                    Where Designers Meet the Real World
                                </p>

                                {/* Main Description */}
                                <p
                                    className="
                                    mt-6
                                    max-w-2xl
                                    text-sm
                                    font-semibold
                                    leading-7
                                    text-white
                                    sm:mt-7
                                    sm:text-base
                                    sm:leading-7
                                    md:mt-8
                                    md:text-lg
                                    md:leading-8
                                    lg:text-xl
                                "
                                >
                                    BRUBLA is a fashion platform built to bring designers, customers, and
                                    local tailors together — making premium fashion more accessible,
                                    personal, and connected.
                                </p>

                                {/* Description */}
                                <p
                                    className="
                                    mt-4
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-white/70
                                    sm:text-base
                                    sm:leading-7
                                    md:mt-5
                                    md:text-base
                                    lg:text-lg
                                    lg:leading-8
                                "
                                >
                                    We believe fashion should be more than simply choosing a product from a
                                    catalogue. It should be an experience where customers can discover
                                    unique designs, explore personalization, and connect with the people
                                    behind the clothes.
                                </p>

                                {/* Closing */}
                                <p
                                    className="
                                    mt-4
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-white/70
                                    sm:text-base
                                    sm:leading-7
                                    md:mt-5
                                    lg:text-lg
                                    lg:leading-8
                                "
                                >
                                    BRUBLA brings this experience together through one integrated platform.
                                </p>
                            </div>
                        </header>
                    </Reveal>

                    {/* ───────── OUR PURPOSE ───────── */}
                    <Block>
                        <Reveal>
                            <Heading>Our purpose</Heading>
                        </Reveal>

                        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-5">
                            <Reveal className="rounded-2xl border border-gray-200 p-5 sm:p-7">
                                <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                                    Fashion is full of talented designers, but many independent designers face
                                    challenges reaching customers, marketing their work, and managing the logistics
                                    involved in selling their creations.
                                </p>
                            </Reveal>
                            <Reveal delay={0.08} className="rounded-2xl border border-gray-200 p-5 sm:p-7">
                                <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                                    At the same time, customers often face a different set of challenges — designer
                                    clothing can be expensive, standard sizes may not provide the right fit, affordable
                                    variety can be limited, and opportunities for personalization are often minimal.
                                </p>
                            </Reveal>
                        </div>

                        <Reveal className="mt-8 max-w-3xl md:mt-10">
                            <p
                                className="text-[#1a1a1a]"
                                style={{ fontFamily: SERIF, fontSize: "clamp(22px,3.4vw,36px)", lineHeight: 1.2, letterSpacing: "-0.01em" }}
                            >
                                BRUBLA was created to bridge this gap.
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                                Our goal is to create a platform where designers can showcase their creativity,
                                customers can discover and personalize fashion, and local tailors can become part of
                                the fashion journey.
                            </p>
                        </Reveal>
                    </Block>

                    {/* ───────── ONE PLATFORM. THREE CONNECTIONS. ───────── */}
                    <Block>
                        <Reveal>
                            <Heading>One platform. Three connections.</Heading>
                        </Reveal>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:mt-8 lg:grid-cols-3">
                            {CONNECTIONS.map((c, i) => (
                                <Reveal
                                    key={c.title}
                                    delay={i * 0.08}
                                    className={`group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-2xl ${DARK_TILE} p-6 shadow-md transition-shadow duration-300 hover:shadow-xl sm:min-h-[300px] sm:p-7 ${i === 2 ? "sm:col-span-2 lg:col-span-1" : ""
                                        }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-4 top-1 select-none leading-none text-white/10 transition-transform duration-700 ease-out group-hover:scale-110"
                                        style={{ fontFamily: SERIF, fontSize: "clamp(7rem, 16vw, 10rem)" }}
                                    >
                                        {c.letter}
                                    </span>
                                    <h3 className="relative text-2xl font-bold tracking-tight text-white" style={{ fontFamily: SERIF }}>
                                        {c.title}
                                    </h3>
                                    <p className="relative mt-2 text-sm leading-relaxed text-white/75 sm:text-base">{c.text}</p>
                                </Reveal>
                            ))}
                        </div>

                        <Reveal className="mt-6 md:mt-8">
                            <p className="text-center text-base font-bold text-[#1a1a1a] sm:text-lg">
                                BRUBLA brings them together in one ecosystem.
                            </p>
                        </Reveal>
                    </Block>

                    {/* ───────── MAKING DESIGNER FASHION MORE ACCESSIBLE ───────── */}
                    <Block>
                        <div className="grid gap-5 lg:grid-cols-5 lg:gap-12">
                            <Reveal className="lg:col-span-2">
                                <Heading>Making designer fashion more accessible</Heading>
                            </Reveal>
                            <Reveal delay={0.08} className="space-y-4 text-sm leading-relaxed text-gray-700 sm:text-base lg:col-span-3">
                                <p className="text-base font-semibold text-[#1a1a1a] sm:text-lg">
                                    We believe premium fashion should not feel distant or inaccessible.
                                </p>
                                <p>
                                    BRUBLA creates a space where customers can discover designer creations while giving
                                    independent designers a platform to bring their work directly to the people who
                                    appreciate it.
                                </p>
                                <p>
                                    From discovering a design to exploring customization and getting the right fit,
                                    BRUBLA aims to make the journey more personal.
                                </p>
                            </Reveal>
                        </div>
                    </Block>

                    {/* ───────── MORE THAN A FASHION MARKETPLACE ───────── */}
                    <Block>
                        <Reveal>
                            <Heading>More than a fashion marketplace</Heading>
                            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-700 sm:text-base">
                                BRUBLA is designed around the idea that fashion should connect people.
                                <span className="mt-1 block font-semibold text-[#1a1a1a]">It connects:</span>
                            </p>
                        </Reveal>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:mt-8">
                            {CONNECTS.map((item, i) => (
                                <Reveal
                                    key={item.title}
                                    delay={(i % 2) * 0.08}
                                    className="group rounded-2xl bg-gray-50 p-5 transition-shadow duration-300 hover:shadow-lg sm:p-7"
                                >
                                    <h3 className="text-lg font-bold tracking-tight text-[#1a1a1a] sm:text-xl" style={{ fontFamily: SERIF }}>
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{item.text}</p>
                                    <span
                                        className="mt-4 block h-0.5 w-6 rounded-full transition-all duration-300 group-hover:w-full"
                                        style={{ background: item.accent }}
                                    />
                                </Reveal>
                            ))}
                        </div>
                    </Block>

                    {/* ───────── DESIGNERS + TAILORS ───────── */}
                    <Block>
                        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
                            {/* Empowering designers */}
                            <Reveal className="flex flex-col rounded-2xl border border-gray-200 p-6 sm:p-8">
                                <Heading className="!text-[clamp(24px,3.6vw,36px)]">Empowering designers</Heading>
                                <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                                    <p>
                                        There are thousands of talented fashion designers with unique ideas and creative
                                        identities.
                                    </p>
                                    <p>
                                        BRUBLA aims to give independent designers a dedicated space to showcase their work
                                        and build a presence online.
                                    </p>
                                    <p>
                                        Through the platform, designers can have their own online storefront while
                                        receiving support around marketing and logistics.
                                    </p>
                                </div>
                                <p
                                    className="mt-6 font-bold text-[#1a1a1a]"
                                    style={{ fontFamily: SERIF, fontSize: "clamp(18px,2.4vw,24px)", lineHeight: 1.35 }}
                                >
                                    Your design. Your identity. Your audience.
                                </p>
                            </Reveal>

                            {/* Connecting customers with local tailors */}
                            <Reveal delay={0.08} className="flex flex-col rounded-2xl border border-gray-200 p-6 sm:p-8">
                                <Heading className="!text-[clamp(24px,3.6vw,36px)]">Connecting customers with local tailors</Heading>
                                <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                                    <p>The right design is only part of the experience. The right fit matters too.</p>
                                    <p>
                                        BRUBLA connects customers with local tailors through appointment bookings,
                                        allowing customers to arrange measurement services and bring greater
                                        personalization into their fashion journey.
                                    </p>
                                </div>

                                <ol className="mt-6 flex flex-wrap items-center gap-2 lg:mt-auto lg:pt-6" aria-label="The BRUBLA journey">
                                    {FLOW.map((step, i) => (
                                        <li key={step} className="flex items-center gap-2">
                                            <span className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white sm:text-sm">
                                                {step}
                                            </span>
                                            {i < FLOW.length - 1 && (
                                                <span className="text-gray-400">
                                                    <ArrowRight size={16} />
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </Reveal>
                        </div>
                    </Block>

                    {/* ───────── OUR VISION ───────── */}
                    <Block>
                        <Reveal>
                            <div className={`relative overflow-hidden rounded-3xl ${DARK_TILE} px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20`}>
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -left-2 -top-10 select-none leading-none text-white/[0.05]"
                                    style={{ fontFamily: SERIF, fontSize: "clamp(12rem, 30vw, 26rem)" }}
                                >
                                    V
                                </span>
                                <div className="relative max-w-3xl">
                                    <Heading light>Our vision</Heading>
                                    <p className="mt-5 text-sm leading-relaxed text-white/75 sm:text-base">
                                        We envision a fashion ecosystem where technology brings together creativity,
                                        craftsmanship, and customers.
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                                        A place where independent designers can be discovered, customers can explore more
                                        personalized fashion, and local tailoring becomes part of the modern fashion
                                        experience.
                                    </p>
                                    <p
                                        className="mt-8 text-white"
                                        style={{ fontFamily: SERIF, fontSize: "clamp(20px,3vw,32px)", lineHeight: 1.25, letterSpacing: "-0.01em" }}
                                    >
                                        Our vision is to build a connected Indian fashion ecosystem that can take Indian
                                        creativity and craftsmanship to a wider audience.
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </Block>

                    {/* ───────── THE BRUBLA EXPERIENCE ───────── */}
                    <Block>
                        <Reveal>
                            <Heading>The BRUBLA experience</Heading>
                        </Reveal>

                        <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 md:mt-8 lg:grid-cols-4">
                            {EXPERIENCE.map((item, i) => (
                                <Reveal key={item.title} delay={i * 0.07} className="group border-t border-gray-200 pt-5">
                                    <span
                                        className="mb-4 block h-0.5 w-6 rounded-full transition-all duration-300 group-hover:w-12"
                                        style={{ background: item.accent }}
                                    />
                                    <h3 className="text-xl font-bold tracking-tight text-[#1a1a1a]" style={{ fontFamily: SERIF }}>
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{item.text}</p>
                                </Reveal>
                            ))}
                        </div>
                    </Block>

                    {/* ───────── BUILT AROUND PEOPLE ───────── */}
                    <Block>
                        <Reveal>
                            <Heading>Built around people</Heading>
                            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-700 sm:text-base">
                                At the heart of BRUBLA are the people who make fashion possible.
                            </p>
                        </Reveal>

                        <div className="mt-6 space-y-3 md:mt-8">
                            {PEOPLE.map((p, i) => (
                                <Reveal
                                    key={p.role}
                                    delay={i * 0.07}
                                    className="rounded-2xl bg-gray-50 px-5 py-4 sm:px-7 sm:py-5"
                                >
                                    <p className="text-[#1a1a1a]" style={{ fontFamily: SERIF, fontSize: "clamp(18px,2.6vw,28px)", lineHeight: 1.3 }}>
                                        <strong className="font-bold">{p.role}</strong> {p.line}
                                    </p>
                                </Reveal>
                            ))}
                            <Reveal delay={0.21} className="rounded-2xl bg-neutral-900 px-5 py-4 sm:px-7 sm:py-5">
                                <p className="text-white" style={{ fontFamily: SERIF, fontSize: "clamp(18px,2.6vw,28px)", lineHeight: 1.3 }}>
                                    <strong className="font-bold">BRUBLA</strong> brings them together.
                                </p>
                            </Reveal>
                        </div>
                    </Block>

                    {/* ───────── THE FUTURE OF PERSONAL FASHION ───────── */}
                    <Block className="pb-6 md:pb-10">
                        <Reveal className="mx-auto max-w-3xl text-center">
                            <Heading>The future of personal fashion</Heading>
                            <p className="mt-5 text-sm leading-relaxed text-gray-700 sm:text-base">
                                BRUBLA is building a fashion platform where discovering what you wear can become as
                                meaningful as wearing it.
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                                From independent designers and their creations to local tailoring and personalized
                                experiences, we are working toward a fashion ecosystem that is more connected,
                                accessible, and personal.
                            </p>
                            <p
                                className="mt-8 font-bold text-[#1a1a1a]"
                                style={{ fontFamily: SERIF, fontSize: "clamp(24px,4vw,40px)", letterSpacing: "-0.02em" }}
                            >
                                This is BRUBLA.
                            </p>
                            <p
                                className="mt-2 italic text-gray-500"
                                style={{ fontFamily: SERIF, fontSize: "clamp(16px,2.2vw,22px)" }}
                            >
                                Where Designers Meet the Real World.
                            </p>
                        </Reveal>
                    </Block>
                </div>
            </main>
            <Footer />
        </>
    );
}