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

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: number;
}

export const createProduct = async (data: ProductInput) => {
  const response = await apiServices.post(`${path}`, data);
  return response.data;
};

export const updateProduct = async (
  id: number,
  data: Partial<ProductInput>
) => {
  const response = await apiServices.patch(`${path}${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await apiServices.delete(`${path}${id}`);
  return response.data;
};
