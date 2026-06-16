"use client";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/services/productsServices";
import { IProduct } from "@/helpers/mockProducts";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { orderService } from "@/services/orderServices";
import { confirmAction, showError, showSuccess } from "@/helpers/alerts";
import { IUser } from "@/interfaces/userInterface";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";

const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;

const CartPage = () => {
  const {
    addToCart,
    removeOneFromCart,
    removeAllFromCart,
    clearCart,
    getCartCount,
    cartIds,
  } = useCart();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState(true);
  const productCounts = getCartCount();
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const productsInCart = products.filter((product) => productCounts[product.id]);

  const totalItems = cartIds.length;
  const totalPrice = productsInCart.reduce((accumulator, product) => {
    const quantity = productCounts[product.id] || 0;
    return accumulator + product.price * quantity;
  }, 0);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/loginUser");
      return;
    }
    const confirmed = await confirmAction({
      title: "Confirm purchase?",
      text: `You are about to make a purchase for ${formatPrice(
        totalPrice
      )}. Do you wish to continue?`,
      confirmButtonText: "Yes, confirm",
    });
    if (!confirmed) return;

    try {
      await orderService({ products: cartIds });
      showSuccess("Purchase successful");
      clearCart();
      router.push("/products");
    } catch (error) {
      showError("Error processing the purchase");
      console.error(error);
    }
  };

  const handleClearCart = async () => {
    const confirmed = await confirmAction({
      title: "Empty cart?",
      text: "All products will be removed from the cart.",
      confirmButtonText: "Yes, empty",
    });
    if (confirmed) {
      clearCart();
      showSuccess("Cart is now empty");
    }
  };

  const handleDeleteAll = async (id: number, name: string) => {
    const confirmed = await confirmAction({
      title: `Remove ${name} from the cart?`,
      text: "All units of this product will be removed.",
      confirmButtonText: "Yes, remove",
    });
    if (confirmed) {
      removeAllFromCart(id);
      showSuccess("Successfully removed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="section min-h-screen py-10">
      <h1 className="mb-8 text-3xl md:text-4xl">Shopping Cart</h1>

      {productsInCart.length === 0 ? (
        <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
          <ShoppingBag size={44} className="text-gold" />
          <p className="text-lg font-semibold text-bordo">Your cart is empty</p>
          <p className="text-sm text-ink-soft">
            Add some instruments to get started.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="btn btn-primary mt-2"
          >
            Explore Our Products
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Line items */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {productsInCart.map((product) => {
              const quantity = productCounts[product.id];
              const atStockLimit = quantity >= product.stock;
              return (
                <div
                  key={product.id}
                  className="card flex gap-4 p-4 sm:items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
                  />

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-semibold text-ink">
                          {product.name}
                        </h2>
                        <p className="text-sm text-ink-soft">
                          {formatPrice(product.price)} each
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAll(product.id, product.name)}
                        aria-label={`Remove ${product.name}`}
                        className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-cream-200 hover:text-bordo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1 rounded-xl border-2 border-cream-200 p-1">
                        <button
                          onClick={() => removeOneFromCart(product.id)}
                          aria-label="Decrease quantity"
                          className="rounded-lg p-1.5 text-bordo transition-colors hover:bg-cream-200"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(product.id, product.stock)}
                          disabled={atStockLimit}
                          aria-label="Increase quantity"
                          className="rounded-lg p-1.5 text-bordo transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <span className="text-lg font-bold text-bordo">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 flex flex-col gap-4 p-6">
              <h2 className="text-xl">Order Summary</h2>

              <div className="flex justify-between text-sm text-ink-soft">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between border-t border-cream-200 pt-4">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-2xl font-bold text-bordo">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-primary w-full py-3 text-base"
              >
                {user ? "Complete Purchase" : "Log in to check out"}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={handleClearCart}
                className="btn btn-ghost w-full text-bordo"
              >
                <Trash2 size={16} />
                Empty Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
