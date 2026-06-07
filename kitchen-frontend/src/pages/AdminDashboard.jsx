import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios, { API } from "../api";
import { useToast } from "../context/ToastContext";
import ProductForm from "../components/admin/ProductForm";
import CategoryForm from "../components/admin/CategoryForm";
import ProductList from "../components/admin/ProductList";
import CategoryList from "../components/admin/CategoryList";
import MessageList from "../components/admin/MessageList";
import ReelForm from "../components/admin/ReelForm";
import ReelList from "../components/admin/ReelList";
import BannerForm from "../components/admin/BannerForm";
import BannerList from "../components/admin/BannerList";
import AdminSearchBar from "../components/admin/AdminSearchBar";
import AdminSearchResults from "../components/admin/AdminSearchResults";
import DealerForm from "../components/admin/DealerForm";
import DealerList from "../components/admin/DealerList";

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reels, setReels] = useState([]);
  const [banners, setBanners] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingReel, setEditingReel] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingDealer, setEditingDealer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Please login to continue");
        navigate("/admin/login");
        return;
      }

      if (activeTab === "products") {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get("/products"),
          axios.get("/categories"),
        ]);

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } else if (activeTab === "categories") {
        const res = await axios.get("/categories");
        setCategories(res.data);
      } else if (activeTab === "messages") {
        const res = await axios.get("/contact");
        setMessages(res.data);
      } else if (activeTab === "reels") {
        const res = await axios.get("/reels/all");
        setReels(res.data);
      } else if (activeTab === "banners") {
        const res = await axios.get("/banners/all");
        setBanners(res.data);
      } else if (activeTab === "dealers") {
        const res = await axios.get("/dealers/all");
        setDealers(res.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Error loading data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductSave = () => {
    setEditingProduct(null);
    loadData();
  };

  const handleOptimisticAdd = (optimisticProduct) => {
    setProducts((prev) => [...prev, optimisticProduct]);
  };

  const handleOptimisticSuccess = (tempId, serverProduct) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === tempId);
      if (idx === -1) return [...prev, serverProduct];
      return prev.map((p) => (p.id === tempId ? { ...serverProduct, order: p.order ?? serverProduct.order } : p));
    });
    setEditingProduct(null);
  };

  const handleOptimisticFailure = (tempId) => {
    setProducts((prev) => prev.filter((p) => p.id !== tempId));
  };

  const handleProductDelete = (product) => {
    if (product && String(product.id).startsWith("temp-")) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      return;
    }
    loadData();
  };

  const handleCategorySave = () => {
    setEditingCategory(null);
    loadData();
  };



  const handleReelSave = () => {
    setEditingReel(null);
    loadData();
  };

  const handleBannerSave = () => {
    setEditingBanner(null);
    loadData();
  };

  const handleDealerSave = () => {
    setEditingDealer(null);
    loadData();
  };

  const tabs = [
    { id: "products", label: "Products", icon: null },
    { id: "categories", label: "Categories", icon: null },
    { id: "banners", label: "Banners", icon: null },
    { id: "reels", label: "Reels", icon: null },
    { id: "dealers", label: "Dealers", icon: null },
    { id: "messages", label: "Messages", icon: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-cream border-r border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MakeWin" className="h-6 w-auto" />
            <div>
              <div className="text-sm font-semibold text-gray-900">MakeWin</div>
              <div className="text-xs text-gray-600 truncate max-w-[14rem]">{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="p-3 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingProduct(null);
                setEditingCategory(null);
                setEditingReel(null);
                setEditingBanner(null);
                setEditingDealer(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-left ${activeTab === tab.id
                ? "bg-olive text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >

              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-olive to-olive-dark text-white rounded-lg hover:from-olive-dark hover:to-olive transition font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            View Shop
          </button>
          <button
            onClick={logout}
            className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar (mobile + page header) */}
        <div className="bg-cream shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin <span className="text-olive">Dashboard</span>
                  </h1>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 flex-1 justify-end max-w-2xl">
                <AdminSearchBar
                  onSelectProduct={(product) => {
                    setActiveTab("products");
                    setEditingProduct(product);
                  }}
                  onSelectCategory={(category) => {
                    setActiveTab("categories");
                    setEditingCategory(category);
                  }}
                  onViewAllResults={(query, results) => {
                    setSearchQuery(query);
                    setSearchResults(results);
                    setActiveTab("search");
                    setEditingProduct(null);
                  }}
                />
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-gradient-to-r from-olive to-olive-dark text-white rounded-lg hover:from-olive-dark hover:to-olive transition font-medium flex items-center gap-2 shadow-md hover:shadow-lg shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  View Shop
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium shrink-0"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Search (mobile) */}
            <div className="lg:hidden mt-4">
              <AdminSearchBar
                onSelectProduct={(product) => {
                  setActiveTab("products");
                  setEditingProduct(product);
                }}
                onSelectCategory={(category) => {
                  setActiveTab("categories");
                  setEditingCategory(category);
                }}
                onViewAllResults={(query, results) => {
                  setSearchQuery(query);
                  setSearchResults(results);
                  setActiveTab("search");
                  setEditingProduct(null);
                }}
              />
            </div>

            {/* Top menu (mobile) */}
            <div className="lg:hidden mt-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setEditingProduct(null);
                      setEditingCategory(null);
                      setEditingReel(null);
                      setEditingBanner(null);
                      setEditingDealer(null);
                    }}
                    className={`shrink-0 px-4 py-2.5 rounded-full font-semibold transition-all ${activeTab === tab.id
                      ? "bg-olive text-white shadow-md"
                      : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 sm:hidden mt-2">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-olive to-olive-dark text-white rounded-lg transition font-medium shadow-md"
                >
                  View Shop
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg transition font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4 py-6 ">
          {/* Content */}
          {loading ? (
            <div className="bg-cream rounded-lg shadow p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === "products" && (
                <div>
                  <ProductForm
                    product={editingProduct}
                    categories={categories}
                    onSave={handleProductSave}
                    onCancel={() => setEditingProduct(null)}
                    onOptimisticAdd={handleOptimisticAdd}
                    onOptimisticSuccess={handleOptimisticSuccess}
                    onOptimisticFailure={handleOptimisticFailure}
                  />
                  <ProductList
                    products={products}
                    onEdit={setEditingProduct}
                    onDelete={handleProductDelete}
                  />
                </div>
              )}

              {activeTab === "categories" && (
                <div>
                  <CategoryForm
                    category={editingCategory}
                    onSave={handleCategorySave}
                    onCancel={() => setEditingCategory(null)}
                  />
                  <CategoryList
                    categories={categories}
                    onEdit={setEditingCategory}
                    onDelete={loadData}
                  />
                </div>
              )}



              {activeTab === "banners" && (
                <div>
                  <BannerForm
                    banner={editingBanner}
                    onSave={handleBannerSave}
                    onCancel={() => setEditingBanner(null)}
                  />
                  <BannerList
                    banners={banners}
                    onEdit={setEditingBanner}
                    onDelete={loadData}
                  />
                </div>
              )}

              {activeTab === "dealers" && (
                <div>
                  <DealerForm
                    dealer={editingDealer}
                    onSave={handleDealerSave}
                    onCancel={() => setEditingDealer(null)}
                  />
                  <DealerList
                    dealers={dealers}
                    onEdit={setEditingDealer}
                    onDelete={loadData}
                  />
                </div>
              )}



              {activeTab === "reels" && (
                <div>
                  <ReelForm
                    reel={editingReel}
                    onSave={handleReelSave}
                    onCancel={() => setEditingReel(null)}
                  />
                  <ReelList
                    reels={reels}
                    onEdit={setEditingReel}
                    onDelete={loadData}
                  />
                </div>
              )}

              {activeTab === "messages" && (
                <MessageList messages={messages} onUpdate={loadData} />
              )}

              {activeTab === "search" && (
                <AdminSearchResults
                  query={searchQuery}
                  results={searchResults}
                  onEditProduct={(product) => {
                    setActiveTab("products");
                    setEditingProduct(product);
                  }}
                  onEditCategory={(category) => {
                    setActiveTab("categories");
                    setEditingCategory(category);
                  }}

                  onClearSearch={() => {
                    setSearchQuery("");
                    setSearchResults(null);
                    setActiveTab("products");
                  }}
                  onRefresh={loadData}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
