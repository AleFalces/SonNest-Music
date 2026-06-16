import { Request, Response } from "express";
import { createPreferenceService } from "../services/payment.service";
import { catchedController } from "../utils/catchedController";

export const createPreference = catchedController(
  async (req: Request, res: Response) => {
    const { products, userId } = req.body;
    const preference = await createPreferenceService(products, userId);
    res.send(preference);
  }
);
