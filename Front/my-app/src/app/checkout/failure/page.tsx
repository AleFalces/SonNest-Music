import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <div className="section min-h-screen py-10">
      <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <XCircle size={44} className="text-bordo" />
        <h1 className="text-2xl">Payment not completed</h1>
        <p className="text-sm text-ink-soft">
          Your payment was rejected or cancelled. Your cart is still here, so you
          can try again whenever you want.
        </p>
        <Link href="/cart" className="btn btn-primary mt-2">
          Back to cart
        </Link>
      </div>
    </div>
  );
}
