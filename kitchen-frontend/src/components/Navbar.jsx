import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/categories", label: "Products" },
  { path: "/downloads", label: "Downloads" },
  { path: "/dealers", label: "Dealers" },
  { path: "/contact", label: "Contact" },
];

const HERO_ROUTES = new Set(["/", "/shop", "/about"]);

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isHeroPage = HERO_ROUTES.has(location.pathname);
  const lightText = isHeroPage && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = "Makewin Kitchens";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled or share unavailable
    }
  };

  const edgeTextColor = lightText ? "white" : "var(--ink)";

  const glassShell = lightText
    ? {
        backgroundColor: "rgba(15, 15, 15, 0.28)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      }
    : {
        backgroundColor: "rgba(255, 255, 255, 0.58)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.72)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
      };

  const glassPill = {
    backgroundColor: lightText ? "rgba(0, 0, 0, 0.42)" : "rgba(26, 26, 26, 0.72)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.12)",
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 lg:px-8 pt-3 sm:pt-4 pointer-events-none">
      <div
        className="flex items-center justify-between gap-3 sm:gap-5 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 rounded-full pointer-events-auto transition-all duration-300"
        style={glassShell}
      >
        {/* Left — brand */}
        <Link
          to="/"
          className="shrink-0 font-mono text-[11px] sm:text-xs tracking-[0.12em] leading-tight transition-colors duration-300"
          style={{
            color: edgeTextColor,
            textDecoration: "none",
            textShadow: lightText ? "0 1px 10px rgba(0,0,0,0.35)" : "none",
          }}
        >
          Makewin
        </Link>

        {/* Center — dark nav pill (desktop) */}
        <div className="hidden lg:flex flex-1 items-center justify-center max-w-3xl mx-auto min-w-0">
          <div
            className="flex items-center gap-0.5 w-full max-w-2xl rounded-full py-1 pl-3 pr-1.5 min-w-0"
            style={glassPill}
          >
            <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto scrollbar-none">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="shrink-0 rounded-full px-3 py-2 transition-opacity duration-200 hover:opacity-100"
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    textDecoration: "none",
                    color: isActive(item.path) ? "#fff" : "rgba(255,255,255,0.55)",
                    opacity: isActive(item.path) ? 1 : 0.85,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <span
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full ml-0.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
              aria-hidden
            >
              <GridIcon />
            </span>
          </div>
        </div>

        {/* Mobile — compact dark pill trigger */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex items-center gap-2 rounded-full py-2 pl-4 pr-2 min-w-0 flex-1 max-w-[12rem] sm:max-w-xs mx-auto"
          style={glassPill}
          aria-label="Toggle menu"
        >
          <span
            className="font-mono text-[9px] uppercase tracking-[0.2em] truncate"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Menu
          </span>
          <span
            className="ml-auto flex items-center justify-center w-8 h-8 shrink-0"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <GridIcon />
          </span>
        </button>

        {/* Right — share */}
        <button
          type="button"
          onClick={handleShare}
          className="shrink-0 font-mono text-[11px] sm:text-xs lowercase tracking-[0.12em] leading-tight text-right transition-opacity hover:opacity-70 transition-colors duration-300"
          style={{
            color: edgeTextColor,
            textShadow: lightText ? "0 1px 10px rgba(0,0,0,0.35)" : "none",
          }}
        >
          share
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="mx-3 sm:mx-5 lg:mx-8 mt-2 pointer-events-auto">
          <div
            className="rounded-2xl p-2 flex flex-col"
            style={{
              backgroundColor: "rgba(20, 20, 20, 0.55)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
            }}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-mono rounded-xl px-4 py-3 text-[10px] uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
                style={{
                  textDecoration: "none",
                  color: isActive(item.path) ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="3.5" cy="3.5" r="1.2" />
      <circle cx="10.5" cy="3.5" r="1.2" />
      <circle cx="3.5" cy="10.5" r="1.2" />
      <circle cx="10.5" cy="10.5" r="1.2" />
    </svg>
  );
}
