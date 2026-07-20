import { useEffect, useMemo, useRef, useState } from "react";
import axios, { API } from "../../api";
import { useToast } from "../../context/ToastContext";

export default function DownloadForm({ download, onSave, onCancel }) {
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    category: "photos",
    subcategory: "",
    pages: "",
    order: "0",
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const initialSnapshotRef = useRef("");

  const snapshot = useMemo(() => {
    return JSON.stringify({
      formData,
      fileSelected: !!file,
      coverSelected: !!coverImage,
      existingFileUrl,
      existingCoverUrl,
    });
  }, [formData, file, coverImage, existingFileUrl, existingCoverUrl]);

  const isDirty = initialSnapshotRef.current !== "" && snapshot !== initialSnapshotRef.current;

  useEffect(() => {
    if (download) {
      setFormData({
        title: download.title || "",
        category: download.category || "photos",
        subcategory: download.subcategory || "",
        pages: download.pages !== null && download.pages !== undefined ? String(download.pages) : "",
        order: download.order !== undefined ? String(download.order) : "0",
      });
      setExistingFileUrl(download.fileUrl || null);
      setFileName(download.fileUrl ? download.fileUrl.split("/").pop() : "");
      setExistingCoverUrl(download.coverUrl || null);
      setCoverImagePreview(download.coverUrl || null);
      setFile(null);
      setCoverImage(null);
    } else {
      setFormData({
        title: "",
        category: "photos",
        subcategory: "",
        pages: "",
        order: "0",
      });
      setExistingFileUrl(null);
      setFileName("");
      setExistingCoverUrl(null);
      setCoverImagePreview(null);
      setFile(null);
      setCoverImage(null);
    }

    setTimeout(() => {
      initialSnapshotRef.current = JSON.stringify({
        formData: download
          ? {
              title: download.title || "",
              category: download.category || "photos",
              subcategory: download.subcategory || "",
              pages: download.pages !== null && download.pages !== undefined ? String(download.pages) : "",
              order: download.order !== undefined ? String(download.order) : "0",
            }
          : {
              title: "",
              category: "photos",
              subcategory: "",
              pages: "",
              order: "0",
            },
        fileSelected: false,
        coverSelected: false,
        existingFileUrl: download?.fileUrl || null,
        existingCoverUrl: download?.coverUrl || null,
      });
    }, 0);
  }, [download]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleCoverChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setCoverImage(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
    setExistingFileUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    setExistingCoverUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!download && !file) {
      toast.error("Download file is required");
      return;
    }

    setLoading(true);
    isSubmittingRef.current = true;

    try {
      const url = download ? `/downloads/${download.id}` : "/downloads";
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("subcategory", formData.subcategory.trim());
      formDataToSend.append("order", formData.order);
      
      if (formData.category !== "photos" && formData.pages) {
        formDataToSend.append("pages", formData.pages);
      }

      if (file) {
        formDataToSend.append("file", file);
      }
      
      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }
      
      if (download) {
        // For updates, let backend know if we keep or delete/change the cover URL
        formDataToSend.append("existingCover", existingCoverUrl || "");
      }

      if (download) {
        await axios.put(url, formDataToSend);
      } else {
        await axios.post(url, formDataToSend);
      }

      toast.success(download ? "Download asset updated" : "Download asset created");
      onSave();
      
      // Reset form on success
      setFormData({
        title: "",
        category: "photos",
        subcategory: "",
        pages: "",
        order: "0",
      });
      removeFile();
      removeCover();
      initialSnapshotRef.current = "";
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save download asset";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (loading) return;
    if (isDirty) {
      const ok = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!ok) return;
    }
    setFormData({
      title: "",
      category: "photos",
      subcategory: "",
      pages: "",
      order: "0",
    });
    removeFile();
    removeCover();
    initialSnapshotRef.current = "";
    onCancel?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }
    if (e.key === "Enter") {
      const tag = e.target?.tagName;
      if (tag === "TEXTAREA" || tag === "SELECT" || e.target.type === "file") return;
      if (loading) return;
      e.preventDefault();
      formRef.current?.requestSubmit?.();
    }
  };

  const resolvePreview = (preview) => {
    if (!preview) return null;
    if (preview.startsWith("data:") || preview.startsWith("blob:")) return preview;
    if (preview.startsWith("http")) return preview;
    return `${API}${preview}`;
  };

  // Predefined subcategory presets based on category choice
  const subcategoryPresets = useMemo(() => {
    if (formData.category === "photos") {
      return ["Product", "Brand", "Textures", "Architecture", "Tutorials"];
    }
    if (formData.category === "catalogues") {
      return ["Edition 2026", "Edition 2025"];
    }
    return [];
  }, [formData.category]);

  return (
    <div className="bg-cream rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {download ? "Edit Download Asset" : "Add New Download Asset"}
        </h2>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit?.()}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-olive to-olive-dark text-white rounded-lg font-semibold hover:from-olive-dark hover:to-olive transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            )}
            {download ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
              placeholder="e.g. Interior Products Catalogue 2026"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => {
                const newCat = e.target.value;
                setFormData({
                  ...formData,
                  category: newCat,
                  subcategory: "", // reset subcategory on change
                });
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
            >
              <option value="photos">Images & Videos</option>
              <option value="specs">Technical Specifications</option>
              <option value="catalogues">Catalogues</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subcategory */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory / Tag</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
                placeholder="e.g. Product, Brand, Textures, or Edition 2026"
              />
              {subcategoryPresets.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData({ ...formData, subcategory: e.target.value });
                    }
                  }}
                  className="px-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white text-sm"
                >
                  <option value="">Presets</option>
                  {subcategoryPresets.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Pages (Only for specs & catalogues) */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 transition-colors ${
                formData.category === "photos" ? "text-gray-400" : "text-gray-700"
              }`}
            >
              Pages Count {formData.category !== "photos" && "*"}
            </label>
            <input
              type="number"
              min="1"
              value={formData.pages}
              disabled={formData.category === "photos"}
              onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={formData.category === "photos" ? "N/A" : "e.g. 12, 124"}
              required={formData.category !== "photos"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
              placeholder="e.g. 0, 1, 2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Main Download File */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Download File *</label>
            {(fileName || existingFileUrl) && (
              <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{fileName || "Existing file"}</p>
                  {existingFileUrl && (
                    <a
                      href={existingFileUrl.startsWith("http") ? existingFileUrl : `${API}${existingFileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-olive hover:underline"
                    >
                      View file link
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition shrink-0"
                >
                  ×
                </button>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.zip,.rar,.mp4,.mov,image/*,.heic,.heif,.avif"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-olive hover:text-olive transition w-full bg-white"
              >
                {fileName || existingFileUrl ? "Change Download File" : "Select File (PDF, ZIP, DOC, MP4)"}
              </button>
            </div>
          </div>

          {/* Cover Image Thumbnail */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Cover Thumbnail {formData.category === "catalogues" && "(Highly Recommended)"}
            </label>
            {(coverImagePreview || existingCoverUrl) && (
              <div className="relative inline-block">
                <img
                  src={resolvePreview(coverImagePreview || existingCoverUrl)}
                  alt="Cover preview"
                  className="w-32 h-40 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  ×
                </button>
              </div>
            )}
            <div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-olive hover:text-olive transition w-full bg-white"
              >
                {coverImagePreview || existingCoverUrl ? "Change Cover Image" : "Upload Cover Image (JPG, PNG)"}
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-cream pt-4 pb-2 border-t border-gray-200 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-olive to-olive-dark text-white py-3 rounded-lg font-semibold hover:from-olive-dark hover:to-olive transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            )}
            {download ? "Update Asset" : "Save Asset"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
