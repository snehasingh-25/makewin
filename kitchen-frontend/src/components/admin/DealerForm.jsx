import { useEffect, useMemo, useRef, useState } from "react";
import axios, { API } from "../../api";
import { useToast } from "../../context/ToastContext";

export default function DealerForm({ dealer, onSave, onCancel }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    firm: "",
    city: "",
    location: "",
    address: "",
    phone: "",
  });

  const [image1, setImage1] = useState(null);
  const [image1Preview, setImage1Preview] = useState(null);
  const [existingImage1Url, setExistingImage1Url] = useState(null);

  const [image2, setImage2] = useState(null);
  const [image2Preview, setImage2Preview] = useState(null);
  const [existingImage2Url, setExistingImage2Url] = useState(null);

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const formRef = useRef(null);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);
  const initialSnapshotRef = useRef("");

  const snapshot = useMemo(() => {
    return JSON.stringify({
      formData,
      image1Selected: !!image1,
      image2Selected: !!image2,
      existingImage1Url,
      existingImage2Url,
    });
  }, [formData, image1, image2, existingImage1Url, existingImage2Url]);

  const isDirty = initialSnapshotRef.current !== "" && snapshot !== initialSnapshotRef.current;

  useEffect(() => {
    if (dealer) {
      setFormData({
        firm: dealer.firm || "",
        city: dealer.city || "",
        location: dealer.location || "",
        address: dealer.address || "",
        phone: dealer.phone || "",
      });
      setExistingImage1Url(dealer.image1 || null);
      setImage1Preview(dealer.image1 || null);
      setExistingImage2Url(dealer.image2 || null);
      setImage2Preview(dealer.image2 || null);
      setImage1(null);
      setImage2(null);
    } else {
      setFormData({ firm: "", city: "", location: "", address: "", phone: "" });
      setExistingImage1Url(null);
      setImage1Preview(null);
      setExistingImage2Url(null);
      setImage2Preview(null);
      setImage1(null);
      setImage2(null);
    }

    setTimeout(() => {
      initialSnapshotRef.current = JSON.stringify({
        formData: dealer
          ? {
            firm: dealer.firm || "",
            city: dealer.city || "",
            location: dealer.location || "",
            address: dealer.address || "",
            phone: dealer.phone || "",
          }
          : { firm: "", city: "", location: "", address: "", phone: "" },
        image1Selected: false,
        image2Selected: false,
        existingImage1Url: dealer?.image1 || null,
        existingImage2Url: dealer?.image2 || null,
      });
    }, 0);
  }, [dealer]);

  const handleImage1Change = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage1(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage1Preview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImage2Change = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage2(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage2Preview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage1 = () => {
    setImage1(null);
    setImage1Preview(null);
    setExistingImage1Url(null);
    if (fileInput1Ref.current) fileInput1Ref.current.value = "";
  };

  const removeImage2 = () => {
    setImage2(null);
    setImage2Preview(null);
    setExistingImage2Url(null);
    if (fileInput2Ref.current) fileInput2Ref.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    setLoading(true);
    isSubmittingRef.current = true;

    try {
      const url = dealer ? `/dealers/${dealer.id}` : "/dealers";

      const formDataToSend = new FormData();
      formDataToSend.append("firm", formData.firm);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("phone", formData.phone);

      if (image1) {
        formDataToSend.append("image1", image1);
      }
      if (existingImage1Url && !image1) {
        formDataToSend.append("existingImage1", existingImage1Url);
      }

      if (image2) {
        formDataToSend.append("image2", image2);
      }
      if (existingImage2Url && !image2) {
        formDataToSend.append("existingImage2", existingImage2Url);
      }

      if (dealer) {
        await axios.put(url, formDataToSend);
      } else {
        await axios.post(url, formDataToSend);
      }

      toast.success(dealer ? "Dealer updated" : "Dealer created");
      onSave();
      setFormData({ firm: "", city: "", location: "", address: "", phone: "" });
      removeImage1();
      removeImage2();
      initialSnapshotRef.current = "";
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to save dealer";
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
    setFormData({ firm: "", city: "", location: "", address: "", phone: "" });
    removeImage1();
    removeImage2();
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
      if (tag === "TEXTAREA") return;
      if (loading) return;
      e.preventDefault();
      formRef.current?.requestSubmit?.();
    }
  };

  const resolvePreview = (preview, fallback) => {
    if (!preview) return null;
    if (preview.startsWith("data:") || preview.startsWith("blob:")) return preview;
    if (preview.startsWith("http")) return preview;
    return `${API}${preview}`;
  };

  return (
    <div className="bg-cream rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {dealer ? "Edit Dealer" : "Add New Dealer"}
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
            {dealer ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Firm Name *</label>
            <input
              type="text"
              value={formData.firm}
              onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
              placeholder="e.g. Aarav Interiors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
              placeholder="e.g. Ahmedabad, Bengaluru"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location/State *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
              placeholder="e.g. Gujarat, Karnataka, New Delhi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
              placeholder="e.g. +91 98250 11111"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address *</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition bg-white"
            rows="2"
            placeholder="e.g. 12, S G Highway, Bodakdev"
            required
          />
        </div>

        {/* Showroom Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image 1: Showroom Exterior */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Showroom Exterior Photo</label>
            {(image1Preview || existingImage1Url) && (
              <div className="relative inline-block">
                <img
                  src={resolvePreview(image1Preview || existingImage1Url)}
                  alt="Showroom exterior preview"
                  className="w-full max-w-xs h-40 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage1}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  ×
                </button>
              </div>
            )}
            <div>
              <input
                ref={fileInput1Ref}
                type="file"
                accept="image/*"
                onChange={handleImage1Change}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInput1Ref.current?.click()}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-olive hover:text-olive transition w-full bg-white"
              >
                {image1Preview || existingImage1Url ? "Change Exterior Photo" : "Upload Exterior Photo"}
              </button>
            </div>
          </div>

          {/* Image 2: Showroom Interior */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Showroom Interior Photo</label>
            {(image2Preview || existingImage2Url) && (
              <div className="relative inline-block">
                <img
                  src={resolvePreview(image2Preview || existingImage2Url)}
                  alt="Showroom interior preview"
                  className="w-full max-w-xs h-40 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage2}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  ×
                </button>
              </div>
            )}
            <div>
              <input
                ref={fileInput2Ref}
                type="file"
                accept="image/*"
                onChange={handleImage2Change}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInput2Ref.current?.click()}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-olive hover:text-olive transition w-full bg-white"
              >
                {image2Preview || existingImage2Url ? "Change Interior Photo" : "Upload Interior Photo"}
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
            {dealer ? "Update Dealer" : "Save Dealer"}
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
