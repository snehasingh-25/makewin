import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const IMAGE_MAX = 10;
const MAX_SIZE_MB = 50;

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|avif|bmp|svg|tiff?|heic|heif|ico|jfif)$/i;

function isAcceptableImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith("image/")) return true;
  // Some formats (HEIC etc.) report empty or octet-stream mime
  return IMAGE_EXT_RE.test(file.name || "");
}

// Stable id for new files (one-time when added)
function makeNewId() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getImageItemId(item) {
  if (item.type === "existing") return `existing-${item.url}`;
  return item.id;
}

function SortableImageCard({ item, index, onRemove, isOverlay }) {
  const isFeatured = index === 0;
  const id = getImageItemId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const src =
    item.type === "existing"
      ? item.url
      : item.objectURL || (item.file && URL.createObjectURL(item.file));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border-2 overflow-hidden bg-gray-100 ${isFeatured ? "ring-2 ring-olive ring-offset-2" : "border-gray-200"
        } ${isOverlay ? "shadow-xl cursor-grabbing" : ""}`}
    >
      <div className="aspect-square w-full">
        <img
          src={src}
          alt={item.type === "existing" ? "Product" : item.file?.name || "Upload"}
          className="w-full h-full object-cover"
        />
      </div>
      {isFeatured && (
        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-olive text-white shadow">
          Featured
        </span>
      )}
      {!isOverlay && (
        <>
          <div
            {...attributes}
            {...listeners}
            className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-cream/95 shadow cursor-grab active:cursor-grabbing hover:bg-gray-50"
            aria-label="Drag to reorder"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-red-500 text-white shadow hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default function ImageUpload({
  imageItems,
  onImageItemsChange,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const fileInputRef = useRef(null);

  const items = Array.isArray(imageItems) ? imageItems : [];
  const canAdd = items.length < IMAGE_MAX;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => getImageItemId(i) === active.id);
    const newIndex = items.findIndex((i) => getImageItemId(i) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(items, oldIndex, newIndex);
    onImageItemsChange(next);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (!canAdd) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files).filter(isAcceptableImageFile);
        const toAdd = newFiles.slice(0, IMAGE_MAX - items.length).map((file) => ({
          type: "new",
          id: makeNewId(),
          file,
          objectURL: URL.createObjectURL(file),
        }));
        if (toAdd.length) onImageItemsChange([...items, ...toAdd]);
      }
    },
    [canAdd, items, onImageItemsChange]
  );

  const handleChange = useCallback(
    (e) => {
      if (!e.target.files?.length || !canAdd) return;
      const newFiles = Array.from(e.target.files).filter(isAcceptableImageFile);
      const toAdd = newFiles.slice(0, IMAGE_MAX - items.length).map((file) => ({
        type: "new",
        id: makeNewId(),
        file,
        objectURL: URL.createObjectURL(file),
      }));
      if (toAdd.length) onImageItemsChange([...items, ...toAdd]);
      e.target.value = "";
    },
    [canAdd, items, onImageItemsChange]
  );

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const removeItem = useCallback(
    (item) => {
      if (item.type === "new" && item.objectURL) URL.revokeObjectURL(item.objectURL);
      onImageItemsChange(items.filter((i) => getImageItemId(i) !== getImageItemId(item)));
    },
    [items, onImageItemsChange]
  );

  const activeItem = activeId
    ? items.find((i) => getImageItemId(i) === activeId)
    : null;
  const activeIndex = activeItem ? items.indexOf(activeItem) : -1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Product Images
        </label>
        <span className="text-xs text-gray-500">
          {items.length} / {IMAGE_MAX} · First image = featured
        </span>
      </div>

      {items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(getImageItemId)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item, index) => (
                <SortableImageCard
                  key={getImageItemId(item)}
                  item={item}
                  index={index}
                  onRemove={removeItem}
                  isOverlay={false}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <div className="w-32">
                <SortableImageCard
                  item={activeItem}
                  index={activeIndex}
                  onRemove={() => { }}
                  isOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {canAdd && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragActive
            ? "border-olive bg-tan/20"
            : "border-gray-300 hover:border-olive bg-gray-50"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif,.avif,.tif,.tiff,.bmp,.svg,.ico,.jfif"
            onChange={handleChange}
            className="hidden"
          />
          <div className="text-3xl mb-2">📸</div>
          <p className="text-gray-600 text-sm">
            Drag images here or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-olive hover:text-olive underline font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, WebP, HEIC, AVIF and other image formats · max {MAX_SIZE_MB}MB each
          </p>
        </div>
      )}

      {items.length === 0 && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${dragActive
            ? "border-olive bg-tan/20"
            : "border-gray-300 hover:border-olive bg-gray-50"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif,.avif,.tif,.tiff,.bmp,.svg,.ico,.jfif"
            onChange={handleChange}
            className="hidden"
          />
          <div className="text-4xl mb-3">📸</div>
          <p className="text-gray-600 mb-2">
            Drag and drop images here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-olive hover:text-olive underline font-semibold"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG, WebP, HEIC, AVIF and other image formats · max {MAX_SIZE_MB}MB each · first image = featured
          </p>
        </div>
      )}
    </div>
  );
}
