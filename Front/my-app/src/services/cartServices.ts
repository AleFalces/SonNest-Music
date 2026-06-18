import { apiServices, handleAxiosError } from "./apiServices";

const path = "/cart";

// All endpoints return the user's full cart: { id, items: [{ id, quantity, product }] }

type ServerCart = {
  id: number;
  items: { quantity: number; product: { id: number } }[];
};

// Translates the backend cart (lines with quantity) into the legacy
// `cartIds: number[]` shape the CartContext exposes (each id repeated N times),
// so existing consumers (getCartCount, getRemainingStock, ...) keep working.
export const flattenCart = (cart?: ServerCart | null): number[] => {
  if (!cart?.items) return [];
  return cart.items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => item.product.id)
  );
};

export const getCart = async () => {
  try {
    const response = await apiServices.get(path);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error loading the cart");
  }
};

export const addCartItem = async (productId: number) => {
  try {
    const response = await apiServices.post(`${path}/items`, { productId });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error adding the product to the cart");
  }
};

export const removeCartItem = async (productId: number) => {
  try {
    const response = await apiServices.delete(`${path}/items/${productId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error removing the product from the cart");
  }
};

export const removeCartProduct = async (productId: number) => {
  try {
    const response = await apiServices.delete(`${path}/items/${productId}/all`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error removing the product from the cart");
  }
};

export const clearCartApi = async () => {
  try {
    const response = await apiServices.delete(path);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error clearing the cart");
  }
};
