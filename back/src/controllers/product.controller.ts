import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import {
  getProductsByIdService,
  getProductsService,
  updateProductService,
} from "../services/products.service";
import { Product } from "../entities/Product";
import { ClientError } from "../utils/errors";

export const getProducts = catchedController(
  async (req: Request, res: Response) => {
    const products = await getProductsService();
    res.json(products);
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

export const updateProduct = catchedController(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw new ClientError("Invalid product id", 400);

    const { stock, price } = req.body;

    if (stock === undefined && price === undefined)
      throw new ClientError("Provide stock or price to update", 400);

    if (
      stock !== undefined &&
      (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0)
    )
      throw new ClientError("stock must be a non-negative integer", 400);

    if (price !== undefined && (typeof price !== "number" || price < 0))
      throw new ClientError("price must be a non-negative number", 400);

    const updated: Product = await updateProductService(id, { stock, price });
    res.json(updated);
  }
);
