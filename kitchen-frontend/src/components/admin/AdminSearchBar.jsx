import { useState, useEffect, useRef, useMemo } from "react";
import Fuse from "fuse.js";
import { API } from "../../api";

const FUSE_OPTIONS = { threshold: 0.4, includeScore: true, minMatchCharLength: 2 };

/**
 * @param {Object} props
 * @param {(product: Object) => void} props.onSelectProduct
 * @param {(category: Object) => void} [props.onSelectCategory]
 * @param {(query: string) => void} [props.onViewAllResults]
 */
export default function AdminSearchBar({
  onSelectProduct,
  onSelectCategory,
  onViewAllResults,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products`).then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
      fetch(`${API}/categories`).then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
    ]).then(([products, categories]) => {
      setAllProducts(products);
      setAllCategories(categories);
    });
  }, []);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return { products: [], categories: [] };
    const productFuse = new Fuse(allProducts, { keys: ["name", "description", "keywords"], ...FUSE_OPTIONS });
    const categoryFuse = new Fuse(allCategories, { keys: ["name", "slug", "description"], ...FUSE_OPTIONS });
    return {
      products: productFuse.search(q).slice(0, 4).map((r) => r.item),
      categories: categoryFuse.search(q).slice(0, 3).map((r) => r.item),
    };
  }, [searchQuery, allProducts, allCategories]);

  // Full (un-sliced) results for the "View all results" action
  const fullResults = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return { products: [], categories: [] };
    const productFuse = new Fuse(allProducts, { keys: ["name", "description", "keywords"], ...FUSE_OPTIONS });
    const categoryFuse = new Fuse(allCategories, { keys: ["name", "slug", "description"], ...FUSE_OPTIONS });
    return {
      products: productFuse.search(q).map((r) => r.item),
      categories: categoryFuse.search(q).map((r) => r.item),
    };
  }, [searchQuery, allProducts, allCategories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setSuggestionsDismissed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasAnySuggestions = suggestions.products.length > 0 || suggestions.categories.length > 0;
  const showSuggestions = hasAnySuggestions && !suggestionsDismissed;

  const dismissSuggestions = () => {
    setSuggestionsDismissed(true);
    setSearchQuery("");
  };

  const handleSelectProduct = (product) => {
    dismissSuggestions();
    onSelectProduct?.(product);
  };

  const handleSelectCategory = (category) => {
    dismissSuggestions();
    onSelectCategory?.(category);
  };

  const handleViewAllResults = () => {
    const q = searchQuery.trim();
    dismissSuggestions();
    onViewAllResults?.(q, fullResults);
  };

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSuggestionsDismissed(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery.trim()) {
              handleViewAllResults();
            } else if (e.key === "Escape") {
              setSuggestionsDismissed(true);
            }
          }}
          onFocus={() => {
            if (hasAnySuggestions) setSuggestionsDismissed(false);
          }}
          onBlur={(e) => {
            if (e.relatedTarget && suggestionsRef.current?.contains(e.relatedTarget)) return;
            setTimeout(() => setSuggestionsDismissed(true), 200);
          }}
          placeholder="Search products or categories..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm text-gray-900 placeholder-gray-500 transition focus:border-olive focus:bg-cream focus:outline-none focus:ring-1 focus:ring-olive"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      {showSuggestions && hasAnySuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 z-50 mt-2 w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-cream shadow-xl"
        >
          <div className="max-h-96 overflow-y-auto p-2">
            {suggestions.products.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Products
                </div>
                {suggestions.products.map((product) => {
                  const images = product.images
                    ? Array.isArray(product.images)
                      ? product.images
                      : JSON.parse(product.images || "[]")
                    : [];
                  return (
                    <button
                      key={`p-${product.id}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectProduct(product);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                    >
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <img src="/logo.png" alt="" className="h-6 w-6 object-contain opacity-50" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">{product.name}</div>
                        {(product.categories?.length || product.category) && (
                          <div className="truncate text-xs text-gray-500">
                            {product.categories?.length
                              ? product.categories.map((c) => c.name || c.category?.name).join(", ")
                              : product.category?.name}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            )}
            {suggestions.categories.length > 0 && (
              <>
                <div className="mt-1 border-t border-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Categories
                </div>
                {suggestions.categories.map((category) => (
                  <button
                    key={`c-${category.id}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectCategory(category);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                  >
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tan/20 text-olive-dark">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">{category.name}</div>
                      {category.slug && (
                        <div className="truncate text-xs text-gray-500">{category.slug}</div>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleViewAllResults();
              }}
              className="mt-2 block w-full rounded-lg bg-gray-100 px-3 py-2 text-center text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200"
            >
              View all results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
