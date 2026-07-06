import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Products", to: "/categories" },
  { label: "Downloads", to: "/downloads" },
  { label: "Dealers", to: "/dealers" },
  { label: "Contact", to: "/contact" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/makewin_modular/",
    icon: IconInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/MakewinModular",
    icon: IconFacebook,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Makewin_Modular",
    icon: IconYoutube,
  },
];

const ACCENT = "oklch(62% 0.09 55)";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Peach → copper → cream gradient (reference-style) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 130% 90% at 15% -10%, oklch(72% 0.14 52) 0%, transparent 55%)",
            "radial-gradient(ellipse 110% 80% at 85% 5%, oklch(68% 0.16 48) 0%, transparent 50%)",
            "radial-gradient(ellipse 140% 100% at 50% 35%, oklch(58% 0.15 42 / 0.85) 0%, transparent 62%)",
            "radial-gradient(ellipse 120% 90% at 30% 55%, oklch(65% 0.13 50 / 0.6) 0%, transparent 58%)",
            "radial-gradient(ellipse 100% 80% at 70% 48%, oklch(52% 0.12 40 / 0.45) 0%, transparent 55%)",
            "linear-gradient(180deg, oklch(78% 0.11 55) 0%, oklch(62% 0.14 45) 38%, oklch(88% 0.06 70) 72%, var(--cream) 100%)",
          ].join(", "),
        }}
        aria-hidden
      />

      {/* Grain / noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
        aria-hidden
      />

      <div className="relative z-10 px-8 sm:px-14 lg:px-20 xl:px-24 pt-14 sm:pt-16 pb-10 sm:pb-12">

        {/* Top row — nav + follow us */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16 mb-16 sm:mb-20 lg:mb-24">
          <nav className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-3">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-medium transition-opacity hover:opacity-55"
                style={{ color: "var(--ink)", textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-start gap-6 lg:gap-8 lg:pl-8 lg:border-l" style={{ borderColor: "oklch(85% .01 80)" }}>
            <div>
              <p
                className="text-[9px] tracking-[0.28em] uppercase mb-4 font-medium"
                style={{ color: "oklch(50% .02 80)" }}
              >
                Follow Us
              </p>
              <div className="flex items-center gap-4 sm:gap-5">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="transition-opacity hover:opacity-55"
                    style={{ color: "var(--ink)" }}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Brand + tagline */}
        <div className="mb-14 sm:mb-16 lg:mb-20">
          <div className="relative inline-block">
            <h2
              className="font-sans font-semibold leading-none tracking-[0.06em]"
              style={{
                fontSize: "clamp(3.5rem, 12vw, 8.5rem)",
                color: "var(--ink)",
              }}
            >
              MakeWin
            </h2>
            <div
              className="absolute left-0 h-px"
              style={{
                width: "0.42em",
                bottom: "0.12em",
                backgroundColor: ACCENT,
              }}
              aria-hidden
            />
          </div>

          <p
            className="mt-6 sm:mt-8 text-sm sm:text-base leading-relaxed max-w-lg"
            style={{ color: "oklch(42% .015 80)" }}
          >
            A workshop where{" "}
            <em style={{ color: ACCENT, fontStyle: "normal" }}>aluminium</em> meets{" "}
            <em style={{ color: ACCENT, fontStyle: "normal" }}>art.</em>
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t" style={{ borderColor: "oklch(88% .01 80)" }}>
          <p className="text-[11px] tracking-wide" style={{ color: "oklch(52% .015 80)" }}>
            &copy; {year} MakeWin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function IconInstagram() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.4} />
      <circle cx="12" cy="12" r="4" strokeWidth={1.4} />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
      />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"
      />
      <polygon
        points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
