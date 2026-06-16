"use client";

import { CardProps } from "@/helpers/mockProducts";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";

export const Card: React.FC<CardProps> = ({ product }) => {
  const { addToCart, getRemainingStock } = useCart();
  const router = useRouter();

  const remainingStock = getRemainingStock(product.id, product.stock);
  const isOutOfStock = remainingStock === 0;
  const formattedPrice = `$${product.price.toLocaleString("en-US")}`;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Not enough stock available");
      return;
    }
    addToCart(product.id, product.stock);
  };

  return (
    <div className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="badge badge-gold absolute left-3 top-3 shadow-soft">
          {product.category.name}
        </span>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
            <span className="badge badge-bordo">Out of stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">{product.name}</h3>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xl font-bold text-bordo">{formattedPrice}</span>
          <span
            className={`text-xs font-semibold ${
              isOutOfStock ? "text-bordo" : "text-ink-soft"
            }`}
          >
            {isOutOfStock ? "Unavailable" : `${remainingStock} in stock`}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn btn-primary flex-1"
          >
            <ShoppingCart size={16} />
            Add
          </button>
          <button
            onClick={() => router.push(`/products/${product.id}`)}
            className="btn btn-outline"
          >
            <Eye size={16} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
