import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SingleOrderModal from "../pages/SingleOrderModal";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";
import { Wallet } from "lucide-react";

// API Base URL
const API_BASE_URL = "http://31.97.228.17:4077/api";

// Format price in Indian Rupees
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .fd { font-family: 'Playfair Display', Georgia, serif; }
    .fs { font-family: 'DM Sans', system-ui, sans-serif; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes slideIn  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
    @keyframes scaleIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }

    .menu-item:hover .menu-arrow { transform: translateX(4px); }
    .order-card::-webkit-scrollbar,
    .activity-track::-webkit-scrollbar { display: none; }
    input:focus { outline: none; }
    
    @media (max-width: 640px) {
      button, .menu-item, .cursor-pointer { 
        -webkit-tap-highlight-color: transparent; 
      }
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const Ic = ({ d, c = "w-5 h-5", fill = "none", sw = 2, ch }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={c} fill={fill}
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : ch}
  </svg>
);
const User = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const Edit = ({ c }) => <Ic c={c || "w-4 h-4"} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />;
const Order = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></>} />;
const Heart = ({ c, f }) => <Ic c={c || "w-5 h-5"} fill={f ? "currentColor" : "none"} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />;
const Location = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>} />;
const Bell = ({ c }) => <Ic c={c || "w-5 h-5"} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />;
const Shield = ({ c }) => <Ic c={c || "w-5 h-5"} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const Gift = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></>} />;
const Help = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" sw={3} /></>} />;
const Logout = ({ c }) => <Ic c={c || "w-5 h-5"} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />;
const ChevRight = ({ c }) => <Ic c={c || "w-4 h-4"} d="M9 18l6-6-6-6" sw={2.5} />;
const Camera = ({ c }) => <Ic c={c || "w-4 h-4"} ch={<><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></>} />;
const Truck = ({ c }) => <Ic c={c || "w-4 h-4"} ch={<><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>} />;
const MapPin = ({ c }) => <Ic c={c || "w-5 h-5"} ch={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></>} />;
const Loader2 = ({ c }) => <Ic c={c || "w-5 h-5"} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />;

// ─────────────────────────────────────────────────────────────────────────────
// ENTRANCE HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useVis = (delay = 0) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVis(true), delay); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return [ref, vis];
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE HERO
// ─────────────────────────────────────────────────────────────────────────────

