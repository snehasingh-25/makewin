import { useEffect, useMemo, useRef, useState } from "react";
import axios, { API } from "../../api";
import ImageUpload from "./ImageUpload";
import VideoUpload from "./VideoUpload";
import { useToast } from "../../context/ToastContext";

// Treat as "edit" only when product has a valid server id
const isEditProduct = (p) =>
  p && (p.id != null && p.id !== "") && !String(p.id).startsWith("temp-");

function parseProductImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}




export default function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
  onOptimisticAdd,
  onOptimisticSuccess,
  onOptimisticFailure,
}) {
  const toast = useToast();
  const isEdit = isEditProduct(product);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    keywords: "",
    isFeatured: false,
  });

  const [imageItems, setImageItems] = useState([]); // { type: 'existing', url } | { type: 'new', id, file, objectURL? }
  const [videos, setVideos] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [descriptionLanguage, setDescriptionLanguage] = useState("English");

  const formRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const initialSnapshotRef = useRef("");

  const snapshot = useMemo(() => {
    return JSON.stringify({
      formData,
      imageItemsLength: imageItems.length,
      imageItemsOrder: imageItems.map((i) => (i.type === "existing" ? i.url : i.id)),
      selectedCategories,
    });
  }, [formData, imageItems, selectedCategories]);

  const isDirty = initialSnapshotRef.current !== "" && snapshot !== initialSnapshotRef.current;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
        isFeatured: Boolean(product.isFeatured),
      });
      setImageItems((prev) => {
        prev.forEach((i) => {
          if (i.type === "new" && i.objectURL) URL.revokeObjectURL(i.objectURL);
        });
        return parseProductImages(product.images).map((url) => ({ type: "existing", url }));
      });
      setExistingVideos(product.videos && Array.isArray(product.videos) ? product.videos : []);

      if (product.categories && product.categories.length > 0) {
        setSelectedCategories(product.categories.map((pc) => pc.categoryId || pc.category?.id || pc.id));
      } else if (product.categoryId) {
        setSelectedCategories([product.categoryId]);
      } else {
        setSelectedCategories([]);
      }
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        keywords: "",
        isFeatured: false,
      });
      setImageItems([]);
      setVideos([]);
      setExistingVideos([]);
      setSelectedCategories([]);
    }

    // snapshot after state settles
    setTimeout(() => {
      initialSnapshotRef.current = JSON.stringify({
        formData: product
          ? {
            name: product.name || "",
            description: product.description || "",
            keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
            isFeatured: Boolean(product?.isFeatured),
          }
          : {
            name: "",
            description: "",
            keywords: "",
            isFeatured: false,
          },
        existingVideos: product?.videos && Array.isArray(product.videos) ? product.videos : [],
        selectedCategories:
          product?.categories && product.categories.length > 0
            ? product.categories.map((pc) => pc.categoryId || pc.category?.id || pc.id)
            : product?.categoryId
              ? [product.categoryId]
              : [],
        imageItemsLength: product ? parseProductImages(product.images).length : 0,
        imageItemsOrder: product ? parseProductImages(product.images).join(",") : "",
      });
    }, 0);
  }, [product]);

  useEffect(() => {
    if (!isEdit || !product?.id) return;

    let cancelled = false;
    axios.get(`/products/${product.id}`)
      .then((res) => {
        const fullProduct = res.data;
        if (cancelled || !fullProduct) return;

        setFormData({
          name: fullProduct.name || "",
          description: fullProduct.description || "",
          keywords: fullProduct.keywords
            ? (Array.isArray(fullProduct.keywords) ? fullProduct.keywords.join(", ") : fullProduct.keywords)
            : "",
          isFeatured: Boolean(fullProduct.isFeatured),
        });

        setImageItems((prev) => {
          prev.forEach((i) => {
            if (i.type === "new" && i.objectURL) URL.revokeObjectURL(i.objectURL);
          });
          return parseProductImages(fullProduct.images).map((url) => ({ type: "existing", url }));
        });
        setExistingVideos(fullProduct.videos && Array.isArray(fullProduct.videos) ? fullProduct.videos : []);

        if (fullProduct.categories && fullProduct.categories.length > 0) {
          setSelectedCategories(fullProduct.categories.map((pc) => pc.categoryId || pc.category?.id || pc.id));
        } else if (fullProduct.categoryId) {
          setSelectedCategories([fullProduct.categoryId]);
        } else {
          setSelectedCategories([]);
        }
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, [isEdit, product?.id]);

  const generateKeywords = (productName) => {
    if (!productName || productName.trim() === "") {
      return [];
    }

    const words = productName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/[\s-]+/)
      .filter(word => word.length > 2)
      .filter((word, index, self) => self.indexOf(word) === index);

    if (productName.length <= 50) {
      words.unshift(productName.toLowerCase().trim());
    }

    return words;
  };

  const prevProductNameRef = useRef("");
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevProductNameRef.current = formData.name || "";
      return;
    }

    if (formData.name && formData.name.trim() !== "" && formData.name !== prevProductNameRef.current) {
      const autoKeywords = generateKeywords(formData.name);
      const keywordsString = autoKeywords.join(", ");

      setFormData(prev => ({
        ...prev,
        keywords: keywordsString
      }));

      prevProductNameRef.current = formData.name;
    } else if (!formData.name || formData.name.trim() === "") {
      setFormData(prev => ({
        ...prev,
        keywords: ""
      }));
      prevProductNameRef.current = "";
    }
  }, [formData.name]);

  useEffect(() => {
    isInitialLoadRef.current = true;
    prevProductNameRef.current = "";
  }, [product]);

  const buildFormPayload = () => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);

    let keywordsArray = [];
    if (formData.keywords && formData.keywords.trim() !== "") {
      keywordsArray = formData.keywords.split(",").map((k) => k.trim()).filter(Boolean);
    } else {
      keywordsArray = generateKeywords(formData.name);
    }
    formDataToSend.append("keywords", JSON.stringify(keywordsArray));
    formDataToSend.append("categoryIds", JSON.stringify(selectedCategories));
    formDataToSend.append("isFeatured", String(Boolean(formData.isFeatured)));

    const orderedExisting = imageItems.filter((i) => i.type === "existing").map((i) => i.url);
    const orderedNewFiles = imageItems.filter((i) => i.type === "new").map((i) => i.file);
    const imageOrderPayload = imageItems.map((i) => (i.type === "existing" ? i.url : "NEW"));

    if (product && (orderedExisting.length > 0 || orderedNewFiles.length > 0)) {
      formDataToSend.append("existingImages", JSON.stringify(orderedExisting));
      if (imageOrderPayload.length > 0) {
        formDataToSend.append("imageOrder", JSON.stringify(imageOrderPayload));
      }
    }
    if (product && existingVideos.length > 0) {
      formDataToSend.append("existingVideos", JSON.stringify(existingVideos));
    }
    orderedNewFiles.forEach((file) => formDataToSend.append("images", file));
    videos.forEach((file) => formDataToSend.append("videos", file));

    return formDataToSend;
  };

  const buildOptimisticProduct = (tempId) => {
    const imageUrls = imageItems.map((i) => (i.type === "existing" ? i.url : i.objectURL || ""));
    const resolvedCategories = (categories || []).filter((c) => selectedCategories.includes(c.id)).map((c) => ({ id: c.id, name: c.name }));
    return {
      id: tempId,
      name: formData.name || "Untitled",
      description: (formData.description || "").slice(0, 200),
      order: 0,
      images: imageUrls.filter(Boolean),
      categories: resolvedCategories,
      isFeatured: Boolean(formData.isFeatured),
    };
  };

  const resetFormState = () => {
    setFormData({
      name: "",
      description: "",
      keywords: "",
      isFeatured: false,
    });
    setImageItems((prev) => {
      prev.forEach((i) => {
        if (i.type === "new" && i.objectURL) URL.revokeObjectURL(i.objectURL);
      });
      return [];
    });
    setVideos([]);
    setExistingVideos([]);
    setSelectedCategories([]);
    initialSnapshotRef.current = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setLoading(true);
    isSubmittingRef.current = true;

    const isOptimisticCreate = !isEdit && onOptimisticAdd && onOptimisticSuccess && onOptimisticFailure;

    if (isOptimisticCreate) {
      if (product && String(product.id).startsWith("temp-")) {
        onOptimisticFailure(product.id);
      }
      const tempId = `temp-${Date.now()}`;
      const optimisticProduct = buildOptimisticProduct(tempId);

      try {
        const formDataToSend = buildFormPayload();
        const res = await axios.post("/products", formDataToSend);

        onOptimisticAdd(optimisticProduct);
        onOptimisticSuccess(tempId, res.data);
        toast.success("Product added successfully");
        resetFormState();
        onSave();
      } catch (error) {
        onOptimisticFailure(tempId);
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to save product. Please try again.";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
        isSubmittingRef.current = false;
      }
      return;
    }

    try {
      const formDataToSend = buildFormPayload();
      const url = isEdit ? `/products/${product.id}` : "/products";
      const res = isEdit ? await axios.put(url, formDataToSend) : await axios.post(url, formDataToSend);

      toast.success(isEdit ? "Product updated" : "Product created");
      onSave();
      resetFormState();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save product";
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
    resetFormState();
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

  const handleGenerateDescription = async (forceRegenerate = false) => {
    if (!formData.name?.trim()) {
      toast.error("Enter product name first");
      return;
    }
    setGeneratingDescription(true);
    try {
      const categoryNames = selectedCategories
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const payload = {
        product_name: formData.name.trim(),
        category: categoryNames || "General",
        material: "",
        color: "",
        target_audience: "",
        use_case: "",
        features: formData.keywords || "",
        language: descriptionLanguage,
      };
      if (isEdit && product?.id) {
        payload.productId = product.id;
        payload.forceRegenerate = forceRegenerate;
      }
      const firstImageItem = imageItems?.length > 0 ? imageItems[0] : null;
      const firstImageUrl =
        firstImageItem?.type === "existing" ? firstImageItem.url : null;
      if (firstImageUrl) {
        payload.imageUrl = firstImageUrl.startsWith("http") ? firstImageUrl : `${API}${firstImageUrl.startsWith("/") ? "" : "/"}${firstImageUrl}`;
      }
      const res = await axios.post("/generate-description", payload);
      const data = res.data;
      if (data.description) setFormData((prev) => ({ ...prev, description: data.description }));
      toast.success(data.fromCache ? "Description loaded from cache" : "Description generated");
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message || "Could not generate description";
      toast.error(errorMsg);
    } finally {
      setGeneratingDescription(false);
    }
  };

  return (
    <div className="bg-cream rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h2>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-olive/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit?.()}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-olive to-olive-dark text-white rounded-lg font-semibold hover:from-olive-dark hover:to-olive transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-olive/40 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            )}
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Categories *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 rounded-xl border-2 border-gray-200 bg-gray-50/50">
            {[...categories]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${isSelected ? "border-olive bg-tan/20" : "border-gray-200 bg-cream hover:border-olive"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter((id) => id !== cat.id));
                        } else {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        }
                      }}
                      className="w-4 h-4 text-olive rounded focus:ring-olive shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">{cat.name}</span>
                  </label>
                );
              })}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">Select at least one category.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isFeatured"
            type="checkbox"
            checked={Boolean(formData.isFeatured)}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4 h-4 text-olive rounded focus:ring-olive"
          />
          <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700">Mark as featured product</label>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block text-sm font-semibold text-gray-700">Description *</label>
            <div className="flex items-center gap-2 flex-wrap">
              {isEdit && product?.id && (
                <button
                  type="button"
                  onClick={() => handleGenerateDescription(true)}
                  disabled={generatingDescription}
                  className="text-sm px-3 py-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg font-medium hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Search Keywords (comma-separated)</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="e.g., kitchen, wardrobe, aluminium, modern"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-olive transition"
          />
          <p className="text-xs text-gray-500 mt-1">Keywords help users search for this product. Automatically generated from name if left empty.</p>
        </div>

        <ImageUpload
          imageItems={imageItems}
          onImageItemsChange={setImageItems}
        />

        <VideoUpload
          videos={videos}
          existingVideos={existingVideos}
          onVideosChange={setVideos}
          onExistingVideosChange={setExistingVideos}
        />

        <div className="sticky bottom-0 bg-cream pt-4 pb-2 border-t border-gray-200 z-10">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-olive to-olive-dark text-white py-3 rounded-lg font-semibold hover:from-olive-dark hover:to-olive transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              )}
              {isEdit ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
