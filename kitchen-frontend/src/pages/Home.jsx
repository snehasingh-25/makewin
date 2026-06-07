import { useEffect, useMemo, useState } from "react";
import { API } from "../api";
import HeroSection from "../components/HeroSection";
import HeroPromoCarousel from "../components/HeroPromoCarousel";
import { MemoReelCarousel as ReelCarousel } from "../components/ReelCarousel";
import HorizontalProductCarousel from "../components/HorizontalProductCarousel";
import { shuffleArray } from "../utils/shuffle";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [reels, setReels] = useState([]);
  const [primaryBanners, setPrimaryBanners] = useState([]);
  const [secondaryBanners, setSecondaryBanners] = useState([]);
  const [visibleProductsCount, setVisibleProductsCount] = useState(10);
  const [loading, setLoading] = useState({
    products: true,
    reels: true,
    banners: true,
  });

  useEffect(() => {
    const ac = new AbortController();

    // Fetch products
    fetch(`${API}/products`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        const list = shuffleArray(Array.isArray(data) ? data : []);
        setProducts(list);
        setLoading((prev) => ({ ...prev, products: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, products: false }));
      });

    // Fetch reels
    fetch(`${API}/reels`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setReels(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, reels: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, reels: false }));
      });

    // Fetch primary banners for hero section
    fetch(`${API}/banners?type=primary`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setPrimaryBanners(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, banners: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, banners: false }));
      });

    // Fetch secondary banners for mid-page promos
    fetch(`${API}/banners?type=secondary`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setSecondaryBanners(Array.isArray(data) ? data : []);
      })
      .catch(() => { });

    return () => {
      ac.abort();
    };
  }, []);

  // After initial content is visible, progressively render more product cards
  useEffect(() => {
    if (!products.length) return;
    if (visibleProductsCount >= Math.min(products.length, 25)) return;
    const t = setTimeout(() => setVisibleProductsCount((c) => Math.min(c + 5, 25)), 600);
    return () => clearTimeout(t);
  }, [products.length, visibleProductsCount]);

  const visibleProducts = useMemo(
    () => (Array.isArray(products) ? products.slice(0, visibleProductsCount) : []),
    [products, visibleProductsCount]
  );

  // Check if any data is still loading
  const isInitialLoad = loading.products || loading.reels || loading.banners;

  return (
    <div className="min-h-screen bg-cream fade-in">
      <style>{`
        @keyframes home-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .hm-sk {
          background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
          background-size: 1200px 100%;
          animation: home-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Skeleton — shown while any section is still loading */}
      {isInitialLoad && (
        <div>
          {/* Hero section skeleton */}
          <div className="hm-sk w-full min-h-[100svh]" />

          {/* Hero banner skeleton */}
          <div className="hm-sk w-full mt-6" style={{ height: "clamp(180px, 40vw, 420px)" }} />

          <div className="px-1 sm:px-2 lg:px-4">

            {/* Trending Products */}
            <div className="pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="hm-sk h-6 w-44 rounded" />
                <div className="hm-sk h-4 w-16 rounded" />
              </div>
              <div className="flex gap-3 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="shrink-0 basis-[calc((100%-0.5rem)/2)] lg:basis-[calc((100%-2rem)/5)]">
                    <div className="hm-sk aspect-[4/5] w-full" />
                    <div className="mt-2 space-y-2 px-1">
                      <div className="hm-sk h-3 w-3/4 rounded" />
                      <div className="hm-sk h-3 w-1/3 rounded" />
                      <div className="hm-sk h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="pb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="hm-sk h-6 w-16 rounded" />
                <div className="hm-sk h-4 w-16 rounded" />
              </div>
              <div className="flex gap-3 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="shrink-0 basis-[calc((100%-0.5rem)/2)] lg:basis-[calc((100%-2rem)/5)]">
                    <div className="hm-sk aspect-[4/5] w-full" />
                    <div className="mt-2 space-y-2 px-1">
                      <div className="hm-sk h-3 w-3/4 rounded" />
                      <div className="hm-sk h-3 w-1/3 rounded" />
                      <div className="hm-sk h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!isInitialLoad && (
        <>
          {/* Signature Brand Hero Section */}
          <HeroSection />

          {/* Hero promo carousel (3/2/1 cards per view) */}
          <HeroPromoCarousel banners={primaryBanners} />

          <div className="px-1 sm:px-2 lg:px-4">
            {/* Products Section */}
            <HorizontalProductCarousel
              title="Products"
              products={visibleProducts}
              isLoading={loading.products}
              sectionClassName="mt-6 lg:mt-8"
            />
          </div>

          {/* Secondary Banner Section - Between Products and Reels */}
          {!isInitialLoad && <HeroPromoCarousel banners={secondaryBanners} />}

          {/* Reels Section */}
          {reels.length > 0 && (
            <div className="py-6 bg-cream">
              <div className="px-1 sm:px-2 lg:px-4">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center tracking-tight" style={{ color: 'var(--olive)' }}>
                  Follow Us{" "}
                  <a
                    href="https://www.instagram.com/MakeWin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition-all"
                    style={{ color: 'var(--primary)' }}
                  >
                    @MakeWin
                  </a>
                </h2>
                <ReelCarousel reels={reels} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
