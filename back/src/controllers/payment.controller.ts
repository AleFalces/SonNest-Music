import { Request, Response } from "express";
import {
  createPreferenceService,
  confirmPaymentService,
} from "../services/payment.service";
import { catchedController } from "../utils/catchedController";

export const createPreference = catchedController(
  async (req: Request, res: Response) => {
    const { products, userId } = req.body;
    const preference = await createPreferenceService(products, userId);
    res.send(preference);
  }
);

export const confirmPayment = catchedController(
  async (req: Request, res: Response) => {
    const paymentId = req.query.payment_id as string;
    const order = await confirmPaymentService(paymentId);
    res.send(order);
  }
);
