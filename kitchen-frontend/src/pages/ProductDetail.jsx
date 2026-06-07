import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios, { API } from "../api";
import HorizontalProductCarousel from "../components/HorizontalProductCarousel";
import { MemoReelCarousel as ReelCarousel } from "../components/ReelCarousel";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null); // "not_found" | "network" | "server"
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(() => new Set());
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

  // Combined media: images and videos
  const media = useMemo(() => {
    const imgItems = images.map((url) => ({ type: "image", url }));
    const vidItems = videos.map((url) => ({ type: "video", url }));
    return [...imgItems, ...vidItems];
  }, [images, videos]);

  const activeMedia = media[activeImageIndex] || media[0] || null;
  const activeImage = activeMedia?.type === "image" ? activeMedia.url : null;

  const toggleSection = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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

    axios.get(`/products/${encodeURIComponent(String(id))}`, { signal: ac.signal })
      .then((res) => {
        const data = res.data;
        if (!data) return;
        setProduct(data);
        setActiveImageIndex(0);
        setLoading(false);

        // Fetch global "Follow Us" reels
        axios.get("/reels", { signal: ac.signal })
          .then((reelsRes) => {
            setGlobalReels(Array.isArray(reelsRes.data) ? reelsRes.data : []);
          })
          .catch((error) => {
            if (axios.isCancel(error)) return;
            setGlobalReels([]);
          });

        // Fetch similar products from the same category
        const firstCategory = data?.categories && data.categories.length > 0 ? data.categories[0] : data?.category;
        if (firstCategory?.slug) {
          setLoadingSimilar(true);
          axios.get(`/products?category=${firstCategory.slug}&limit=10`, { signal: ac.signal })
            .then((similarRes) => {
              const similar = Array.isArray(similarRes.data)
                ? similarRes.data.filter((p) => p.id !== Number(id))
                : [];
              setSimilarProducts(similar);
              setLoadingSimilar(false);
            })
            .catch((error) => {
              if (axios.isCancel(error)) return;
              console.error("Error fetching similar products:", error);
              setLoadingSimilar(false);
            });
        } else {
          setLoadingSimilar(false);
        }
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error("Error fetching product:", error);
        setProduct(null);
        if (error.response && error.response.status === 404) {
          setLoadError("not_found");
        } else {
          setLoadError(error.response ? "server" : "network");
        }
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <style>{`
          @keyframes pd-shimmer {
            0%   { background-position: -600px 0; }
            100% { background-position: 600px 0; }
          }
          .pd-sk {
            background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
            background-size: 1200px 100%;
            animation: pd-shimmer 1.5s ease-in-out infinite;
          }
        `}</style>

        <div className="px-1 sm:px-2 lg:px-4 pt-6 pb-16">
          <div className="mb-5 flex items-center gap-2">
            <div className="pd-sk h-3 w-10 rounded" />
            <div className="pd-sk h-3 w-3 rounded" />
            <div className="pd-sk h-3 w-14 rounded" />
            <div className="pd-sk h-3 w-3 rounded" />
            <div className="pd-sk h-3 w-32 rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Media gallery skeleton */}
            <div className="lg:col-span-7">
              <div className="lg:flex lg:gap-4">
                <div className="hidden lg:flex flex-col gap-3 w-20 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="pd-sk aspect-square w-20 rounded-xl" />
                  ))}
                </div>

                <div className="flex-1">
                  <div className="pd-sk rounded-3xl w-full" style={{ paddingBottom: "100%" }} />
                  <div className="mt-4 flex gap-3 lg:hidden">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="pd-sk shrink-0 w-20 aspect-square rounded-2xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Enquiry box skeleton */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border bg-cream p-6 shadow-sm" style={{ borderColor: "var(--primary)" }}>
                <div className="pd-sk h-9 w-4/5 rounded-lg" />
                <div className="pd-sk h-9 w-2/3 rounded-lg mt-2" />

                <div className="pd-sk h-4 w-full rounded-lg mt-6" />
                <div className="pd-sk h-4 w-4/5 rounded-lg mt-2" />

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="pd-sk h-12 rounded-2xl" />
                  <div className="pd-sk h-12 rounded-2xl" />
                </div>

                <div className="pd-sk h-4 w-24 rounded mx-auto mt-6" />
              </div>

              <div className="mt-4 rounded-3xl border bg-cream overflow-hidden" style={{ borderColor: "var(--primary)" }}>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="pd-sk h-4 w-32 rounded" />
                  <div className="pd-sk h-5 w-5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          {loadError === "network" ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Can’t reach the server</h2>
              <p className="text-sm text-gray-600 mb-5 max-w-sm">
                This link is valid, but your device/browser can’t connect to our API right now. Please check your connection or try again.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: "var(--primary)", color: "var(--olive)" }}
                >
                  Retry
                </button>
                <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                  Go home
                </Link>
              </div>
            </>
          ) : loadError === "server" ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-600 mb-5 max-w-sm">
                We couldn’t load this product due to a server error. Please try again in a moment.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: "var(--primary)", color: "var(--olive)" }}
                >
                  Retry
                </button>
                <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                  Go home
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
              <Link to="/" className="text-olive hover:underline">
                Go back to home
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div>
          {/* Top bar */}
          <div className="px-1 sm:px-2 lg:px-4 pt-6">
            <nav className="mb-5">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm" style={{ color: "oklch(55% .02 340)" }}>
                <li>
                  <Link to="/" className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link to="/categories" className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                    Showcase
                  </Link>
                </li>
                {product.categories && product.categories.length > 0 ? (
                  <>
                    <li>/</li>
                    <li>
                      <Link to={`/category/${product.categories[0].slug}`} className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                        {product.categories[0].name}
                      </Link>
                    </li>
                  </>
                ) : product.category ? (
                  <>
                    <li>/</li>
                    <li>
                      <Link to={`/category/${product.category.slug}`} className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                        {product.category.name}
                      </Link>
                    </li>
                  </>
                ) : null}
                <li>/</li>
                <li className="font-semibold" style={{ color: "var(--olive)" }}>
                  {product.name}
                </li>
              </ol>
            </nav>
          </div>

          <div className="px-1 sm:px-2 lg:px-4 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left: Media gallery */}
              <section className="lg:col-span-7">
                <div className="lg:flex lg:gap-4">
                  {/* Thumbnails (desktop vertical) */}
                  {media.length > 1 ? (
                    <div className="hidden lg:flex flex-col gap-3 w-20 shrink-0">
                      {media.slice(0, 8).map((item, idx) => {
                        const active = idx === activeImageIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            onMouseEnter={() => setActiveImageIndex(idx)}
                            className={[
                              "relative rounded-xl overflow-hidden border transition-transform duration-200",
                              active ? "ring-2 ring-offset-2" : "hover:scale-[1.02]",
                            ].join(" ")}
                            style={{
                              borderColor: active ? "oklch(88% .06 340)" : "var(--primary)",
                              ringColor: "oklch(88% .06 340)",
                            }}
                          >
                            <div className="aspect-square bg-cream">
                              {item.type === "video" ? (
                                <video
                                  src={item.url}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  preload="metadata"
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
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Primary image or video */}
                  <div className="flex-1">
                    <div className="relative overflow-hidden bg-cream">
                      <div className="relative w-full" style={{ paddingBottom: activeMedia?.type === "video" ? "56.25%" : "100%" }}>
                        {activeMedia?.type === "video" ? (
                          <video
                            src={activeMedia.url}
                            className="absolute inset-0 w-full h-full object-contain bg-black"
                            controls
                            playsInline
                            preload="metadata"
                          />
                        ) : activeImage ? (
                          <img
                            src={activeImage}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            decoding="async"
                            loading="eager"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
                            <img src="/logo.png" alt="MakeWin Logo" className="w-24 h-24 object-contain opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thumbnails (mobile horizontal) */}
                    {media.length > 1 ? (
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 lg:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
                        {media.slice(0, 10).map((item, idx) => {
                          const active = idx === activeImageIndex;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              className={[
                                "shrink-0 w-20 rounded-2xl overflow-hidden border transition-transform duration-200",
                                active ? "ring-2 ring-offset-2" : "active:scale-95",
                              ].join(" ")}
                              style={{ borderColor: "var(--primary)" }}
                            >
                              <div className="aspect-square bg-cream">
                                {item.type === "video" ? (
                                  <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
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
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Right: Sticky enquiry box */}
              <aside className="lg:col-span-5">
                <div className="lg:sticky lg:top-6">
                  <div className="bg-cream">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: "var(--olive)" }}>
                      {product.name}
                    </h1>

                    <p className="mt-4 text-sm leading-relaxed" style={{ color: "oklch(55% .02 340)" }}>
                      Premium, lifetime-durable aluminium craftsmanship by Makewin. Enquire below to customize this product for your home.
                    </p>

                    {/* CTAs */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          const message = `Hi! I'm interested in: ${product.name} (Link: ${window.location.href})`;
                          window.open(`https://wa.me/917976948872?text=${encodeURIComponent(message)}`);
                        }}
                        className="w-full py-3 rounded-2xl font-bold transition-transform duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
                        style={{ backgroundColor: "oklch(55% .18 145)", color: "white" }}
                      >
                        Enquire on WhatsApp
                      </button>
                      <Link
                        to="/contact"
                        state={{ fromProduct: product.name }}
                        className="w-full py-3 rounded-2xl font-bold transition-transform duration-200 active:scale-[0.99] flex items-center justify-center gap-2 text-center"
                        style={{ backgroundColor: "var(--primary)", color: "var(--olive)" }}
                      >
                        Contact Us
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="mt-4 w-full text-sm font-semibold underline text-center"
                      style={{ color: "oklch(40% .02 340)" }}
                    >
                      Back to Gallery
                    </button>
                  </div>

                  {/* Accordions */}
                  <div className="mt-6 rounded-3xl border bg-cream overflow-hidden" style={{ borderColor: "var(--primary)" }}>
                    <button
                      type="button"
                      onClick={() => toggleSection("details")}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <div className="font-bold" style={{ color: "var(--olive)" }}>
                        Product details
                      </div>
                      <div className="text-xl font-black" style={{ color: "oklch(40% .02 340)" }}>
                        {expanded.has("details") ? "−" : "+"}
                      </div>
                    </button>
                    {expanded.has("details") ? (
                      <div className="px-5 pb-5 text-sm leading-relaxed whitespace-pre-line" style={{ color: "oklch(55% .02 340)" }}>
                        {product.description}
                      </div>
                    ) : null}
                  </div>
                </div>
              </aside>
            </div>

            {/* Similar Products Section */}
            <HorizontalProductCarousel
              title="Products from the same category"
              products={similarProducts}
              isLoading={loadingSimilar}
              excludeProductId={id}
            />

            {/* Global Reels Section */}
            {globalReels.length > 0 && (
              <div className="py-6 bg-cream mt-16">
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
                  <ReelCarousel reels={globalReels} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

