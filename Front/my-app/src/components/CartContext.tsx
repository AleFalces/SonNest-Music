"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const [cartIds, setCartIds] = useState<number[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartIds(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartIds));
  }, [cartIds]);

  const addToCart = (id: number, stock: number) => {
    const count = cartIds.filter((itemId) => itemId === id).length;
    if (count >= stock) return;
    setCartIds((prev) => [...prev, id]);
    toast.success("Product added to cart");
  };

  const removeOneFromCart = (id: number) => {
    const index = cartIds.findIndex((itemId) => itemId === id);
    if (index !== -1) {
      const newCart = [...cartIds];
      newCart.splice(index, 1);
      setCartIds(newCart);
      toast.success("Product successfully removed");
    }
  };

  const removeAllFromCart = (id: number) => {
    setCartIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const clearCart = () => {
    setCartIds([]);
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