const ProfileHero = ({
  user,
  loading,
  userId,
  fetchUserData
}) => {

  const [vis, setVis] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    about: "",
  });

  const fileInputRef = useRef(null);

  useEffect(() => {

    const t = setTimeout(() => setVis(true), 80);

    return () => clearTimeout(t);

  }, []);

  // sync form data
  useEffect(() => {

    if (user) {

      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        about: user?.about || "",
      });

    }

  }, [user]);

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ───────────────────────────────────────────────────────────────────────────

  const handleUpdateProfile = async () => {

    try {

      setUpdating(true);

      const response = await axios.put(
        `${API_BASE_URL}/users/update/${userId}`,
        {
          name: formData.name,
          email: formData.email,
          about: formData.about,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {

        await fetchUserData();

        setEditing(false);

        alert("Profile updated successfully");

      }

    } catch (error) {

      console.log("Update profile error:", error);

      alert("Failed to update profile");

    } finally {

      setUpdating(false);

    }

  };

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE IMAGE
  // ───────────────────────────────────────────────────────────────────────────

  const updateProfileImage = async (file) => {

    try {

      setUpdating(true);

      const formData = new FormData();

      formData.append("profileImage", file);

      const response = await axios.put(
        `${API_BASE_URL}/users/update-image/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {

        await fetchUserData();

        alert("Profile image updated");

      }

    } catch (error) {

      console.log("Image upload error:", error);

      alert("Failed to upload image");

    } finally {

      setUpdating(false);

    }

  };

  // ───────────────────────────────────────────────────────────────────────────
  // LOADING
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {

    return (
      <div className="relative overflow-hidden bg-white border-b border-gray-200">

        <div className="px-4 sm:px-6 md:px-8 lg:px-14 pt-8 sm:pt-10 pb-6 sm:pb-8 max-w-5xl mx-auto">

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">

            <div className="w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full bg-gray-200 animate-pulse" />

            <div className="flex-1 text-center sm:text-left w-full">

              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />

              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse" />

              <div className="h-3 bg-gray-200 rounded w-64 animate-pulse" />

            </div>

          </div>

        </div>

      </div>
    );

  }

  return (

    <div className="relative overflow-hidden bg-white border-b border-gray-200">

      <div className="px-4 sm:px-6 md:px-8 lg:px-14 pt-8 sm:pt-10 pb-6 sm:pb-8 max-w-5xl mx-auto">

        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">

          {/* Avatar */}
          <div
            className="relative flex-shrink-0"
            style={{
              opacity: vis ? 1 : 0,
              animation: vis
                ? "scaleIn 0.6s ease 0.05s both"
                : "none"
            }}
          >

            <div
              className="absolute inset-0 rounded-full"
              style={{
                margin: "-2px",
                // border: "1.5px solid #000",
                borderRadius: "50%"
              }}
            />

            <div
              className="
                relative rounded-full overflow-hidden
                flex items-center justify-center
                text-white font-bold uppercase
              "
              style={{
                width: "clamp(72px, 15vw, 96px)",
                height: "clamp(72px, 15vw, 96px)",
                border: "3px solid white"
              }}
            >

              {user?.profileImageUrl ? (

                <img
                  src={user.profileImageUrl}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                />

              ) : (

                <span
                  style={{
                    fontSize: "clamp(24px, 5vw, 36px)"
                  }}
                >
                  {user?.name?.charAt(0) || "U"}
                </span>

              )}

              {updating && (

                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">

                  <Loader2 className="w-5 h-5 animate-spin text-white" />

                </div>

              )}

            </div>

            {/* Camera */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={updating}
              className="
                absolute bottom-0 right-0
                flex items-center justify-center
                rounded-full transition-all
                hover:scale-110 active:scale-95
                bg-black text-white
              "
              style={{
                width: "clamp(24px, 5vw, 28px)",
                height: "clamp(24px, 5vw, 28px)",
                border: "2px solid white"
              }}
            >
              <Camera className="w-3 h-3" />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {

                const file = e.target.files?.[0];

                if (file) {

                  updateProfileImage(file);

                }

              }}
            />

          </div>

          {/* User Details */}
          <div
            className="flex-1 w-full"
            style={{
              opacity: vis ? 1 : 0,
              animation: vis
                ? "fadeUp 0.6s ease 0.18s both"
                : "none"
            }}
          >

            {!editing ? (

              <>
                <div className="flex flex-wrap items-center gap-2 mb-1">

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-black text-white">
                    {user?.role || "Member"}
                  </span>

                  <span className="text-[10px] text-gray-400">
                    Member since{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).getFullYear()
                      : "2024"}
                  </span>

                </div>

                <h1
                  className="font-black leading-tight text-black mb-1"
                  style={{
                    fontSize: "clamp(20px, 5vw, 34px)",
                    letterSpacing: "-0.02em"
                  }}
                >
                  {user?.name || "User"}
                </h1>

                <p className="text-xs text-gray-500 mb-1">
                  {user?.email}
                </p>

                <p className="text-xs text-gray-500 mb-2">
                  {user?.mobile}
                </p>

                <p className="text-sm text-gray-700 max-w-2xl leading-relaxed">
                  {user?.about || "No bio added yet."}
                </p>
              </>

            ) : (

              <div className="space-y-3 w-full max-w-xl">

                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />

                <textarea
                  rows={4}
                  placeholder="About"
                  value={formData.about}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: e.target.value
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black resize-none"
                />

              </div>

            )}

          </div>

          {/* Actions */}
          <div className="flex gap-2">

            {!editing ? (

              <button
                onClick={() => setEditing(true)}
                className="
                  px-5 py-2.5 rounded-xl
                  bg-black text-white
                  text-xs font-bold
                  hover:scale-105 active:scale-95
                  transition-all
                "
              >
                Edit Profile
              </button>

            ) : (

              <>
                <button
                  onClick={() => setEditing(false)}
                  className="
                    px-5 py-2.5 rounded-xl
                    bg-gray-200 text-black
                    text-xs font-bold
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="
                    px-5 py-2.5 rounded-xl
                    bg-black text-white
                    text-xs font-bold
                    disabled:opacity-50
                  "
                >
                  {updating ? "Saving..." : "Save"}
                </button>
              </>

            )}

          </div>

        </div>

      </div>

    </div>

  );

};

// ─────────────────────────────────────────────────────────────────────────────
// RECENT ORDERS
// ─────────────────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onClick }) => {
  const item = order.items?.[0];
  const orderStatus = order.orderStatus || "pending";
  const getStatusColor = () => {
    switch (orderStatus.toLowerCase()) {
      case "delivered": return "#22c55e";
      case "shipped": return "#eab308";
      case "processing": return "#f97316";
      case "pending": return "#f97316";
      case "cancelled": return "#ef4444";
      default: return "#9ca3af";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 group bg-white border border-gray-200 hover:border-black hover:shadow-md"
    >
      <div className="rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-gray-100"
        style={{ width: "48px", height: "60px" }}>
        <img
          src={item?.variant?.mainImage || "https://placehold.co/300x400/e5e7eb/64748b?text=No+Image"}
          alt="Product"
          className="w-full h-full object-cover object-top"
          loading="lazy" draggable={false} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-xs font-bold text-black truncate">{item?.productName || "Product"}</p>
        <p className="text-[9px] sm:text-[10px] mt-0.5 text-gray-400">{order.orderId} · {formatDate(order.createdAt)}</p>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: getStatusColor() }} />
          <span className="text-[9px] sm:text-[10px] font-bold capitalize" style={{ color: getStatusColor() }}>
            {orderStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="font-black text-sm sm:text-base text-black">{formatPrice(order.finalAmount || order.totalAmount)}</span>
        <ChevRight c="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover:translate-x-1 text-gray-400" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
const SectionHead = ({ eyebrow, title, cta, onCta }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-end justify-between mb-3 sm:mb-4">
      <div>
        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 fs text-gray-400">
          {eyebrow}
        </p>
        <h2 className="fd font-black leading-none text-black" style={{ fontSize: "clamp(16px, 4vw, 24px)", letterSpacing: "-0.02em" }}>
          {title}
        </h2>
      </div>
      {cta && (
        <button onClick={() => navigate(onCta)} className="text-[10px] sm:text-xs font-bold fs transition-colors flex items-center gap-1 text-black hover:text-gray-600">
          {cta} <ChevRight c="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      )}
    </div>
  );
};


const QuickLinks = ({ userId }) => {
  const [ref, vis] = useVis(50);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      try {

        const res = await fetch(
          `http://31.97.228.17:4077/api/users/wallet/${userId}`
        );

        const data = await res.json();

        if (data.success) {
          setWalletBalance(data.data.wallet.balance);
        }
      } catch (err) {
        console.error("Wallet fetch error:", err);
      }
    };

    fetchWallet();
  }, []);

  const items = [
    {
      Icon: Wallet,
      label: `₹${walletBalance}`,
      sub: "My Wallet",
      link: "/profile/wallet",
      bg: "bg-green-600",
    },
    {
      Icon: MapPin,
      label: "Addresses",
      sub: "Manage addresses",
      link: "/profile/saved-addresses",
      bg: "bg-black",
    },
    {
      Icon: Truck,
      label: "My Orders",
      sub: "View all orders",
      link: "/profile/my-orders",
      bg: "bg-black",
    },
    {
      Icon: Heart,
      label: "Wishlist",
      sub: "Saved items",
      link: "/profile/wishlists",
      bg: "bg-black",
    },
  ];

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      style={{
        opacity: vis ? 1 : 0,
        animation: vis ? "fadeUp 0.55s ease both" : "none",
      }}
    >
      {items.map(({ Icon, label, sub, link, bg }, i) => (
        <button
          key={i}
          onClick={() => (window.location.href = link)}
          className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${sub === 'My Wallet' ? 'bg-green-50 hover:border-green-400' : 'bg-white hover:border-black'} border border-gray-200 `}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${bg}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-black leading-tight">
              {label}
            </p>
            <p className="text-[10px] mt-1 text-gray-400">{sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MENU GROUP
// ─────────────────────────────────────────────────────────────────────────────
const MenuGroup = ({ group, delay, userId }) => {
  const [ref, vis] = useVis(delay);
  const navigate = useNavigate();

  const getLink = (item) => {
    if (item.link) return item.link;
    switch (item.label) {
      case "Privacy Policy": return "/privacy-policy";
      case "Terms of Service": return "/terms-of-service";
      case "Help & Support": return "/help-support";
      default: return "#";
    }
  };

  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, animation: vis ? `slideIn 0.5s ease both` : "none" }}>
      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.22em] mb-2 px-1 fs text-gray-400">
        {group.label}
      </p>
      <div className="rounded-xl sm:rounded-2xl overflow-hidden divide-y divide-gray-100 border border-gray-200 bg-white">
        {group.items.map((item, i) => (
          <button key={i}
            className="menu-item w-full flex items-center gap-3 sm:gap-3.5 px-3 sm:px-4 py-3 sm:py-3.5 text-left transition-all duration-200 hover:bg-gray-50"
            onClick={() => navigate(getLink(item))}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl flex-shrink-0 bg-gray-100 text-black">
              <item.icon c="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-black fs">{item.label}</p>
              <p className="text-[9px] sm:text-[10px] fs truncate text-gray-400">{item.sub}</p>
            </div>
            <div className="menu-arrow transition-transform duration-200 flex-shrink-0 text-gray-300">
              <ChevRight c="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [ordersRef, ordersVis] = useVis(80);
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get userId from sessionStorage
  const getUserId = () => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
      return userData?.id || null;
    } catch {
      return null;
    }
  };

  const userId = getUserId();

  // Fetch user data from API
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("User not logged in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);


      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        setError(response.data.message || "Failed to load user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    navigate('/');
  };

  // Get recent orders (last 3)
  const recentOrders = Array.isArray(user?.orders)
    ? [...user.orders].reverse().slice(0, 4)
    : [];

  const MENU_GROUPS = [
    {
      label: "Account",
      items: [
        { icon: Location, label: "Saved Addresses", sub: `${user?.addresses?.length || 0} addresses saved`, link: "/profile/saved-addresses" },
        { icon: Heart, label: "My Wishlist", sub: `${user?.wishlist?.length || 0} items`, link: "/profile/wishlists" },
        { icon: Order, label: "My Orders", sub: `${user?.orders?.length || 0} orders placed`, link: "/profile/my-orders" },
        { icon: Bell, label: "Notifications", sub: "", link: "/profile/notifications" },
      ],
    },
    {
      label: "Support",
      items: [
        { icon: Shield, label: "Privacy Policy", sub: "" },
        { icon: Shield, label: "Terms of Service", sub: "" },
        { icon: Help, label: "Help & Support", sub: "FAQs, chat with us" },
      ],
    },
  ];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 c="w-8 h-8 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-500 text-sm">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Profile</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchUserData}
              className="px-5 py-2 rounded-xl bg-black text-white font-semibold text-sm hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen fs pb-20 sm:pb-24 lg:pb-12 bg-gray-50">
        <Styles />

        <ProfileHero user={user} userId={userId} fetchUserData={fetchUserData} loading={loading} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-14 pt-6 sm:pt-8">

          <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-8">

            {/* LEFT COLUMN */}
            <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6">

              <div>
                <SectionHead eyebrow="Quick Access" title="Shortcuts" />
                <QuickLinks userId={userId} />
              </div>

              {recentOrders.length > 0 && (
                <div ref={ordersRef}
                  style={{ opacity: ordersVis ? 1 : 1, animation: ordersVis ? "fadeUp 0.55s ease both" : "none" }}>
                  <SectionHead onCta="/profile/my-orders" eyebrow="Shopping History" title="Recent Orders" cta="View All" />
                  <div className="flex flex-col gap-2 sm:gap-2.5">
                    {recentOrders.map((order, idx) => (
                      <OrderCard
                        key={order._id || idx}
                        order={order}
                        onClick={() => setSelectedOrder({ ...order, userId: userId, orderId: order.orderId })}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:w-80 flex flex-col gap-5 sm:gap-6 flex-shrink-0">


              {MENU_GROUPS.map((g, i) => (
                <MenuGroup key={i} group={g} delay={i * 60} userId={userId} />
              ))}

              <button onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm fs transition-all hover:scale-[1.01] active:scale-[0.99] bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                <Logout c="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Sign Out
              </button>

              <p className="text-center text-[8px] sm:text-[10px] fs pb-2 text-gray-300">
                Brubla · Terms · Privacy
              </p>
            </div>
          </div>
        </div>

        {selectedOrder && (
          <SingleOrderModal
            order={selectedOrder}
            orderId={selectedOrder?.orderId}
            userId={userId}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}