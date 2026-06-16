import { Category } from "../entities/Category";
import { CategoryRepository } from "../repositories/category.repository";

export const getCategoriesService = async (): Promise<Category[]> => {
  return await CategoryRepository.find({ order: { id: "ASC" } });
};
