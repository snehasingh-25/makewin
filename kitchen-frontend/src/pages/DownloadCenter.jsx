import { useEffect, useMemo, useRef, useState } from "react";
import { FiDownload, FiSearch, FiEye, FiChevronDown, FiX, FiFileText, FiPlay, FiBookOpen } from "react-icons/fi";
import axios, { API } from "../api";
import { toPlayableVideoUrl } from "../utils/videoUrl";

export default function DownloadCenter() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search states for each section
  const [searchPhotos, setSearchPhotos] = useState("");
  const [searchSpecs, setSearchSpecs] = useState("");
  const [searchCatalogues, setSearchCatalogues] = useState("");

  // Filter category state for Photos & Videos
  const [activePhotoCat, setActivePhotoCat] = useState("All");
  const [isPhotoCatOpen, setIsPhotoCatOpen] = useState(false);

  // Scrollspy states
  const [activeSection, setActiveSection] = useState("photos");
  const sectionRefs = {
    photos: useRef(null),
    specs: useRef(null),
    catalogues: useRef(null),
  };

  // Modals state
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [docViewMode, setDocViewMode] = useState("pdf"); // "pdf" or "book"

  useEffect(() => {
    axios.get("/downloads")
      .then((res) => {
        setDownloads(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching downloads:", error);
        setLoading(false);
      });
  }, []);

  // Lock body scroll and listen for Escape key when modals are open
  useEffect(() => {
    const isModalOpen = Boolean(activeVideoUrl || previewPhoto || previewDoc);
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveVideoUrl(null);
        setPreviewPhoto(null);
        setPreviewDoc(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideoUrl, previewPhoto, previewDoc]);

  // Scroll spy detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;

      const photosOffset = sectionRefs.photos.current?.offsetTop || 0;
      const specsOffset = sectionRefs.specs.current?.offsetTop || 0;
      const cataloguesOffset = sectionRefs.catalogues.current?.offsetTop || 0;

      if (scrollPos >= cataloguesOffset) {
        setActiveSection("catalogues");
      } else if (scrollPos >= specsOffset) {
        setActiveSection("specs");
      } else {
        setActiveSection("photos");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionRefs.catalogues, sectionRefs.photos, sectionRefs.specs]);

  const scrollToSection = (id) => {
    const ref = sectionRefs[id];
    if (ref && ref.current) {
      const yOffset = -120; // clearance for sticky sub-nav and navbar
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const resolveImage = (path, fallback) => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    return `${API}${path}`;
  };

  const resolveFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API}${path}`;
  };

  const resolvePlayableVideoUrl = (path) => toPlayableVideoUrl(resolveFileUrl(path));

  const buildDownloadFilename = (item) => {
    const rawTitle = (item?.title || "download").trim() || "download";
    const safeTitle = rawTitle.replace(/[^\w\s.-]+/g, "").replace(/\s+/g, "_");
    const fromUrl = (item?.fileUrl || "").split("?")[0].split("/").pop() || "";
    const urlExt = fromUrl.includes(".") ? fromUrl.split(".").pop() : "";
    const typeExt = (item?.fileType || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const ext = (urlExt || typeExt || "pdf").replace(/^\./, "");
    if (safeTitle.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) return safeTitle;
    return `${safeTitle}.${ext}`;
  };

  /** Force a real file download via backend proxy (handles Cloudinary raw/PDF 401). */
  const startFileDownload = async (item) => {
    if (!item?.id) return;

    const filename = buildDownloadFilename(item);
    const proxyUrl = `${API}/downloads/file/${item.id}`;

    try {
      const res = await fetch(proxyUrl, { mode: "cors" });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    } catch (err) {
      console.error("Download error:", err);
      // Last resort: navigate to proxy so Content-Disposition can still trigger save
      const a = document.createElement("a");
      a.href = proxyUrl;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  // Group items by category
  const photosAndVideos = useMemo(() => downloads.filter((d) => d.category === "photos"), [downloads]);
  const technicalSpecs = useMemo(() => downloads.filter((d) => d.category === "specs"), [downloads]);
  const catalogues = useMemo(() => downloads.filter((d) => d.category === "catalogues"), [downloads]);

  // Get unique subcategories/categories for Photos filters
  const photoCategories = useMemo(() => {
    const subs = photosAndVideos
      .map((d) => d.subcategory)
      .filter((sub) => sub);
    return ["All", ...Array.from(new Set(subs))];
  }, [photosAndVideos]);

  // Filtered lists
  const filteredPhotos = useMemo(() => {
    return photosAndVideos.filter((d) => {
      const matchSearch = d.title.toLowerCase().includes(searchPhotos.toLowerCase()) || 
                          (d.subcategory || "").toLowerCase().includes(searchPhotos.toLowerCase());
      const matchCat = activePhotoCat === "All" || d.subcategory === activePhotoCat;
      return matchSearch && matchCat;
    });
  }, [photosAndVideos, searchPhotos, activePhotoCat]);

  const filteredSpecs = useMemo(() => {
    return technicalSpecs.filter((d) => {
      return d.title.toLowerCase().includes(searchSpecs.toLowerCase()) || 
             (d.subcategory || "").toLowerCase().includes(searchSpecs.toLowerCase());
    });
  }, [technicalSpecs, searchSpecs]);

  const filteredCatalogues = useMemo(() => {
    return catalogues.filter((d) => {
      return d.title.toLowerCase().includes(searchCatalogues.toLowerCase()) || 
             (d.subcategory || "").toLowerCase().includes(searchCatalogues.toLowerCase());
    });
  }, [catalogues, searchCatalogues]);

  // Document preview handler
  const handleOpenDocumentPreview = (docItem) => {
    setPreviewDoc(docItem);
    setPreviewPage(1);
    const fileUrl = (docItem?.fileUrl || "").toLowerCase();
    const fileType = (docItem?.fileType || "").toLowerCase();
    const isPdf = fileType === "pdf" || fileUrl.endsWith(".pdf") || fileUrl.includes(".pdf?");
    setDocViewMode(isPdf ? "pdf" : "book");
  };

  const previewPagesCount = 4;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive" />
          <p className="font-display text-lg font-light tracking-wide text-muted-foreground">Loading archive index...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .download-page {
          background-color: var(--cream);
          color: var(--ink);
          font-family: var(--font-sans);
        }
        .download-page h1,
        .download-page h2,
        .download-page h3,
        .download-page h4,
        .download-page h5,
        .download-page .font-heading,
        .download-page .font-display {
          font-family: var(--font-display);
        }
        .download-page .font-body,
        .download-page .font-sans {
          font-family: var(--font-sans);
        }
        .download-page .bg-[#FDFBF7] {
          background-color: var(--cream) !important;
        }
        .download-page .text-[#1A1B18] {
          color: var(--ink) !important;
        }
        .download-page .text-[#5C5C56] {
          color: var(--muted-foreground) !important;
        }
        .download-page .text-[#C25E4A] {
          color: var(--olive) !important;
        }
        .download-page .bg-[#C25E4A] {
          background-color: var(--olive) !important;
        }
      `}</style>
      <main data-testid="download-center-page" className="download-page min-h-screen bg-cream text-ink">
        {/* Accessibility notifications live section */}
      <section aria-label="Notifications alt+T" tabIndex="-1" aria-live="polite" aria-relevant="additions text" aria-atomic="false" />

      {/* Hero Section */}
      <section className="px-6 md:px-12 lg:px-20 pt-6 sm:pt-8 pb-10 border-b border-[rgba(135, 185, 35, 0.15)]">
        <div className="max-w-3xl">
          <h1 className="font-heading font-light text-[#1A1B18] text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] leading-[0.95] tracking-tight">
            Download Center
          </h1>
          <p className="font-body text-base md:text-lg leading-relaxed text-[#1A1B18]">
            Access and download our latest{" "}
            <span className="ink-link text-[#1A1B18] cursor-pointer" onClick={() => scrollToSection("photos")}>Photos &amp; Videos</span>,{" "}
            <span className="ink-link text-[#1A1B18] cursor-pointer" onClick={() => scrollToSection("specs")}>Technical Specifications</span>, and{" "}
            <span className="ink-link text-[#1A1B18] cursor-pointer" onClick={() => scrollToSection("catalogues")}>Product Catalogues</span>.
          </p>
        </div>
      </section>

      {/* Sticky Sub Nav */}
      <nav className="px-6 md:px-12 lg:px-20 sticky top-14 lg:top-20 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[rgba(26,27,24,0.12)]">
        <ul className="flex items-center gap-6 md:gap-12 overflow-x-auto py-5 -mx-1 px-1 scrollbar-hide">
          <li className="shrink-0">
            <button
              data-testid="tab-photos"
              onClick={() => scrollToSection("photos")}
              className="group flex items-end gap-2 pb-2 border-b transition-colors duration-300"
              style={{
                borderColor: activeSection === "photos" ? "rgb(26, 27, 24)" : "transparent",
                color: activeSection === "photos" ? "rgb(26, 27, 24)" : "rgb(92, 92, 86)",
              }}
            >
              <span className="tag-pill">01</span>
              <span className="font-heading text-lg md:text-xl lg:text-2xl font-light tracking-tight whitespace-nowrap group-hover:text-[#1A1B18]">
                Photos &amp; Videos
              </span>
            </button>
          </li>
          <li className="shrink-0">
            <button
              data-testid="tab-specs"
              onClick={() => scrollToSection("specs")}
              className="group flex items-end gap-2 pb-2 border-b transition-colors duration-300"
              style={{
                borderColor: activeSection === "specs" ? "rgb(26, 27, 24)" : "transparent",
                color: activeSection === "specs" ? "rgb(26, 27, 24)" : "rgb(92, 92, 86)",
              }}
            >
              <span className="tag-pill">02</span>
              <span className="font-heading text-lg md:text-xl lg:text-2xl font-light tracking-tight whitespace-nowrap group-hover:text-[#1A1B18]">
                Technical Specifications
              </span>
            </button>
          </li>
          <li className="shrink-0">
            <button
              data-testid="tab-catalogues"
              onClick={() => scrollToSection("catalogues")}
              className="group flex items-end gap-2 pb-2 border-b transition-colors duration-300"
              style={{
                borderColor: activeSection === "catalogues" ? "rgb(26, 27, 24)" : "transparent",
                color: activeSection === "catalogues" ? "rgb(26, 27, 24)" : "rgb(92, 92, 86)",
              }}
            >
              <span className="tag-pill">03</span>
              <span className="font-heading text-lg md:text-xl lg:text-2xl font-light tracking-tight whitespace-nowrap group-hover:text-[#1A1B18]">
                Catalogues
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* 01. Photos & Videos Section */}
      <div id="section-photos" ref={sectionRefs.photos}>
        <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
            <div className="max-w-2xl">
              <div className="tag-pill text-[#5C5C56] mb-4">01 · Visual Library</div>
              <h2 className="font-heading text-4xl md:text-5xl font-light leading-[1.05] text-[#1A1B18]">Photos &amp; Videos</h2>
              <p className="font-body mt-4 text-base md:text-lg text-[#5C5C56] leading-relaxed">
                Studio-grade product imagery, brand assets and motion content — ready to preview and download across catalogues, web and retail.
              </p>
            </div>
            
            {/* Filters */}
            <div className="md:max-w-md w-full">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative w-full">
                  <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-[#1A1B18] w-[18px] h-[18px]" />
                  <input
                    data-testid="search-photos"
                    type="text"
                    value={searchPhotos}
                    onChange={(e) => setSearchPhotos(e.target.value)}
                    placeholder="Search assets…"
                    className="flex w-full px-3 py-1 shadow-sm transition-colors focus-visible:outline-none font-heading h-14 pl-8 pr-2 rounded-none border-0 border-b border-[rgba(26,27,24,0.25)] bg-transparent text-lg md:text-xl font-light tracking-tight focus-visible:ring-0 focus-visible:border-[#1A1B18] placeholder:text-[#9C9C95]"
                  />
                </div>
                
                {/* Dropdown category */}
                <div className="relative">
                  <button
                    data-testid="filter-photos"
                    onClick={() => setIsPhotoCatOpen(!isPhotoCatOpen)}
                    className="flex items-center justify-between w-full h-11 px-4 border border-[rgba(26,27,24,0.2)] bg-transparent tag-pill text-[#1A1B18] hover:bg-[#1A1B18] hover:text-[#FDFBF7] transition-colors duration-300"
                    type="button"
                  >
                    <span>Category — {activePhotoCat}</span>
                    <FiChevronDown className={`w-[14px] h-[14px] transition-transform ${isPhotoCatOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isPhotoCatOpen && (
                    <ul className="absolute left-0 w-full mt-1 bg-[#FDFBF7] border border-[rgba(26,27,24,0.15)] shadow-lg z-20 max-h-60 overflow-y-auto">
                      {photoCategories.map((cat) => (
                        <li key={cat}>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoCat(cat);
                              setIsPhotoCatOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition hover:bg-gray-100 ${
                              activePhotoCat === cat ? "text-[#C25E4A] bg-gray-50" : "text-gray-700"
                            }`}
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPhotos.map((d) => {
              const isVideo = d.fileType === "MP4" || d.fileType === "VIDEO" || (d.fileUrl && d.fileUrl.endsWith(".mp4"));
              const coverImg = resolveImage(d.coverUrl || d.fileUrl, "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80");
              return (
                <article key={d.id} className="group relative lift overflow-hidden bg-[#F0EFEA] border border-[rgba(26,27,24,0.10)] flex flex-col justify-between">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                    <img
                      alt={d.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      src={coverImg}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B18]/55 via-[#1A1B18]/0 to-[#1A1B18]/10" />
                    
                    {/* Badge */}
                    <span className="absolute top-4 left-4 tag-pill bg-[#FDFBF7] text-[#1A1B18] px-3 py-1.5 border border-[rgba(26,27,24,0.15)] z-10">
                      {isVideo ? "Video" : "Photo"}
                    </span>

                    {/* Play Video Trigger or Photo Lightbox Trigger */}
                    {isVideo ? (
                      <button
                        onClick={() => setActiveVideoUrl(resolvePlayableVideoUrl(d.fileUrl))}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer group/play z-10"
                        aria-label="Play video"
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FDFBF7]/95 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg">
                          <FiPlay className="text-[#1A1B18] w-[22px] h-[22px] ml-0.5 fill-current" />
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => setPreviewPhoto(d)}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-300 z-10"
                        aria-label="Preview photo"
                      >
                        <div className="flex items-center gap-2 bg-[#FDFBF7] text-[#1A1B18] px-4 py-2 rounded-full font-heading text-xs uppercase tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <FiEye className="w-4 h-4" />
                          <span>Preview Photo</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 md:p-6 flex items-end justify-between gap-4 bg-[#FDFBF7]">
                    <div className="min-w-0">
                      <h3 className="font-heading text-lg md:text-xl font-medium text-[#1A1B18] leading-tight truncate">
                        {d.title}
                      </h3>
                      <p className="font-body text-xs text-[#5C5C56] mt-2 tracking-wide">
                        {d.subcategory || "Asset"} · {d.fileType || "File"} · {d.fileSize || ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isVideo && (
                        <button
                          type="button"
                          data-testid={`preview-photo-pv-${d.id}`}
                          onClick={() => setPreviewPhoto(d)}
                          aria-label={`Preview ${d.title}`}
                          className="w-11 h-11 border border-[rgba(26,27,24,0.2)] flex items-center justify-center text-[#1A1B18] transition-all duration-300 hover:bg-[#1A1B18] hover:text-[#FDFBF7] cursor-pointer bg-transparent"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid={`download-photo-pv-${d.id}`}
                        onClick={() => startFileDownload(d)}
                        aria-label={`Download ${d.title}`}
                        className="w-11 h-11 border border-[#1A1B18] flex items-center justify-center text-[#1A1B18] transition-all duration-300 hover:bg-[#1A1B18] hover:text-[#FDFBF7] cursor-pointer bg-transparent"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredPhotos.length === 0 && (
              <div className="col-span-full text-center py-16 border border-dashed border-[rgba(26,27,24,0.15)] bg-[#F0EFEA]/30">
                <p className="font-body text-base text-[#5C5C56] font-medium">No visual assets match your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 02. Technical Specifications Section */}
      <div id="section-specs" ref={sectionRefs.specs}>
        <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20 bg-[#F0EFEA]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
            <div className="max-w-2xl">
              <div className="tag-pill text-[#5C5C56] mb-4">02 · Documentation</div>
              <h2 className="font-heading text-4xl md:text-5xl font-light leading-[1.05] text-[#1A1B18]">
                Technical Specifications
              </h2>
              <p className="font-body mt-4 text-base md:text-lg text-[#5C5C56] leading-relaxed">
                Material, dimensional, fire-safety and installation documents. Preview online or download for procurement teams.
              </p>
            </div>
            
            {/* Search */}
            <div className="md:max-w-md w-full">
              <div className="relative w-full">
                <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-[#1A1B18] w-[18px] h-[18px]" />
                <input
                  data-testid="search-specs"
                  type="text"
                  value={searchSpecs}
                  onChange={(e) => setSearchSpecs(e.target.value)}
                  placeholder="Search documents…"
                  className="flex w-full px-3 py-1 shadow-sm transition-colors focus-visible:outline-none font-heading h-14 pl-8 pr-2 rounded-none border-0 border-b border-[rgba(26,27,24,0.25)] bg-transparent text-lg md:text-xl font-light tracking-tight focus-visible:ring-0 focus-visible:border-[#1A1B18] placeholder:text-[#9C9C95]"
                />
              </div>
            </div>
          </div>

          {/* Table List Layout */}
          <ul className="border-t border-[rgba(26,27,24,0.18)]">
            {filteredSpecs.map((d) => {
              const fileTypeLower = (d.fileType || "").toLowerCase();
              const isPdf = fileTypeLower === "pdf";
              
              return (
                <li
                  key={d.id}
                  className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 md:gap-8 py-6 md:py-7 border-b border-[rgba(26,27,24,0.18)] transition-colors hover:bg-[#FDFBF7]/60 px-2"
                >
                  {/* File Icon Box */}
                  <div className="w-12 h-14 md:w-14 md:h-16 border border-[rgba(26,27,24,0.2)] flex items-center justify-center bg-[#FDFBF7]">
                    <FiFileText className={`w-5 h-5 ${isPdf ? "text-[#C25E4A]" : "text-[#8C9B86]"}`} />
                  </div>
                  
                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl md:text-2xl font-light text-[#1A1B18] leading-tight truncate">
                      {d.title}
                    </h3>
                    <p className="font-body text-xs md:text-sm text-[#5C5C56] mt-1.5 tracking-wide">
                      {d.subcategory || "Specs"} · {d.pages !== null ? `${d.pages} pages` : "Specification Sheet"}
                    </p>
                  </div>
                  
                  {/* Badges */}
                  <span className="hidden md:inline tag-pill text-[#1A1B18] border border-[#1A1B18] px-3 py-1.5 uppercase">
                    {d.fileType}
                  </span>
                  <span className="hidden md:inline font-body text-sm text-[#5C5C56] min-w-[64px] text-right">
                    {d.fileSize}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`preview-spec-sp-${d.id}`}
                      onClick={() => handleOpenDocumentPreview(d)}
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-medium focus-visible:outline-none py-2 rounded-none h-11 px-3 md:px-4 border border-[rgba(26,27,24,0.3)] tag-pill text-[#1A1B18] hover:bg-[#1A1B18] hover:text-[#FDFBF7] transition-colors duration-300 cursor-pointer bg-transparent"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      Preview
                    </button>

                    <button
                      type="button"
                      data-testid={`download-spec-sp-${d.id}`}
                      onClick={() => startFileDownload(d)}
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-medium focus-visible:outline-none py-2 rounded-none h-11 px-4 md:px-5 border border-[#1A1B18] tag-pill text-[#1A1B18] hover:bg-[#1A1B18] hover:text-[#FDFBF7] transition-colors duration-300 cursor-pointer bg-transparent"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </li>
              );
            })}

            {filteredSpecs.length === 0 && (
              <li className="text-center py-16">
                <p className="font-body text-base text-[#5C5C56] font-medium">No documentation matches your search.</p>
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* 03. Catalogues Section */}
      <div id="section-catalogues" ref={sectionRefs.catalogues}>
        <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
            <div className="max-w-2xl">
              <div className="tag-pill text-[#5C5C56] mb-4">03 · The Bookshelf</div>
              <h2 className="font-heading text-4xl md:text-5xl font-light leading-[1.05] text-[#1A1B18]">Catalogues</h2>
              <p className="font-body mt-4 text-base md:text-lg text-[#5C5C56] leading-relaxed">
                Browse the seasonal index. Each edition is a curated walkthrough of finishes, profiles and applications — open in full interactive viewer or download.
              </p>
            </div>
            
            {/* Search */}
            <div className="md:max-w-md w-full">
              <div className="relative w-full">
                <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-[#1A1B18] w-[18px] h-[18px]" />
                <input
                  data-testid="search-catalogues"
                  type="text"
                  value={searchCatalogues}
                  onChange={(e) => setSearchCatalogues(e.target.value)}
                  placeholder="Search catalogues…"
                  className="flex w-full px-3 py-1 shadow-sm transition-colors focus-visible:outline-none font-heading h-14 pl-8 pr-2 rounded-none border-0 border-b border-[rgba(26,27,24,0.25)] bg-transparent text-lg md:text-xl font-light tracking-tight focus-visible:ring-0 focus-visible:border-[#1A1B18] placeholder:text-[#9C9C95]"
                />
              </div>
            </div>
          </div>

          {/* Grid list covers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {filteredCatalogues.map((d) => {
              const coverImg = resolveImage(d.coverUrl, "https://images.unsplash.com/photo-1526050071463-2c476b162a4c?auto=format&fit=crop&w=800&q=80");
              return (
                <article key={d.id} className="group flex flex-col gap-5">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EFEA] lift shadow-sm border border-gray-200">
                    <img
                      alt={d.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.04]"
                      src={coverImg}
                    />
                    
                    {/* Edition tag top-left */}
                    <div className="absolute top-4 left-4 tag-pill bg-[#FDFBF7] text-[#1A1B18] px-3 py-1.5 border border-[rgba(26,27,24,0.15)]">
                      {d.subcategory || "Edition 2026"}
                    </div>

                    {/* Hover eye preview button */}
                    <button
                      data-testid={`preview-catalogue-cat-${d.id}`}
                      onClick={() => handleOpenDocumentPreview(d)}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-[#FDFBF7] text-[#1A1B18] border border-[rgba(26,27,24,0.15)] flex items-center justify-center opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#1A1B18] hover:text-[#FDFBF7] shadow-lg cursor-pointer"
                      aria-label={`Preview ${d.title}`}
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title and metadata */}
                  <div>
                    <h3 className="font-heading text-2xl md:text-[26px] font-light text-[#1A1B18] leading-[1.15]">
                      {d.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-4 font-body text-xs text-[#5C5C56] tracking-wide">
                      <span>{d.pages ? `${d.pages} pages` : "Catalog"}</span>
                      <span className="w-1 h-1 rounded-full bg-[#5C5C56]" />
                      <span>{d.fileSize}</span>
                    </div>
                  </div>

                  {/* Bottom action bar */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      data-testid={`download-catalogue-cat-${d.id}`}
                      onClick={() => startFileDownload(d)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium focus-visible:outline-none shadow py-2 rounded-none h-11 px-5 bg-[#1A1B18] text-[#FDFBF7] tag-pill hover:bg-[#C25E4A] hover:text-[#FDFBF7] transition-colors duration-300 cursor-pointer border-0"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      data-testid={`preview-catalogue-text-cat-${d.id}`}
                      onClick={() => handleOpenDocumentPreview(d)}
                      className="ink-link font-heading tag-pill text-[#1A1B18] flex items-center gap-1.5 cursor-pointer bg-transparent border-0 text-xs uppercase tracking-wider"
                    >
                      Preview 
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-up-right ml-0.5"
                      >
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredCatalogues.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="font-body text-base text-[#5C5C56] font-medium">No catalogues found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FULL SCREEN & PROPER PREVIEW MODALS SECTION                   */}
      {/* ------------------------------------------------------------- */}

      {/* 1. Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col justify-between p-4 md:p-6 animate-fadeIn"
          onClick={() => setPreviewPhoto(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="tag-pill bg-white/10 text-xs px-2.5 py-1 text-gray-200 rounded border border-white/20">
                {previewPhoto.subcategory || "Photo Asset"}
              </span>
              <h4 className="font-heading text-xl md:text-2xl text-white mt-1.5 font-medium truncate max-w-xl">
                {previewPhoto.title}
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => startFileDownload(previewPhoto)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C25E4A] hover:bg-[#a84e3c] text-white text-xs tag-pill rounded transition-colors shadow"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Close preview"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Photo Display Area */}
          <div
            className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center my-4 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveImage(previewPhoto.coverUrl || previewPhoto.fileUrl, "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80")}
              alt={previewPhoto.title}
              className="max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl border border-white/10"
            />
          </div>

          {/* Footer Info */}
          <div
            className="w-full max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-400 font-body py-1 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{previewPhoto.fileType || "JPEG/PNG"} · {previewPhoto.fileSize || "High Resolution"}</span>
            <span>Click backdrop or press Esc to close</span>
          </div>
        </div>
      )}

      {/* 2. Lightbox Video Modal */}
      {activeVideoUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
          onClick={() => setActiveVideoUrl(null)}
        >
          <div
            className="w-full max-w-6xl bg-black rounded-lg overflow-hidden shadow-2xl flex flex-col relative border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <span className="font-heading text-lg font-medium truncate">Video Preview</span>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="text-gray-400 hover:text-white transition w-9 h-9 flex items-center justify-center rounded-full bg-white/10"
                aria-label="Close video"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full max-h-[82vh] aspect-video bg-black flex items-center justify-center relative">
              <video
                key={activeVideoUrl}
                src={activeVideoUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full h-full max-h-[82vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Spacious & Proper Document / Spec / Catalogue Preview Reader */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-[#FDFBF7] w-full max-w-7xl h-[92vh] flex flex-col justify-between overflow-hidden shadow-2xl relative border border-white/20 rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 md:px-6 md:py-4 border-b border-[rgba(26,27,24,0.12)] flex items-center justify-between bg-white shrink-0">
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#F0EFEA] border border-gray-200 flex items-center justify-center shrink-0">
                  <FiFileText className="w-5 h-5 text-[#C25E4A]" />
                </div>
                <div className="min-w-0">
                  <span className="tag-pill text-[#5C5C56] text-[11px] uppercase tracking-wider">
                    {previewDoc.subcategory || previewDoc.category || "Document"} · {previewDoc.fileType || "PDF"}
                  </span>
                  <h4 className="font-heading text-lg md:text-xl font-medium truncate text-[#1A1B18] mt-0.5">
                    {previewDoc.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => startFileDownload(previewDoc)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium py-2 h-10 px-4 bg-[#1A1B18] text-[#FDFBF7] tag-pill hover:bg-[#C25E4A] transition-colors duration-300 cursor-pointer border-0 rounded"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download File</span>
                </button>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-10 h-10 border border-[rgba(26,27,24,0.2)] rounded flex items-center justify-center hover:bg-[#1A1B18] hover:text-[#FDFBF7] transition-colors focus:outline-none text-[#1A1B18]"
                  aria-label="Close preview"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Reader Main Display */}
            <div className="flex-1 bg-[#EAE8E1] relative overflow-hidden flex items-center justify-center p-2 sm:p-4 md:p-6">
              {docViewMode === "pdf" && previewDoc.fileUrl ? (
                /* Full Native PDF Viewer */
                <div className="w-full h-full flex flex-col items-center justify-center bg-white shadow-xl rounded overflow-hidden border border-gray-300">
                  <iframe
                    src={previewDoc.id ? `${API}/downloads/view/${previewDoc.id}#toolbar=1&navpanes=0` : `${resolveFileUrl(previewDoc.fileUrl)}#toolbar=1&navpanes=0`}
                    title={previewDoc.title}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                /* Spacious Interactive Document / Flipbook Presentation Reader */
                <div className="h-full w-full flex items-center justify-center relative">
                  <div className="h-full max-h-[78vh] aspect-[3/4] max-w-4xl bg-white shadow-2xl relative overflow-hidden border border-gray-300 rounded-sm transition-all duration-300 flex flex-col justify-between">
                    
                    {previewPage === 1 ? (
                      // Cover Page
                      <div className="absolute inset-0">
                        <img
                          src={resolveImage(previewDoc.coverUrl, "https://images.unsplash.com/photo-1526050071463-2c476b162a4c?auto=format&fit=crop&w=1200&q=80")}
                          alt="Cover Page"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                    ) : previewPage === 2 ? (
                      // Table of Contents
                      <div className="p-8 md:p-12 flex flex-col justify-between h-full bg-[#FDFBF7] overflow-y-auto">
                        <div>
                          <div className="flex items-center gap-2 text-[#C25E4A] mb-4">
                            <FiBookOpen className="w-5 h-5" />
                            <span className="tag-pill text-xs">Index</span>
                          </div>
                          <h5 className="font-heading text-3xl font-light text-[#1A1B18] mb-6">Table of Contents</h5>
                          <ul className="space-y-4 font-body text-sm text-[#5C5C56]">
                            <li className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                              <span>01. Material Innovations &amp; PVC</span>
                              <span className="font-heading">Page 12</span>
                            </li>
                            <li className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                              <span>02. Modular Kitchen Collections</span>
                              <span className="font-heading">Page 28</span>
                            </li>
                            <li className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                              <span>03. Premium WPC Board Selection</span>
                              <span className="font-heading">Page 45</span>
                            </li>
                            <li className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                              <span>04. Installation &amp; Technical Spec Sheet</span>
                              <span className="font-heading">Page 72</span>
                            </li>
                            <li className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                              <span>05. Hardware &amp; Fitting Systems</span>
                              <span className="font-heading">Page 98</span>
                            </li>
                          </ul>
                        </div>
                        <div className="tag-pill text-center text-[#9C9C95] text-[10px] mt-6">
                          {previewDoc.title} · Document Showcase
                        </div>
                      </div>
                    ) : previewPage === 3 ? (
                      // Showcase Layout
                      <div className="p-8 md:p-12 flex flex-col justify-between h-full bg-cream overflow-y-auto">
                        <div>
                          <span className="tag-pill text-[#C25E4A] text-xs">Aesthetic Layouts</span>
                          <h5 className="font-heading text-3xl font-light text-[#1A1B18] mt-2 mb-4 leading-tight">
                            Modular Luxury
                          </h5>
                          <p className="font-body text-xs md:text-sm text-[#5C5C56] leading-relaxed mb-6">
                            Designed with German hardware integration, waterproof composite board structures, and a curated selection of anti-scratch matte and high-gloss acrylic surfaces.
                          </p>
                          <div className="aspect-video bg-gray-200 border border-gray-300 relative overflow-hidden rounded shadow-sm">
                            <img
                              src="https://images.unsplash.com/photo-1601993957728-1e56ab70c5a8?auto=format&fit=crop&w=1000&q=80"
                              alt="Layout interior"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="tag-pill text-center text-[#9C9C95] text-[10px] mt-6">
                          Section 02 · Collection Showcase
                        </div>
                      </div>
                    ) : (
                      // Back Cover
                      <div className="p-8 md:p-12 flex flex-col justify-between items-center text-center h-full bg-[#1A1B18] text-[#FDFBF7]">
                        <div className="my-auto space-y-6">
                          <div className="w-12 h-12 bg-[#C25E4A] rounded-full mx-auto shadow-md" />
                          <div>
                            <h5 className="font-heading text-4xl font-light tracking-wide">
                              Linea<span className="text-[#C25E4A]">/</span>Studio
                            </h5>
                            <p className="font-body text-xs text-[#9C9C95] tracking-widest uppercase mt-2">
                              Premium Modular Kitchens
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] tag-pill text-[#5C5C56]">
                          © 2026 Linea/Studio. All Rights Reserved.
                        </div>
                      </div>
                    )}

                    {/* Page Number Overlay badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] px-2.5 py-1 tag-pill rounded backdrop-blur-sm">
                      Page {previewPage} of {previewPagesCount}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Controls / Footer */}
            <div className="p-3 md:px-6 md:py-4 border-t border-[rgba(26,27,24,0.12)] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                {previewDoc.fileUrl && (
                  <button
                    onClick={() => setDocViewMode(docViewMode === "pdf" ? "book" : "pdf")}
                    className="px-3 py-1.5 border border-gray-300 text-[#1A1B18] text-xs tag-pill rounded hover:bg-gray-100 transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <FiEye className="w-3.5 h-3.5 text-[#C25E4A]" />
                    {docViewMode === "pdf" ? "Switch to Flipbook View" : "Switch to PDF Reader"}
                  </button>
                )}
              </div>

              {docViewMode !== "pdf" && (
                <div className="flex items-center gap-3">
                  <button
                    disabled={previewPage === 1}
                    onClick={() => setPreviewPage(previewPage - 1)}
                    className="px-4 py-1.5 border border-[rgba(26,27,24,0.15)] text-[#1A1B18] tag-pill text-xs rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1A1B18] hover:text-[#FDFBF7] transition-colors focus:outline-none"
                  >
                    Previous
                  </button>
                  <span className="font-body text-xs text-[#5C5C56]">
                    Page {previewPage} of {previewPagesCount}
                  </span>
                  <button
                    disabled={previewPage === previewPagesCount}
                    onClick={() => setPreviewPage(previewPage + 1)}
                    className="px-4 py-1.5 border border-[rgba(26,27,24,0.15)] text-[#1A1B18] tag-pill text-xs rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1A1B18] hover:text-[#FDFBF7] transition-colors focus:outline-none"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
