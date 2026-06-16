"use client";

import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/productsServices";
import { IProduct } from "@/helpers/mockProducts";
import Card from "@/components/Card";
import { Search, PackageOpen } from "lucide-react";

const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[4/3] animate-pulse bg-cream-200" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-3/4 animate-pulse rounded bg-cream-200" />
      <div className="flex justify-between">
        <div className="h-5 w-16 animate-pulse rounded bg-cream-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-cream-200" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-xl bg-cream-200" />
    </div>
  </div>
);

const Products: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category.name)));

  const filteredProducts = products
    .filter((p) =>
      selectedCategory === "all" ? true : p.category.name === selectedCategory
    )
    .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${
                isActive
                  ? "bg-bordo text-white shadow-soft"
                  : "border-2 border-cream-200 text-ink-soft hover:border-bordo hover:text-bordo"
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
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProducts.length ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} product={product} />
          ))}
        </div>
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
