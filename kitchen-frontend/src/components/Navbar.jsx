import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/categories", label: "Products" },
    { path: "/downloads", label: "Downloads" },
    { path: "/dealers", label: "Dealer Locator" },
    { path: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: "transparent",
        borderBottom: scrolled ? "1px solid rgba(180,170,155,0.35)" : "1px solid transparent",
      }}
    >
      <div className="px-8 sm:px-14 lg:px-20">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">

          {/* Logo — text mark */}
          <Link
            to="/"
            className="flex items-baseline gap-0 shrink-0 select-none"
            style={{ textDecoration: "none" }}
          >
            <span
              className="font-display leading-none"
              style={{
                fontSize: "clamp(1.15rem, 2vw, 1.5rem)",
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}
            >
              Makewin
            </span>
            <span
              className="font-sans font-medium"
              style={{
                fontSize: "clamp(0.55rem, 0.85vw, 0.7rem)",
                color: "var(--olive)",
                opacity: 0.65,
                letterSpacing: "0.12em",
                marginLeft: "0.28em",
                textTransform: "uppercase",
              }}
            >
              .in
            </span>
          </Link>

          {/* Desktop nav — centered */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative transition-opacity duration-200"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: isActive(item.path) ? "var(--ink)" : "var(--olive)",
                  opacity: isActive(item.path) ? 1 : 0.7,
                  textDecoration: "none",
                  paddingBottom: "2px",
                  borderBottom: isActive(item.path)
                    ? "1px solid var(--ink)"
                    : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.color = "var(--ink)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.opacity = "0.7";
                    e.currentTarget.style.color = "var(--olive)";
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side — search icon + mobile hamburger */}
          <div className="flex items-center gap-4">

            {/* Search icon (all sizes) */}
            <Link
              to="/search"
              aria-label="Search"
              className="transition-opacity duration-200 hover:opacity-60"
              style={{ color: "var(--olive)" }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden transition-opacity duration-200 hover:opacity-60"
              style={{ color: "var(--olive)" }}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                {isMobileMenuOpen ? (
                  <>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu — slide down */}
        <div
          className="lg:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: isMobileMenuOpen ? "24rem" : "0" }}
        >
          <div
            className="flex flex-col gap-0 border-t py-5"
            style={{ borderColor: "oklch(85% .015 80)" }}
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 transition-opacity duration-200"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: isActive(item.path) ? "var(--ink)" : "var(--olive)",
                  opacity: isActive(item.path) ? 1 : 0.7,
                  textDecoration: "none",
                  borderBottom: isActive(item.path)
                    ? "none"
                    : "none",
                  paddingLeft: isActive(item.path) ? "0.75rem" : "0",
                  borderLeft: isActive(item.path)
                    ? "2px solid var(--ink)"
                    : "2px solid transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
