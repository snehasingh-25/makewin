import axios, { API } from "../../api";
import { useToast } from "../../context/ToastContext";
import AdminTable from "./AdminTable";

export default function DownloadList({ downloads, onEdit, onDelete }) {
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this download asset?")) return;

    try {
      await axios.delete(`/downloads/${id}`);
      toast.success("Download asset deleted");
      onDelete();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to delete download asset";
      toast.error(errorMsg);
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "photos":
        return "Images & Videos";
      case "specs":
        return "Technical Specifications";
      case "catalogues":
        return "Catalogues";
      default:
        return cat;
    }
  };

  const columns = [
    {
      key: "cover",
      header: "Cover / Icon",
      searchText: () => "",
      render: (d) => {
        const coverUrl = d.coverUrl ? (d.coverUrl.startsWith("http") ? d.coverUrl : `${API}${d.coverUrl}`) : null;
        return coverUrl ? (
          <img
            src={coverUrl}
            alt={d.title}
            className="w-10 h-14 object-cover rounded border border-gray-200"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-14 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 text-center font-medium">
            No Cover
          </div>
        );
      },
    },
    {
      key: "title",
      header: "Title",
      searchText: (d) => `${d.title} ${d.subcategory}`,
      render: (d) => (
        <div>
          <span className="font-semibold text-gray-900 block leading-snug">{d.title}</span>
          {d.subcategory && (
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-olive bg-olive/10 px-2 py-0.5 mt-1 rounded">
              {d.subcategory}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      searchText: (d) => getCategoryLabel(d.category),
      render: (d) => (
        <span className="text-gray-700 font-medium text-sm">
          {getCategoryLabel(d.category)}
        </span>
      ),
    },
    {
      key: "format",
      header: "Format / Size",
      searchText: (d) => `${d.fileType} ${d.fileSize}`,
      render: (d) => (
        <div>
          <span className="font-semibold text-gray-900 text-xs border border-gray-300 px-1.5 py-0.5 rounded bg-gray-50 uppercase mr-2">
            {d.fileType}
          </span>
          <span className="text-xs text-gray-500 font-medium">{d.fileSize}</span>
        </div>
      ),
    },
    {
      key: "pages",
      header: "Pages",
      searchText: (d) => String(d.pages || ""),
      render: (d) => (
        <span className="text-gray-600 text-sm">
          {d.pages !== null && d.pages !== undefined ? `${d.pages} pages` : "—"}
        </span>
      ),
    },
    {
      key: "order",
      header: "Order",
      searchText: (d) => String(d.order),
      render: (d) => <span className="text-gray-600 font-medium text-sm">{d.order}</span>,
    },
  ];

  const actions = (d) => (
    <div className="flex gap-2">
      <a
        href={d.fileUrl.startsWith("http") ? d.fileUrl : `${API}${d.fileUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition flex items-center justify-center cursor-pointer"
      >
        View
      </a>
      <button
        onClick={() => onEdit(d)}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition cursor-pointer"
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(d.id)}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition cursor-pointer"
      >
        Delete
      </button>
    </div>
  );

  return (
    <AdminTable
      title="Download Center Catalogues & Documents"
      subtitle="Manage visual packs, technical drawings, specifications and product bookshelves"
      items={downloads}
      columns={columns}
      getRowId={(d) => d.id}
      actions={actions}
      emptyState={
        <div className="py-8">
          <p className="text-gray-600 font-medium">No download center assets found. Add your first file above!</p>
        </div>
      }
    />
  );
}
