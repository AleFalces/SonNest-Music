"use client";

import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/productsServices";
import { IProduct } from "@/helpers/mockProducts";
import Card from "@/components/Card";
import { Loader2 } from "lucide-react"; // Ícono de carga

const Products: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category.name === selectedCategory);

  return (
    <div className="p-6  min-h-screen">
      <div className="mb-6 mt-4 flex justify-center items-center gap-4">
        <label htmlFor="category" className="text-red-800  font-semibold">
          Filter by Category:
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border-2 border-yellow-700 rounded-xl focus:outline-none focus:ring-2 bg-white focus:ring-red-800"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-yellow-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <Card key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-yellow-800 font-semibold text-xl bg-yellow-200 p-6 rounded-2xl shadow-md">
              There are no products available at the moment
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
