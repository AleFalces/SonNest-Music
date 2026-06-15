"use client";

import { useRouter } from "next/navigation";
import { Rocket, UserPlus } from "lucide-react";

const CallToActionSection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-12 px-4 text-center bg-red-800">
      <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2 mb-4">
        <Rocket size={24} />
        Ready to get started?
      </h2>
      <p className="text-amber-200 mb-8">Discover our products right now.</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          className="bg-amber-100 text-red-800 px-6 py-3 rounded-xl font-semibold transition-colors duration-300 hover:bg-amber-200"
          onClick={() => router.push("/products")}
        >
          View Products
        </button>
        <button
          className="bg-amber-100 text-red-800 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-amber-200"
          onClick={() => router.push("/registerUser")}
        >
          <UserPlus size={20} />
          Sign Up Now
        </button>
      </div>
    </section>
  );
};

export default CallToActionSection;
