import { z } from "zod";

export const orderSchema = z.object({
  products: z
    .array(z.number({ error: "Product ids must be numbers" }).int().positive(), {
      error: "products must be an array",
    })
    .min(1, "Order must have at least one item"),
});
