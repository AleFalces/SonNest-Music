"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllProducts,
  updateProduct,
  createProduct,
  deleteProduct,
} from "@/services/productsServices";
import { getCategories, ICategory } from "@/services/categoriesServices";
import { IProduct } from "@/helpers/mockProducts";
import { Loader2, Save, ShieldCheck, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Draft = { stock: string; price: string };

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image: "",
  categoryId: "",
};

const AdminProducts: React.FC = () => {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
        const [data, cats] = await Promise.all([
          getAllProducts(),
          getCategories(),
        ]);
        setProducts(data);
        setCategories(cats);
        setDrafts(
          Object.fromEntries(
            data.map((p: IProduct) => [
              p.id,
              { stock: String(p.stock), price: String(p.price) },
            ])
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

  const setFormField = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const categoryId = Number(form.categoryId);

    if (!form.name.trim() || !form.description.trim() || !form.image.trim()) {
      toast.error("Name, description and image are required");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.error("Price must be a non-negative number");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a non-negative integer");
      return;
    }
    if (!categoryId) {
      toast.error("Pick a category");
      return;
    }

    setCreating(true);
    try {
      const created: IProduct = await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        price,
        stock,
        categoryId,
      });
      setProducts((prev) => [created, ...prev]);
      setDrafts((prev) => ({
        ...prev,
        [created.id]: { stock: String(created.stock), price: String(created.price) },
      }));
      setForm(emptyForm);
      toast.success(`Created "${created.name}"`);
    } catch {
      toast.error("Could not create the product");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (p: IProduct) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      toast.success(`Deleted "${p.name}"`);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
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

      <form onSubmit={handleCreate} className="card mb-8 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg">
          <Plus size={18} className="text-bordo" /> Add a product
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setFormField("name", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input
              className="input"
              value={form.image}
              onChange={(e) => setFormField("image", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.categoryId}
              onChange={(e) => setFormField("categoryId", e.target.value)}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Price ($)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.price}
              onChange={(e) => setFormField("price", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Stock</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.stock}
              onChange={(e) => setFormField("stock", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label">Description</label>
            <input
              className="input"
              value={form.description}
              onChange={(e) => setFormField("description", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={creating} className="btn btn-primary px-4 py-2">
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create product
          </button>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-muted text-ink-soft">
            <tr>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="w-32 p-4 font-semibold">Price ($)</th>
              <th className="w-32 p-4 font-semibold">Stock</th>
              <th className="w-40 p-4"></th>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(p)}
                      disabled={!isDirty(p) || savingId === p.id}
                      className="btn btn-primary px-3 py-1.5"
                    >
                      {savingId === p.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      aria-label={`Delete ${p.name}`}
                      className="btn btn-outline px-3 py-1.5"
                    >
                      {deletingId === p.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
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
