import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

const FAQ_DATA = [
    {
        category: "Orders & Shipping",
        items: [
            {
                q: "How long does delivery take?",
                a: "Most orders are delivered within 3–7 business days depending on your pincode. Metro cities usually receive orders sooner. You'll get tracking updates by SMS and email once your order ships.",
            },
            {
                q: "Is there a delivery charge?",
                a: "Delivery is free on orders above ₹499. For smaller orders, a flat shipping fee is shown at checkout before you pay.",
            },
            {
                q: "How can I track my order?",
                a: "Go to Profile → My Orders and open the order you want to track. You'll see its live status and courier details there.",
            },
            {
                q: "Can I change my delivery address after ordering?",
                a: "You can change the address before the order is shipped. Contact our support team as soon as possible with your order number and the new address.",
            },
        ],
    },
    {
        category: "Returns & Exchange",
        items: [
            {
                q: "What is your return policy?",
                a: "You can return unused items with their original tags within 7 days of delivery. Once we receive and inspect the item, your refund is processed.",
            },
            {
                q: "How do I exchange a product for a different size?",
                a: "Open your order under My Orders, choose Exchange, and select the new size. Exchanges depend on stock availability for the size you want.",
            },
            {
                q: "When will I get my refund?",
                a: "Refunds are issued to your original payment method within 5–7 business days after the returned item passes quality check.",
            },
        ],
    },
    {
        category: "Payments",
        items: [
            {
                q: "Which payment methods do you accept?",
                a: "We accept UPI, debit and credit cards, net banking, popular wallets and Cash on Delivery on eligible pincodes.",
            },
            {
                q: "Is it safe to pay on your website?",
                a: "Yes. Payments are processed through secure, encrypted gateways, and we never store your full card details.",
            },
            {
                q: "My payment failed but money was deducted. What now?",
                a: "Don't worry. The amount is usually reverted automatically within 5–7 business days. If it isn't, contact us with your transaction ID and we'll help.",
            },
        ],
    },
    {
        category: "Account & Offers",
        items: [
            {
                q: "How do I apply a discount code?",
                a: "Add your items to the cart, enter the code in the coupon box and tap Apply. The discount is shown in your order summary before payment.",
            },
            {
                q: "I forgot my password. How do I reset it?",
                a: "Tap Forgot Password on the login screen and follow the steps sent to your registered email or phone number.",
            },
        ],
    },
    {
        category: "Partners",
        items: [
            {
                q: "How can I become a BRUBLA partner?",
                a: "Tap Join Us and fill in the partner form. Our team reviews every application and reaches out within a few business days.",
            },
        ],
    },
];

const CATEGORIES = ["All", ...FAQ_DATA.map((g) => g.category)];

const FaqItem = ({ id, q, a, open, onToggle }) => (
    <div
        className="overflow-hidden rounded-2xl border transition-colors duration-200"
        style={{
            background: "#fff",
            borderColor: open ? "#000" : "rgba(111,78,55,0.15)",
        }}
    >
        <button
            onClick={() => onToggle(id)}
            aria-expanded={open}
            aria-controls={`faq-panel-${id}`}
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6 sm:py-5"
        >
            <span className="text-sm font-semibold text-black sm:text-base">{q}</span>
            <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
                style={{
                    background: open ? "#000" : "#f9f5f0",
                    color: open ? "#fff" : "#333",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
            >
                <FaChevronDown size={11} />
            </span>
        </button>

        {/* grid-rows trick = smooth height animation with no measuring */}
        <div
            id={`faq-panel-${id}`}
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
        >
            <div className="overflow-hidden">
                <p className="px-4 pb-5 text-sm leading-6 text-[#4d4a48] sm:px-6 sm:text-[15px] sm:leading-7">
                    {a}
                </p>
            </div>
        </div>
    </div>
);

export default function FAQs() {
    const [activeCat, setActiveCat] = useState("All");
    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState(null);

    const groups = useMemo(() => {
        const term = query.trim().toLowerCase();
        return FAQ_DATA.filter(
            (g) => activeCat === "All" || g.category === activeCat,
        )
            .map((g) => ({
                ...g,
                items: g.items.filter(
                    (it) =>
                        !term ||
                        it.q.toLowerCase().includes(term) ||
                        it.a.toLowerCase().includes(term),
                ),
            }))
            .filter((g) => g.items.length > 0);
    }, [activeCat, query]);

    const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

    return (
        <>
            <Header />
            <section className="min-h-screen bg-[#f9f5f0]">
                {/* Hero */}
                <div className="bg-black px-4 py-12 text-center sm:py-16">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
                        Help Center
                    </p>
                    <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl lg:text-5xl">
                        FAQs
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                        Quick answers about orders, delivery, returns and payments.
                    </p>

                    {/* Search */}
                    <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-full bg-white px-5 py-3 shadow-lg">
                        <FaSearch size={14} className="flex-shrink-0 text-black/40" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search your question…"
                            className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/40"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="text-xs font-semibold text-[#7a6a5a] hover:text-black"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
                    {/* Category tabs */}
                    <div
                        className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {CATEGORIES.map((cat) => {
                            const active = activeCat === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCat(cat)}
                                    className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95"
                                    style={{
                                        background: active ? "#000" : "#fff",
                                        color: active ? "#fff" : "#333",
                                        border: active
                                            ? "1.5px solid #000"
                                            : "1px solid rgba(111,78,55,0.2)",
                                    }}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Questions */}
                    {groups.length > 0 ? (
                        <div className="space-y-10">
                            {groups.map((group) => (
                                <div key={group.category}>
                                    <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#7a6a5a]">
                                        {group.category}
                                    </h2>
                                    <div className="space-y-3">
                                        {group.items.map((it, i) => {
                                            const id = `${group.category}-${i}`;
                                            return (
                                                <FaqItem
                                                    key={id}
                                                    id={id}
                                                    q={it.q}
                                                    a={it.a}
                                                    open={openId === id}
                                                    onToggle={toggle}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[rgba(111,78,55,0.15)] bg-white px-6 py-14 text-center">
                            <FaSearch size={28} className="mx-auto mb-3 text-black/20" />
                            <p className="text-sm font-semibold text-black">
                                No answers found for "{query}"
                            </p>
                            <p className="mt-1 text-xs text-[#7a6a5a]">
                                Try different keywords or contact our team directly.
                            </p>
                        </div>
                    )}

                    {/* Still need help */}
                    <div className="mt-12 rounded-3xl bg-black px-6 py-10 text-center sm:px-10">
                        <h3 className="text-xl font-black uppercase tracking-[0.1em] text-white sm:text-2xl">
                            Still need help?
                        </h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
                            Can't find what you're looking for? Our support team is happy to
                            help.
                        </p>
                        <Link
                            to="/contact"
                            className="mt-6 inline-flex items-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-transform duration-200 hover:scale-105 active:scale-95"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}