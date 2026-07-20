import { Link } from "react-router-dom";
import { memo, useMemo } from "react";

function ProductCard({ product, compact = false, catalogue = false }) {
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

  const img = images[0] || null;
  const subtitle = product.categories?.[0]?.name || product.categories?.[0]?.category?.name || "Premium Craftsmanship";

  // Format price for Indian locale if available
  const formattedPrice = product.price
    ? `₹${Number(product.price).toLocaleString("en-IN")}`
    : null;

  if (catalogue) {
    return (
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-sm bg-cream">
          {img ? (
            <img
              src={img}
              alt={product.name}
              className="aspect-square w-full object-cover group-hover:scale-105 transition duration-700"
              loading="lazy"
            />
          ) : (
            <div className="aspect-square w-full flex items-center justify-center bg-cream">
              <img
                src="/logo.png"
                alt="Makewin Logo"
                className="w-16 h-16 object-contain opacity-40"
              />
            </div>
          )}

          {/* Collection / category label at top-left */}
          <div className="absolute top-3 left-3">
            <span
              className="text-[9px] tracking-[0.18em] uppercase px-2 py-1"
              style={{ backgroundColor: "white", color: "var(--ink)" }}
            >
              {subtitle}
            </span>
          </div>

          {/* Heart / wishlist icon at top-right */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label="Save to wishlist"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <div className="pt-3">
          <h3
            className="font-display text-base sm:text-lg truncate"
            style={{ color: "var(--ink)" }}
          >
            {product.name}
          </h3>
          {formattedPrice && (
            <p className="text-sm mt-1 font-medium" style={{ color: "var(--olive)" }}>
              {formattedPrice}
            </p>
          )}
        </div>
      </Link>
    );
  }

  if (compact) {
    return (
      <Link to={`/product/${product.id}`} className="group flex gap-3 bg-white p-2.5 rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300">
        <div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-cream">
          {img ? (
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain opacity-30" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h4 className="font-semibold text-sm truncate" style={{ color: "var(--olive)" }}>{product.name}</h4>
            <p className="text-[10px] tracking-wider uppercase text-gray-500 truncate mt-0.5">{subtitle}</p>
          </div>
          <span className="text-olive-dark text-xs font-semibold self-end">View Details →</span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="overflow-hidden bg-cream rounded-lg">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover group-hover:scale-105 transition duration-700"
            loading="lazy"
          />
        ) : (
          <div className="aspect-[4/5] w-full flex items-center justify-center bg-cream">
            <img src="/logo.png" alt="Makewin Logo" className="w-24 h-24 object-contain opacity-50" />
          </div>
        )}
      </div>
      <div className="pt-4 flex items-baseline justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg sm:text-xl truncate" style={{ color: "var(--olive)" }}>{product.name}</h3>
          <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1 truncate">
            {subtitle}
          </p>
          {product.description && (
            <p className="text-sm text-foreground/70 mt-2 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        <span className="text-olive-dark text-sm ml-2 shrink-0">→</span>
      </div>
    </Link>
  );
}

export default memo(ProductCard);