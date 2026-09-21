import { Link } from "react-router-dom";
import {
  FaApple,
  FaFacebookF,
  FaGooglePlay,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";

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
      { label: "About Us", to: "/home" },
      { label: "Collections", to: "/collections" },
      { label: "Wedding Edit", to: "/wedding" },
      { label: "Join Us", to: "/joinUs" },
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
      { label: "Contact Us", to: "/home" },
      { label: "Track Order", to: "/profile/my-orders" },
      { label: "Help Center", to: "/home" },
      { label: "FAQs", to: "/home" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF },
  { label: "Pinterest", href: "https://pinterest.com", icon: FaPinterestP },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube },
];

const appLinks = [
  { label: "App Store", href: "#", icon: FaApple },
  { label: "Google Play", href: "#", icon: FaGooglePlay },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f7f4f1] text-[#1a1a1a] border-t border-[#ece7e2]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr] lg:gap-8 lg:py-14">
          <div className="max-w-[280px]">
            <div className="mb-4 inline-block">
              <img
                src="/logo1.png"
                alt="Brubla logo"
                className="h-12 w-auto object-contain sm:h-14"
              />
            </div>
            <p className="text-sm leading-6 text-[#4d4a48]">
              Elevating everyday dressing with contemporary essentials, refined silhouettes,
              and thoughtful craftsmanship for modern wardrobes.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a1a1a]">
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm text-[#4d4a48]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="transition-colors duration-200 hover:text-[#111111]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a1a1a]">
              Follow Us
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d0ca] bg-white text-[#1a1a1a] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#111111]"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>

            <div className="mt-7">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a1a1a]">
                Download App
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {appLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-2 rounded-full border border-[#d9d0ca] bg-white px-2.5 py-2 text-left text-[11px] font-medium text-[#1a1a1a] transition-colors duration-200 hover:border-[#111111]"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a] text-white">
                      <Icon size={12} />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[8px] text-[#6b6865] uppercase tracking-[0.12em]">
                        Get it on
                      </span>
                      <span className="block text-[11px] font-semibold tracking-normal">
                        {label}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e7e0db] py-4 text-[11px] text-[#5f5a57] sm:flex sm:items-center sm:justify-between">
          <p>© {year} BRUBLA. All rights reserved.</p>
          <div className="mt-2 flex flex-wrap items-center gap-4 sm:mt-0">
            <Link to="/home" className="transition-colors hover:text-[#111111]">
              Privacy Policy
            </Link>
            <Link to="/home" className="transition-colors hover:text-[#111111]">
              Terms
            </Link>
            <Link to="/home" className="transition-colors hover:text-[#111111]">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
