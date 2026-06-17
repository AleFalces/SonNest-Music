import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import { ClientError } from "../utils/errors";
import {
  getCartService,
  addItemService,
  removeItemService,
  removeProductService,
  clearCartService,
} from "../services/cart.service";

export const getCart = catchedController(
  async (req: Request, res: Response) => {
    const cart = await getCartService(req.body.userId);
    res.json(cart);
  }
);

export const addItem = catchedController(
  async (req: Request, res: Response) => {
    const { userId, productId } = req.body;
    const cart = await addItemService(userId, productId);
    res.status(201).json(cart);
  }
);

export const removeItem = catchedController(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.productId);
    if (Number.isNaN(productId))
      throw new ClientError("Invalid product id", 400);
    const cart = await removeItemService(req.body.userId, productId);
    res.json(cart);
  }
);

export const removeProduct = catchedController(
  async (req: Request, res: Response) => {
    const productId = Number(req.params.productId);
    if (Number.isNaN(productId))
      throw new ClientError("Invalid product id", 400);
    const cart = await removeProductService(req.body.userId, productId);
    res.json(cart);
  }
);

export const clearCart = catchedController(
  async (req: Request, res: Response) => {
    const cart = await clearCartService(req.body.userId);
    res.json(cart);
  }
);
