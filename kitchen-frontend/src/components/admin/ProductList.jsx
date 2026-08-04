import axios from "../../api";
import { useToast } from "../../context/ToastContext";
import { cloneProductForDuplicate } from "./productUtils";

export default function ProductList({ products, onEdit, onDelete }) {
  const toast = useToast();

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  const handleDelete = async (product) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const isTemp = product && String(product.id).startsWith("temp-");
    if (isTemp) {
      onDelete(product);
      return;
    }

    try {
      await axios.delete(`/products/${product.id}`);
      toast.success("Product deleted");
      onDelete(product);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to delete product";
      toast.error(errorMsg);
    }
  };

  if (safeProducts.length === 0) {
    return (
      <div className="bg-cream rounded-xl shadow-md border border-gray-200 p-12 text-center">
        <img src="/logo.png" alt="Makewin Logo" className="w-20 h-20 mx-auto mb-4 object-contain opacity-50" />
        <p className="text-gray-600 font-medium">No products yet. Add your first product above!</p>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">All Products</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {safeProducts.map((product) => {
          const images = product.images
            ? Array.isArray(product.images)
              ? product.images
              : JSON.parse(product.images)
            : [];

          return (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 transition-all hover:bg-gray-50"
            >
              {/* Image */}
              <div className="flex-shrink-0">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
                    <img src="/logo.png" alt="Makewin Logo" className="w-10 h-10 object-contain opacity-50" />
                  </div>
                )}
              </div>

              {/* Name & Details */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: "var(--olive)" }}>
                  {product.name}
                </div>
                <div className="text-xs line-clamp-1" style={{ color: "oklch(50% .02 340)" }}>
                  {product.description}
                </div>
                <div className="text-xs mt-1" style={{ color: "oklch(50% .02 340)" }}>
                  {product.categories && product.categories.length > 0
                    ? product.categories.map((c) => c.name || c.category?.name).join(", ")
                    : product.category?.name || "No category"}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex gap-2 flex-wrap">
                <button
                  onClick={() => onEdit(product)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "oklch(88% .06 340)")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--primary)")}
                >
                  Edit
                </button>
                <button
                  onClick={() => onEdit(cloneProductForDuplicate(product))}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition border"
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
                  Duplicate
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
