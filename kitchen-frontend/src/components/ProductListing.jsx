import { useState, useEffect, useMemo } from "react";
import { API } from "../api";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import SortDropdown from "./SortDropdown";
import { shuffleArray } from "../utils/shuffle";

function ProductListingInner({
  initialFilters = {},
  showFilters = true,
  showSort = true,
  gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Build API URL with filters and sort
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();

    // Add filters
    if (filters.category) params.append("category", filters.category);
    if (filters.search) params.append("search", filters.search);

    // Add sort (disable shuffle when sorting)
    if (sort && sort !== "relevance") {
      params.append("sort", sort);
      params.append("shuffle", "false");
    }

    return `${API}/products?${params.toString()}`;
  }, [filters, sort]);

  useEffect(() => {
    const ac = new AbortController();

    fetch(apiUrl, { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        const isDefaultSort = !sort || sort === "relevance";
        setProducts(isDefaultSort ? shuffleArray(arr) : arr);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching products:", error);
          setProducts([]);
        }
        setLoading(false);
      });

    return () => ac.abort();
  }, [apiUrl]);

  const handleFiltersChange = (newFilters) => {
    setLoading(true);
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setLoading(true);
    setSort(newSort);
  };

  const selectedSortOption = useMemo(() => {
    const sortOptions = [
      { value: "relevance", label: "Relevance" },
      { value: "newest", label: "Newest First" },
      { value: "popularity", label: "Popularity" },
    ];
    return sortOptions.find(opt => opt.value === (sort || "relevance")) || sortOptions[0];
  }, [sort]);

  return (
    <>
      <div>
        {/* Main Content - same layout on all screen sizes (match mobile) */}
        <div className="flex-1 min-w-0 max-w-full">
          {/* Filters + Sort buttons (all screens, same as mobile) */}
          {/* {(showFilters || showSort) && (
            <div className="mb-4 flex items-center gap-3">
              {showFilters && (
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="flex-1 px-4 py-2.5 border rounded-md text-sm font-medium flex items-center justify-center gap-2"
                  style={{ borderColor: "var(--primary)", color: "var(--olive)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
              )}
              {showSort && (
                <button
                  onClick={() => setSortOpen(true)}
                  className="flex-1 px-4 py-2.5 border rounded-md text-sm font-medium flex items-center justify-center gap-2"
                  style={{ borderColor: "var(--primary)", color: "var(--olive)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sort: {selectedSortOption.label}
                </button>
              )}
            </div>
          )} */}

          {/* Filters overlay/sheet (all screens) */}
          {/* {showFilters && (
            <ProductFilters
              key={JSON.stringify(filters)}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(false)}
              onApply={() => setFiltersOpen(false)}
              onClear={() => { }}
            />
          )} */}

          {/* Sort overlay/sheet (all screens) */}
          {/* {showSort && (
            <SortDropdown
              sort={sort}
              onSortChange={handleSortChange}
              isMobile={true}
              isOpen={sortOpen}
              onToggle={() => setSortOpen(!sortOpen)}
            />
          )} */}

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-sm" style={{ color: "oklch(55% .02 340)" }}>
                Loading products...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-base font-medium mb-2" style={{ color: "var(--olive)" }}>
                No products found
              </div>
              <div className="text-sm" style={{ color: "oklch(55% .02 340)" }}>
                Try adjusting your filters
              </div>
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductListing(props) {
  const resetKey = useMemo(() => {
    const f = props.initialFilters || {};
    return [
      f.category || "",
    ].join("::");
  }, [props.initialFilters]);

  return <ProductListingInner key={resetKey} {...props} />;
}
