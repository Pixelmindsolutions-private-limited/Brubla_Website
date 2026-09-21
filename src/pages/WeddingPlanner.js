import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const EVENTS = [
    { id: "haldi", label: "Haldi", icon: "✦", gradient: "from-amber-400/20 to-orange-500/20" },
    { id: "mehandi", label: "Mehndi", icon: "✿", gradient: "from-emerald-400/20 to-teal-500/20" },
    { id: "sangeet", label: "Sangeet", icon: "♪", gradient: "from-purple-400/20 to-pink-500/20" },
    { id: "nikah", label: "Nikah / Wedding", icon: "◈", gradient: "from-red-400/20 to-rose-600/20" },
    { id: "reception", label: "Reception", icon: "❋", gradient: "from-blue-400/20 to-indigo-500/20" },
    { id: "engagement", label: "Engagement", icon: "◇", gradient: "from-cyan-400/20 to-sky-500/20" },
    { id: "cocktail", label: "Cocktail Night", icon: "◉", gradient: "from-fuchsia-400/20 to-purple-500/20" },
];

const BRIDAL_CATEGORIES = [
    { key: "lehenga", label: "Bridal Lehenga / Saree", icon: "👰", description: "Traditional bridal ensemble" },
    { key: "jewellery", label: "Jewellery & Accessories", icon: "💎", description: "Necklaces, earrings, maang tikka" },
    { key: "blouse", label: "Blouse / Choli Design", icon: "✨", description: "Custom blouse designs" },
    { key: "dupatta", label: "Dupatta & Draping", icon: "🧣", description: "Styling and draping" },
    { key: "footwear", label: "Bridal Footwear", icon: "👠", description: "Juttis, heels, mojari" },
    { key: "makeup", label: "Makeup & Hair", icon: "💄", description: "Bridal makeup artists" },
    { key: "mehandi", label: "Mehndi Artist", icon: "🎨", description: "Henna designs" },
    { key: "alterations", label: "Alterations & Fitting", icon: "📏", description: "Perfect fit adjustments" },
];

const GROOM_CATEGORIES = [
    { key: "sherwani", label: "Sherwani / Bandhgala", icon: "👔", description: "Traditional groom wear" },
    { key: "accessories", label: "Turban & Accessories", icon: "🎩", description: "Safa, brooch, cufflinks" },
    { key: "footwear", label: "Mojari / Footwear", icon: "👞", description: "Traditional footwear" },
    { key: "watch", label: "Watch & Cufflinks", icon: "⌚", description: "Luxury accessories" },
    { key: "grooming", label: "Grooming & Barber", icon: "✂️", description: "Pre-wedding grooming" },
    { key: "alterations", label: "Alterations & Fitting", icon: "📏", description: "Perfect fit adjustments" },
];

const EVENT_OUTFIT_MAP = {
    haldi: { bridal: "Yellow Kurta Set / Anarkali", groom: "White Kurta-Pyjama / Dhoti" },
    mehandi: { bridal: "Green Lehenga / Palazzo Set", groom: "Pastel Kurta Set" },
    sangeet: { bridal: "Embroidered Lehenga / Saree", groom: "Designer Sherwani / Jodhpuri" },
    nikah: { bridal: "Bridal Lehenga / Gharara", groom: "Classic Sherwani + Safa" },
    reception: { bridal: "Gown / Saree / Lehenga", groom: "Tuxedo / Bandhgala Suit" },
    engagement: { bridal: "Anarkali / Salwar Suit", groom: "Indo-Western Suit" },
    cocktail: { bridal: "Saree / Indo-Western Gown", groom: "Blazer + Kurta Combo" },
};

/* ─────────────────────────────────────────────
   PREMIUM STEP INDICATOR
───────────────────────────────────────────── */
const Steps = ({ current, total }) => (
    <div className="flex items-center gap-3">
        {/* {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="relative">
                <div 
                    className={`h-0.5 transition-all duration-700 rounded-full ${
                        i < current ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-gray-200"
                    }`}
                    style={{ width: i === current - 1 ? 32 : 16 }}
                />
                {i < current && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
            </div>
        ))} */}
        <span className="text-gray-400 text-xs font-mono ml-2 tracking-wider">
            Step {current} of {total}
        </span>
    </div>
);

