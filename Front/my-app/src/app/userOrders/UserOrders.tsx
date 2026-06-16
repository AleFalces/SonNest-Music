"use client";
import { IOrder } from "@/interfaces/orderInterface";
import { getUserOrders } from "@/services/userServices";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  Calendar,
  ArrowRight,
  Loader2,
  ClipboardList,
} from "lucide-react";

const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        try {
          const data = await getUserOrders();
          setOrders(data);
        } catch (error) {
          console.error("Error loading orders:", error);
        }
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="section min-h-screen py-10">
      <h1 className="mb-8 text-center text-3xl md:text-4xl">My Orders</h1>

      {orders.length > 0 ? (
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {orders.map((order) => {
            const total = (order.products ?? []).reduce(
              (sum, p) => sum + p.price,
              0
            );
            return (
              <div key={order.id} className="card p-5">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-200 text-bordo">
                      <Package size={22} />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Order #{order.id}</p>
                      <p className="flex items-center gap-1 text-sm text-ink-soft">
                        <Calendar size={14} />
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-gold capitalize">
                    {order.status}
                  </span>
                </div>

                {/* Products */}
                {order.products?.length > 0 && (
                  <ul className="mt-4 divide-y divide-muted border-t border-muted">
                    {order.products.map((p, idx) => (
                      <li
                        key={`${order.id}-${p.id}-${idx}`}
                        className="flex items-center gap-3 py-3"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                        <span className="flex-1 text-sm text-ink">{p.name}</span>
                        <span className="text-sm font-semibold text-bordo">
                          {formatPrice(p.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Total */}
                <div className="mt-3 flex items-center justify-between border-t border-muted pt-3">
                  <span className="text-sm text-ink-soft">
                    {order.products?.length ?? 0}{" "}
                    {order.products?.length === 1 ? "item" : "items"}
                  </span>
                  <span className="text-lg font-bold text-bordo">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
          <ClipboardList size={44} className="text-gold" />
          <p className="text-lg font-semibold text-bordo">No orders yet</p>
          <p className="text-sm text-ink-soft">
            You haven&apos;t placed any orders yet.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="btn btn-primary mt-2"
          >
            Explore Our Products
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
