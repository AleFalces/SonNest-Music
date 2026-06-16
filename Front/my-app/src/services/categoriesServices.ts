import { apiServices, handleAxiosError } from "./apiServices";

export interface ICategory {
  id: number;
  name: string;
}

export const getCategories = async (): Promise<ICategory[]> => {
  try {
    const response = await apiServices.get("/categories");
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error to get categories");
    return [];
  }
};
