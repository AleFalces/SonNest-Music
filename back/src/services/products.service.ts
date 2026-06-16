import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/product.repository";
import { ClientError } from "../utils/errors";

export const checkProductExists = async (itemId: number): Promise<boolean> => {
  const item: Product | null = await ProductRepository.findOneBy({
    id: itemId,
  });
  return !!item;
};

export const getProductsService = async (): Promise<Product[]> => {
  return await ProductRepository.find({
    relations: ["category"],
  });
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
