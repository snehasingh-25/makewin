import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { shuffleArray } from "../utils/shuffle";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch categories and all products for suggestions
  useEffect(() => {
    Promise.all([
      axios.get("/categories").then(res => res.data),
      axios.get("/products").then(res => res.data)
    ])
      .then(([categoriesData, productsData]) => {
        setCategories(categoriesData);
        setAllProducts(productsData);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      const params = {};
      if (query) params.search = query;
      if (categoryFilter) params.category = categoryFilter;

      try {
        const res = await axios.get("/products", { params });
        const safeData = shuffleArray(Array.isArray(res.data) ? res.data : []);
        setProducts(safeData);

        // If no results and we have a query, fall back to all products in selected category.
        if (safeData.length === 0 && query) {
          let fallbackProducts = [];
          if (categoryFilter) {
            const fallbackParams = { category: categoryFilter };
            const fallbackRes = await axios.get("/products", { params: fallbackParams });
            fallbackProducts = shuffleArray(Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
          } else {
            fallbackProducts = shuffleArray(Array.isArray(allProducts) ? allProducts : []);
          }

          setSuggestedProducts(fallbackProducts);
          setShowSuggestions(fallbackProducts.length > 0);
        } else {
          setSuggestedProducts([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, categoryFilter, allProducts]);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-cream pt-4 sm:pt-6 pb-4 sm:pb-6">
      <div className="px-1 sm:px-2 lg:px-4">

        {/* Mobile search bar — hidden on desktop where Navbar already has one */}
        <div className="lg:hidden mb-5">
          <SearchBar
            initialValue={query}
            showTyped={false}
            onSearch={(q) => {
              const params = new URLSearchParams(searchParams);
              if (q) params.set("q", q);
              else params.delete("q");
              setSearchParams(params);
            }}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--olive)' }}>
            Search Results
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold" style={{ color: 'oklch(40% .02 340)' }}>
                Category:
              </label>
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="px-4 py-2 rounded-lg border-2 text-sm transition-all duration-300 focus:outline-none"
                style={{
                  borderColor: 'var(--primary)',
                  backgroundColor: 'white',
                  color: 'var(--olive)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'oklch(88% .06 340)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--primary)'}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {categoryFilter && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 text-white"
                style={{
                  backgroundColor: 'var(--primary)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
              >
                Clear Filters
              </button>
            )}
          </div>

          {(query || categoryFilter) && (
            <p className="text-lg mb-4" style={{ color: 'oklch(60% .02 340)' }}>
              {products.length > 0
                ? `Found ${products.length} product${products.length !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}${categoryFilter ? ` in ${categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}` : ''}`
                : `No products found${query ? ` for "${query}"` : ''}${categoryFilter ? ` in ${categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}` : ''}`
              }
            </p>
          )}
        </div>

        {!query && !categoryFilter ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-4xl">🔍</span>
            </div>
            <p className="font-medium" style={{ color: 'oklch(60% .02 340)' }}>
              Enter a search term or select filters to find products
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : showSuggestions && suggestedProducts.length > 0 ? (
          <div>
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--primary)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--olive)' }}>
                No exact matches found for "{query}"
              </p>
              <p className="text-sm" style={{ color: 'oklch(60% .02 340)' }}>
                Showing {categoryFilter ? "all products in this category" : "all products"}:
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {suggestedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'var(--primary)' }}>
              <span className="text-4xl">😔</span>
            </div>
            <p className="font-medium mb-2" style={{ color: 'oklch(60% .02 340)' }}>
              No products found
            </p>
            <p className="text-sm" style={{ color: 'oklch(60% .02 340)' }}>
              Try searching with different keywords or adjust your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
