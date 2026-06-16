import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/product.repository";
import { ClientError } from "../utils/errors";

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

export const getProductsByIdService = async (
  id: number
): Promise<Product | null> => {
  return await ProductRepository.findOne({
    where: { id: id },
    relations: ["category"],
  });
};

export const updateProductService = async (
  id: number,
  data: { stock?: number; price?: number }
): Promise<Product> => {
  const product = await ProductRepository.findOneBy({ id });
  if (!product) throw new ClientError("Product not found", 404);

  if (data.stock !== undefined) product.stock = data.stock;
  if (data.price !== undefined) product.price = data.price;

  await ProductRepository.save(product);
  return product;
};
