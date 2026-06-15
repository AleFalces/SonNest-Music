"use client";

import { getProductsById } from "@/services/productsServices";
import { IProduct } from "@/helpers/mockProducts";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const { addToCart, getRemainingStock } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (typeof id === "string") getProductsById(id).then(setProduct);
  }, [id]);

  if (!product) return <p className="text-center p-6">Loading...</p>;

  const remainingStock = getRemainingStock(product.id, product.stock);

  return (
    <div className="p-6  min-h-screen flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex justify-center items-center">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full max-w-xl rounded-xl shadow-md border-1 border-yellow-700 transform transition-transform duration-700 ease-in-out hover:scale-105"
        />
      </div>

      <div className="flex-1 flex flex-col justify-start">
        <h1 className="text-5xl font-bold text-red-800 mb-4">{product.name}</h1>
        <p className="text-2xl text-gray-800 mb-6">{product.description}</p>
        <p className="text-3xl font-semibold text-yellow-700 mb-2">
          Price: ${product.price}
        </p>
        <p className="text-base text-gray-800 mb-4">
          Category: {product.category.name}
        </p>
        <p className="text-base text-gray-800 mb-6">
          Available Stock: {remainingStock}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => addToCart(product.id, product.stock)}
            disabled={remainingStock === 0}
            className={`px-6 py-3 rounded-xl font-semibold text-white bg-red-800 hover:bg-red-900 transition-colors duration-300 `}
          >
            Add to Cart
          </button>
          <button
            onClick={() => router.push(`/products`)}
            className="px-6 py-3 rounded-xl font-semibold text-white bg-yellow-700 hover:bg-yellow-800 transition-colors duration-300"
          >
            Back to Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
