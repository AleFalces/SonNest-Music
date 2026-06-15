"use client";

import { CardProps } from "@/helpers/mockProducts";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const Card: React.FC<CardProps> = ({ product }) => {
  const { addToCart, getRemainingStock } = useCart();
  const router = useRouter();

  const remainingStock = getRemainingStock(product.id, product.stock);

  const handleAddToCart = () => {
    if (remainingStock === 0) {
      toast.error("Not enough stock available");
      return;
    }

    addToCart(product.id, product.stock);
  };

  return (
    <div className="bg-amber-50  rounded-xl shadow-md p-4 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-sm duration-300">
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="border-1 border-yellow-700 w-full h-40 object-cover rounded-xl mb-4"
      />
      <h2 className="text-xl font-semibold text-red-800 mb-2">
        {product.name}
      </h2>
      <p className="text-base text-gray-800 mb-1">Price: ${product.price}</p>
      <p className="text-sm text-gray-800 mb-2">{product.category.name}</p>
      <p className="text-sm text-gray-800 mb-4">
        Available Stock: {remainingStock}
      </p>
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleAddToCart}
          className={`px-4 py-2 rounded-xl font-semibold text-white transition-colors duration-300 ${
            remainingStock === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-800 hover:bg-red-900"
          }`}
        >
          Add to Cart
        </button>
        <button
          onClick={() => router.push(`/products/${product.id}`)}
          className="bg-yellow-700  text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-800 transition-colors duration-300"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default Card;
