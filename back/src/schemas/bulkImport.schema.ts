import { z } from "zod";

// One invoice/import row. `sku` and `stock` are always required; the remaining product
// fields are required only when creating a new sku, so the per-line service (not Zod)
// enforces that rule and reports a missing-field row as `failed` instead of aborting
// the whole batch.
const bulkLineSchema = z.object({
  sku: z.string({ error: "SKU is required" }).min(1, "SKU is required"),
  stock: z
    .number({ error: "Stock is required" })
    .int("Stock must be an integer")
    .nonnegative("Stock must be a non-negative integer"),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.number().nonnegative("Price must be a non-negative number").optional(),
  image: z.url({ error: "A valid image URL is required" }).optional(),
  categoryId: z.number().int("categoryId must be an integer").optional(),
});

// `sum` (the invoice case: stock += qty) is the default; `set` overwrites.
export const bulkImportSchema = z.object({
  mode: z.enum(["sum", "set"]).default("sum"),
  importId: z.string().optional(),
  items: z.array(bulkLineSchema).min(1, "At least one item is required"),
});
