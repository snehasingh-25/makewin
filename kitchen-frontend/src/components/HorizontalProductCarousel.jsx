import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../api";
import { shuffleArray } from "../utils/shuffle";
import ProductCard from "./ProductCard";
import CarouselArrow from "./CarouselArrow";

// Inject shimmer keyframe once
if (typeof document !== "undefined" && !document.getElementById("hpc-shimmer-style")) {
  const style = document.createElement("style");
  style.id = "hpc-shimmer-style";
  style.textContent = `
    @keyframes hpc-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .hpc-shimmer {
      background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
      background-size: 800px 100%;
      animation: hpc-shimmer 1.4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

function ProductCardSkeleton({ wrapperClassName }) {
  return (
    <div className={wrapperClassName}>
      <div className="overflow-hidden rounded-none bg-cream border border-black/5 shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
        {/* Image area — matches aspect-4/5 */}
        <div className="hpc-shimmer aspect-[4/5] w-full" />

        {/* Text + button area */}
        <div className="px-[0.9rem] py-[0.9rem] space-y-[0.6rem]">
          {/* Title */}
          <div className="hpc-shimmer h-[0.85rem] w-3/4 rounded" />
          {/* Price */}
          <div className="hpc-shimmer h-[0.85rem] w-1/3 rounded" />
          {/* Button */}
          <div className="hpc-shimmer mt-[0.9rem] h-[2.475rem] w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

export default function HorizontalProductCarousel({
  title,
  subtitle,
  products = null,
  productIds = [],
  excludeProductId = null,
  shuffleFetched = true,
  isLoading = false,
  hideHeader = false,
  showCounter = false,
  showControls = true,
  cardWrapperClassName = "shrink-0 basis-[calc((100%-0.5rem)/2)] lg:basis-[calc((100%-2rem)/5)] overflow-hidden",
  skeletonCount = 4,
  containerClassName = "",
  sectionClassName = "mt-12 lg:mt-14",
  titleClassName = "pd-headline text-xl sm:text-2xl font-bold",
  subtitleClassName = "text-sm mt-1 text-[#474747]",
  loadingSkeletonClassName = "shrink-0 basis-[calc((100%-0.5rem)/2)] lg:basis-[calc((100%-2rem)/5)] rounded-lg animate-pulse",
  loadingTrackClassName = "flex gap-1 overflow-x-auto scroll-smooth scrollbar-hide pb-1",
  renderTrackClassName = "flex gap-1 overflow-x-auto scroll-smooth scrollbar-hide pb-1",
  hideScrollbar = true,
  className = "",
}) {
  const scrollContainerRef = useRef(null);
  const [fetchedByKey, setFetchedByKey] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasProvidedProducts = Array.isArray(products);
  const idsToFetch = useMemo(
    () => (excludeProductId ? productIds.filter((id) => Number(id) !== Number(excludeProductId)) : productIds),
    [excludeProductId, productIds]
  );
  const idsKey = useMemo(() => idsToFetch.join(","), [idsToFetch]);

  useEffect(() => {
    if (hasProvidedProducts || idsToFetch.length === 0 || fetchedByKey[idsKey] !== undefined) return;
    const ac = new AbortController();
    axios.get("/products", { params: { ids: idsToFetch.join(",") }, signal: ac.signal })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setFetchedByKey((prev) => ({
          ...prev,
          [idsKey]: shuffleFetched ? shuffleArray(list) : list,
        }));
      })
      .catch((err) => {
        if (!axios.isCancel(err)) console.error("HorizontalProductCarousel fetch error:", err);
        setFetchedByKey((prev) => ({ ...prev, [idsKey]: [] }));
      });
    return () => ac.abort();
  }, [fetchedByKey, hasProvidedProducts, idsKey, idsToFetch, shuffleFetched]);

  const resolvedProducts = useMemo(() => {
    if (hasProvidedProducts) return products;
    return fetchedByKey[idsKey] ?? [];
  }, [fetchedByKey, hasProvidedProducts, idsKey, products]);

  const list = useMemo(
    () => resolvedProducts.filter((p) => !excludeProductId || p.id !== Number(excludeProductId)),
    [excludeProductId, resolvedProducts]
  );

  const resolvedLoading =
    isLoading || (!hasProvidedProducts && idsToFetch.length > 0 && fetchedByKey[idsKey] === undefined);

  const countText = useMemo(() => {
    if (!showCounter) return null;
    return subtitle || `${list.length} items selected just for you`;
  }, [list.length, showCounter, subtitle]);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [list]);

  useEffect(() => {
    if (!showControls || !scrollContainerRef.current || list.length <= 1 || isHovered) return;

    const getScrollAmount = () => {
      const container = scrollContainerRef.current;
      if (!container) return 280;
      const firstCard = container.firstElementChild;
      if (!firstCard) return 280;

      const cardWidth = firstCard.getBoundingClientRect().width;
      const styles = window.getComputedStyle(container);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return Math.max(200, Math.round(cardWidth + gap));
    };

    const autoScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      const scrollAmount = getScrollAmount();

      if (scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };

    const intervalId = setInterval(autoScroll, 3000);

    return () => clearInterval(intervalId);
  }, [list.length, showControls, isHovered]);

  if (list.length === 0 && !resolvedLoading) return null;

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const getScrollAmount = () => {
      const container = scrollContainerRef.current;
      if (!container) return 280;
      const firstCard = container.firstElementChild;
      if (!firstCard) return 280;

      const cardWidth = firstCard.getBoundingClientRect().width;
      const styles = window.getComputedStyle(container);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return Math.max(200, Math.round(cardWidth + gap));
    };

    const scrollAmount = getScrollAmount();
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`${sectionClassName} ${className}`.trim()}>
      {!hideHeader ? (
        <div className="mb-6">
          <h2 className={titleClassName}>{title}</h2>
          {countText ? <p className={subtitleClassName}>{countText}</p> : null}
        </div>
      ) : null}

      {resolvedLoading ? (
        <div className={loadingTrackClassName} style={{ WebkitOverflowScrolling: "touch" }}>
          {[...Array(skeletonCount)].map((_, i) => (
            <ProductCardSkeleton key={i} wrapperClassName={loadingSkeletonClassName.replace("animate-pulse", "").trim()} />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div
          className={`relative ss-slider-shell ${containerClassName}`.trim()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {showControls && canScrollLeft ? (
            <CarouselArrow
              direction="left"
              onClick={() => handleScroll("left")}
              ariaLabel="Scroll left"
              size="md"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
            />
          ) : null}

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className={renderTrackClassName}
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: hideScrollbar ? "none" : undefined,
            }}
          >
            {list.map((product) => (
              <div key={product.id} className={cardWrapperClassName}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {showControls && canScrollRight ? (
            <CarouselArrow
              direction="right"
              onClick={() => handleScroll("right")}
              ariaLabel="Scroll right"
              size="md"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
