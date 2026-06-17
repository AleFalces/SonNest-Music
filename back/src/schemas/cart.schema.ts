import { z } from "zod";

export const addItemSchema = z.object({
  productId: z
    .number({ error: "productId must be a number" })
    .int("productId must be an integer")
    .positive("productId must be positive"),
});
