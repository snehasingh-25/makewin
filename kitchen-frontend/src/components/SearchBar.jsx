import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Typed from "typed.js";
import Fuse from "fuse.js";
import axios from "../api";

/**
 * Reusable search bar with Fuse.js suggestions and Typed.js animated placeholder.
 *
 * Props:
 *  - initialValue  string   Pre-fill the input (e.g. current URL query on the Search page)
 *  - className     string   Extra classes on the outer wrapper div
 *  - inputClassName string  Extra classes on the <input> element
 *  - showTyped     bool     Show animated placeholder when input is empty (default true)
 *  - onSearch      fn       Optional callback(query) called on submit. Defaults to navigate('/search?q=…')
 */
export default function SearchBar({
  initialValue = "",
  className = "",
  inputClassName = "",
  showTyped = true,
  onSearch,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [allProducts, setAllProducts] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const typedElementRef = useRef(null);
  const typedInstanceRef = useRef(null);

  // Keep input in sync when initialValue changes (e.g. browser back/forward on Search page)
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  // Fetch all products once for fuzzy suggestions
  useEffect(() => {
    axios.get("/products")
      .then((res) => setAllProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => { });
  }, []);

  // Fuse.js suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 0 && allProducts.length > 0) {
      const fuse = new Fuse(allProducts, {
        keys: ["name", "description", "keywords"],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2,
      });
      const results = fuse.search(searchQuery).slice(0, 5).map((r) => r.item);
      setTimeout(() => {
        setSearchSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 0);
    } else {
      setTimeout(() => {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }, 0);
    }
  }, [searchQuery, allProducts]);

  // Typed.js animated placeholder
  useEffect(() => {
    if (!showTyped) return;
    if (typedInstanceRef.current) {
      typedInstanceRef.current.destroy();
      typedInstanceRef.current = null;
    }
    if (typedElementRef.current) {
      typedInstanceRef.current = new Typed(typedElementRef.current, {
        strings: ["Design Your Dream Kitchen", "Elegant Kitchens, Timeless Designs"],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: false,
      });
    }
    return () => {
      if (typedInstanceRef.current) {
        typedInstanceRef.current.destroy();
        typedInstanceRef.current = null;
      }
    };
  }, [showTyped]);

  // Pause/resume typed animation based on query
  useEffect(() => {
    if (!typedInstanceRef.current) return;
    if (searchQuery) typedInstanceRef.current.stop();
    else typedInstanceRef.current.start();
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(q);
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            else if (e.key === "Escape") setShowSuggestions(false);
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--primary)";
            e.target.style.backgroundColor = "white";
            e.target.style.color = "var(--olive)";
            if (typedInstanceRef.current) typedInstanceRef.current.stop();
            if (searchSuggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={(e) => {
            if (e.relatedTarget && suggestionsRef.current?.contains(e.relatedTarget)) return;
            setTimeout(() => {
              if (!searchQuery) {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.backgroundColor = "var(--primary)";
                e.target.style.color = "transparent";
                if (typedInstanceRef.current) typedInstanceRef.current.start();
              }
              setShowSuggestions(false);
            }, 200);
          }}
          className={`rounded-full px-5 py-2.5 pr-10 w-full text-sm transition-all duration-300 relative z-10 ${inputClassName}`}
          style={{
            backgroundColor: searchQuery ? "white" : "var(--primary)",
            border: "1px solid var(--primary)",
            color: searchQuery ? "var(--olive)" : "transparent",
          }}
          aria-label="Search"
        />

        {/* Typed.js animated placeholder */}
        {showTyped && !searchQuery && (
          <span
            ref={typedElementRef}
            className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-sm z-20"
            style={{ color: "oklch(60% .02 340)" }}
          />
        )}

        {/* Search icon / submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer z-30"
          aria-label="Search"
        >
          <svg
            className="w-4 h-4"
            style={{ color: "oklch(60% .02 340)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 mt-2 w-full bg-cream rounded-lg shadow-xl border z-50 max-h-80 overflow-y-auto"
          style={{ borderColor: "var(--primary)" }}
        >
          <div className="p-2">
            <div
              className="text-xs font-semibold px-3 py-2"
              style={{ color: "oklch(60% .02 340)" }}
            >
              Suggestions
            </div>

            {searchSuggestions.map((product) => {
              const images = product.images
                ? Array.isArray(product.images)
                  ? product.images
                  : JSON.parse(product.images)
                : [];
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowSuggestions(false);
                    setSearchQuery("");
                    navigate(`/product/${product.id}`);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <img src="/logo.png" alt="" className="w-10 h-10 object-contain opacity-50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: "var(--olive)" }}>
                      {product.name}
                    </div>
                    {((product.categories && product.categories.length > 0) || product.category) && (
                      <div className="text-xs truncate" style={{ color: "oklch(60% .02 340)" }}>
                        {product.categories?.length > 0
                          ? product.categories.map((c) => c.name || c.category?.name).join(", ")
                          : product.category?.name}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* View all results */}
            <Link
              to={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
              onClick={() => setShowSuggestions(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-center transition-colors mt-1"
              style={{ color: "var(--olive)", backgroundColor: "var(--primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "oklch(88% .06 340)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
            >
              View all results for &ldquo;{searchQuery}&rdquo;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