/* ─────────────────────────────────────────────
   PREMIUM TOGGLE CHIP
───────────────────────────────────────────── */
const Chip = ({ label, icon, active, onClick }) => (
    <button onClick={onClick}
        className={`relative group flex items-center gap-2 px-5 py-2.5 text-sm transition-all duration-300 font-mono tracking-wider uppercase rounded-full
            ${active 
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/25" 
                : "bg-white/10 backdrop-blur-sm text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}>
        <span className="text-base leading-none transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-xs">{label}</span>
        {active && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 opacity-50 blur-md -z-10" />
        )}
    </button>
);

/* ─────────────────────────────────────────────
   PREMIUM BUDGET ROW
───────────────────────────────────────────── */
const BudgetRow = ({ label, value, onChange, icon }) => (
    <div className="group flex items-center gap-4 py-3 border-b border-gray-100 hover:border-amber-200 transition-all duration-300">
        <div className="flex items-center gap-3 flex-1">
            <span className="text-xl">{icon}</span>
            <div>
                <span className="font-serif text-gray-700 text-sm block">{label}</span>
                <span className="text-xs text-gray-400 font-mono">Enter amount</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-gray-400 font-mono text-sm">₹</span>
            <input 
                type="number" 
                value={value} 
                onChange={e => onChange(e.target.value)}
                placeholder="0"
                className="w-32 border-b-2 border-gray-200 focus:border-amber-500 outline-none py-2 font-mono text-base text-right text-gray-800 placeholder-gray-300 bg-transparent transition-all duration-300 focus:scale-105" 
            />
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   PREMIUM CARD COMPONENT
───────────────────────────────────────────── */
const PremiumCard = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl ${className}`}>
        {children}
    </div>
);

