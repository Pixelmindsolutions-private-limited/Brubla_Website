import { useState } from "react";
import {
    FaClock,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaWhatsapp,
} from "react-icons/fa";
import Footer from "../components/Footer";
import Header from "../components/Header";

const API_BASE = "http://31.97.228.17:4077";

// TODO: replace with your real contact details
const CONTACT_INFO = [
    {
        icon: FaPhoneAlt,
        title: "Call Us",
        lines: ["+91 00000 00000"],
        href: "tel:+910000000000",
    },
    {
        icon: FaEnvelope,
        title: "Email Us",
        lines: ["support@brubla.com"],
        href: "mailto:support@brubla.com",
    },
    {
        icon: FaMapMarkerAlt,
        title: "Visit Us",
        lines: ["Your office address", "City, State — PIN"],
    },
    {
        icon: FaClock,
        title: "Working Hours",
        lines: ["Mon – Sat: 10 AM – 7 PM", "Sunday: Closed"],
    },
];

const SUBJECTS = [
    "Order Enquiry",
    "Returns & Exchange",
    "Payment Issue",
    "Partnership",
    "Feedback",
    "Other",
];

const EMPTY = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};

const validate = (v) => {
    const e = {};
    if (!v.name.trim()) e.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address";
    if (v.phone && !/^[6-9]\d{9}$/.test(v.phone.replace(/\s/g, "")))
        e.phone = "Enter a valid 10-digit mobile number";
    if (!v.subject) e.subject = "Please choose a subject";
    if (v.message.trim().length < 10)
        e.message = "Message should be at least 10 characters";
    return e;
};

const inputBase =
    "w-full rounded-xl border bg-[#f9f5f0] px-4 py-3 text-sm text-black outline-none transition-all duration-200 placeholder:text-black/35 focus:bg-white focus:ring-4 focus:ring-black/5";

const Field = ({ label, error, children }) => (
    <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6a5a]">
            {label}
        </span>
        {children}
        {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
);

export default function ContactUs() {
    const [values, setValues] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle"); // idle | loading | success | error

    const set = (key) => (e) => {
        setValues((v) => ({ ...v, [key]: e.target.value }));
        if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    };

    const borderFor = (key) =>
        errors[key]
            ? "border-red-400 focus:border-red-500"
            : "border-[rgba(111,78,55,0.2)] focus:border-black";

    const handleSubmit = async (e) => {
        e.preventDefault();
        const found = validate(values);
        setErrors(found);
        if (Object.keys(found).length) return;

        setStatus("loading");
        try {
            // TODO: point this at your real contact endpoint
            const res = await fetch(`${API_BASE}/api/users/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.success === false) throw new Error("Request failed");
            setStatus("success");
            setValues(EMPTY);
        } catch {
            setStatus("error");
        }
    };

    return (
        <>
            <Header />
            <section className="min-h-screen bg-[#f9f5f0]">
                {/* Hero */}
                <div className="bg-black px-4 py-12 text-center sm:py-16">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
                        We'd love to hear from you
                    </p>
                    <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl lg:text-5xl">
                        Contact Us
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                        Questions about an order, a product or a partnership? Send us a
                        message and we'll get back to you soon.
                    </p>
                </div>

                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
                    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-10">
                        {/* Info column */}
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                {CONTACT_INFO.map(({ icon: Icon, title, lines, href }) => {
                                    const Wrapper = href ? "a" : "div";
                                    return (
                                        <Wrapper
                                            key={title}
                                            {...(href ? { href } : {})}
                                            className="group flex items-start gap-4 rounded-2xl border border-[rgba(111,78,55,0.15)] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                                        >
                                            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:scale-110">
                                                <Icon size={15} />
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7a6a5a]">
                                                    {title}
                                                </h3>
                                                {lines.map((l) => (
                                                    <p
                                                        key={l}
                                                        className="mt-1 break-words text-sm font-medium text-black"
                                                    >
                                                        {l}
                                                    </p>
                                                ))}
                                            </div>
                                        </Wrapper>
                                    );
                                })}
                            </div>

                            {/* WhatsApp */}
                            <a
                                href="https://wa.me/910000000000"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-5 py-4 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_10px_28px_rgba(37,211,102,0.4)] active:scale-95"
                            >
                                <FaWhatsapp size={20} />
                                Chat on WhatsApp
                            </a>
                        </div>

                        {/* Form */}
                        <div className="rounded-3xl border border-[rgba(111,78,55,0.15)] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8">
                            {status === "success" ? (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
                                        ✓
                                    </span>
                                    <h2 className="text-xl font-black uppercase tracking-[0.1em] text-black">
                                        Message sent
                                    </h2>
                                    <p className="mt-3 max-w-sm text-sm leading-6 text-[#4d4a48]">
                                        Thanks for reaching out. Our team will reply to you shortly.
                                    </p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="mt-6 rounded-full bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition-transform hover:scale-105 active:scale-95"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                                    <h2 className="text-lg font-black uppercase tracking-[0.1em] text-black sm:text-xl">
                                        Send us a message
                                    </h2>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Full Name" error={errors.name}>
                                            <input
                                                type="text"
                                                value={values.name}
                                                onChange={set("name")}
                                                placeholder="Your name"
                                                className={`${inputBase} ${borderFor("name")}`}
                                            />
                                        </Field>
                                        <Field label="Email" error={errors.email}>
                                            <input
                                                type="email"
                                                value={values.email}
                                                onChange={set("email")}
                                                placeholder="you@example.com"
                                                className={`${inputBase} ${borderFor("email")}`}
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Phone (optional)" error={errors.phone}>
                                            <input
                                                type="tel"
                                                value={values.phone}
                                                onChange={set("phone")}
                                                placeholder="10-digit mobile number"
                                                className={`${inputBase} ${borderFor("phone")}`}
                                            />
                                        </Field>
                                        <Field label="Subject" error={errors.subject}>
                                            <select
                                                value={values.subject}
                                                onChange={set("subject")}
                                                className={`${inputBase} ${borderFor("subject")}`}
                                            >
                                                <option value="">Select a subject</option>
                                                {SUBJECTS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>

                                    <Field label="Message" error={errors.message}>
                                        <textarea
                                            rows={5}
                                            value={values.message}
                                            onChange={set("message")}
                                            placeholder="How can we help you?"
                                            className={`${inputBase} resize-none ${borderFor("message")}`}
                                        />
                                    </Field>

                                    {status === "error" && (
                                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                            Something went wrong while sending your message. Please try
                                            again.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_10px_28px_rgba(0,0,0,0.3)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        strokeOpacity="0.25"
                                                    />
                                                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                                </svg>
                                                Sending…
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}