/**
 * A single row for Category in search results.
 * Mirrors the row layouts from CategoryList
 * but without drag-to-reorder controls.
 *
 * @param {Object} props
 * @param {Object} props.item - The category object
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 */
export default function SearchResultEntityRow({ item, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-4 p-4 transition-all hover:bg-gray-50">
      {/* Image */}
      <div className="flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-14 h-14 object-cover rounded-lg"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <img src="/logo.png" alt="MakeWin Logo" className="w-10 h-10 object-contain opacity-50" />
          </div>
        )}
      </div>

      {/* Name & Details */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold" style={{ color: "var(--olive)" }}>
          {item.name}
        </div>
        <div className="text-xs" style={{ color: "oklch(50% .02 340)" }}>
          Slug: {item.slug}
        </div>
        {item.description && (
          <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "oklch(50% .02 340)" }}>
            {item.description}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex-shrink-0 hidden sm:block">
        <div className="flex flex-wrap gap-1">
          {item._count?.products != null && (
            <span className="px-2 py-0.5 bg-olive/10 text-olive text-xs rounded-full font-semibold">
              {item._count.products} products
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-2">
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition"
          style={{ backgroundColor: "var(--primary)", color: "var(--olive)" }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "oklch(88% .06 340)")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--primary)")}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
