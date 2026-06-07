import { API } from "../../api";
import { useToast } from "../../context/ToastContext";
import AdminTable from "./AdminTable";

export default function DealerList({ dealers, onEdit, onDelete }) {
  const toast = useToast();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this dealer showroom?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/dealers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Dealer showroom deleted");
        onDelete();
      } else {
        const data = await res.json();
        toast.error(data.error || data.message || "Failed to delete dealer");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete dealer");
    }
  };

  const columns = [
    {
      key: "image",
      header: "Exterior Photo",
      searchText: () => "",
      render: (d) => {
        const imgUrl = d.image1 ? (d.image1.startsWith("http") ? d.image1 : `${API}${d.image1}`) : null;
        return imgUrl ? (
          <img
            src={imgUrl}
            alt={d.firm}
            className="w-16 h-12 object-cover rounded-lg border border-gray-200"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400">
            No Photo
          </div>
        );
      },
    },
    {
      key: "firm",
      header: "Firm Name",
      searchText: (d) => d.firm,
      render: (d) => <span className="font-semibold text-gray-900">{d.firm}</span>,
    },
    {
      key: "city",
      header: "City / Location",
      searchText: (d) => `${d.city} ${d.location}`,
      render: (d) => (
        <div>
          <span className="font-medium text-gray-900">{d.city}</span>
          <span className="block text-xs text-gray-500">{d.location}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      searchText: (d) => d.phone,
      render: (d) => <span className="text-gray-600 font-medium">{d.phone}</span>,
    },
  ];

  const actions = (d) => (
    <div className="flex gap-2">
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
      title="All Dealers"
      subtitle="Manage your authorized showrooms and dealer partners"
      items={dealers}
      columns={columns}
      getRowId={(d) => d.id}
      actions={actions}
      emptyState={
        <div className="py-8">
          <p className="text-gray-600 font-medium">No dealers found. Add your first dealer showroom above!</p>
        </div>
      }
    />
  );
}
