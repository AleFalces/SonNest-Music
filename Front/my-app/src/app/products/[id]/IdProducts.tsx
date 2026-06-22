"use client";

import { getProductsById } from "@/services/productsServices";
import { IProduct } from "@/helpers/mockProducts";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const { addToCart, getRemainingStock } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (typeof id === "string") getProductsById(id).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    );
  }

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
    <div className="section min-h-screen py-10">
      <button
        onClick={() => router.push("/products")}
        className="btn btn-ghost mb-6 -ml-2"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="card overflow-hidden">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
            <img
              src={product.image}
              alt={product.name}
              decoding="async"
              className="h-full w-full rounded-xl object-contain p-4"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-night/55">
                <span className="badge badge-bordo">Out of stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="badge badge-gold mb-4 w-fit">
            {product.category.name}
          </span>

          <h1 className="text-4xl md:text-5xl">{product.name}</h1>

          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            {product.description}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-bordo">
              {formattedPrice}
            </span>
            <span
              className={`text-sm font-semibold ${
                isOutOfStock ? "text-bordo" : "text-ink-soft"
              }`}
            >
              {isOutOfStock ? "Unavailable" : `${remainingStock} in stock`}
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn btn-primary px-6 py-3 text-base"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
