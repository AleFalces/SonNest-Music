import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";

type StockMode = "sum" | "set";

interface BulkLine {
  sku: string;
  stock: number;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: number;
}

interface BulkInput {
  mode: StockMode;
  items: BulkLine[];
  importId?: string;
}

interface LineResult {
  sku: string;
  status: "created" | "updated" | "failed";
  reason?: string;
}

interface BulkSummary {
  created: number;
  updated: number;
  failed: number;
  results: LineResult[];
}

export const bulkUpsertProductsService = async (
  input: BulkInput
): Promise<BulkSummary> => {
  const summary: BulkSummary = { created: 0, updated: 0, failed: 0, results: [] };

  for (const line of input.items) {
    const existing = await ProductRepository.findOneBy({ sku: line.sku });

    if (existing) {
      existing.stock =
        input.mode === "sum" ? existing.stock + line.stock : line.stock;
      await ProductRepository.save(existing);

      summary.updated++;
      summary.results.push({ sku: line.sku, status: "updated" });
      continue;
    }

    // A new sku needs the full product definition; an invoice row may only carry sku+stock.
    const required = ["name", "description", "price", "image", "categoryId"] as const;
    const missing = required.filter((field) => line[field] === undefined);
    if (missing.length > 0) {
      summary.failed++;
      summary.results.push({
        sku: line.sku,
        status: "failed",
        reason: `Missing required fields to create: ${missing.join(", ")}`,
      });
      continue;
    }

    const category = await CategoryRepository.findOneBy({ id: line.categoryId });
    if (!category) {
      summary.failed++;
      summary.results.push({
        sku: line.sku,
        status: "failed",
        reason: `Category ${line.categoryId} does not exist`,
      });
      continue;
    }

    const created = ProductRepository.create(line);
    await ProductRepository.save(created);

    summary.created++;
    summary.results.push({ sku: line.sku, status: "created" });
  }

  return summary;
};
