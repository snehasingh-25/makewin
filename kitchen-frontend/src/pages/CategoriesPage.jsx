import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api";
import ProductCard from "../components/ProductCard";
import ProductListing from "../components/ProductListing";
import { shuffleArray } from "../utils/shuffle";

const SK_STYLE = `@keyframes sk-sweep{0%{background-position:-600px 0}100%{background-position:600px 0}}.sk{background:linear-gradient(90deg,oklch(93% .03 340) 25%,oklch(96% .02 340) 50%,oklch(93% .03 340) 75%);background-size:1200px 100%;animation:sk-sweep 1.5s ease-in-out infinite}`;

function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}

// ─── Filtered category view (when /category/:slug is open) ───────────────────
function CategoryFilteredView({ slug, categories }) {
  const navigate = useNavigate();
  const cat = categories.find((c) => c.slug === slug) || null;

  return (
    <div className="min-h-screen bg-cream">
      <div className="px-6 sm:px-10 lg:px-16 pt-10 pb-4">
        <button
          onClick={() => navigate("/categories")}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--olive)" }}
        >
          ← Back to Catalogue
        </button>
        <h2
          className="font-display text-3xl sm:text-4xl lg:text-5xl mb-2"
          style={{ color: "var(--ink)" }}
        >
          {cat?.name || "Collection"}
        </h2>
        {cat?.description && (
          <p className="text-sm sm:text-base mt-2 max-w-xl" style={{ color: "oklch(55% .02 340)" }}>
            {cat.description}
          </p>
        )}
      </div>

      <div className="px-6 sm:px-10 lg:px-16 py-8">
        <ProductListing
          initialFilters={{ category: slug }}
          showFilters={false}
          showSort={false}
          gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        />
      </div>
    </div>
  );
}

