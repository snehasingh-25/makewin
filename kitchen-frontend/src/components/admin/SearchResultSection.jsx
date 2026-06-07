import { useState } from "react";

/**
 * Collapsible section wrapper for a group of search results.
 * Displays a header with the entity type label + result count,
 * and a collapsible body containing the children (row components).
 */
export default function SearchResultSection({ title, count, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div
      className="bg-cream rounded-xl shadow-md border mb-4"
      style={{ borderColor: "var(--primary)" }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left transition-colors hover:bg-gray-50 rounded-t-xl"
      >
        <h3
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: "var(--olive)" }}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {title}
          <span
            className="text-sm font-medium ml-1"
            style={{ color: "oklch(50% .02 340)" }}
          >
            ({count})
          </span>
        </h3>
      </button>

      {/* Body */}
      {isOpen && (
        <div
          className="divide-y border-t"
          style={{ borderColor: "var(--primary)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
