import { useEffect, useRef, useState } from "react"; // useEffect/useState used by FadeUp/FadeIn hooks
import { Link } from "react-router-dom";

// ─── Intersection-observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.1) {
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

// ─── FadeUp — slides up from below ───────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "", threshold = 0.1 }) {
  const [ref, visible] = useInView(threshold);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── FadeIn — slides from left, right, or bottom ─────────────────────────────
function FadeIn({ children, from = "bottom", delay = 0, className = "", threshold = 0.08 }) {
  const [ref, visible] = useInView(threshold);
  const offsets = { bottom: "translateY(40px)", left: "translateX(-48px)", right: "translateX(48px)" };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : offsets[from],
        transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function About() {
  return (
    <div className="bg-cream overflow-x-hidden">
      <style>{`
        .partner-card {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.35s ease,
                      border-color 0.35s ease;
        }
        .partner-card:hover {
          transform: scale(1.04);
          box-shadow: 0 0 0 1.5px var(--olive), 0 8px 32px rgba(0,0,0,0.08);
          border-color: var(--olive) !important;
        }
        .partner-logo {
          filter: grayscale(1) opacity(0.55);
          transition: filter 0.4s ease;
        }
        .partner-card:hover .partner-logo {
          filter: grayscale(0) opacity(1);
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border: 1px solid;
          border-radius: 9999px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          transition: background 0.3s, color 0.3s;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          S2 — ABOUT COMPANY
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 pt-8 sm:pt-12 lg:pt-28 pb-16 sm:pb-20 lg:pb-28">

        {/* Section label + editorial title */}
        <FadeUp delay={0}>
          <p className="text-sm sm:text-base font-semibold tracking-[0.18em] uppercase mb-5" style={{ color: "white", backgroundColor: "var(--ink)", display: "inline-block", padding: "4px 14px" }}>
            About Company
          </p>
        </FadeUp>
        <FadeUp delay={80}>
          <h2
            className="font-display leading-[1.03] mb-12 sm:mb-16 lg:mb-20"
            style={{ fontSize: "clamp(2.8rem, 7.5vw, 8rem)", color: "var(--ink)", maxWidth: "20ch" }}
          >
            A workshop where<br />
            <em style={{ color: "var(--olive)" }}>aluminium meets art.</em>
          </h2>
        </FadeUp>

        {/* ── Block 1: Factory image ── */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <FadeIn from="left" delay={0}>
            <div className="w-full lg:w-[70%]">
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
                <img
                  src="/about-factory.png"
                  alt="Makewin Factory — Bhilwara, Rajasthan"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
              <p className="text-[9px] tracking-[0.3em] uppercase mt-3" style={{ color: "oklch(55% .015 80)" }}>
                Manufactured in Bhilwara, Rajasthan
              </p>
            </div>
          </FadeIn>
        </div>

        {/* ── Block 2: Machinery image + feature chips ── */}
        <div className="mb-12 sm:mb-16 lg:mb-20 flex justify-end">
          <FadeIn from="right" delay={0} className="w-full lg:w-[70%]">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
                <img
                  src="/about-page-machinery.png"
                  alt="Makewin — CNC precision manufacturing"
                  className="absolute inset-0 w-full h-full object-contain bg-white"
                style={{ transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
            <p className="text-[9px] tracking-[0.3em] uppercase mt-3 mb-4" style={{ color: "oklch(55% .015 80)" }}>
              Fully Automatic Manufacturing
            </p>
            <div className="flex flex-wrap gap-2">
              {["CNC Precision", "Powder Coating", "Aluminium Fabrication", "Automated Production"].map((chip) => (
                <span
                  key={chip}
                  className="chip"
                  style={{ borderColor: "var(--olive)", color: "var(--olive)" }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* ── Block 3: Copy + stat cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <FadeIn from="left" delay={0}>
            <h2
              className="font-display leading-[1.05] mb-6"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 5rem)", color: "var(--ink)" }}
            >
              Built in India.<br />Built to Last.
            </h2>
            <p className="text-sm sm:text-base leading-[1.9] max-w-md" style={{ color: "oklch(42% .015 80)" }}>
              Makewin Aluminium Kitchen Factory manufactures premium aluminium kitchens
              and furniture from its fully automatic plant in Bhilwara. Every product
              is crafted using precision machinery, premium aluminium, and strict quality
              standards to deliver furniture that is waterproof, termite-proof, durable,
              and built for decades.
            </p>
          </FadeIn>

          <FadeIn from="right" delay={120}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: "18,000+", label: "Sq. Ft Factory" },
                { stat: "100%",    label: "Aluminium" },
                { stat: "0%",      label: "Wood" },
                { stat: "Make in India", label: "Factory in Bhilwara" },
              ].map(({ stat, label }) => (
                <div
                  key={stat}
                  className="p-5 sm:p-6"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid oklch(0.9 0.01 80)",
                    borderLeft: "3px solid var(--olive)",
                  }}
                >
                  <p
                    className="font-sans font-semibold leading-tight mb-1 tabular-nums"
                    style={{ fontSize: "clamp(1.3rem, 2.5vw, 2rem)", color: "var(--ink)" }}
                  >
                    {stat}
                  </p>
                  <p className="text-[10px] tracking-[0.1em] uppercase" style={{ color: "oklch(52% .015 80)" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* ── Block 4: Core Material + Promise cards ── */}
        <div className="mt-14 sm:mt-20 lg:mt-24">
          <FadeUp delay={0}>
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--olive)" }}
            >
              Core Material
            </p>
            <h3
              className="font-display leading-[1.05] mb-5"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.5rem)", color: "var(--ink)" }}
            >
              Premium Aluminium. <em style={{ color: "var(--olive)" }}>Built Different.</em>
            </h3>
            <p
              className="text-sm sm:text-base leading-[1.9] mb-8 sm:mb-10"
              style={{ color: "oklch(42% .015 80)", maxWidth: "72ch" }}
            >
              Our aluminum furniture is built using premium-quality aluminium that ensures exceptional
              strength, durability, and long-lasting performance. High-grade aluminum profiles provide
              excellent structural stability while remaining lightweight and corrosion-resistant.
              Combined with precision-engineered panels and premium hardware, the result is furniture
              that is stylish, reliable, and designed for everyday use.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: (
                  <>
                    <span className="font-sans font-semibold tabular-nums">10</span> Year Warranty
                  </>
                ),
                titleKey: "10 Year Warranty",
                body: "Every Makewin aluminium furniture comes with a 10-year warranty against manufacturing defects.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.08 1.18 2 2 0 012.08 0h3a2 2 0 012 1.72c.13 1 .37 1.98.72 2.91a2 2 0 01-.45 2.11L6.11 7.91a16 16 0 006 6l1.17-1.17a2 2 0 012.11-.45c.93.35 1.91.59 2.91.72A2 2 0 0122 16.92z" />
                  </svg>
                ),
                title: "After Sales Service",
                titleKey: "After Sales Service",
                body: "Makewin provides all customers 4 free services within 10 years of installation.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8h4l3 5v3h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                ),
                title: "Delivery Time",
                titleKey: "Delivery Time",
                body: "Your furniture is delivered within 30 days of order finalisation.",
              },
            ].map(({ icon, title, titleKey, body }) => (
              <FadeUp key={titleKey} delay={80}>
                <div
                  className="h-full p-7 sm:p-8 flex flex-col gap-5"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid oklch(0.9 0.01 80)",
                    borderTop: "3px solid var(--olive)",
                  }}
                >
                  <span style={{ color: "var(--olive)" }}>{icon}</span>
                  <p
                    className="font-display"
                    style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)", color: "var(--ink)" }}
                  >
                    {title}
                  </p>
                  <p className="text-sm leading-[1.8]" style={{ color: "oklch(48% .015 80)" }}>
                    {body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S3 — EXPERIENCE CENTRE
      ══════════════════════════════════════════════════════════ */}
      <section
        className="px-8 sm:px-14 lg:px-20 pt-20 sm:pt-28 lg:pt-36 pb-20 sm:pb-28 lg:pb-32"
        style={{ backgroundColor: "var(--ink)" }}
      >
        {/* Section label + editorial title */}
        <FadeUp delay={0}>
          <h2
            className="font-display leading-[1.1] mb-3"
            style={{
              fontSize: "clamp(1.65rem, 3.2vw, 2.6rem)",
              color: "white",
              letterSpacing: "-0.01em",
            }}
          >
            About Company Experience Centre
          </h2>
          <div
            className="mb-8 sm:mb-10"
            style={{ width: "4.5rem", height: "3px", backgroundColor: "var(--tan)" }}
          />
        </FadeUp>
        <FadeUp delay={80}>
          <h3
            className="font-display leading-[1.0] mb-12 sm:mb-16 lg:mb-20"
            style={{ fontSize: "clamp(2.8rem, 7.5vw, 8rem)", color: "white", maxWidth: "16ch" }}
          >
            See it.<br />Feel it.<br />
            <em style={{ color: "var(--tan)" }}>Live it.</em>
          </h3>
        </FadeUp>

        {/* ── Block 1: Exterior showroom ── */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <FadeIn from="left" delay={0}>
            <div className="w-full lg:w-[70%]">
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
                <img
                  src="/about-page-exterior.png"
                  alt="Makewin Experience Centre Exterior"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
              <p className="text-[9px] tracking-[0.3em] uppercase mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Experience Centre Exterior
              </p>
            </div>
          </FadeIn>
        </div>

        {/* ── Block 2: Interior showroom ── */}
        <div className="mb-12 sm:mb-16 lg:mb-20 flex justify-end">
          <FadeIn from="right" delay={0} className="w-full lg:w-[70%]">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
              <img
                src="/about-interior.png"
                alt="Makewin Experience Centre Interior"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
            <p className="text-[9px] tracking-[0.3em] uppercase mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Premium Interior Experience
            </p>
          </FadeIn>
        </div>

        {/* ── Block 3: Description + CTA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-end">
          <FadeIn from="left" delay={0}>
            <p className="text-sm sm:text-base leading-[1.9] max-w-md" style={{ color: "rgba(255,255,255,0.55)" }}>
              Our experience centre in Bhilwara allows customers to explore premium kitchens,
              wardrobes, finishes, hardware, and accessories before making a decision. Touch
              the materials, experience the craftsmanship, and consult with our design experts.
            </p>
          </FadeIn>

          <FadeIn from="right" delay={100}>
            <div className="lg:flex lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-8 py-3.5 text-[9px] tracking-[0.28em] uppercase border transition-colors duration-300"
                style={{ borderColor: "rgba(255,255,255,0.45)", color: "white" }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "var(--ink)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "white";
                }}
              >
                Book A Visit →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          S4 — WORKING PARTNERS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 pt-20 sm:pt-28 lg:pt-36 pb-20 sm:pb-28 lg:pb-32">

        {/* Label + title */}
        <FadeUp delay={0}>
          <h2
            className="font-display leading-[1.1] mb-3"
            style={{
              fontSize: "clamp(1.65rem, 3.2vw, 2.6rem)",
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            Brand For Your Kitchen
          </h2>
          <div
            className="mb-8 sm:mb-10"
            style={{ width: "4.5rem", height: "3px", backgroundColor: "var(--olive)" }}
          />
        </FadeUp>
        <FadeUp delay={80}>
          <h3
            className="font-display leading-[1.03] mb-5"
            style={{ fontSize: "clamp(2.4rem, 6vw, 6.5rem)", color: "var(--ink)", maxWidth: "22ch" }}
          >
            Trusted by Industry Leaders
          </h3>
        </FadeUp>
        <FadeUp delay={140}>
          <p className="text-sm sm:text-base leading-[1.9] max-w-lg mb-12 sm:mb-16 lg:mb-20" style={{ color: "oklch(42% .015 80)" }}>
            We collaborate with globally trusted brands to ensure every kitchen delivers
            exceptional quality, performance, and reliability.
          </p>
        </FadeUp>

        {/* Logo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { name: "Vellix",  logo: "/partner-vellix.png" },
            { name: "Ozone",   logo: "/partner-ozone.png" },
            { name: "Hettich", logo: "/partner-hettich.png" },
            { name: "Bosch",   logo: "/partner-bosch.png" },
            { name: "Faber",   logo: "/partner-faber.png" },
            { name: "Blum",    logo: "/partner-blum.png" },
            { name: "Scilm",   logo: "/partner-scilm.png" },
            { name: "Siemens", logo: "/partner-siemens.png" },
          ].map(({ name, logo }, i) => (
            <FadeIn key={name} from="bottom" delay={i * 60} className="h-full">
              <div
                className="partner-card h-full flex items-center justify-center px-6 py-8 sm:py-10"
                style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid oklch(0.88 0.012 80)",
                }}
              >
                <div className="w-full flex items-center justify-center" style={{ height: "64px" }}>
                  <img
                    src={logo}
                    alt={name}
                    className="max-h-full max-w-full object-contain"
                    style={{ maxHeight: "64px", maxWidth: "140px" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Thin separator */}
      <div className="h-px" style={{ backgroundColor: "oklch(0.28 0.01 80)" }} />

      {/* ══════════════════════════════════════════════════════════
          S5 — BOTTOM CTA  (unchanged)
      ══════════════════════════════════════════════════════════ */}
      <section
        className="px-8 sm:px-14 lg:px-20 py-24 sm:py-28 lg:py-36 text-center flex flex-col items-center"
        style={{ backgroundColor: "var(--ink)" }}
      >
        <FadeUp delay={80}>
          <h2
            className="font-display text-white leading-tight mb-6"
            style={{ fontSize: "clamp(2.6rem, 8vw, 8rem)", maxWidth: "20ch" }}
          >
            Let&apos;s Create Something Extraordinary.
          </h2>
        </FadeUp>

        <FadeUp delay={160}>
          <p className="text-xs sm:text-sm tracking-widest uppercase mb-10" style={{ color: "rgba(255,255,255,0.35)" }}>
            Start your journey with Makewin Kitchens.
          </p>
        </FadeUp>

        <FadeUp delay={230}>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 text-[9px] tracking-[0.3em] uppercase border transition-colors duration-300"
            style={{ borderColor: "rgba(255,255,255,0.45)", color: "white" }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={e => {
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
