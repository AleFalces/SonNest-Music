import { AppDataSource } from "../config/dataSource";
import { Category } from "../entities/Category";
import { CategoryRepository } from "../repositories/category.repository";

interface ICategory {
  name: string;
}

const categoriesToPreLoad: ICategory[] = [
  { name: "Electric Basses" },
  { name: "Guitars" },
  { name: "Drum Kits" },
  { name: "Guitar Picks" },
  { name: "Drum Sticks" },
  { name: "String Sets" },
];

export const preLoadCategories = async () => {
  const categories = await CategoryRepository.find();
  if (!categories.length)
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Category)
      .values(categoriesToPreLoad)
      .execute();
  console.log("Categories preloaded");
};
