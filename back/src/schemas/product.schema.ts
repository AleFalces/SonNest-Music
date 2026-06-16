import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name is required"),
  description: z
    .string({ error: "Description is required" })
    .min(1, "Description is required"),
  price: z
    .number({ error: "Price is required" })
    .nonnegative("Price must be a non-negative number"),
  stock: z
    .number({ error: "Stock is required" })
    .int("Stock must be an integer")
    .nonnegative("Stock must be a non-negative integer"),
  image: z.url({ error: "A valid image URL is required" }),
  categoryId: z
    .number({ error: "Category is required" })
    .int("categoryId must be an integer"),
});

export const updateProductSchema = createProductSchema.partial();
