"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { parseBulkFile } from "@/helpers/bulkImportParse";
import {
  bulkImportProducts,
  type BulkLine,
  type BulkImportSummary,
} from "@/services/productsServices";

// A row is structurally sendable when it has a sku and a valid stock; the rest of the
// validity (new sku missing create fields, bad categoryId) is reported by the backend.
const isRowValid = (line: BulkLine) =>
  line.sku !== "" && Number.isInteger(line.stock) && line.stock >= 0;

interface Props {
  onImported: () => void;
}

const AdminBulkImport: React.FC<Props> = ({ onImported }) => {
  const [mode, setMode] = useState<"sum" | "set">("sum");
  const [rows, setRows] = useState<BulkLine[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = await parseBulkFile(file);
      setRows(parsed);
      setFileName(file.name);
      setSummary(null);
      if (parsed.length === 0) toast.error("The file has no rows");
    } catch {
      toast.error("Could not read the file");
    }
  };

  const validRows = rows.filter(isRowValid);
  const invalidCount = rows.length - validRows.length;

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const result = await bulkImportProducts({ mode, items: validRows });
      setSummary(result);
      toast.success(
        `Imported: ${result.created} created, ${result.updated} updated`
      );
      onImported();
    } catch {
      toast.error("Bulk import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="card mb-8 p-5">
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <FileSpreadsheet size={18} className="text-bordo" /> Bulk import
      </h2>
      <p className="mb-4 text-sm text-ink-soft">
        Upload an .xlsx, .xlsm or .csv with columns:{" "}
        <span className="font-medium text-ink">
          sku, stock, name, description, price, image, categoryId
        </span>
        . Existing SKUs update stock ({mode}); new SKUs need every field.
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <label className="btn btn-outline cursor-pointer px-3 py-2">
          <FileSpreadsheet size={16} />
          {fileName || "Choose file"}
          <input
            type="file"
            accept=".xlsx,.xlsm,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        <div>
          <label className="label">Stock mode</label>
          <select
            className="input"
            value={mode}
            onChange={(e) => setMode(e.target.value as "sum" | "set")}
          >
            <option value="sum">Sum (add to current stock)</option>
            <option value="set">Set (overwrite stock)</option>
          </select>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm text-ink-soft">
            {rows.length} row(s) · {validRows.length} ready
            {invalidCount > 0 && (
              <span className="text-bordo"> · {invalidCount} invalid</span>
            )}
          </p>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-muted text-ink-soft">
                <tr>
                  <th className="p-3 font-semibold">SKU</th>
                  <th className="p-3 font-semibold">Stock</th>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Price</th>
                  <th className="p-3 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((line, i) => (
                  <tr
                    key={i}
                    className={`border-b border-muted last:border-0 ${
                      isRowValid(line) ? "" : "bg-bordo/5"
                    }`}
                  >
                    <td className="p-3">{line.sku || "—"}</td>
                    <td className="p-3">
                      {Number.isNaN(line.stock) ? "—" : line.stock}
                    </td>
                    <td className="p-3">{line.name ?? "—"}</td>
                    <td className="p-3">{line.price ?? "—"}</td>
                    <td className="p-3">{line.categoryId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="btn btn-primary px-4 py-2"
            >
              {importing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              Import {validRows.length} row(s)
            </button>
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-5 rounded-xl border border-muted p-4 text-sm">
          <p className="mb-2 font-medium text-ink">
            {summary.created} created · {summary.updated} updated
            {summary.failed > 0 && (
              <span className="text-bordo"> · {summary.failed} failed</span>
            )}
          </p>
          {summary.failed > 0 && (
            <ul className="list-inside list-disc text-ink-soft">
              {summary.results
                .filter((r) => r.status === "failed")
                .map((r) => (
                  <li key={r.sku}>
                    <span className="font-medium text-ink">{r.sku}</span>:{" "}
                    {r.reason}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBulkImport;
