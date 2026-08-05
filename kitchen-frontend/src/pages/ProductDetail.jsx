import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api";
import { MemoReelCarousel as ReelCarousel } from "../components/ReelCarousel";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toPlayableVideoUrl } from "../utils/videoUrl";

// ─── Editorial constants ───────────────────────────────────────────────────

const HIGHLIGHTS = [
  {
    num: "01",
    title: "Architectural Detailing",
    copy: "Seamlessly integrated profiles and precision-cut panels that define the space.",
  },
  {
    num: "02",
    title: "Precision Crafted Storage",
    copy: "Engineered modular units with soft-close mechanisms and intelligent organisation.",
  },
  {
    num: "03",
    title: "Integrated Ambient Lighting",
    copy: "Under-cabinet and recess lighting built directly into the aluminium structure.",
  },
  {
    num: "04",
    title: "Premium Aluminium Framework",
    copy: "Aircraft-grade aluminium for lasting structural integrity and a timeless finish.",
  },
];

/** Singular product noun for copy — kitchen only for kitchen category. */
function productTypeLabel(category) {
  const raw = `${category?.slug || ""} ${category?.name || ""}`.toLowerCase();
  if (raw.includes("wardrobe")) return "wardrobe";
  if (raw.includes("door")) return "door";
  if (raw.includes("kitchen")) return "kitchen";
  return "piece";
}

function ProductBackButton({ onClick, className = "mb-4" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back to previous page"
      className={`inline-flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-70 ${className}`}
      style={{ color: "var(--olive)" }}
    >
      <FiChevronLeft size={18} aria-hidden />
      Back
    </button>
  );
}

// ─── Shimmer keyframes (injected once) ────────────────────────────────────

const SHIMMER_CSS = `
@keyframes pd-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
.pd-sk {
  background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
  background-size: 1200px 100%;
  animation: pd-shimmer 1.5s ease-in-out infinite;
}
`;

