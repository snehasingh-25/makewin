import { useState } from "react";

export default function SortDropdown({ sort, onSortChange, isMobile = false, isOpen, onToggle }) {
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "popularity", label: "Popularity" },
  ];

  const selectedOption = sortOptions.find(opt => opt.value === (sort || "relevance")) || sortOptions[0];

  // Desktop: Dropdown
  if (!isMobile) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap" style={{ color: "oklch(55% .02 340)" }}>
          Sort By:
        </label>
        <select
          value={sort || "relevance"}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-1.5 border rounded text-sm font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-400"
          style={{
            borderColor: "var(--primary)",
            color: "var(--olive)",
            backgroundColor: "white"
          }}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Mobile: Bottom Sheet
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
        fixed bottom-0 left-0 right-0
        bg-cream
        rounded-t-2xl
        shadow-2xl
        z-50
        transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: "var(--olive)" }}>
            Sort By
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

        {/* Options List */}
        <div className="py-2">
          {sortOptions.map(option => {
            const isSelected = (sort || "relevance") === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  onToggle();
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className={`text-sm ${isSelected ? "font-semibold" : "font-normal"}`} style={{ color: "var(--olive)" }}>
                  {option.label}
                </span>
                {isSelected && (
                  <svg className="w-5 h-5" style={{ color: "var(--olive)" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
