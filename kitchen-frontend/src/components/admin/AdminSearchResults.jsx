import axios from "../../api";
import { useToast } from "../../context/ToastContext";
import { cloneProductForDuplicate } from "./productUtils";
import SearchResultProductRow from "./SearchResultProductRow";
import SearchResultEntityRow from "./SearchResultEntityRow";
import SearchResultSection from "./SearchResultSection";

/**
 * Full search-results view for the admin dashboard.
 * Shows matching Products and Categories
 * in collapsible sections with Edit / Duplicate / Delete actions.
 *
 * @param {Object} props
 * @param {string} props.query - The search query string
 * @param {{ products: Object[], categories: Object[] }} props.results
 * @param {(product: Object) => void} props.onEditProduct
 * @param {(category: Object) => void} props.onEditCategory
 * @param {() => void} props.onClearSearch - Return to previous tab
 * @param {() => void} props.onRefresh - Refresh data after mutations
 */
export default function AdminSearchResults({
  query,
  results,
  onEditProduct,
  onEditCategory,
  onClearSearch,
  onRefresh,
}) {
  const toast = useToast();

  const { products = [], categories = [] } = results || {};
  const totalCount = products.length + categories.length;

  // ── Product actions ──────────────────────────────────────────────
  const handleDeleteProduct = async (product) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const isTemp = product && String(product.id).startsWith("temp-");
    if (isTemp) {
      onRefresh?.();
      return;
    }

    try {
      await axios.delete(`/products/${product.id}`);
      toast.success("Product deleted");
      onRefresh?.();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to delete product";
      toast.error(errorMsg);
    }
  };

  const handleDuplicateProduct = (product) => {
    const cloned = cloneProductForDuplicate(product);
    onEditProduct(cloned);
  };

  // ── Entity delete helpers ────────────────────────────────────────
  const handleDeleteEntity = async (entityType, item) => {
    const labels = { category: "category" };
    const endpoints = { category: "categories" };
    const label = labels[entityType];
    const endpoint = endpoints[entityType];

    if (!confirm(`Are you sure you want to delete this ${label}?`)) return;

    try {
      await axios.delete(`/${endpoint}/${item.id}`);
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted`);
      onRefresh?.();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || `Failed to delete ${label}`;
      toast.error(errorMsg);
    }
  };

  // ── Summary line ─────────────────────────────────────────────────
  const summaryParts = [];
  if (products.length > 0) summaryParts.push(`${products.length} product${products.length !== 1 ? "s" : ""}`);
  if (categories.length > 0) summaryParts.push(`${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`);

  return (
    <div>
      {/* Header */}
      <div
        className="bg-cream rounded-xl shadow-md border p-4 sm:p-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ borderColor: "var(--primary)" }}
      >
        <div>
          <h2
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "var(--olive)" }}
          >
            <svg className="w-5 h-5" style={{ color: "oklch(50% .02 340)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search results for &ldquo;{query}&rdquo;
          </h2>
          {totalCount > 0 ? (
            <p className="text-sm mt-1" style={{ color: "oklch(50% .02 340)" }}>
              Found {summaryParts.join(", ")}
            </p>
          ) : (
            <p className="text-sm mt-1" style={{ color: "oklch(50% .02 340)" }}>
              No results found
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClearSearch}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition border shrink-0"
          style={{ borderColor: "oklch(70% .06 340)", color: "oklch(40% .02 340)" }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "oklch(96% .02 340)";
            e.target.style.borderColor = "oklch(60% .06 340)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "";
            e.target.style.borderColor = "oklch(70% .06 340)";
          }}
        >
          ✕ Clear Search
        </button>
      </div>

      {/* Empty state */}
      {totalCount === 0 && (
        <div
          className="bg-cream rounded-xl shadow-md p-12 text-center border"
          style={{ borderColor: "var(--primary)" }}
        >
          <img src="/logo.png" alt="Makewin Logo" className="w-20 h-20 mx-auto mb-4 object-contain opacity-50" />
          <p className="text-gray-600 font-medium">
            No products or categories match &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {/* Products section */}
      <SearchResultSection title="Products" count={products.length} defaultOpen={true}>
        {products.map((product) => (
          <SearchResultProductRow
            key={`product-${product.id}`}
            product={product}
            onEdit={onEditProduct}
            onDuplicate={handleDuplicateProduct}
            onDelete={handleDeleteProduct}
          />
        ))}
      </SearchResultSection>

      {/* Categories section */}
      <SearchResultSection title="Categories" count={categories.length} defaultOpen={true}>
        {categories.map((category) => (
          <SearchResultEntityRow
            key={`category-${category.id}`}
            item={category}
            onEdit={onEditCategory}
            onDelete={(item) => handleDeleteEntity("category", item)}
          />
        ))}
      </SearchResultSection>
    </div>
  );
}
