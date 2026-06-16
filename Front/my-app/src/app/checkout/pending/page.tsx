import Link from "next/link";
import { Clock } from "lucide-react";

export default function CheckoutPendingPage() {
  return (
    <div className="section min-h-screen py-10">
      <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <Clock size={44} className="text-gold" />
        <h1 className="text-2xl">Your payment is pending</h1>
        <p className="text-sm text-ink-soft">
          We&apos;re waiting for Mercado Pago to confirm your payment. Once
          approved,
          your order will be created automatically.
        </p>
        <Link href="/products" className="btn btn-primary mt-2">
          Back to products
        </Link>
      </div>
    </div>
  );
}
