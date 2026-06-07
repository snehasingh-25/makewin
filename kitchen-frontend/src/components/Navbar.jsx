import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/categories", label: "Products" },
    { path: "/downloads", label: "Download Center" },
    { path: "/dealers", label: "Dealer Locator" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <nav
      className={`sticky top-0 z-50 transition-all ${scrolled
        ? "bg-cream/70 shadow-lg border-b backdrop-blur-xl"
        : "bg-cream/55 backdrop-blur-xl"
        }`}
      style={{ borderColor: scrolled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.25)" }}
    >
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex items-center justify-between h-14 md:h-14 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="MakeWin Logo"
              className="h-6 w-auto object-contain transition-transform duration-300 lg:group-hover:scale-110"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${isActive(item.path)
                    ? "border-2"
                    : ""
                    }`}
                  style={{
                    color: isActive(item.path) ? 'var(--cream)' : 'var(--olive)',
                    backgroundColor: isActive(item.path) ? 'var(--primary)' : 'transparent',
                    borderColor: isActive(item.path) ? 'var(--primary)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--cream)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--olive)';
                    }
                  }}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'var(--cream)' }}>
                      {item.badge}
                    </span>
                  )}
                </Link>

              </div>
            ))}
          </div>

          {/* Search + Cart + Mobile Button */}
          <div className="flex items-center gap-3">

            {/* Desktop search bar */}
            <SearchBar className="hidden lg:block w-60" />

            {/* Mobile/Tablet Search Icon (replaces search bar) */}
            <Link to="/search" className="relative lg:hidden group">
              <button
                type="button"
                className="p-2 rounded-full hover:scale-110 transition-all duration-300 active:scale-95"
                style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--olive)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </Link>



            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-all duration-300 active:scale-95"
              style={{ color: 'var(--olive)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-96 py-4" : "max-h-0"
            }`}
        >
          <div className="flex flex-col gap-1 border-t pt-4" style={{ borderColor: 'var(--primary)' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(item.path)
                  ? "border-2"
                  : "active:scale-95"
                  }`}
                style={{
                  color: isActive(item.path) ? 'var(--cream)' : 'var(--olive)',
                  backgroundColor: isActive(item.path) ? 'var(--primary)' : 'transparent',
                  borderColor: isActive(item.path) ? 'var(--primary)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--cream)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--olive)';
                  }
                }}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'var(--cream)' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
