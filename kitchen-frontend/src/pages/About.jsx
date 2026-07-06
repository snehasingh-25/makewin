import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ─── Intersection-observer fade-up hook ──────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── Reusable fade-up wrapper (accepts threshold prop) ───────────────────────
function FadeUp({ children, delay = 0, className = "", threshold = 0.12 }) {
  const [ref, visible] = useInView(threshold);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function About() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-cream overflow-x-hidden">
      <style>{`
        @keyframes chevron-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(7px); opacity: 0.9; }
        }
        .chevron-bounce { animation: chevron-bounce 2.2s ease-in-out infinite; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          S1 — HERO
          Full-viewport dark section. Content anchored to bottom-left.
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full min-h-screen flex flex-col justify-end"
        style={{ backgroundColor: "var(--ink)" }}
      >
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/about-hero.png"
            alt="MakeWin Kitchen"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        </div>

        {/* Page content */}
        <div className="relative z-10 px-8 sm:px-14 lg:px-20 pb-24 pt-48 lg:pt-56">
          <p
            className="text-[9px] tracking-[0.4em] uppercase mb-7"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Makewin Kitchens
          </p>

          <h1
            className="font-display leading-[0.92] mb-7"
            style={{ fontSize: "clamp(4rem, 13vw, 11rem)", color: "white" }}
          >
            About<br />Us
          </h1>

          <p
            className="font-display italic"
            style={{ fontSize: "clamp(1.1rem, 2.4vw, 2rem)", color: "var(--tan)" }}
          >
            Crafted with aluminium. Designed for life.
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 chevron-bounce pointer-events-none"
          style={{ opacity: scrolled ? 0 : 1, transition: "opacity 0.5s ease" }}
        >
          <span
            className="text-[8px] tracking-[0.32em] uppercase"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Scroll
          </span>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1L7 7L13 1" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S2 — BRAND STATEMENT
          Cream. Very large heading. One paragraph. Maximum whitespace.
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 py-28 sm:py-36 lg:py-44">

        <FadeUp delay={0}>
          <p
            className="text-[9px] tracking-[0.35em] uppercase mb-10 lg:mb-14"
            style={{ color: "var(--olive)" }}
          >
            About the Company
          </p>
        </FadeUp>

        <FadeUp delay={80}>
          <h2
            className="font-display leading-[1.05] mb-14 lg:mb-20"
            style={{
              fontSize: "clamp(2.6rem, 7vw, 7.5rem)",
              color: "var(--ink)",
              maxWidth: "22ch",
            }}
          >
            A workshop where<br />
            <em style={{ color: "var(--olive)" }}>aluminium meets art.</em>
          </h2>
        </FadeUp>

        <FadeUp delay={160}>
          <p
            className="text-sm sm:text-base leading-relaxed max-w-md"
            style={{ color: "oklch(45% .015 80)" }}
          >
            Welcome to Makewin Aluminum Kitchen Factory. From our fully automatic
            plant in Bhilwara, Rajasthan, we design and manufacture high-quality
            aluminum furniture — built to outlive trends and elevate every space,
            residential or commercial.
          </p>
        </FadeUp>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S4 — FACTORY
          Two columns: image left, text + 3 trust indicators right.
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 pb-28 sm:pb-36 lg:pb-44">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — image */}
          <FadeUp className="w-full">
            <div className="w-full">
              <div className="relative w-full overflow-hidden aspect-[4/3]">
                <img
                  src="/about-factory.png"
                  alt="MakeWin Factory"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                />
              </div>
              <p
                className="text-[9px] tracking-[0.3em] uppercase mt-4"
                style={{ color: "oklch(55% .015 80)" }}
              >
                Bhilwara, Rajasthan
              </p>
            </div>
          </FadeUp>

          {/* Right — copy + trust indicators */}
          <FadeUp delay={120} className="w-full">
            <div>
              <p
                className="text-[9px] tracking-[0.35em] uppercase mb-8"
                style={{ color: "var(--olive)" }}
              >
                Our Factory
              </p>

              <h2
                className="font-display leading-tight mb-8"
                style={{ fontSize: "clamp(2rem, 4vw, 4.5rem)", color: "var(--ink)" }}
              >
                Built in India.<br />Built to Last.
              </h2>

              <p
                className="text-sm sm:text-base leading-relaxed mb-12 max-w-sm"
                style={{ color: "oklch(45% .015 80)" }}
              >
                Our fully automatic plant in Bhilwara crafts every piece from
                100% aluminium — no wood, no compromise. Water resistant, termite
                proof, and built for decades of daily use.
              </p>

              {/* Trust indicators — plain text with olive left border */}
              <div className="space-y-7">
                {[
                  { stat: "10,000+",          desc: "Sq. Ft. Manufacturing Plant" },
                  { stat: "Premium Materials", desc: "100% Aluminium, 0% Wood" },
                  { stat: "Made In India",     desc: "Factory-finished in Bhilwara" },
                ].map(({ stat, desc }) => (
                  <div
                    key={stat}
                    className="pl-5 border-l"
                    style={{ borderColor: "var(--olive)" }}
                  >
                    <p className="font-display text-xl" style={{ color: "var(--ink)" }}>
                      {stat}
                    </p>
                    <p
                      className="text-xs mt-0.5 tracking-wide"
                      style={{ color: "oklch(55% .015 80)" }}
                    >
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S5 — EXPERIENCE CENTRE
          Dark. Large cinematic image. Minimal copy. Strong CTA.
      ══════════════════════════════════════════════════════════ */}
      <section
        className="px-8 sm:px-14 lg:px-20 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20"
        style={{ backgroundColor: "var(--ink)" }}
      >
        {/* Text row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-14 lg:mb-18">

          <FadeUp>
            <div>
              <p
                className="text-[9px] tracking-[0.35em] uppercase mb-8"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Experience Centre
              </p>
              <h2
                className="font-display text-white leading-[1.0]"
                style={{ fontSize: "clamp(2.4rem, 6vw, 7rem)" }}
              >
                See it. Feel it.<br />
                <em style={{ color: "var(--tan)" }}>Live in it.</em>
              </h2>
            </div>
          </FadeUp>

          <FadeUp delay={130}>
            <div className="lg:pb-3">
              <p
                className="text-sm sm:text-base leading-relaxed mb-10 max-w-sm"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Our studio in Bhilwara is open seven days a week. Touch the
                finishes, open the cabinets, see the craftsmanship up close.
                Our experts are here to guide you.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-8 py-3.5 text-[9px] tracking-[0.28em] uppercase border transition-colors duration-300"
                style={{ borderColor: "rgba(255,255,255,0.45)", color: "white" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "var(--ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "white";
                }}
              >
                Book a Visit →
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Cinematic full-width image */}
        <FadeUp threshold={0.06}>
          <div className="relative w-full overflow-hidden aspect-[21/9]">
            <img
              src="/about-experience.png"
              alt="MakeWin Showroom"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-[1.02]"
            />
          </div>
        </FadeUp>
      </section>

      {/* Thin separator between the two dark sections */}
      <div className="h-px" style={{ backgroundColor: "oklch(0.28 0.01 80)" }} />

      {/* ══════════════════════════════════════════════════════════
          S6 — BOTTOM CTA
          Dark. Very large serif heading. Single button.
      ══════════════════════════════════════════════════════════ */}
      <section
        className="px-8 sm:px-14 lg:px-20 py-32 sm:py-40 lg:py-52 text-center flex flex-col items-center"
        style={{ backgroundColor: "var(--ink)" }}
      >
        <FadeUp>
          <p
            className="text-[9px] tracking-[0.38em] uppercase mb-10"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Let&apos;s Work Together
          </p>
        </FadeUp>

        <FadeUp delay={80}>
          <h2
            className="font-display text-white leading-tight mb-8"
            style={{
              fontSize: "clamp(2.6rem, 8vw, 8rem)",
              maxWidth: "20ch",
            }}
          >
            Let&apos;s Create Something Extraordinary.
          </h2>
        </FadeUp>

        <FadeUp delay={160}>
          <p
            className="text-xs sm:text-sm tracking-widest uppercase mb-14"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Start your journey with MakeWin Kitchens.
          </p>
        </FadeUp>

        <FadeUp delay={230}>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 text-[9px] tracking-[0.3em] uppercase border transition-colors duration-300"
            style={{ borderColor: "rgba(255,255,255,0.45)", color: "white" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "white";
            }}
          >
            Schedule a Consultation →
          </Link>
        </FadeUp>
      </section>

    </div>
  );
}
