import { Link } from "react-router-dom";

/**
 * OccasionBooking – premium light "Book your occasion" section with contact details and one button.
 *
 * Props (all optional)
 *  - contact  { phone, email, address, hours }
 *  - to       (string) where the button goes (default "/contact")
 *  - label    (string) button text
 *
 * Usage
 *  <OccasionBooking to="/book-occasion" contact={{ phone: "+91 …", email: "…", address: "…", hours: "…" }} />
 */

const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";
const ACCENT = "#8a7440"; // deep champagne, readable on white

const DEFAULT_CONTACT = {
  phone: "+91 00000 00000",
  email: "styling@brubla.com",
  address: "Your studio address, City",
  hours: "Mon – Sat, 10:00 – 19:00",
};

const Icon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const PhoneIcon = () => (
  <Icon>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Icon>
);
const MailIcon = () => (
  <Icon>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </Icon>
);
const PinIcon = () => (
  <Icon>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);
const ClockIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Icon>
);
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function OccasionBooking({
  contact = DEFAULT_CONTACT,
  to = "/contact",
  label = "Contact Us to Book",
}) {
  const info = { ...DEFAULT_CONTACT, ...contact };

  const rows = [
    { icon: <PhoneIcon />, title: "Call or WhatsApp", value: info.phone, href: `tel:${info.phone.replace(/\s/g, "")}` },
    { icon: <MailIcon />, title: "Email", value: info.email, href: `mailto:${info.email}` },
    { icon: <PinIcon />, title: "Studio", value: info.address },
    { icon: <ClockIcon />, title: "Hours", value: info.hours },
  ];

  return (
    <section
      aria-labelledby="occasion-heading"
      className="relative w-full overflow-hidden"
      style={{ background: "#fff", color: "#111", fontFamily: FONT_SANS, borderTop: "1px solid rgba(17,17,17,0.06)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@400;500&display=swap');

        .ob-glow {
          position: absolute; pointer-events: none; left: 0; top: 0;
          width: min(80vw, 700px); height: min(80%, 560px);
          transform: translate(-30%, -20%);
          background: radial-gradient(closest-side, rgba(205,183,127,0.16), rgba(205,183,127,0));
        }

        .ob-btn {
          display: inline-flex; align-items: center; gap: 0.75rem;
          padding: 1rem 2.25rem; border-radius: 999px;
          background: #111; color: #fff; text-decoration: none;
          font-size: 0.875rem; letter-spacing: 0.06em;
          transition: background 300ms ease, gap 300ms ease, transform 300ms ease;
        }
        .ob-btn:hover { background: ${ACCENT}; gap: 1.1rem; transform: translateY(-1px); }
        .ob-btn:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 4px; }

        .ob-card {
          position: relative; border-radius: 1.5rem; padding: 2rem 2rem 0.5rem;
          background: #faf8f4; border: 1px solid rgba(17,17,17,0.07);
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 24px 60px -30px rgba(60,45,10,0.25);
        }
        .ob-card::before {
          content: ""; position: absolute; left: 2rem; right: 2rem; top: -1px; height: 1px;
          background: linear-gradient(to right, rgba(205,183,127,0), ${ACCENT}, rgba(205,183,127,0));
        }
        .ob-head { padding-bottom: 1.5rem; border-bottom: 1px solid rgba(17,17,17,0.08); }
        .ob-row { display: flex; align-items: flex-start; gap: 1.1rem; padding: 1.5rem 0; }
        .ob-row + .ob-row { border-top: 1px solid rgba(17,17,17,0.08); }
        .ob-ico {
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          width: 2.5rem; height: 2.5rem; border-radius: 999px; color: ${ACCENT};
          background: #fff; border: 1px solid rgba(138,116,64,0.35);
        }
        .ob-val { color: inherit; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 200ms ease, color 200ms ease; }
        a.ob-val:hover { color: ${ACCENT}; border-bottom-color: ${ACCENT}; }

        @media (prefers-reduced-motion: reduce) { .ob-btn, .ob-val { transition: none; } }
      `}</style>

      <div className="ob-glow" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-32">
        {/* LEFT: message + button */}
        <div>
          <p style={{ fontSize: "0.625rem", letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, margin: 0 }}>
            Book your occasion
          </p>

          <span
            aria-hidden="true"
            style={{ display: "block", width: 56, height: 1, margin: "1.5rem 0", background: `linear-gradient(to right, ${ACCENT}, rgba(138,116,64,0))` }}
          />

          <h2
            id="occasion-heading"
            style={{
              fontFamily: FONT_SERIF,
              fontWeight: 400,
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              margin: 0,
              maxWidth: "14ch",
              textWrap: "balance",
            }}
          >
            Dressed for the day that matters.
          </h2>

          <p style={{ margin: "1.5rem 0 2.5rem", maxWidth: "26rem", lineHeight: 1.7, color: "rgba(17,17,17,0.62)" }}>
            Weddings, festive evenings, big events. Our stylists will plan your look from first idea to final fitting.
          </p>

          <Link to={to} className="ob-btn">
            {label}
            <Arrow />
          </Link>
        </div>

        {/* RIGHT: contact details container */}
        <div className="ob-card">
          <div className="ob-head">
            <p style={{ fontSize: "0.625rem", letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, margin: 0 }}>
              Get in touch
            </p>
            <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "1.75rem", letterSpacing: "-0.02em", margin: "0.5rem 0 0" }}>
              Contact details
            </h3>
          </div>

          <ul className="m-0 list-none p-0">
            {rows.map((row) => (
              <li key={row.title} className="ob-row">
                <span className="ob-ico">{row.icon}</span>
                <div>
                  <p style={{ fontSize: "0.625rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(17,17,17,0.5)", margin: 0 }}>
                    {row.title}
                  </p>
                  {row.href ? (
                    <a href={row.href} className="ob-val" style={{ display: "inline-block", fontFamily: FONT_SERIF, fontSize: "1.25rem", letterSpacing: "-0.01em", marginTop: "0.2rem" }}>
                      {row.value}
                    </a>
                  ) : (
                    <p style={{ fontFamily: FONT_SERIF, fontSize: "1.25rem", letterSpacing: "-0.01em", margin: "0.2rem 0 0" }}>{row.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}