import { NextFunction, Request, Response } from "express";
import { ClientError } from "../utils/errors";
import { checkProductExists } from "../services/products.service";

// Shape validation (non-empty array of product ids) is handled by the order Zod
// schema; this only checks that every referenced product exists in the database.
const validateItemsExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { products } = req.body;
  for (const itemId of products) {
    const exists = await checkProductExists(itemId);
    if (!exists)
      return next(
        new ClientError("One or more items do not exist in the database")
      );
  }
  next();
};

export default validateItemsExist;
