import { Link } from "react-router-dom";
import {
  FaApple,
  FaFacebookF,
  FaGooglePlay,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";
import logo from "../assets/Wlogopng.png";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", to: "/products" },
      { label: "Women", to: "/category" },
      { label: "Men", to: "/category" },
      { label: "Accessories", to: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Who We Are", to: "/aboutus" },
      { label: "Collections", to: "/collections" },
      // { label: "Wedding Edit", to: "/wedding" },
      { label: "Join Us", to: "/joinus" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Shipping & Delivery", to: "/home" },
      { label: "Returns & Exchange", to: "/home" },
      { label: "Privacy Policy", to: "/home" },
      { label: "Terms of Use", to: "/home" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Contact Us", to: "/contactus" },
      { label: "Track Order", to: "/profile/my-orders" },
      { label: "FAQs", to: "/faqs" },
    ],
  },
];

// Each social link has its own hover colours (full class names so Tailwind picks them up)
const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: FaInstagram,
    hover:
      "hover:border-transparent hover:text-white hover:bg-gradient-to-tr hover:from-[#f9a825] hover:via-[#e1306c] hover:to-[#833ab4] hover:shadow-[0_8px_24px_rgba(225,48,108,0.45)]",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: FaFacebookF,
    hover:
      "hover:border-[#1877f2] hover:bg-[#1877f2] hover:text-white hover:shadow-[0_8px_24px_rgba(24,119,242,0.45)]",
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com",
    icon: FaPinterestP,
    hover:
      "hover:border-[#e60023] hover:bg-[#e60023] hover:text-white hover:shadow-[0_8px_24px_rgba(230,0,35,0.45)]",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: FaYoutube,
    hover:
      "hover:border-[#ff0000] hover:bg-[#ff0000] hover:text-white hover:shadow-[0_8px_24px_rgba(255,0,0,0.45)]",
  },
];

const appLinks = [
  { label: "App Store", href: "#", icon: FaApple },
  { label: "Google Play", href: "#", icon: FaGooglePlay },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a0a0a] text-[#f2f2f2]">
      {/* subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.2fr] lg:gap-8 lg:py-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="mb-4 inline-block">
              {/* brightness-0 invert turns a dark logo into a white one */}
              <img
                src={logo}
                alt="Brubla logo"
                className="h-12 w-auto object-contain brightness sm:h-14"
              />
            </div>
            <p className="max-w-md text-sm leading-6 text-white/60 lg:max-w-[280px]">
              Elevating everyday dressing with contemporary essentials, refined
              silhouettes, and thoughtful craftsmanship for modern wardrobes.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="col-span-1">
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm text-white/60">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group relative inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Follow us */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Follow Us
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ label, href, icon: Icon, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className={`group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 active:scale-95 ${hover}`}
                >
                  <Icon
                    size={15}
                    className="transition-transform duration-300 group-hover:rotate-[360deg]"
                  />
                </a>
              ))}
            </div>

            {/* <div className="mt-7">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Download App
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {appLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2.5 py-2 text-left text-[11px] font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                      <Icon size={12} />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[8px] uppercase tracking-[0.12em] text-white/50">
                        Get it on
                      </span>
                      <span className="block text-[11px] font-semibold tracking-normal">
                        {label}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-3 border-t border-white/10 py-5 text-center text-[11px] text-white/50 sm:flex-row sm:justify-between sm:text-left">
          <p>© {year} BRUBLA. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/home" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/home" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link to="/home" className="transition-colors hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}