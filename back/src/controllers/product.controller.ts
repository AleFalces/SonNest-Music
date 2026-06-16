import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import {
  createProductService,
  deleteProductService,
  getProductsByIdService,
  getProductsService,
  updateProductService,
} from "../services/products.service";
import { Product } from "../entities/Product";
import { ClientError } from "../utils/errors";

export const getProducts = catchedController(
  async (req: Request, res: Response) => {
    const { page, limit, search, category } = req.query;
    const result = await getProductsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: typeof search === "string" ? search : undefined,
      category: typeof category === "string" ? category : undefined,
    });
    res.json(result);
  }
);

export const getProductsById = catchedController(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const numberid = Number(id);
    const products: Product | null = await getProductsByIdService(numberid);
    res.json(products);
  }
);

export const createProduct = catchedController(
  async (req: Request, res: Response) => {
    const { name, description, price, stock, image, categoryId } = req.body;
    const product = await createProductService({
      name,
      description,
      price,
      stock,
      image,
      categoryId,
    });
    res.status(201).json(product);
  }
);

export const deleteProduct = catchedController(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new ClientError("Invalid product id", 400);
    await deleteProductService(id);
    res.status(204).send();
  }
);

export const updateProduct = catchedController(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new ClientError("Invalid product id", 400);

    const { name, description, price, stock, image, categoryId } = req.body;
    const updated: Product = await updateProductService(id, {
      name,
      description,
      price,
      stock,
      image,
      categoryId,
    });
    res.json(updated);
  }
);
