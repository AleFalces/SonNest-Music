"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/services/productsServices";
import { getCategories } from "@/services/categoriesServices";
import { IProduct } from "@/helpers/mockProducts";
import Card from "@/components/Card";
import { Search, PackageOpen, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 9;

const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[4/3] animate-pulse bg-muted" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
      <div className="flex justify-between">
        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  </div>
);

const Products: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Categories for the filter pills.
  useEffect(() => {
    getCategories().then((cats) => setCategories(cats.map((c) => c.name)));
  }, []);

  // Debounce the search box (server-side search).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch the current page whenever query inputs change.
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await getProducts({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        });
        if (!active) return;
        setProducts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [page, debouncedSearch, selectedCategory]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  return (
    <div className="section min-h-screen py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl">Our Products</h1>
        <p className="mt-2 text-ink-soft">
          Browse our curated selection of musical instruments.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-6 max-w-md">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name…"
            className="input pl-10"
            aria-label="Search products by name"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {["all", ...categories].map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => handleCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${
                isActive
                  ? "bg-bordo text-white shadow-soft"
                  : "border-2 border-muted text-ink-soft hover:border-bordo hover:text-bordo"
              }`}
            >
              {category === "all" ? "All" : category}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="mb-4 text-center text-sm text-ink-soft">
          {total} {total === 1 ? "product" : "products"} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length ? (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline px-3 py-2 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 text-sm font-semibold text-ink-soft">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-outline px-3 py-2 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
          <PackageOpen size={40} className="text-gold" />
          <p className="text-lg font-semibold text-bordo">No products found</p>
          <p className="text-sm text-ink-soft">
            Try a different search term or category.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
