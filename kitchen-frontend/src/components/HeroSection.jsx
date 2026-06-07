import { useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-kitchen.jpeg";

const swatches = [
  { name: "Cream", value: "oklch(0.95 0.02 85)", isDark: false },
  { name: "Olive", value: "oklch(0.46 0.06 120)", isDark: true },
  { name: "Sand", value: "oklch(0.82 0.05 75)", isDark: false },
  { name: "Walnut", value: "oklch(0.42 0.04 50)", isDark: true },
  { name: "Ink", value: "oklch(0.2 0.01 80)", isDark: true },
];

export default function HeroSection() {
  const [activeSwatch, setActiveSwatch] = useState(swatches[0]);

  // Determine colors dynamically based on active swatch theme
  const textColor = activeSwatch.isDark ? "oklch(0.97 0.01 90)" : "oklch(0.18 0.01 80)";
  const textMutedColor = activeSwatch.isDark ? "oklch(0.85 0.01 90)" : "oklch(0.45 0.015 80)";
  const accentColor = activeSwatch.isDark ? "oklch(0.85 0.05 85)" : "oklch(0.31 0.08 122.84)";

  // Format overlay color string by adding opacity
  const overlayColor = activeSwatch.value.replace(")", " / 0.65)");

  return (
    <section className="relative min-h-[100svh] overflow-hidden flex flex-col justify-center bg-cream transition-colors duration-700 ease-in-out">
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .hero-img-zoom {
          animation: kenburns 6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>

      {/* Background Image & Dynamic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Aluminium modular kitchen interior"
          className="h-full w-full object-cover hero-img-zoom"
          loading="eager"
        />
        <div
          className="absolute inset-0 transition-colors duration-700 ease-in-out"
          style={{ backgroundColor: overlayColor }}
        />
      </div>

      {/* Vertical text */}
      <div
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 vertical-text text-[10px] lg:text-xs tracking-[0.4em] uppercase hidden sm:block select-none transition-colors duration-700 ease-in-out"
        style={{ color: activeSwatch.isDark ? "oklch(0.97 0.01 90 / 0.45)" : "oklch(0.18 0.01 80 / 0.45)" }}
      >
        Build Your Dream Home
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12 pt-32 pb-20 flex flex-col justify-center min-h-[100svh]">
        <div className="max-w-2xl text-left">
          
          {/* Est. tag */}
          <p
            className="text-[11px] tracking-[0.35em] uppercase mb-6 opacity-0 animate-fade-in-up transition-colors duration-700 ease-in-out"
            style={{ color: accentColor }}
          >
            Makewin · Est. 2022
          </p>

          {/* Heading */}
          <h1
            className="font-display text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] leading-[0.95] opacity-0 animate-fade-in-up delay-100 transition-colors duration-700 ease-in-out"
            style={{ color: textColor }}
          >
            Build your{" "}
            <span
              className="font-script italic font-normal transition-colors duration-700 ease-in-out"
              style={{ color: accentColor }}
            >
              dream home
            </span>
            <br />
            in aluminium.
          </h1>

          {/* Subtext */}
          <p
            className="mt-8 max-w-md text-base md:text-lg opacity-0 animate-fade-in-up delay-200 leading-relaxed transition-colors duration-700 ease-in-out"
            style={{ color: textMutedColor }}
          >
            Modular kitchens, wardrobes, doors and crafted interior pieces — engineered in aluminium,
            designed for a lifetime.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4 opacity-0 animate-fade-in-up delay-300">
            <Link
              to="/categories"
              className="inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-medium shadow-md transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg group"
              style={{
                backgroundColor: activeSwatch.isDark ? "oklch(0.95 0.02 85)" : "oklch(0.31 0.08 122.84)",
                color: activeSwatch.isDark ? "oklch(0.18 0.01 80)" : "oklch(0.972 0.012 90)",
              }}
            >
              Know More{" "}
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-medium border transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                borderColor: activeSwatch.isDark ? "oklch(0.95 0.02 85 / 0.4)" : "oklch(0.31 0.08 122.84 / 0.4)",
                color: activeSwatch.isDark ? "oklch(0.95 0.02 85)" : "oklch(0.31 0.08 122.84)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = activeSwatch.isDark ? "oklch(0.95 0.02 85 / 0.08)" : "oklch(0.31 0.08 122.84 / 0.08)";
                e.currentTarget.style.borderColor = activeSwatch.isDark ? "oklch(0.95 0.02 85)" : "oklch(0.31 0.08 122.84)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = activeSwatch.isDark ? "oklch(0.95 0.02 85 / 0.4)" : "oklch(0.31 0.08 122.84 / 0.4)";
              }}
            >
              Visit Showroom
            </Link>
          </div>

          {/* Swatches block */}
          <div className="mt-14 opacity-0 animate-fade-in-up delay-400">
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-4 transition-colors duration-700 ease-in-out"
              style={{ color: textMutedColor }}
            >
              Signature Palette
            </p>
            <div className="flex items-center gap-4">
              {swatches.map((s) => {
                const isSelected = activeSwatch.name === s.name;
                return (
                  <button
                    key={s.name}
                    onClick={() => setActiveSwatch(s)}
                    className="flex flex-col items-center gap-2 group focus:outline-none cursor-pointer"
                    aria-label={`Select ${s.name} theme`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full border shadow-sm transition-all duration-500 transform group-hover:scale-110 active:scale-95`}
                      style={{
                        backgroundColor: s.value,
                        borderColor: isSelected ? accentColor : "rgba(0,0,0,0.1)",
                        boxShadow: isSelected
                          ? `0 0 0 2px ${activeSwatch.isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"}`
                          : "none",
                      }}
                    />
                    <span
                      className={`text-[9px] tracking-[0.15em] uppercase transition-all duration-300 ${
                        isSelected ? "font-semibold opacity-100" : "opacity-60 group-hover:opacity-100"
                      }`}
                      style={{ color: isSelected ? accentColor : textMutedColor }}
                    >
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
