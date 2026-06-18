"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addCartItem,
  removeCartItem,
  removeCartProduct,
  clearCartApi,
  flattenCart,
} from "@/services/cartServices";

type CartContextType = {
  cartIds: number[];
  addToCart: (id: number, stock: number) => void;
  removeOneFromCart: (id: number) => void;
  removeAllFromCart: (id: number) => void;
  clearCart: () => void;
  getCartCount: () => Record<number, number>;
  getRemainingStock: (productId: number, originalStock: number) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [cartIds, setCartIds] = useState<number[]>([]);
  // Ensures the guest-cart merge runs once per logged-in session (and not twice
  // under React StrictMode). Reset when the user logs out.
  const mergedRef = useRef(false);

  // Load the cart: from the API when logged in, from localStorage as a guest.
  // On the first load after login, merge any guest cart into the server cart.
  useEffect(() => {
    if (!isAuthenticated) {
      mergedRef.current = false;
      const stored = localStorage.getItem("cart");
      setCartIds(stored ? JSON.parse(stored) : []);
      return;
    }

    const loadAndMerge = async () => {
      const stored = localStorage.getItem("cart");
      const guestIds: number[] = stored ? JSON.parse(stored) : [];

      if (!mergedRef.current && guestIds.length) {
        mergedRef.current = true;
        for (const id of guestIds) {
          try {
            await addCartItem(id); // backend enforces stock; skip rejected units
          } catch {
            // over stock or transient error — ignore this unit during the merge
          }
        }
        localStorage.removeItem("cart");
      } else {
        mergedRef.current = true;
      }

      const cart = await getCart();
      setCartIds(flattenCart(cart));
    };

    loadAndMerge();
  }, [isAuthenticated]);

  // Persist the guest cart only; a logged-in cart lives on the server.
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(cartIds));
    }
  }, [cartIds, isAuthenticated]);

  const addToCart = async (id: number, stock: number) => {
    const count = cartIds.filter((itemId) => itemId === id).length;
    if (count >= stock) return;

    if (isAuthenticated) {
      const cart = await addCartItem(id);
      setCartIds(flattenCart(cart));
    } else {
      setCartIds((prev) => [...prev, id]);
    }
    toast.success("Product added to cart");
  };

  const removeOneFromCart = async (id: number) => {
    if (isAuthenticated) {
      const cart = await removeCartItem(id);
      setCartIds(flattenCart(cart));
      toast.success("Product successfully removed");
      return;
    }

    const index = cartIds.findIndex((itemId) => itemId === id);
    if (index !== -1) {
      const newCart = [...cartIds];
      newCart.splice(index, 1);
      setCartIds(newCart);
      toast.success("Product successfully removed");
    }
  };

  const removeAllFromCart = async (id: number) => {
    if (isAuthenticated) {
      const cart = await removeCartProduct(id);
      setCartIds(flattenCart(cart));
    } else {
      setCartIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      const cart = await clearCartApi();
      setCartIds(flattenCart(cart));
    } else {
      setCartIds([]);
    }
  };

  const getCartCount = () => {
    const counts: Record<number, number> = {};
    cartIds.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  };

  const getRemainingStock = (productId: number, originalStock: number) => {
    const count = cartIds.filter((id) => id === productId).length;
    return Math.max(originalStock - count, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartIds,
        addToCart,
        removeOneFromCart,
        removeAllFromCart,
        clearCart,
        getCartCount,
        getRemainingStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
