import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api";
// import HeroPromoCarousel from "../components/HeroPromoCarousel"; // BANNERS DISABLED
import { MemoReelCarousel as ReelCarousel } from "../components/ReelCarousel";

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

export default function Home() {
  const heroVideoRef = useRef(null);
  const isMutedRef = useRef(true);
  const [scrolled, setScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState({ reels: true });

  useEffect(() => {
    document.title = "Makewin | Aluminium Modular Kitchens";
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
      if (!isMutedRef.current) return;

      video.muted = true;
      video.defaultMuted = true;
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("canplaythrough", tryPlay);

    const watchdog = setInterval(tryPlay, 1500);

    return () => {
      clearInterval(watchdog);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("canplaythrough", tryPlay);
    };
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.defaultMuted = isMuted;
  }, [isMuted]);

  const toggleMute = async () => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (isMutedRef.current) {
      isMutedRef.current = false;
      setIsMuted(false);
      video.defaultMuted = false;
      video.muted = false;
      video.volume = 1;
      try {
        await video.play();
      } catch {
        // keep unmuted after explicit user tap even if play is blocked
      }
      return;
    }

    isMutedRef.current = true;
    setIsMuted(true);
    video.muted = true;
    video.defaultMuted = true;
  };

  useEffect(() => {
    const ac = new AbortController();

    axios.get("/reels", { signal: ac.signal })
      .then((res) => {
        setReels(Array.isArray(res.data) ? res.data : []);
        setLoading((prev) => ({ ...prev, reels: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, reels: false }));
      });

    // BANNERS DISABLED
    // axios.get("/banners?type=primary", { signal: ac.signal })
    //   .then((res) => {
    //     setPrimaryBanners(Array.isArray(res.data) ? res.data : []);
    //     setLoading((prev) => ({ ...prev, banners: false }));
    //   })
    //   .catch(() => {
    //     setLoading((prev) => ({ ...prev, banners: false }));
    //   });

    // Banners are currently disabled on the home page.
    // axios.get("/banners?type=secondary", { signal: ac.signal })
    //   .then((res) => {
    //     setSecondaryBanners(Array.isArray(res.data) ? res.data : []);
    //   })
    //   .catch(() => {});

    return () => ac.abort();
  }, []);

  const isInitialLoad = loading.reels;

  return (
    <div className="bg-cream overflow-x-hidden">
      <style>{`
        @keyframes chevron-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(7px); opacity: 0.9; }
        }
        .chevron-bounce { animation: chevron-bounce 2.2s ease-in-out infinite; }

        @keyframes home-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .hm-sk {
          background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
          background-size: 1200px 100%;
          animation: home-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          S1 — HERO
          Full-viewport dark section. Content anchored to bottom-left.
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full h-[89.1svh] flex flex-col justify-end overflow-hidden"
        style={{ backgroundColor: "var(--ink)" }}
      >
        <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: "#000" }}>
          <video
            ref={heroVideoRef}
            key="home-hero-20260805"
            className="absolute inset-0 z-0 w-full h-full object-cover object-center"
            autoPlay
            loop
            playsInline
            preload="metadata"
          >
            <source src="/home-hero-20260805.mp4" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-black/70 via-black/30 to-black/10"
          />
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          aria-pressed={!isMuted}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/65"
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M16 9l4 4M20 9l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M15.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M17.8 6.2a8 8 0 010 11.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div className="relative z-10 px-8 sm:px-14 lg:px-20 pb-10 sm:pb-12 pointer-events-none">
          <h1
            className="font-display leading-[0.92] mb-5"
            style={{ fontSize: "clamp(2.75rem, 10vw, 7rem)", color: "white" }}
          >
            Makewin<br />Kitchens
          </h1>

          <p
            className="font-display italic"
            style={{ fontSize: "clamp(1.1rem, 2.4vw, 2rem)", color: "var(--tan)" }}
          >
            Aluminium furniture, crafted for life.
          </p>
        </div>

        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 chevron-bounce pointer-events-none"
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
          S3 — WHAT WE DO
          3 tall portrait cards. Name-only overlays. Hover reveal.
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 pt-28 sm:pt-36 lg:pt-44 pb-28 sm:pb-36 lg:pb-44">
        <FadeUp>
          <h2
            className="font-display mb-10 lg:mb-14"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--ink)" }}
          >
            Aluminium Products
          </h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          {[
            { label: "Modular Kitchen\nin Aluminium", link: "/category/kitchen", img: "/home-product-1.png", alt: "Makewin Modular Kitchen" },
            { label: "Wardrobes\nin Aluminium", link: "/category/Wardrobe", img: "/about-wardrobes.png", alt: "Makewin Wardrobes" },
            { label: "Doors\nin Aluminium", link: "/category/Door", img: "/home-image-3.png", alt: "Makewin Doors in Aluminium" },
          ].map(({ label, link, img, alt }, i) => (
            <FadeUp key={label} delay={i * 110} className="w-full">
              <Link
                to={link}
                className="group relative block w-full overflow-hidden aspect-[3/4]"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={img}
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 45%, transparent 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
                  }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex items-end justify-between">
                  <p
                    className="font-display text-white leading-snug"
                    style={{ fontSize: "clamp(1.1rem, 2vw, 1.55rem)", whiteSpace: "pre-line" }}
                  >
                    {label}
                  </p>
                  <span
                    className="text-white text-lg opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  >
                    →
                  </span>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>



      {/* ══════════════════════════════════════════════════════════
          S4 — FACTORY
          Two columns: image left, text + 3 trust indicators right.
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 pb-14 sm:pb-[4.5rem] lg:pb-[5.5rem]">
        {/*
          Mobile:  heading (1) → image (2) → description (3)
          Desktop: image left col (1) | heading + description right col (2)
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-20 lg:items-center">

          {/* Heading — visible only on mobile, sits above the image */}
          <FadeUp className="lg:hidden">
            <h2
              className="font-display leading-tight"
              style={{ fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)", color: "var(--ink)" }}
            >
              Crafted in our own factory
            </h2>
          </FadeUp>

          {/* Image — mobile: second, desktop: left column */}
          <FadeUp className="w-full lg:order-first">
            <div className="w-full">
              <div className="relative w-full overflow-hidden aspect-[4/3]">
                <img
                  src="/about-factory.png"
                  alt="Makewin Factory"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                />
              </div>
            </div>
          </FadeUp>

          {/* Right col: heading (desktop only) + description */}
          <FadeUp delay={120} className="w-full">
            <div>
              <h2
                className="hidden lg:block font-display leading-tight"
                style={{ fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)", color: "var(--ink)" }}
              >
                Crafted in our own factory
              </h2>
              <p
                className="lg:mt-6 text-sm sm:text-base leading-[1.85]"
                style={{ color: "oklch(38% .02 80)" }}
              >
                Every detail is shaped with care, from material selection to final finishing.
                Our production process combines precision engineering, durable materials,
                and attentive craftsmanship to deliver spaces that stand the test of time.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
          S5 — EXPERIENCE CENTRE
          Dark. Large cinematic image. Minimal copy. Strong CTA.
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-14 lg:mb-18">

          <FadeUp>
            <div>
              <h2
                className="font-display leading-[1.0]"
                style={{ fontSize: "clamp(2.4rem, 6vw, 7rem)", color: "var(--ink)" }}
              >
                See it. Feel it.<br />
                <em style={{ color: "var(--olive)" }}>Live in it.</em>
              </h2>
            </div>
          </FadeUp>

          <FadeUp delay={130}>
            <div className="lg:pb-3">
              <p
                className="text-sm sm:text-base leading-relaxed mb-10 max-w-sm"
                style={{ color: "oklch(45% .015 80)" }}
              >
                Our studio in Bhilwara is open seven days a week. Touch the
                finishes, open the cabinets, see the craftsmanship up close.
                Our experts are here to guide you.
              </p>
            </div>
          </FadeUp>
        </div>

        <FadeUp threshold={0.06}>
          <div className="relative w-[90%] mx-auto overflow-hidden aspect-[21/9]">
            <img
              src="/home-image-5.png"
              alt="Makewin Showroom"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-[1.02]"
            />
          </div>
        </FadeUp>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MAGAZINE — centred feature
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 pt-12 sm:pt-16 lg:pt-20 pb-28 sm:pb-36 lg:pb-44">
        <FadeUp>
          <h2
            className="text-center font-sans font-bold uppercase tracking-[0.35em] mb-12 sm:mb-16"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "var(--ink)",
            }}
          >
            Inspiration
          </h2>
        </FadeUp>

        <FadeUp delay={80}>
          <div className="max-w-5xl mx-auto w-full overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
            <img
              src="/about-kitchens.png"
              alt="Makewin modular kitchen design"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </FadeUp>

        <FadeUp delay={160}>
          <p
            className="text-center text-sm sm:text-base leading-[1.85] max-w-2xl mx-auto mt-12 sm:mt-16 px-4"
            style={{ color: "oklch(42% .02 80)" }}
          >
            Learn how to design a kitchen that works as hard as you do — from
            smart storage and ergonomic layouts to finishes that age gracefully.
            Explore ideas for maintenance, personalisation, and creating a space
            that feels unmistakably yours, built in aluminium and made to last.
          </p>
        </FadeUp>
      </section>


      {/* ══════════════════════════════════════════════════════════
          S7 — BOTTOM CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream px-8 sm:px-14 lg:px-20 py-6 sm:py-8 lg:py-10 text-center flex flex-col items-center">
        <FadeUp delay={80}>
          <h2
            className="font-display leading-tight mb-8"
            style={{
              fontSize: "clamp(2.6rem, 8vw, 8rem)",
              maxWidth: "20ch",
              color: "var(--ink)",
            }}
          >
            Let&apos;s Create Something Extraordinary.
          </h2>
        </FadeUp>

        <FadeUp delay={160}>
          <p
            className="text-xs sm:text-sm tracking-widest uppercase mb-14"
            style={{ color: "oklch(55% .015 80)" }}
          >
            Start your journey with Makewin Kitchens.
          </p>
        </FadeUp>

        <FadeUp delay={230}>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 text-[9px] tracking-[0.3em] uppercase border transition-colors duration-300"
            style={{ borderColor: "var(--olive)", color: "var(--olive)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--olive)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--olive)";
            }}
          >
            Schedule a Consultation →
          </Link>
        </FadeUp>
      </section>

      {/* Reels */}
      {reels.length > 0 && (
        <div className="py-6 bg-cream">
          <div className="px-1 sm:px-2 lg:px-4">
            <h2
              className="text-xl sm:text-2xl font-bold mb-6 text-center tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Follow Us{" "}
              <a
                href="https://www.instagram.com/Makewin"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
                style={{ color: "var(--primary)" }}
              >
                @Makewin
              </a>
            </h2>
            <ReelCarousel reels={reels} />
          </div>
        </div>
      )}

    </div>
  );
}
