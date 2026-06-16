import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { ClientError } from "../utils/errors";

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: number;
}

export const createProductService = async (
  data: CreateProductInput
): Promise<Product> => {
  const category = await CategoryRepository.findOneBy({ id: data.categoryId });
  if (!category) throw new ClientError("Category not found", 404);

  const product = ProductRepository.create(data);
  await ProductRepository.save(product);
  return product;
};

export const checkProductExists = async (itemId: number): Promise<boolean> => {
  const item: Product | null = await ProductRepository.findOneBy({
    id: itemId,
  });
  return !!item;
};

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface PaginatedProducts {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getProductsService = async (
  opts: ProductQuery = {}
): Promise<PaginatedProducts> => {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(Math.max(1, opts.limit || 9), 100);

  const qb = ProductRepository.createQueryBuilder("product").leftJoinAndSelect(
    "product.category",
    "category"
  );

  if (opts.search)
    qb.andWhere("LOWER(product.name) LIKE LOWER(:search)", {
      search: `%${opts.search}%`,
    });

  if (opts.category && opts.category !== "all")
    qb.andWhere("category.name = :category", { category: opts.category });

  qb.orderBy("product.id", "ASC")
    .skip((page - 1) * limit)
    .take(limit);

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const deleteProductService = async (id: number): Promise<void> => {
  const product = await ProductRepository.findOneBy({ id });
  if (!product) throw new ClientError("Product not found", 404);
  await ProductRepository.remove(product);
};

export const getProductsByIdService = async (
  id: number
): Promise<Product | null> => {
  return await ProductRepository.findOne({
    where: { id: id },
    relations: ["category"],
  });
};

export type UpdateProductInput = Partial<CreateProductInput>;

export const updateProductService = async (
  id: number,
  data: UpdateProductInput
): Promise<Product> => {
  const product = await ProductRepository.findOneBy({ id });
  if (!product) throw new ClientError("Product not found", 404);

  if (data.name !== undefined) product.name = data.name;
  if (data.description !== undefined) product.description = data.description;
  if (data.price !== undefined) product.price = data.price;
  if (data.stock !== undefined) product.stock = data.stock;
  if (data.image !== undefined) product.image = data.image;
  if (data.categoryId !== undefined) product.categoryId = data.categoryId;

  await ProductRepository.save(product);
  return product;
};