/* ─────────────────────────────────────────────
   WEDDING PLANNER PAGE - PREMIUM VERSION
───────────────────────────────────────────── */
export const WeddingPlannerPage = () => {
    const [step, setStep] = useState(1);
    const TOTAL_STEPS = 4;

    const [planFor, setPlanFor] = useState("");
    const [role, setRole] = useState("");
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [name1, setName1] = useState("");
    const [name2, setName2] = useState("");
    const [totalBudget, setTotalBudget] = useState("");
    const [breakdown, setBreakdown] = useState({});
    const [notes, setNotes] = useState("");
    const [done, setDone] = useState(false);

    const toggleEvent = (id) =>
        setSelectedEvents(p => p.includes(id) ? p.filter(e => e !== id) : [...p, id]);

    const cats = role === "bridal" ? BRIDAL_CATEGORIES : GROOM_CATEGORIES;
    const allocated = Object.values(breakdown).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const remaining = (parseFloat(totalBudget) || 0) - allocated;

    const navigate = useNavigate();

    const canProceed = () => {
        if (step === 1) return planFor && name1 && (planFor === "single" ? role : name2);
        if (step === 2) return selectedEvents.length > 0;
        if (step === 3) return !!totalBudget;
        return true;
    };

    if (done) return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30 flex items-center justify-center px-4 py-20">
                <div className="max-w-md w-full animate-fadeIn">
                    <PremiumCard className="text-center p-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full blur-2xl opacity-20" />
                            <div className="relative w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl">
                                <span className="text-3xl animate-bounce">✦</span>
                            </div>
                        </div>
                        
                        <h2 className="font-serif text-3xl text-gray-900 mb-3">Plan Created!</h2>
                        <p className="text-gray-500 font-mono text-xs tracking-widest uppercase mb-8">
                            Your wedding fashion journey begins
                        </p>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-amber-50/20 rounded-xl p-5 text-left space-y-3 mb-8">
                            {[
                                ["Planning for", planFor === "couple" ? `${name1} & ${name2}` : name1, "👰"],
                                ["Role", planFor === "single" ? (role === "bridal" ? "Bride" : "Groom") : "Couple", "💑"],
                                ["Events", selectedEvents.map(e => EVENTS.find(ev => ev.id === e)?.label).join(", "), "🎉"],
                                ["Budget", totalBudget ? `₹${parseInt(totalBudget).toLocaleString("en-IN")}` : "—", "💰"],
                                ["Status", remaining >= 0 ? "On Track" : "Review Needed", remaining >= 0 ? "✅" : "⚠️"],
                            ].map(([k, v, icon]) => (
                                <div key={k} className="flex items-center gap-3 py-2">
                                    <span className="text-xl">{icon}</span>
                                    <div className="flex-1">
                                        <p className="text-gray-400 font-mono text-xs uppercase tracking-wider">{k}</p>
                                        <p className="text-gray-800 font-mono text-sm font-medium">{v}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => navigate('/home')}
                            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 font-mono text-sm tracking-widest uppercase rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                            Back to Home
                        </button>
                    </PremiumCard>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/20">
                {/* Premium Header */}
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <button 
                            onClick={() => { step > 1 ? setStep(s => s - 1) : navigate('/home') }}
                            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 font-mono text-sm tracking-widest uppercase transition-all duration-300">
                            <span className="transform transition-transform group-hover:-translate-x-1">←</span>
                            {step > 1 ? "Back" : "Home"}
                        </button>
                        
                        <div className="text-center">
                            <p className="font-serif text-xl text-gray-900 tracking-tight">Wedding Fashion</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">Planner</p>
                        </div>
                        
                        <Steps current={step} total={TOTAL_STEPS} />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-700 rounded-full"
                        style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} 
                    />
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <PremiumCard className="p-6 md:p-10">
                        {/* Step 1 */}
                        {step === 1 && (
                            <div className="animate-slideIn">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-xs font-mono mb-4">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                        Getting Started
                                    </div>
                                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Who's dressing up?</h2>
                                    <p className="text-gray-500 text-sm font-mono">Choose your planning style</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                    {[
                                        { val: "single", label: "Solo", icon: "👤", desc: "Plan for yourself" },
                                        { val: "couple", label: "Couple", icon: "💑", desc: "Plan together" }
                                    ].map(({ val, label, icon, desc }) => (
                                        <button 
                                            key={val} 
                                            onClick={() => { setPlanFor(val); setRole(""); }}
                                            className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                                                planFor === val 
                                                    ? "border-amber-500 bg-gradient-to-br from-amber-50 to-rose-50 shadow-lg" 
                                                    : "border-gray-200 hover:border-amber-300 hover:shadow-md"
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <span className="text-4xl transition-transform group-hover:scale-110">{icon}</span>
                                                <div>
                                                    <h3 className="font-serif text-xl text-gray-900">{label}</h3>
                                                    <p className="text-gray-500 text-sm font-mono">{desc}</p>
                                                </div>
                                            </div>
                                            {planFor === val && (
                                                <div className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {planFor && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block font-mono text-xs tracking-widest text-gray-500 uppercase mb-2">
                                                    {planFor === "couple" ? "Bride's Name" : "Your Name"}
                                                </label>
                                                <input 
                                                    value={name1} 
                                                    onChange={e => setName1(e.target.value)}
                                                    placeholder={planFor === "couple" ? "Ananya" : "Priya"}
                                                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-amber-500 outline-none font-mono text-gray-800 bg-transparent transition-all duration-300" 
                                                />
                                            </div>
                                            {planFor === "couple" && (
                                                <div>
                                                    <label className="block font-mono text-xs tracking-widest text-gray-500 uppercase mb-2">Groom's Name</label>
                                                    <input 
                                                        value={name2} 
                                                        onChange={e => setName2(e.target.value)}
                                                        placeholder="Arjun"
                                                        className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-amber-500 outline-none font-mono text-gray-800 bg-transparent transition-all duration-300" 
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {planFor === "single" && (
                                            <div className="grid md:grid-cols-2 gap-4 mt-6">
                                                {[
                                                    { val: "bridal", icon: "👰", title: "Bride", subtitle: "Bridal fashion & styling", color: "from-pink-500 to-rose-500" },
                                                    { val: "groom", icon: "🤵", title: "Groom", subtitle: "Groom fashion & styling", color: "from-blue-500 to-indigo-500" },
                                                ].map(({ val, icon, title, subtitle, color }) => (
                                                    <button 
                                                        key={val} 
                                                        onClick={() => setRole(val)}
                                                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-center ${
                                                            role === val 
                                                                ? `border-${color.split(' ')[1]} bg-gradient-to-br ${color}/10 shadow-lg` 
                                                                : "border-gray-200 hover:border-gray-300"
                                                        }`}>
                                                        <span className="text-5xl mb-3 block transition-transform group-hover:scale-110">{icon}</span>
                                                        <h3 className="font-serif text-xl text-gray-900">{title}</h3>
                                                        <p className="text-gray-500 text-sm font-mono mt-1">{subtitle}</p>
                                                        {role === val && (
                                                            <div className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-10">
                                    <button 
                                        onClick={() => setStep(2)} 
                                        disabled={!canProceed()}
                                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 font-mono text-sm tracking-widest uppercase rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed">
                                        Begin Your Journey →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <div className="animate-slideIn">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-xs font-mono mb-4">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                        Select Events
                                    </div>
                                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Your Wedding Events</h2>
                                    <p className="text-gray-500 text-sm font-mono">Choose the ceremonies you need outfits for</p>
                                </div>

                                <div className="flex flex-wrap gap-3 justify-center mb-10">
                                    {EVENTS.map(ev => (
                                        <Chip 
                                            key={ev.id} 
                                            label={ev.label} 
                                            icon={ev.icon}
                                            active={selectedEvents.includes(ev.id)}
                                            onClick={() => toggleEvent(ev.id)}
                                        />
                                    ))}
                                </div>

                                {selectedEvents.length > 0 && (
                                    <div className="mt-8 animate-fadeIn">
                                        <h3 className="font-serif text-xl text-gray-900 mb-4 flex items-center gap-2">
                                            <span>✨</span> Outfit Suggestions
                                        </h3>
                                        <div className="grid gap-3">
                                            {selectedEvents.map(id => {
                                                const ev = EVENTS.find(e => e.id === id);
                                                const suggestion = EVENT_OUTFIT_MAP[id];
                                                return (
                                                    <div key={id} className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:border-amber-200 transition-all duration-300">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-xl">{ev?.icon}</span>
                                                                    <h4 className="font-serif text-gray-800 font-medium">{ev?.label}</h4>
                                                                </div>
                                                                {planFor === "couple" ? (
                                                                    <div className="grid sm:grid-cols-2 gap-2 mt-3">
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <span className="text-pink-500">👰</span>
                                                                            <span className="text-gray-600">{suggestion?.bridal}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <span className="text-blue-500">🤵</span>
                                                                            <span className="text-gray-600">{suggestion?.groom}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-gray-600 text-sm mt-2">
                                                                        {role === "bridal" ? suggestion?.bridal : suggestion?.groom}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setStep(3)} 
                                    disabled={!canProceed()}
                                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 font-mono text-sm tracking-widest uppercase rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed mt-8">
                                    Continue to Budget →
                                </button>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div className="animate-slideIn">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-xs font-mono mb-4">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                        Budget Planning
                                    </div>
                                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Set Your Budget</h2>
                                    <p className="text-gray-500 text-sm font-mono">Plan your investment for each category</p>
                                </div>

                                <div className="mb-8">
                                    <label className="block font-mono text-xs tracking-widest text-gray-500 uppercase mb-2">Total Budget (₹)</label>
                                    <input 
                                        type="number" 
                                        value={totalBudget} 
                                        onChange={e => setTotalBudget(e.target.value)}
                                        placeholder="3,00,000"
                                        className="w-full text-3xl font-mono py-3 border-b-2 border-gray-200 focus:border-amber-500 outline-none text-gray-900 placeholder-gray-300 bg-transparent transition-all duration-300" 
                                    />
                                </div>

                                {totalBudget && (
                                    <div className="animate-fadeIn">
                                        <div className="bg-gradient-to-br from-gray-50 to-amber-50/20 rounded-xl p-6 mb-8">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">Allocated Budget</span>
                                                <span className="font-mono text-sm font-semibold text-gray-900">
                                                    ₹{allocated.toLocaleString("en-IN")} / ₹{parseInt(totalBudget || 0).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${Math.min((allocated / (parseFloat(totalBudget) || 1)) * 100, 100)}%` }} 
                                                />
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <p className={`text-xs font-mono ${remaining >= 0 ? "text-green-600" : "text-red-600 font-semibold"}`}>
                                                    {remaining >= 0
                                                        ? `₹${remaining.toLocaleString("en-IN")} remaining`
                                                        : `⚠ Over budget by ₹${Math.abs(remaining).toLocaleString("en-IN")}`}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${remaining >= 0 ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                                                    <span className="text-xs text-gray-400">{Math.round((allocated / (parseFloat(totalBudget) || 1)) * 100)}% used</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="font-serif text-lg text-gray-900 mb-4 flex items-center gap-2">
                                            <span>💰</span> 
                                            {planFor === "couple" ? "Combined Breakdown" : `${role === "bridal" ? "Bridal" : "Groom"} Allocation`}
                                        </h3>
                                        
                                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                            {planFor === "couple"
                                                ? [...BRIDAL_CATEGORIES, ...GROOM_CATEGORIES].filter((c, i, a) => a.findIndex(x => x.key === c.key) === i)
                                                    .map(cat => (
                                                        <BudgetRow 
                                                            key={cat.key} 
                                                            label={cat.label} 
                                                            icon={cat.icon}
                                                            value={breakdown[cat.key] || ""}
                                                            onChange={v => setBreakdown(p => ({ ...p, [cat.key]: v }))} 
                                                        />
                                                    ))
                                                : cats.map(cat => (
                                                    <BudgetRow 
                                                        key={cat.key} 
                                                        label={cat.label} 
                                                        icon={cat.icon}
                                                        value={breakdown[cat.key] || ""}
                                                        onChange={v => setBreakdown(p => ({ ...p, [cat.key]: v }))} 
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setStep(4)} 
                                    disabled={!canProceed()}
                                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 font-mono text-sm tracking-widest uppercase rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed mt-8">
                                    Review Plan →
                                </button>
                            </div>
                        )}

                        {/* Step 4 */}
                        {step === 4 && (
                            <div className="animate-slideIn">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-xs font-mono mb-4">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                        Final Details
                                    </div>
                                    <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Style Notes</h2>
                                    <p className="text-gray-500 text-sm font-mono">Share your preferences and special requests</p>
                                </div>

                                <textarea 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="e.g., Prefer Sabyasachi lehenga in deep red, want matching accessories, no silk fabric, need specific jewelry style..."
                                    rows={6}
                                    className="w-full rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none p-4 font-mono text-sm text-gray-800 placeholder-gray-400 bg-gray-50/30 transition-all duration-300 resize-none" 
                                />

                                <div className="mt-8 bg-gradient-to-br from-gray-50 to-amber-50/20 rounded-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                                        <p className="font-mono text-xs tracking-widest text-amber-400 uppercase">Plan Summary</p>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        {[
                                            ["Name(s)", planFor === "couple" ? `${name1} & ${name2}` : name1, "👥"],
                                            ["Role", planFor === "couple" ? "Bride + Groom" : (role === "bridal" ? "Bride" : "Groom"), "💑"],
                                            ["Events", selectedEvents.length, "🎉"],
                                            ["Total Budget", totalBudget ? `₹${parseInt(totalBudget).toLocaleString("en-IN")}` : "—", "💰"],
                                            ["Allocated", `₹${allocated.toLocaleString("en-IN")}`, "📊"],
                                            ["Status", remaining >= 0 ? "On Track" : "Review Needed", remaining >= 0 ? "✅" : "⚠️"],
                                        ].map(([k, v, icon]) => (
                                            <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{icon}</span>
                                                    <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">{k}</span>
                                                </div>
                                                <span className="font-mono text-sm text-gray-800 font-medium">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setDone(true)}
                                    className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-4 font-mono text-sm tracking-widest uppercase rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mt-8">
                                    Save Fashion Plan ✦
                                </button>
                            </div>
                        )}
                    </PremiumCard>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
            <Footer />
        </>
    );
};