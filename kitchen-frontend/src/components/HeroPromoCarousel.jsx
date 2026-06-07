import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CarouselArrow from "./CarouselArrow";

function usePerView() {
  const get = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  };
  const [perView, setPerView] = useState(get);
  useEffect(() => {
    const onResize = () => setPerView(get());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return perView;
}

export default function HeroPromoCarousel({ banners }) {
  const list = Array.isArray(banners) ? banners : [];
  const perView = usePerView();
  const viewportRef = useRef(null);
  const rafRef = useRef(0);
  const [page, setPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const pages = useMemo(
    () => (list.length <= 0 ? 0 : Math.max(1, Math.ceil(list.length / perView))),
    [list.length, perView]
  );

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pages - 1)));
  }, [pages]);

  const scrollToPage = (nextPage) => {
    const el = viewportRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(nextPage, pages - 1));
    el.scrollTo({ left: el.clientWidth * clamped, behavior: "smooth" });
    setPage(clamped);
  };

  const onScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const next = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      setPage((p) => (p === next ? p : next));
    });
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  useEffect(() => {
    if (pages <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setPage((curr) => {
        const next = (curr + 1) % pages;
        const el = viewportRef.current;
        if (el) {
          el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [pages, isHovered]);

  if (list.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="px-1 sm:px-2 lg:px-4 pt-5 sm:pt-6 lg:pt-8">
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Scroll viewport */}
          <div
            ref={viewportRef}
            onScroll={onScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label="Promotional carousel"
          >
            <div className="flex gap-4 w-full">
              {list.map((b, idx) => {
                const title = (b?.title || "").toString();
                const subtitle = (b?.subtitle || "").toString();
                const ctaText = (b?.ctaText || "Shop Now").toString();
                const ctaLink = (b?.ctaLink || "/categories").toString();
                const background = (b?.imageUrl || "").toString();

                return (
                  <article
                    key={b?.id ?? `${idx}-${title}`}
                    className="snap-start shrink-0"
                    style={{ flex: `0 0 calc((100% - (16px * ${perView - 1})) / ${perView})` }}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                      {/* Background */}
                      <div className="absolute inset-0">
                        {background ? (
                          <img
                            src={background}
                            alt=""
                            className="w-full h-full object-cover object-center"
                            decoding="async"
                            loading={idx < perView ? "eager" : "lazy"}
                            fetchPriority={idx < perView ? "high" : "auto"}
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ background: "linear-gradient(135deg, oklch(75% .20 330), oklch(78% .16 250), var(--primary))" }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="relative flex items-center min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]">
                        {/* Text */}
                        <div className="flex-1 p-3">
                          {title && (
                            <p className="text-white font-semibold tracking-tight text-xl sm:text-2xl leading-tight drop-shadow-sm line-clamp-3">
                              {title}
                            </p>
                          )}
                          {subtitle && (
                            <p className="mt-2 text-white/85 text-sm sm:text-[15px] leading-relaxed line-clamp-2 max-w-[40ch]">
                              {subtitle}
                            </p>
                          )}
                          <Link
                            to={ctaLink}
                            className="mt-4 sm:mt-5 inline-flex items-center justify-center rounded-xl font-semibold shadow-sm transition-transform active:scale-[0.98] bg-cream text-slate-900 hover:bg-cream/95 px-4 py-2.5 text-sm sm:text-[15px]"
                            aria-label={ctaText}
                          >
                            {ctaText}
                          </Link>
                        </div>


                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Dot indicators */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToPage(i)}
                  className={[
                    "h-2 rounded-full transition-all duration-300",
                    i === page ? "w-6 bg-slate-900/80" : "w-2 bg-slate-300 hover:bg-slate-400",
                  ].join(" ")}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === page ? "true" : "false"}
                />
              ))}
            </div>
          )}

          {/* Desktop prev / next arrows */}
          {pages > 1 && (
            <>
              <CarouselArrow
                direction="left"
                onClick={() => scrollToPage(page - 1)}
                ariaLabel="Previous"
                size="md"
                className="hidden lg:grid absolute -left-3 top-1/2 -translate-y-1/2"
              />
              <CarouselArrow
                direction="right"
                onClick={() => scrollToPage(page + 1)}
                ariaLabel="Next"
                size="md"
                className="hidden lg:grid absolute -right-3 top-1/2 -translate-y-1/2"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
