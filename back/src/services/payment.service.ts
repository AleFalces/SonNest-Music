import { Preference, Payment } from "mercadopago";
import { mpClient } from "../config/mercadopago";
import { FRONTEND_URL } from "../config/envs";
import { ProductRepository } from "../repositories/product.repository";
import { OrderRepository } from "../repositories/order.repository";
import { Order } from "../entities/Order";
import { createOrderService } from "./order.service";
import { ClientError } from "../utils/errors";

// Creates a Mercado Pago "preference" (Checkout Pro) for the given products and
// returns the checkout URL the frontend should redirect the buyer to.
//
// We de-duplicate ids the same way order.service does, so the items charged
// match the order we create later (one unit per distinct product).
export const createPreferenceService = async (
  productIds: number[],
  userId: number
): Promise<{ id: string; init_point: string }> => {
  const uniqueIds = Array.from(new Set(productIds));

  const items = [];
  for (const id of uniqueIds) {
    const product = await ProductRepository.findOneBy({ id });
    if (!product) throw new ClientError("Product not found", 404);

    items.push({
      id: String(product.id),
      title: product.name,
      quantity: 1,
      unit_price: Number(product.price),
      currency_id: "ARS",
    });
  }

  const preference = new Preference(mpClient);

  // Mercado Pago only allows auto_return when back_urls.success is a public URL,
  // so it fails on localhost. Enable it only outside local development.
  const useAutoReturn = /^https:\/\//.test(FRONTEND_URL);

  const result = await preference.create({
    body: {
      items,
      // Travels with the payment so the confirm step (2.3) knows which order to
      // create, without trusting anything coming from the browser.
      metadata: {
        user_id: userId,
        product_ids: uniqueIds,
      },
      // Mercado Pago has three outcomes (unlike a simple success/cancel).
      back_urls: {
        success: `${FRONTEND_URL}/checkout/success`,
        pending: `${FRONTEND_URL}/checkout/pending`,
        failure: `${FRONTEND_URL}/checkout/failure`,
      },
      ...(useAutoReturn && { auto_return: "approved" }),
    },
  });

  return {
    id: String(result.id),
    init_point: result.init_point as string,
  };
};

// Idempotent (guarded by Order.paymentId): verifies the payment against MP and
// creates the order only when approved; returns null if not yet approved.
// Shared by the browser confirm flow and the webhook.
export const processPaymentService = async (
  paymentId: string
): Promise<Order | null> => {
  const existing = await OrderRepository.findOneBy({ paymentId });
  if (existing) return existing;

  const payment = await new Payment(mpClient).get({ id: paymentId });
  if (payment.status !== "approved") return null;

  const { user_id, product_ids } = payment.metadata;
  const order = await createOrderService({
    userId: user_id,
    products: product_ids,
  });

  order.paymentId = paymentId;
  await OrderRepository.save(order);
  return order;
};

// Browser return flow (GET /payments/confirm): surfaces a not-yet-approved
// payment as 402 (the webhook just acks instead).
export const confirmPaymentService = async (
  paymentId: string
): Promise<Order> => {
  const order = await processPaymentService(paymentId);
  if (!order) throw new ClientError("Payment not approved", 402);
  return order;
};
