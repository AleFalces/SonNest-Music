"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProducts, updateProduct } from "@/services/productsServices";
import { IProduct } from "@/helpers/mockProducts";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

type Draft = { stock: string; price: string };

const AdminProducts: React.FC = () => {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Gate: only admins (read straight from storage, like the rest of the app).
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    const ok = user?.role === "admin";
    setAllowed(ok);
    setAuthChecked(true);
    if (!ok) router.replace("/");
  }, [router]);

  useEffect(() => {
    if (!allowed) return;
    const fetchProducts = async () => {
      try {
        const data: IProduct[] = await getAllProducts();
        setProducts(data);
        setDrafts(
          Object.fromEntries(
            data.map((p) => [p.id, { stock: String(p.stock), price: String(p.price) }])
          )
        );
      } catch {
        toast.error("Could not load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [allowed]);

  const setDraft = (id: number, field: keyof Draft, value: string) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const isDirty = (p: IProduct) => {
    const d = drafts[p.id];
    return d && (Number(d.stock) !== p.stock || Number(d.price) !== p.price);
  };

  const handleSave = async (p: IProduct) => {
    const d = drafts[p.id];
    const stock = Number(d.stock);
    const price = Number(d.price);
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a non-negative integer");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.error("Price must be a non-negative number");
      return;
    }
    setSavingId(p.id);
    try {
      const updated: IProduct = await updateProduct(p.id, { stock, price });
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, ...updated } : item))
      );
      toast.success(`Updated "${p.name}"`);
    } catch {
      toast.error("Update failed");
    } finally {
      setSavingId(null);
    }
  };

  if (!authChecked || (allowed && loading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    );
  }

  if (!allowed) return null; // redirecting

  return (
    <div className="section min-h-screen py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-200 text-bordo">
          <ShieldCheck size={22} />
        </span>
        <div>
          <h1 className="text-3xl md:text-4xl">Admin · Stock</h1>
          <p className="text-sm text-ink-soft">
            Update stock and price for each product.
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-muted text-ink-soft">
            <tr>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="w-32 p-4 font-semibold">Price ($)</th>
              <th className="w-32 p-4 font-semibold">Stock</th>
              <th className="w-28 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-muted last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                    />
                    <span className="font-medium text-ink">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-ink-soft">{p.category?.name}</td>
                <td className="p-4">
                  <input
                    type="number"
                    min={0}
                    value={drafts[p.id]?.price ?? ""}
                    onChange={(e) => setDraft(p.id, "price", e.target.value)}
                    className="input px-2 py-1.5"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min={0}
                    value={drafts[p.id]?.stock ?? ""}
                    onChange={(e) => setDraft(p.id, "stock", e.target.value)}
                    className="input px-2 py-1.5"
                  />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleSave(p)}
                    disabled={!isDirty(p) || savingId === p.id}
                    className="btn btn-primary w-full px-3 py-1.5"
                  >
                    {savingId === p.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
