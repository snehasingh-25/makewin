import axios from "../../api";
import { useToast } from "../../context/ToastContext";
import OrderableList from "./OrderableList";
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

  // Sort products by order
  const sortedProducts = [...safeProducts].sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderRow = (product, order, dragHandle, orderInput, isDragging) => {
    const images = product.images
      ? Array.isArray(product.images)
        ? product.images
        : JSON.parse(product.images)
      : [];

    return (
      <div
        className={`flex items-center gap-4 p-4 transition-all ${isDragging ? "opacity-50" : "hover:bg-gray-50"
          }`}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0">{dragHandle}</div>

        {/* Order Input */}
        <div className="flex-shrink-0 w-20">
          {orderInput || (
            <div className="text-center">
              <div className="text-sm font-bold" style={{ color: 'var(--olive)' }}>
                {order}
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="flex-shrink-0">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <img src="/logo.png" alt="MakeWin Logo" className="w-10 h-10 object-contain opacity-50" />
            </div>
          )}
        </div>

        {/* Name & Details */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold" style={{ color: 'var(--olive)' }}>
            {product.name}
          </div>
          <div className="text-xs line-clamp-1" style={{ color: 'oklch(50% .02 340)' }}>
            {product.description}
          </div>
          <div className="text-xs mt-1" style={{ color: 'oklch(50% .02 340)' }}>
            {product.categories && product.categories.length > 0
              ? product.categories.map(c => c.name || c.category?.name).join(", ")
              : product.category?.name || "No category"}
          </div>
        </div>



        {/* Actions */}
        <div className="flex-shrink-0 flex gap-2 flex-wrap">
          <button
            onClick={() => onEdit(product)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition text-white"
            style={{ backgroundColor: 'var(--primary)' }}
            onMouseEnter={(e) => !isDragging && (e.target.style.backgroundColor = 'oklch(88% .06 340)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--primary)')}
          >
            Edit
          </button>
          <button
            onClick={() => onEdit(cloneProductForDuplicate(product))}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition border"
            style={{ borderColor: 'oklch(70% .06 340)', color: 'oklch(40% .02 340)' }}
            onMouseEnter={(e) => {
              if (!isDragging) {
                e.target.style.backgroundColor = 'oklch(96% .02 340)';
                e.target.style.borderColor = 'oklch(60% .06 340)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '';
              e.target.style.borderColor = 'oklch(70% .06 340)';
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
  };

  const renderOrderInput = (product, currentOrder, inputValue, onChange, onBlur) => (
    <input
      type="number"
      min="1"
      max={sortedProducts.length}
      value={inputValue}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur(e.target.value)}
      className="w-16 px-2 py-1 text-center text-sm font-bold border-2 rounded-lg focus:outline-none focus:ring-2 transition"
      style={{
        borderColor: 'var(--primary)',
        color: 'var(--olive)'
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );

  return (
    <OrderableList
      items={sortedProducts}
      onReorder={() => {
        // Refresh list after reorder
        if (onDelete) onDelete();
      }}
      reorderEndpoint="/products/reorder"
      getItemId={(p) => p.id}
      renderRow={renderRow}
      renderOrderInput={renderOrderInput}
      title="All Products"
      emptyState={
        <>
          <img src="/logo.png" alt="MakeWin Logo" className="w-20 h-20 mx-auto mb-4 object-contain opacity-50" />
          <p className="text-gray-600 font-medium">No products yet. Add your first product above!</p>
        </>
      }
    />
  );
}
