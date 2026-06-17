"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { confirmPayment } from "@/services/paymentServices";
import { useCart } from "@/components/CartContext";

const SuccessContent = () => {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  // Guard against React StrictMode mounting the effect twice in dev, which
  // would fire the confirm request (and clearCart) twice.
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;

    const paymentId = params.get("payment_id");
    if (!paymentId) {
      setStatus("error");
      return;
    }
    confirmPayment(paymentId)
      .then(() => {
        clearCart();
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
        <p className="text-ink-soft">Confirming your payment…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <XCircle size={44} className="text-bordo" />
        <h1 className="text-2xl">We couldn&apos;t confirm your payment</h1>
        <p className="text-sm text-ink-soft">
          If you were charged, your order will still be processed. Please contact
          support if you have any doubts.
        </p>
        <Link href="/products" className="btn btn-primary mt-2">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
      <CheckCircle2 size={44} className="text-gold" />
      <h1 className="text-2xl">Payment confirmed!</h1>
      <p className="text-sm text-ink-soft">
        Thank you for your purchase. You can see it in your orders.
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/userOrders" className="btn btn-primary">
          View my orders
        </Link>
        <Link href="/products" className="btn btn-outline">
          Keep shopping
        </Link>
      </div>
    </div>
  );
};

export default function CheckoutSuccessPage() {
  return (
    <div className="section min-h-screen py-10">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