// ─── Component ─────────────────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/categories");
  };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [globalReels, setGlobalReels] = useState([]);

  const images = useMemo(() => {
    if (!product?.images) return [];
    if (Array.isArray(product.images)) return product.images;
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [product?.images]);

  const videos = useMemo(() => {
    if (!product?.videos || !Array.isArray(product.videos)) return [];
    return product.videos;
  }, [product?.videos]);

  const media = useMemo(() => {
    const imgItems = images.map((url) => ({ type: "image", url }));
    const vidItems = videos.map((url) => ({ type: "video", url }));
    return [...imgItems, ...vidItems];
  }, [images, videos]);

  const activeMedia = media[activeImageIndex] || media[0] || null;

  const goPrev = () =>
    setActiveImageIndex((i) => (i === 0 ? media.length - 1 : i - 1));
  const goNext = () =>
    setActiveImageIndex((i) => (i === media.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const ac = new AbortController();
    setLoadError(null);
    setLoading(true);

    const numericId = Number(id);
    if (!Number.isFinite(numericId) || Number.isNaN(numericId)) {
      setProduct(null);
      setLoading(false);
      setLoadError("not_found");
      return () => ac.abort();
    }

    axios
      .get(`/products/${encodeURIComponent(String(id))}`, { signal: ac.signal })
      .then((res) => {
        const data = res.data;
        if (!data) return;
        setProduct(data);
        setActiveImageIndex(0);
        setLoading(false);

        axios
          .get("/reels", { signal: ac.signal })
          .then((reelsRes) => {
            setGlobalReels(Array.isArray(reelsRes.data) ? reelsRes.data : []);
          })
          .catch((err) => {
            if (axios.isCancel(err)) return;
            setGlobalReels([]);
          });

        const firstCategory =
          data?.categories?.length > 0
            ? data.categories[0]
            : data?.category;
        if (firstCategory?.slug) {
          setLoadingSimilar(true);
          axios
            .get(`/products?category=${firstCategory.slug}&limit=10`, {
              signal: ac.signal,
            })
            .then((similarRes) => {
              const similar = Array.isArray(similarRes.data)
                ? similarRes.data.filter((p) => p.id !== Number(id))
                : [];
              setSimilarProducts(similar);
              setLoadingSimilar(false);
            })
            .catch((err) => {
              if (axios.isCancel(err)) return;
              setLoadingSimilar(false);
            });
        } else {
          setLoadingSimilar(false);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setProduct(null);
        setLoadError(
          err.response?.status === 404
            ? "not_found"
            : err.response
            ? "server"
            : "network"
        );
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <style>{SHIMMER_CSS}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <ProductBackButton onClick={goBack} className="mb-6" />
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-10">
            {[10, 3, 14, 3, 28].map((w, i) => (
              <div key={i} className={`pd-sk h-3 w-${w} rounded`} />
            ))}
          </div>
          {/* Hero grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_0.9fr] gap-12 lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="pd-sk rounded-2xl w-full aspect-square" />
              <div className="mt-4 flex gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="pd-sk w-20 aspect-square rounded-xl shrink-0" />
                ))}
              </div>
            </div>
            {/* Right panel */}
            <div className="flex flex-col gap-4">
              <div className="pd-sk h-3 w-32 rounded" />
              <div className="pd-sk h-14 w-3/4 rounded-lg" />
              <div className="pd-sk h-14 w-1/2 rounded-lg" />
              <div className="mt-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="pd-sk h-3 w-24 rounded" />
                    <div className="pd-sk h-3 w-28 rounded" />
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <div className="pd-sk h-12 rounded-2xl" />
                <div className="pd-sk h-12 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error states ──────────────────────────────────────────────────────────

  if (!product) {
    const isNetwork = loadError === "network";
    const isServer = loadError === "server";
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center px-6 max-w-sm">
          {isNetwork || isServer ? (
            <>
              <p
                className="font-display text-3xl mb-3"
                style={{ color: "var(--olive)" }}
              >
                {isNetwork ? "Can't reach the server" : "Something went wrong"}
              </p>
              <p className="text-sm mb-6" style={{ color: "oklch(55% .02 340)" }}>
                {isNetwork
                  ? "Check your connection and try again."
                  : "A server error occurred. Please try again in a moment."}
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-2 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80"
                  style={{ borderColor: "var(--olive)", color: "var(--olive)" }}
                >
                  Go back
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "var(--olive)", color: "#fff" }}
                >
                  Retry
                </button>
                <Link
                  to="/"
                  className="text-sm font-semibold hover:underline"
                  style={{ color: "oklch(40% .02 340)" }}
                >
                  Go home
                </Link>
              </div>
            </>
          ) : (
            <>
              <p
                className="font-display text-3xl mb-3"
                style={{ color: "var(--olive)" }}
              >
                Product not found
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: "var(--olive)" }}
                >
                  Go back
                </button>
                <Link
                  to="/"
                  className="text-sm hover:underline"
                  style={{ color: "oklch(40% .02 340)" }}
                >
                  Return home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const category =
    product.categories?.length > 0
      ? product.categories[0]
      : product.category ?? null;

  const collectionLabel = category?.name
    ? `— ${category.name.toUpperCase()}`
    : "— COLLECTION";

  const typeLabel = productTypeLabel(category);
  const galleryImages = images; // pure image URLs for editorial sections

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream">
      <style>{SHIMMER_CSS}</style>

      {/* ════════════════════════════════════════════════════════════════
          BREADCRUMB
      ════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <ProductBackButton onClick={goBack} />
        <nav>
          <ol
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-wide"
            style={{ color: "oklch(55% .02 340)" }}
          >
            <li>
              <Link
                to="/"
                className="hover:underline transition-colors"
                style={{ color: "oklch(40% .02 340)" }}
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                to="/categories"
                className="hover:underline transition-colors"
                style={{ color: "oklch(40% .02 340)" }}
              >
                Showcase
              </Link>
            </li>
            {category && (
              <>
                <li>/</li>
                <li>
                  <Link
                    to={`/category/${category.slug}`}
                    className="hover:underline transition-colors"
                    style={{ color: "oklch(40% .02 340)" }}
                  >
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="font-medium" style={{ color: "var(--olive)" }}>
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          HERO — 65 / 35 editorial grid
      ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_0.9fr] gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Gallery ─────────────────────────────────────── */}
          <div>
            {/* Main image / video */}
            <div className="relative overflow-hidden rounded-2xl bg-cream group">
              {activeMedia?.type === "video" ? (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <video
                    key={activeMedia.url}
                    src={toPlayableVideoUrl(activeMedia.url)}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    controls
                    playsInline
                    preload="metadata"
                    webkit-playsinline="true"
                    x5-playsinline="true"
                  />
                </div>
              ) : activeMedia?.type === "image" ? (
                <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                  <img
                    src={activeMedia.url}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    decoding="async"
                    loading="eager"
                  />
                </div>
              ) : (
                <div
                  className="w-full flex items-center justify-center"
                  style={{ paddingBottom: "100%", position: "relative", backgroundColor: "var(--primary)" }}
                >
                  <img
                    src="/logo.png"
                    alt="Makewin"
                    className="absolute inset-0 m-auto w-24 h-24 object-contain opacity-40"
                  />
                </div>
              )}

              {/* Counter overlay */}
              {media.length > 1 && (
                <div
                  className="absolute bottom-4 left-4 text-xs tracking-widest uppercase font-medium pointer-events-none"
                  style={{
                    color: "#fff",
                    textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {String(activeImageIndex + 1).padStart(2, "0")} /{" "}
                  {String(media.length).padStart(2, "0")}
                </div>
              )}

              {/* Prev / Next arrows */}
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.85)",
                      color: "var(--olive)",
                      backdropFilter: "blur(4px)",
                    }}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.85)",
                      color: "var(--olive)",
                      backdropFilter: "blur(4px)",
                    }}
                    aria-label="Next image"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {media.length > 1 && (
              <div
                className="mt-4 flex gap-3 overflow-x-auto pb-2"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {media.slice(0, 10).map((item, idx) => {
                  const active = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={[
                        "shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200",
                        active
                          ? "border-[var(--olive)] scale-[1.02]"
                          : "border-transparent hover:border-[var(--primary)] hover:scale-[1.01]",
                      ].join(" ")}
                      aria-label={`View image ${idx + 1}`}
                    >
                      {item.type === "video" ? (
                        <video
                          src={toPlayableVideoUrl(item.url)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                          webkit-playsinline="true"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width={96}
                          height={96}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Editorial panel ─────────────────────────── */}
          <div className="lg:sticky lg:top-8 flex flex-col gap-0">

            {/* Collection label */}
            <p
              className="text-xs tracking-[0.25em] uppercase font-medium mb-5"
              style={{ color: "oklch(55% .02 340)" }}
            >
              {collectionLabel}
            </p>

            {/* Editorial title */}
            <h1
              className="font-display leading-[0.95] mb-7"
              style={{
                fontSize: "clamp(3rem, 6vw, 5.25rem)",
                color: "var(--olive)",
                wordBreak: "break-word",
              }}
            >
              {product.name}
            </h1>

            {/* Divider */}
            <div
              className="w-10 h-px mb-8"
              style={{ backgroundColor: "oklch(40% .04 122)" }}
            />

            {/* Metadata rows */}
            <div className="flex flex-col gap-4 mb-8">
              {[
                { label: "Collection", value: category?.name ?? "Signature" },
                { label: "Design Language", value: "Warm Minimal" },
                { label: "Material", value: "Premium Aluminium" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline justify-between gap-4">
                  <span
                    className="text-xs tracking-wider uppercase shrink-0"
                    style={{ color: "oklch(55% .02 340)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-sm font-semibold text-right"
                    style={{ color: "var(--olive)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div
              className="w-full h-px mb-8"
              style={{ backgroundColor: "var(--primary)" }}
            />

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                type="button"
                onClick={() => {
                  const msg = `Hi! I'm interested in: ${product.name} (${window.location.href})`;
                  window.open(
                    `https://wa.me/919166166190?text=${encodeURIComponent(msg)}`
                  );
                }}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: "var(--olive)", color: "#fff" }}
              >
                Enquire on WhatsApp →
              </button>
              <Link
                to="/contact"
                state={{ fromProduct: product.name }}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide text-center border-2 transition-all duration-200 hover:bg-[var(--olive)] active:scale-[0.99]"
                style={{
                  borderColor: "var(--olive)",
                  color: "var(--olive)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--olive)";
                }}
              >
                Contact Us
              </Link>
            </div>

            {/* Description */}
            {product.description && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(55% .02 340)" }}
              >
                {product.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION: DESIGN HIGHLIGHTS (numbered 01–04)
      ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t" style={{ borderColor: "var(--primary)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {HIGHLIGHTS.map(({ num, title, copy }) => (
            <div key={num} className="flex flex-col">
              <span
                className="font-display font-light leading-none mb-4"
                style={{
                  fontSize: "clamp(3.5rem, 5vw, 5rem)",
                  color: "var(--olive)",
                  opacity: 0.45,
                }}
              >
                {num}
              </span>
              <div
                className="w-8 h-px mb-4"
                style={{ backgroundColor: "var(--olive)", opacity: 0.4 }}
              />
              <p
                className="font-sans font-semibold text-xs uppercase tracking-[0.15em] mb-2"
                style={{ color: "var(--olive)" }}
              >
                {title}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(55% .02 340)" }}
              >
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1: THE DESIGN PHILOSOPHY
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="py-28 lg:py-36"
        style={{ backgroundColor: "oklch(96% 0.01 80)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text */}
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase mb-5 font-medium"
                style={{ color: "oklch(55% .02 340)" }}
              >
                The Design Philosophy
              </p>
              <h2
                className="font-display leading-[1.05] mb-8"
                style={{
                  fontSize: "clamp(2.5rem, 4vw, 3.75rem)",
                  color: "var(--olive)",
                }}
              >
                Where Function<br />Meets Beauty
              </h2>
              <div
                className="flex flex-col gap-5 text-sm leading-relaxed"
                style={{ color: "oklch(45% .02 340)", maxWidth: "55ch" }}
              >
                <p>
                  Every Makewin {typeLabel} begins with a single question: how can a space feel
                  both effortless and extraordinary? The answer lies in the precision of our
                  aluminium framework — engineered for a lifetime, finished to feel timeless.
                </p>
                <p>
                  {product.description
                    ? product.description
                    : "Our design language draws from the warmth of natural materials — the grain of oak, the cool weight of quartz, the subtle sheen of brushed brass — and translates them into surfaces that are as practical as they are beautiful."}
                </p>
                <p>
                  The result is a {typeLabel} that tells a story: of considered choices, skilled
                  hands, and spaces designed to be lived in — not merely admired.
                </p>
              </div>
            </div>
            {/* Image */}
            <div className="relative">
              {galleryImages.length >= 2 ? (
                <img
                  src={galleryImages[1]}
                  alt="Design philosophy"
                  className="w-full rounded-2xl object-cover"
                  style={{ aspectRatio: "4/5" }}
                  loading="lazy"
                  decoding="async"
                />
              ) : galleryImages.length === 1 ? (
                <img
                  src={galleryImages[0]}
                  alt="Design philosophy"
                  className="w-full rounded-2xl object-cover"
                  style={{ aspectRatio: "4/5" }}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="w-full rounded-2xl flex items-center justify-center"
                  style={{
                    aspectRatio: "4/5",
                    backgroundColor: "var(--primary)",
                  }}
                >
                  <img src="/logo.png" alt="Makewin" className="w-20 opacity-30" />
                </div>
              )}
              {/* Decorative offset block */}
              <div
                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl -z-10 hidden lg:block"
                style={{ backgroundColor: "var(--primary)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3: DESIGN GALLERY
      ════════════════════════════════════════════════════════════════ */}
      {galleryImages.length >= 1 && (
        <section className="py-12 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-10 font-medium"
              style={{ color: "oklch(55% .02 340)" }}
            >
              Design Gallery
            </p>

            <div className="flex flex-col gap-4">
              {/* Row 1: full-width hero image */}
              <div className="overflow-hidden rounded-2xl w-full" style={{ aspectRatio: "21/9" }}>
                <img
                  src={galleryImages[0]}
                  alt={`${product.name} — hero`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Row 2: asymmetric 2-col (only if 3+ images) */}
              {galleryImages.length >= 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-4">
                  <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "4/5" }}>
                    <img
                      src={galleryImages[1]}
                      alt={`${product.name} — detail`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={galleryImages[2]}
                      alt={`${product.name} — close-up`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              )}

              {/* Row 2 fallback: 2 images side by side */}
              {galleryImages.length === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={galleryImages[1]}
                      alt={`${product.name} — 2`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={galleryImages[0]}
                      alt={`${product.name} — 1`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4: RELATED COLLECTIONS
      ════════════════════════════════════════════════════════════════ */}
      {(similarProducts.length > 0 || loadingSimilar) && (
        <section className="py-28 lg:py-32 bg-cream border-t" style={{ borderColor: "var(--primary)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="font-display text-center mb-16"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                color: "var(--olive)",
              }}
            >
              Explore Similar Collections
            </h2>

            {loadingSimilar ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="pd-sk rounded-2xl w-full" style={{ aspectRatio: "3/4" }} />
                    <div className="mt-4 pd-sk h-5 w-3/4 rounded" />
                    <div className="mt-2 pd-sk h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {similarProducts.slice(0, 3).map((p) => {
                  const pImg = (() => {
                    if (!p.images) return null;
                    if (Array.isArray(p.images)) return p.images[0] ?? null;
                    try {
                      const arr = JSON.parse(p.images);
                      return Array.isArray(arr) ? arr[0] ?? null : null;
                    } catch {
                      return null;
                    }
                  })();
                  const pCat =
                    p.categories?.length > 0
                      ? p.categories[0]
                      : p.category ?? null;

                  return (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      className="group block"
                    >
                      {/* Image card */}
                      <div
                        className="relative overflow-hidden rounded-2xl bg-cream"
                        style={{ aspectRatio: "3/4" }}
                      >
                        {pImg ? (
                          <img
                            src={pImg}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: "var(--primary)" }}
                          >
                            <img src="/logo.png" alt="Makewin" className="w-16 opacity-30" />
                          </div>
                        )}
                        {/* Hover scrim with name */}
                        <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
                          }}
                        >
                          <p
                            className="font-display text-xl leading-tight"
                            style={{ color: "#fff" }}
                          >
                            {p.name}
                          </p>
                        </div>
                      </div>
                      {/* Below card */}
                      <div className="mt-4">
                        <p
                          className="font-display text-xl leading-tight"
                          style={{ color: "var(--olive)" }}
                        >
                          {p.name}
                        </p>
                        {pCat && (
                          <p
                            className="text-xs mt-1 tracking-wider uppercase"
                            style={{ color: "oklch(55% .02 340)" }}
                          >
                            {pCat.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          FOLLOW US — Reels
      ════════════════════════════════════════════════════════════════ */}
      {globalReels.length > 0 && (
        <section className="py-16 bg-cream border-t" style={{ borderColor: "var(--primary)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="font-display text-2xl text-center mb-8"
              style={{ color: "var(--ink)" }}
            >
              Follow Us{" "}
              <a
                href="https://www.instagram.com/Makewin"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
                style={{ color: "var(--olive)", opacity: 0.65 }}
              >
                @Makewin
              </a>
            </h2>
            <ReelCarousel reels={globalReels} />
          </div>
        </section>
      )}
    </div>
  );
}
