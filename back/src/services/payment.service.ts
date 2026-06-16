import { Preference } from "mercadopago";
import { mpClient } from "../config/mercadopago";
import { FRONTEND_URL } from "../config/envs";
import { ProductRepository } from "../repositories/product.repository";
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
      // Auto-redirect back to our site once the payment is approved.
      auto_return: "approved",
    },
  });

  return {
    id: String(result.id),
    init_point: result.init_point as string,
  };
};
