import { apiServices, handleAxiosError } from "./apiServices";

const path: string = "/products/";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

// Paginated catalog query (used by the products page).
export const getProducts = async (params: ProductQueryParams = {}) => {
  try {
    const response = await apiServices.get(`${path}`, { params });
    return response.data; // { data, page, limit, total, totalPages }
  } catch (error) {
    handleAxiosError(error, "Error to get products");
  }
};

// Every product as a flat array (used by the cart to resolve its items).
export const getAllProducts = async () => {
  try {
    const response = await apiServices.get(`${path}`, {
      params: { limit: 1000 },
    });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error to get products");
  }
};

export const getProductsById = async (id: string) => {
  try {
    const response = await apiServices.get(`${path}${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error to get products");
  }
};

export const updateProduct = async (
  id: number,
  data: { stock?: number; price?: number }
) => {
  const response = await apiServices.patch(`${path}${id}`, data);
  return response.data;
};
