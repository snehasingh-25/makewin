import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Catalogue", to: "/categories" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/about" },
  { label: "Portfolio", to: "/categories" },
  { label: "Contact Us", to: "/contact" },
];

const INSTAGRAM_URL = "https://www.instagram.com/makewin_modular/";
const FACEBOOK_URL  = "https://www.facebook.com/MakewinModular";
const YOUTUBE_URL   = "https://www.youtube.com/@Makewin_Modular";

function IconInstagram() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"
      />
      <polygon
        points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
      />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cream border-t" style={{ borderColor: "var(--border)" }}>

      {/* ── Main 4-column grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--border)" }}>

        {/* Column 1 — Brand */}
        <div className="px-8 sm:px-10 py-12 lg:pr-10 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--border)" }}>
          <img
            src="/logo.png"
            alt="MakeWin"
            className="h-10 w-auto object-contain mb-5"
          />
          <p
            className="font-display text-2xl tracking-[0.08em] leading-none"
            style={{ color: "var(--ink)" }}
          >
            MAKEWIN
          </p>
          <div className="w-8 h-px my-4" style={{ backgroundColor: "var(--border)" }} />
          <p className="text-xs leading-relaxed max-w-[180px]" style={{ color: "oklch(55% .015 80)" }}>
            Thoughtfully crafted modular kitchens that inspire and endure.
          </p>
        </div>

        {/* Column 2 — Navigation */}
        <div className="px-8 sm:px-10 lg:px-10 py-12 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--border)" }}>
          <p
            className="text-[10px] tracking-[0.28em] uppercase mb-6 font-medium"
            style={{ color: "var(--ink)" }}
          >
            Navigation
          </p>
          <ul className="space-y-3">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ color: "oklch(40% .02 80)" }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Studio */}
        <div className="px-8 sm:px-10 lg:px-10 py-12 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--border)" }}>
          <p
            className="text-[10px] tracking-[0.28em] uppercase mb-6 font-medium"
            style={{ color: "var(--ink)" }}
          >
            Studio
          </p>
          <address className="not-italic text-sm leading-relaxed" style={{ color: "oklch(40% .02 80)" }}>
            Plot No. 13, Near Lotus Ply School<br />
            100 Feet Road, Banni Park Colony<br />
            Bhilwara 311001, Rajasthan (India)
          </address>
          <div className="w-6 h-px my-5" style={{ backgroundColor: "var(--border)" }} />
          <div className="space-y-2 text-sm" style={{ color: "oklch(40% .02 80)" }}>
            <a
              href="mailto:makewinglobal@gmail.com"
              className="block transition-opacity hover:opacity-60"
            >
              makewinglobal@gmail.com
            </a>
            <a
              href="tel:+919166166190"
              className="block transition-opacity hover:opacity-60"
            >
              +91 91661 66190
            </a>
          </div>
        </div>

        {/* Column 4 — Connect */}
        <div className="px-8 sm:px-10 lg:px-10 py-12">
          <p
            className="text-[10px] tracking-[0.28em] uppercase mb-6 font-medium"
            style={{ color: "var(--ink)" }}
          >
            Connect
          </p>
          <ul className="space-y-4">
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-opacity hover:opacity-60"
                style={{ color: "oklch(40% .02 80)" }}
              >
                <IconInstagram />
                Instagram
              </a>
            </li>
            <li>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-opacity hover:opacity-60"
                style={{ color: "oklch(40% .02 80)" }}
              >
                <IconFacebook />
                Facebook
              </a>
            </li>
            <li>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-opacity hover:opacity-60"
                style={{ color: "oklch(40% .02 80)" }}
              >
                <IconYoutube />
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────── */}
      <div
        className="border-t px-8 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs" style={{ color: "oklch(55% .015 80)" }}>
          &copy; {year} MakeWin
        </p>
        <p className="text-xs" style={{ color: "oklch(55% .015 80)" }}>
          All rights reserved.
        </p>
        <p className="text-xs" style={{ color: "oklch(55% .015 80)" }}>
          Powered by{" "}
          <a
            href="https://www.instagram.com/qyverra.it?igsh=MTV5a2pzdGNxNjIzdg=="
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-opacity hover:opacity-60"
            style={{ color: "var(--ink)" }}
          >
            Qyverra
          </a>
        </p>
      </div>

    </footer>
  );
}
