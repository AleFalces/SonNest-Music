import { Request, Response } from "express";
import {
  createPreferenceService,
  confirmPaymentService,
  processPaymentService,
} from "../services/payment.service";
import { verifyMpWebhookSignature } from "../utils/mpWebhookSignature";
import { MP_WEBHOOK_SECRET } from "../config/envs";
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

// Public, server-to-server endpoint. MP sends type + data.id on the query (and
// sometimes the body). We always ack 200 so MP stops retrying; a thrown error
// (e.g. DB down) bubbles to a 500 so MP retries later.
export const paymentWebhook = catchedController(
  async (req: Request, res: Response) => {
    const type = (req.query.type as string) ?? req.body?.type;
    const dataId = (req.query["data.id"] as string) ?? req.body?.data?.id;

    if (type !== "payment" || !dataId) return res.sendStatus(200);

    // Skip validation when no secret is set (local sandbox); enforce otherwise.
    if (MP_WEBHOOK_SECRET) {
      const valid = verifyMpWebhookSignature({
        xSignature: req.headers["x-signature"] as string,
        xRequestId: req.headers["x-request-id"] as string,
        dataId,
        secret: MP_WEBHOOK_SECRET,
      });
      if (!valid) return res.sendStatus(401);
    }

    await processPaymentService(dataId);
    res.sendStatus(200);
  }
);
