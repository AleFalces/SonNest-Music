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
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card flex items-center justify-between gap-4 p-5"
            >
              <div className="flex items-center gap-4">
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
          ))}
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
