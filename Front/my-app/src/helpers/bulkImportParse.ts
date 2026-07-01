import type { BulkLine } from "@/services/productsServices";

// Reads an .xlsx/.xlsm/.csv file entirely in the browser and maps its rows to the
// bulk-import contract. Expected column headers (case-insensitive): sku, stock, name,
// description, price, image, categoryId. Excel numeric cells arrive as numbers, CSV
// cells as strings — both are coerced here. Row-level validity is left to the preview:
// a missing sku yields "" and a missing/invalid stock yields NaN so the caller can flag it.

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

const toText = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s === "" ? undefined : s;
};

export const parseBulkFile = async (file: File): Promise<BulkLine[]> => {
  // Loaded on demand so xlsx (heavy) stays out of the admin page's initial bundle.
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: undefined,
  });

  return rows.map((row) => {
    // Normalize headers so "SKU", "Sku " and "categoryid" all resolve.
    const cell: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      cell[key.trim().toLowerCase()] = value;
    }
    return {
      sku: toText(cell.sku) ?? "",
      stock: toNumber(cell.stock) ?? NaN,
      name: toText(cell.name),
      description: toText(cell.description),
      price: toNumber(cell.price),
      image: toText(cell.image),
      categoryId: toNumber(cell.categoryid),
    };
  });
};