// ─── Main catalogue page ──────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { slug } = useParams();

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  // const [heroBanner, setHeroBanner] = useState(null); // BANNERS DISABLED
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();

    if (slug) {
      // For slug view only need categories (for the heading)
      axios
        .get("/categories", { signal: ac.signal })
        .then((res) => {
          setCategories(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        })
        .catch((err) => {
          if (!axios.isCancel?.(err)) setLoading(false);
        });
    } else {
      // Fetch everything in parallel for the main catalogue page
      Promise.all([
        axios.get("/categories", { signal: ac.signal }),
        axios.get("/products", { signal: ac.signal }),
        // axios.get("/banners?type=primary", { signal: ac.signal }), // BANNERS DISABLED
      ])
        .then(([catsRes, prodsRes /* , bannersRes */]) => {
          setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
          setAllProducts(shuffleArray(Array.isArray(prodsRes.data) ? prodsRes.data : []));
          // const banners = Array.isArray(bannersRes.data) ? bannersRes.data : [];
          // setHeroBanner(banners[0] || null);
          setLoading(false);
        })
        .catch((err) => {
          if (!axios.isCancel?.(err)) setLoading(false);
        });
    }

    return () => ac.abort();
  }, [slug]);

  const categoryCountMap = useMemo(() => {
    const map = {};
    allProducts.forEach((p) => {
      const cats = Array.isArray(p.categories) ? p.categories : [];
      cats.forEach((c) => {
        const s = c.slug || c.category?.slug;
        if (s) map[s] = (map[s] || 0) + 1;
      });
    });
    return map;
  }, [allProducts]);

  const featuredProducts = useMemo(
    () => (Array.isArray(allProducts) ? allProducts.filter((product) => Boolean(product.isFeatured)) : []),
    [allProducts]
  );
  const regularProducts = useMemo(
    () => (Array.isArray(allProducts) ? allProducts.filter((product) => !product.isFeatured) : []),
    [allProducts]
  );

  // Hero image: fall back to first product image (banners disabled)
  const heroImageUrl =
    // heroBanner?.imageUrl ||
    (() => {
      const imgs = parseImages(allProducts[0]?.images);
      return imgs[0] || null;
    })();

  // ── Main catalogue skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <style>{SK_STYLE}</style>
        {/* Hero skeleton */}
        <div className="grid md:grid-cols-2" style={{ minHeight: "70vh" }}>
          <div className="p-12 flex flex-col justify-center gap-5">
            <div className="sk h-3 w-28 rounded" />
            <div className="sk h-12 w-3/4 rounded" />
            <div className="sk h-4 w-full rounded" />
            <div className="sk h-4 w-2/3 rounded" />
            <div className="sk h-11 w-44 rounded" />
          </div>
          <div className="sk" style={{ minHeight: "50vh" }} />
        </div>
        {/* Category skeleton */}
        <div className="px-6 sm:px-10 lg:px-16 py-16">
          <div className="sk h-5 w-56 rounded mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="sk rounded-lg" style={{ aspectRatio: "3/4" }} />
            ))}
          </div>
        </div>
        {/* Product skeleton */}
        <div className="px-6 sm:px-10 lg:px-16 py-8">
          <div className="sk h-5 w-48 rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="sk aspect-square rounded-lg w-full" />
                <div className="mt-3 space-y-2">
                  <div className="sk h-4 w-3/4 rounded" />
                  <div className="sk h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main catalogue render ──
  return (
    <div className="min-h-screen bg-cream">

      {/* ── Section 1: Hero ──────────────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 overflow-hidden" style={{ minHeight: "70vh" }}>
        {/* Left: text */}
        <div
          className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-16 bg-cream order-2 md:order-1"
        >
          <p
            className="text-[10px] tracking-[0.25em] uppercase mb-5"
            style={{ color: "var(--olive)" }}
          >
            Curated to Inspire
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6"
            style={{ color: "var(--ink)" }}
          >
            Spaces Designed<br />to Perfection
          </h1>
          <div className="w-10 h-px mb-6" style={{ backgroundColor: "var(--olive)" }} />
          <p
            className="text-sm sm:text-base leading-relaxed mb-10 max-w-sm"
            style={{ color: "oklch(45% .015 80)" }}
          >
            Explore our exclusive range of modular kitchens crafted with precision,
            premium materials, and timeless design.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-3 px-8 py-3.5 text-[10px] tracking-[0.2em] uppercase font-medium self-start transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--ink)", color: "white" }}
          >
            Explore Collection
            <span>→</span>
          </a>
        </div>

        {/* Right: image */}
        <div className="relative order-1 md:order-2 overflow-hidden" style={{ minHeight: "55vw", maxHeight: "100vh" }}>
          <img
            src="/catalogue-hero.png"
            alt="MakeWin Modular Kitchen — full feature view"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* ── Section 2: Categories ─────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="px-6 sm:px-10 lg:px-16 xl:px-20 py-16 lg:py-20">
          {/* Header row */}
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <p
                className="text-[10px] tracking-[0.25em] uppercase mb-2"
                style={{ color: "var(--olive)" }}
              >
                Browse by Category
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl lg:text-5xl"
                style={{ color: "var(--ink)" }}
              >
                Find the Perfect Fit
              </h2>
            </div>
          </div>

          {/* 5-column cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const count = categoryCountMap[cat.slug] || 0;
              return (
                <Link
                  key={cat.id ?? cat.slug}
                  to={`/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-lg block"
                  style={{ aspectRatio: "3 / 4" }}
                >
                  {/* Image */}
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: "var(--tan)" }}
                    />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-white font-display text-lg sm:text-xl leading-tight truncate">
                        {cat.name}
                      </p>
                      {count > 0 && (
                        <p className="text-white/65 text-[10px] tracking-wider mt-0.5">
                          {count} Design{count !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    {/* Circular arrow */}
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5"
                      style={{ backgroundColor: "white", color: "var(--ink)" }}
                    >
                      <span className="text-xs font-semibold leading-none">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile "View All" */}
          <Link
            to="/categories"
            className="sm:hidden flex items-center justify-center gap-2 text-[10px] tracking-[0.18em] uppercase mt-6 py-2 border-b self-center w-max mx-auto"
            style={{ color: "var(--olive)", borderColor: "var(--olive)" }}
          >
            View All Categories →
          </Link>
        </section>
      )}

      {/* ── Section 3: Featured Products ──────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-16">
          <div className="mb-8 sm:mb-10">
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{ color: "var(--olive)" }}
            >
              Our Collection
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl lg:text-5xl"
              style={{ color: "var(--ink)" }}
            >
              Featured Products
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} catalogue />
            ))}
          </div>
        </section>
      )}

      {regularProducts.length > 0 && (
        <section id="products" className="px-6 sm:px-10 lg:px-16 xl:px-20 pb-12 lg:pb-16">
          <div className="mb-8 sm:mb-10">
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{ color: "var(--olive)" }}
            >
              Products
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl lg:text-5xl"
              style={{ color: "var(--ink)" }}
            >
              Products
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {regularProducts.map((product) => (
              <ProductCard key={product.id} product={product} catalogue />
            ))}
          </div>
        </section>
      )}

      {/* ── Section 4: Features Row ───────────────────────────────────────── */}
      <section
        className="px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-14 border-t border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              ),
              label: "Premium Materials",
              desc: "Carefully selected for durability and beauty",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              ),
              label: "Smart Solutions",
              desc: "Functional designs for modern living",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
              label: "Ambient Lighting",
              desc: "Layered lighting to enhance ambience",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              label: "Built to Last",
              desc: "Precision craftsmanship you can trust",
            },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ color: "var(--olive)" }}
              >
                {icon}
              </div>
              <div>
                <p
                  className="text-[10px] tracking-[0.18em] uppercase font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {label}
                </p>
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: "oklch(55% .015 80)" }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Bottom CTA ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 px-6 text-center"
        style={{ backgroundColor: "var(--ink)" }}
      >
        {/* Subtle background image overlay */}
        {heroImageUrl && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={heroImageUrl}
              alt=""
              className="w-full h-full object-cover opacity-10"
            />
          </div>
        )}
        <div className="relative z-10 max-w-2xl mx-auto">
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-4"
            style={{ color: "oklch(65% .04 85)" }}
          >
            Let&apos;s Create Something Beautiful
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
            Your Dream Space<br />Starts Here
          </h2>
          <p
            className="text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed"
            style={{ color: "oklch(72% .01 85)" }}
          >
            Our design experts are here to help you create a space that reflects your style
            and elevates your everyday living.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-8 py-3.5 text-[10px] tracking-[0.2em] uppercase font-medium border transition-all duration-200 hover:bg-white"
            style={{ borderColor: "white", color: "white" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "white"; }}
          >
            Consult Our Experts <span>→</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
