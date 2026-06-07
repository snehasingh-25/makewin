import { useState, useEffect } from "react";
import axios from "../api";

function FilterSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--olive)" }}>
          {title}
        </h4>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "oklch(55% .02 340)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

function FilterContent({
  filterOptions,
  tempFilters,
  onCategoryToggle,
}) {
  return (
    <div className="p-6">
      {/* Categories */}
      {filterOptions.categories && filterOptions.categories.length > 0 && (
        <FilterSection title="Category" defaultOpen={true}>
          <div className="space-y-2">
            {filterOptions.categories.map((category) => (
              <label key={category.id} className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="radio"
                  name="category"
                  checked={tempFilters.category === category.slug}
                  onChange={() => onCategoryToggle(category.slug)}
                  className="w-4 h-4 text-gray-900"
                />
                <span className="text-sm" style={{ color: "var(--olive)" }}>
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
  onApply,
  onClear
}) {
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;

    axios.get("/products/filters", { params })
      .then(res => {
        setFilterOptions(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters.category]);

  const handleCategoryToggle = (categorySlug) => {
    const updatedFilters = {
      ...tempFilters,
      category: tempFilters.category === categorySlug ? undefined : categorySlug
    };
    setTempFilters(updatedFilters);
    // Desktop: apply immediately
    if (window.innerWidth >= 1024) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    if (onApply) onApply();
    if (window.innerWidth < 1024) {
      onToggle(); // Close mobile panel
    }
  };

  const handleClear = () => {
    const clearedFilters = {
      category: undefined,
      search: filters.search
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    if (onClear) onClear();
  };

  const hasActiveFilters = !!tempFilters.category;

  if (loading) {
    return (
      <div className="p-4 lg:p-0">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!filterOptions) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Bottom Sheet */}
      <div className={`
        fixed
        bottom-0 left-0 right-0
        bg-cream
        rounded-t-2xl
        shadow-2xl
        z-50
        transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
        max-h-[85vh]
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: "var(--olive)" }}>
            Filters
          </h3>
          <button
            onClick={onToggle}
            className="p-2 -mr-2"
            style={{ color: "oklch(40% .02 340)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <FilterContent
            filterOptions={filterOptions}
            tempFilters={tempFilters}
            onCategoryToggle={handleCategoryToggle}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-cream flex gap-3">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-3 border rounded font-medium text-sm"
              style={{
                borderColor: "var(--primary)",
                color: "var(--olive)"
              }}
            >
              Clear All
            </button>
          )}
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 rounded font-medium text-sm text-white"
            style={{ backgroundColor: "var(--olive)" }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

