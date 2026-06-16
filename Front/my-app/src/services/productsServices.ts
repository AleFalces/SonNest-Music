import { apiServices, handleAxiosError } from "./apiServices";

const path: string = "/products/";

export const getAllProducts = async () => {
  try {
    const response = await apiServices.get(`${path}`);
    return response.data;
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
