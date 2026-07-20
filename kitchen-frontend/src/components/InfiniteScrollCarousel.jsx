import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { INFINITE_SCROLL_CAROUSEL_UI } from "./infiniteScrollCarouselPresets";
import CarouselArrow from "./CarouselArrow";

/**
 * Infinite scroll carousel for Categories.
 * - Always uses the "triple-list" technique for seamless looping.
 * - Arrows + optional auto-scroll.
 */
export default function InfiniteScrollCarousel({
  items,
  title = "Shop By Category",
  showViewAll = false,
  viewAllTo = "/categories",
  onItemClick,
  autoScroll = true,
  step,
  trackClassName,
  ui,
  hideArrowsOnMobile = false,
  rows = 1, // 1 or 2 (two-row horizontal scroller)
  desktopRows, // optional override at lg+
}) {
  const scrollRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const setWidthRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const baseItems = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items]);
  const list = useMemo(() => (baseItems.length ? [...baseItems, ...baseItems, ...baseItems] : []), [baseItems]);

  const resolvedStep = useMemo(() => {
    if (typeof step === "number") return step;
    if (typeof window === "undefined") return 220;
    return window.innerWidth >= 1024 ? 260 : window.innerWidth >= 640 ? 220 : 180;
  }, [step]);

  // Initialize scroll position to middle set
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || baseItems.length === 0) return;
    const setWidth = el.scrollWidth / 3;
    setWidthRef.current = setWidth;
    el.scrollLeft = setWidth;
  }, [baseItems]);

  const normalizeLoopPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el || baseItems.length === 0) return;
    const setWidth = setWidthRef.current || el.scrollWidth / 3;
    const sl = el.scrollLeft;
    if (sl >= setWidth * 2 - 50) el.scrollLeft = sl - setWidth;
    else if (sl <= 50) el.scrollLeft = sl + setWidth;
  }, [baseItems.length]);

  const scroll = useCallback(
    (direction) => {
      const el = scrollRef.current;
      if (!el || baseItems.length === 0) return;
      el.scrollBy({ left: direction === "left" ? -resolvedStep : resolvedStep, behavior: "smooth" });
      const setWidth = setWidthRef.current || el.scrollWidth / 3;
      setTimeout(() => {
        if (!scrollRef.current) return;
        const sl = scrollRef.current.scrollLeft;
        if (sl >= setWidth * 2 - 50) scrollRef.current.scrollLeft = sl - setWidth;
        else if (sl <= 50) scrollRef.current.scrollLeft = sl + setWidth;
      }, 350);
    },
    [baseItems.length, resolvedStep]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!autoScroll || !el || baseItems.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      scroll("right");
    }, 3000);

    return () => clearInterval(interval);
  }, [autoScroll, baseItems.length, scroll, isHovered]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  const resolvedUi = useMemo(() => {
    const preset = INFINITE_SCROLL_CAROUSEL_UI.category;
    return { ...preset, ...(ui ?? {}) };
  }, [ui]);

  const itemLinkPrefix = resolvedUi.linkPrefix;
  const tileWidthClass = resolvedUi.tileWidthClass;
  const mediaClass = resolvedUi.mediaClass;
  const mediaInnerRounding = resolvedUi.mediaInnerRounding;
  const nameClass = resolvedUi.nameClass;
  const resolvedTrackClassName = useMemo(() => {
    if (trackClassName) return trackClassName;
    const base = resolvedUi.trackClassName;

    const wantsTwoRows = rows >= 2;
    const wantsDesktopOneRow = desktopRows === 1;

    // Default: keep existing preset behavior
    if (!wantsTwoRows) return base;

    // Convert the base "flex ..." track into a responsive 2-row grid that becomes flex at lg.
    const rest = base.replace(/^flex\s+/, "");
    const desktopDisplay = wantsDesktopOneRow ? " lg:flex" : "";
    const desktopRowsClass = wantsDesktopOneRow ? " lg:grid-rows-1" : "";

    return `grid grid-flow-col auto-cols-max grid-rows-2${desktopRowsClass}${desktopDisplay} ${rest}`.trim();
  }, [desktopRows, rows, trackClassName, resolvedUi.trackClassName]);
  const arrowClassPrefix = hideArrowsOnMobile ? "hidden sm:grid " : "";

  if (baseItems.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--olive)" }}>
          {title}
        </h2>
        {showViewAll && (
          <Link
            to={viewAllTo}
            className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-300 hover:gap-2 group"
            style={{ color: "var(--olive)" }}
            onMouseEnter={(e) => (e.target.style.color = "oklch(40% .02 340)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--olive)")}
          >
            View All
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <CarouselArrow
          direction="left"
          onClick={() => scroll("left")}
          ariaLabel="Scroll categories left"
          size="sm"
          className={`${arrowClassPrefix}absolute left-0 top-1/2 -translate-y-1/2 z-10`}
        />

        <div
          ref={scrollRef}
          className={resolvedTrackClassName}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          onScroll={() => {
            if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
            scrollEndTimerRef.current = setTimeout(normalizeLoopPosition, 150);
          }}
        >
          {list.map((item, i) => (
            <Link
              key={`category-${item?.id ?? item?.slug ?? i}-${i}`}
              to={`${itemLinkPrefix}/${item?.slug ?? ""}`}
              onClick={() => onItemClick?.(item)}
              className={`flex-shrink-0 flex flex-col items-center ${tileWidthClass} group`}
            >
              <div
                className={`${mediaClass} flex items-center justify-center text-2xl sm:text-3xl group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 overflow-hidden cursor-pointer`}
                style={{
                  backgroundColor: "var(--primary)",
                }}
              >
                {item?.imageUrl ? (
                  <img src={item.imageUrl} alt={item?.name ?? ""} className={`w-full h-full object-cover ${mediaInnerRounding}`} />
                ) : (
                  <div className={`w-full h-full ${mediaInnerRounding} flex items-center justify-center overflow-hidden`} style={{ backgroundColor: "var(--primary)" }}>
                    <img src="/logo.png" alt="Makewin Logo" className="w-3/4 h-3/4 object-contain" />
                  </div>
                )}
              </div>

              <span
                className={`${nameClass} font-semibold text-center transition-colors mt-2 w-full whitespace-normal break-words leading-tight`}
                style={{
                  color: "oklch(40% .02 340)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.target.style.color = "oklch(40% .02 340)")}
              >
                {item?.name ?? ""}
              </span>
            </Link>
          ))}
        </div>

        <CarouselArrow
          direction="right"
          onClick={() => scroll("right")}
          ariaLabel="Scroll categories right"
          size="sm"
          className={`${arrowClassPrefix}absolute right-0 top-1/2 -translate-y-1/2 z-10`}
        />
      </div>
    </div>
  );
}
